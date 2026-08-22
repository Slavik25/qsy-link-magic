import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

/**
 * Consulta de estado de suspensión. Es de solo lectura: no existe ningún
 * endpoint que permita crear baneos desde el navegador, así que ningún script
 * externo puede suspender a otros usuarios ni a sí mismo.
 */

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
