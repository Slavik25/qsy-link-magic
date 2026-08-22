import { createFileRoute } from "@tanstack/react-router";

/** Acciones de auditoría que se consideran alertas de seguridad. */
const ALERT_ACTIONS = [
  "shop_item_insert_blocked",
  "shop_item_update_blocked",
  "shop_item_delete_blocked",
  "economy_write_blocked",
  "coin_grant_blocked",
  "price_mismatch_detected",
  "price_tamper_corrected",
  "purchase_rejected",
  "reconciliation_fixed",
];

async function handle(request: Request) {
  const apiKey = request.headers.get("apikey") ?? "";
  const expected =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"] ?? "";
  if (!expected || apiKey !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const since = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
  const { data: events, error } = await supabaseAdmin
    .from("audit_events")
    .select("id, kind, action, actor_name, actor_user_id, detail, created_at")
    .in("action", ALERT_ACTIONS)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return new Response(error.message, { status: 500 });

  const { data: delivered } = await supabaseAdmin
    .from("security_alert_deliveries")
    .select("event_id");
  const done = new Set((delivered ?? []).map((d) => d.event_id as string));
  const pending = (events ?? []).filter((e) => !done.has(e.id as string));
  if (!pending.length) return Response.json({ sent: 0 });

  const { data: settings } = await supabaseAdmin
    .from("integration_settings")
    .select("key, value")
    .in("key", ["security_webhook", "security_alert_email"]);
  const webhook = settings?.find((s) => s.key === "security_webhook")?.value ?? "";
  const email = settings?.find((s) => s.key === "security_alert_email")?.value ?? "";

  const results: { event_id: string; target: string; ok: boolean; error: string | null }[] = [];

  for (const ev of pending) {
    if (webhook) {
      try {
        const res = await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: "qsy-security",
            action: ev.action,
            actor: ev.actor_name,
            at: ev.created_at,
            detail: ev.detail,
          }),
        });
        results.push({
          event_id: ev.id as string,
          target: "webhook",
          ok: res.ok,
          error: res.ok ? null : `HTTP ${res.status}`,
        });
      } catch (e) {
        results.push({
          event_id: ev.id as string,
          target: "webhook",
          ok: false,
          error: e instanceof Error ? e.message : "error",
        });
      }
    } else {
      results.push({ event_id: ev.id as string, target: "none", ok: true, error: null });
    }
  }

  if (email && pending.length) {
    try {
      const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
      await sendTemplateEmail("security-alert", email, {
        templateData: {
          count: pending.length,
          items: pending.slice(0, 20).map((e) => ({
            action: e.action as string,
            actor: e.actor_name as string,
            at: e.created_at as string,
          })),
        },
      });
    } catch {
      /* el webhook / auditoría siguen funcionando aunque falle el correo */
    }
  }

  if (results.length) {
    await supabaseAdmin.from("security_alert_deliveries").upsert(results, {
      onConflict: "event_id",
    });
  }

  return Response.json({ sent: results.length });
}

export const Route = createFileRoute("/api/public/hooks/security-alerts")({
  server: {
    handlers: {
      POST: async ({ request }) => handle(request),
      GET: async ({ request }) => handle(request),
    },
  },
});
