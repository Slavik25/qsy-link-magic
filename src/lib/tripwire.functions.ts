import { createServerFn } from "@tanstack/react-start";

/**
 * Consulta de estado de suspensión. Es de solo lectura: no existe ningún
 * endpoint que permita crear baneos desde el navegador, así que ningún script
 * externo puede suspender a otros usuarios ni a sí mismo.
 */

type StatusInput = {
  fingerprint: string;
  userId?: string | null;
};

export const checkBanStatus = createServerFn({ method: "POST" })
  .inputValidator((input: StatusInput) => ({
    fingerprint: String(input?.fingerprint ?? "").slice(0, 64),
    userId: input?.userId ? String(input.userId).slice(0, 64) : null,
  }))
  .handler(async ({ data }) => {
    const { requestIp } = await import("./tripwire-request.server");
    const ip = requestIp();
    if (!data.fingerprint && !data.userId && !ip) return { banned: false };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const ors: string[] = [];
    if (data.userId) ors.push(`user_id.eq.${data.userId}`);
    if (data.fingerprint) ors.push(`fingerprint.eq.${data.fingerprint}`);
    if (ip) ors.push(`ip.eq.${ip}`);

    const { data: rows } = await supabaseAdmin
      .from("site_bans")
      .select("id")
      .eq("active", true)
      .or(ors.join(","))
      .limit(1);

    return { banned: !!rows?.length };
  });

type ConsoleAlertInput = {
  signal: string;
  detail?: string;
  userId?: string | null;
  fingerprint?: string;
};

/**
 * Registra (solo registra: nunca banea) señales de manipulación desde la
 * consola del navegador para que queden visibles en el panel de auditoría.
 */
export const reportConsoleSignal = createServerFn({ method: "POST" })
  .inputValidator((input: ConsoleAlertInput) => ({
    signal: String(input?.signal ?? "unknown").slice(0, 64),
    detail: String(input?.detail ?? "").slice(0, 500),
    userId: input?.userId ? String(input.userId).slice(0, 64) : null,
    fingerprint: String(input?.fingerprint ?? "").slice(0, 64),
  }))
  .handler(async ({ data }) => {
    const { requestIp, requestUserAgent } = await import("./tripwire-request.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    await supabaseAdmin.from("audit_events").insert({
      kind: "shop",
      action: "console_tamper_detected",
      actor_user_id: data.userId,
      actor_name: "console",
      source: "browser",
      ip: requestIp(),
      user_agent: requestUserAgent(),
      detail: {
        signal: data.signal,
        detail: data.detail,
        fingerprint: data.fingerprint,
      },
    });

    return { logged: true };
  });
