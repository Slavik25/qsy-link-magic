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
