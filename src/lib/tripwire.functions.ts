import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

/**
 * Trampas anti-consola: registran un baneo total del sitio cuando alguien
 * intenta manipular la app desde la consola del navegador, y permiten
 * consultar si el visitante actual está baneado.
 *
 * El baneo se guarda además por IP y user agent, de forma que borrar el
 * localStorage o la huella desde la consola no sirve para desbanearse.
 */

type ReportInput = {
  fingerprint: string;
  kind: string;
  detail: string;
  userId?: string | null;
};

type StatusInput = {
  fingerprint: string;
  userId?: string | null;
};

function clean(value: unknown, max = 400): string {
  return String(value ?? "").slice(0, max);
}

/** IP real del visitante detrás del proxy/CDN. */
function requestIp(): string | null {
  try {
    const h = getRequest().headers;
    const raw =
      h.get("cf-connecting-ip") ||
      h.get("x-real-ip") ||
      (h.get("x-forwarded-for") ?? "").split(",")[0] ||
      "";
    const ip = raw.trim();
    return ip ? ip.slice(0, 64) : null;
  } catch {
    return null;
  }
}

function requestUserAgent(): string | null {
  try {
    return (getRequest().headers.get("user-agent") ?? "").slice(0, 300) || null;
  } catch {
    return null;
  }
}

export const reportConsoleAttack = createServerFn({ method: "POST" })
  .inputValidator((input: ReportInput) => ({
    fingerprint: clean(input?.fingerprint, 64),
    kind: clean(input?.kind, 64) || "console_attack",
    detail: clean(input?.detail, 600),
    userId: input?.userId ? clean(input.userId, 64) : null,
  }))
  .handler(async ({ data }) => {
    const ip = requestIp();
    const userAgent = requestUserAgent();
    if (!data.fingerprint && !ip && !data.userId) return { banned: false };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let profileId: string | null = null;
    if (data.userId) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("user_id", data.userId)
        .maybeSingle();
      profileId = profile?.id ?? null;
    }

    await supabaseAdmin.from("site_bans").insert({
      user_id: data.userId,
      profile_id: profileId,
      fingerprint: data.fingerprint || null,
      ip,
      user_agent: userAgent,
      reason: data.kind,
      evidence: { detail: data.detail, at: new Date().toISOString(), ip } as never,
    });

    return { banned: true };
  });

export const checkBanStatus = createServerFn({ method: "POST" })
  .inputValidator((input: StatusInput) => ({
    fingerprint: clean(input?.fingerprint, 64),
    userId: input?.userId ? clean(input.userId, 64) : null,
  }))
  .handler(async ({ data }) => {
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
