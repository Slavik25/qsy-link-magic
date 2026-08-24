import { createServerFn } from "@tanstack/react-start";

/**
 * Límites antiabuso para el registro sin verificación de email.
 * Se aplican por IP: intentos por hora y cuentas creadas por día.
 */
export const MAX_ATTEMPTS_PER_HOUR = 10;
export const MAX_ACCOUNTS_PER_DAY = 3;

type GuardResult = { ok: true } | { ok: false; error: string };

export const checkSignupAllowed = createServerFn({ method: "POST" })
  .inputValidator((data: { kind?: string }) => ({ kind: data?.kind === "code" ? "code" : "email" }))
  .handler(async ({ data }): Promise<GuardResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { requestIp, requestUserAgent } = await import("@/lib/tripwire-request.server");
    const ip = requestIp();
    const ua = requestUserAgent();

    if (!ip) return { ok: true };

    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { count: attempts } = await supabaseAdmin
      .from("signup_attempts")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .gte("created_at", hourAgo);

    if ((attempts ?? 0) >= MAX_ATTEMPTS_PER_HOUR) {
      await supabaseAdmin.from("signup_attempts").insert({
        ip,
        kind: data.kind,
        ok: false,
        reason: "too_many_attempts",
        user_agent: ua,
      });
      return { ok: false, error: "Demasiados intentos desde tu conexión. Probá de nuevo en una hora." };
    }

    const { count: created } = await supabaseAdmin
      .from("signup_attempts")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .eq("ok", true)
      .gte("created_at", dayAgo);

    if ((created ?? 0) >= MAX_ACCOUNTS_PER_DAY) {
      await supabaseAdmin.from("signup_attempts").insert({
        ip,
        kind: data.kind,
        ok: false,
        reason: "daily_account_limit",
        user_agent: ua,
      });
      return {
        ok: false,
        error: `Se alcanzó el límite de ${MAX_ACCOUNTS_PER_DAY} cuentas por día desde esta conexión.`,
      };
    }

    return { ok: true };
  });

/** Registra que la cuenta se creó correctamente (cuenta para el límite diario). */
export const recordSignupSuccess = createServerFn({ method: "POST" })
  .inputValidator((data: { kind?: string }) => ({ kind: data?.kind === "code" ? "code" : "email" }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { requestIp, requestUserAgent } = await import("@/lib/tripwire-request.server");
    const ip = requestIp();
    if (!ip) return { ok: true as const };
    await supabaseAdmin.from("signup_attempts").insert({
      ip,
      kind: data.kind,
      ok: true,
      reason: "created",
      user_agent: requestUserAgent(),
    });
    return { ok: true as const };
  });
