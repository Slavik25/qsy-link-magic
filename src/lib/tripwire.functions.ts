import { createServerFn } from "@tanstack/react-start";

/**
 * Trampas anti-consola: registran un baneo total del sitio cuando alguien
 * intenta manipular la app desde la consola del navegador, y permiten
 * consultar si el visitante actual está baneado.
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

export const reportConsoleAttack = createServerFn({ method: "POST" })
  .inputValidator((input: ReportInput) => ({
    fingerprint: clean(input?.fingerprint, 64),
    kind: clean(input?.kind, 64) || "console_attack",
    detail: clean(input?.detail, 600),
    userId: input?.userId ? clean(input.userId, 64) : null,
  }))
  .handler(async ({ data }) => {
    if (!data.fingerprint) return { banned: false };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing } = await supabaseAdmin
      .from("site_bans")
      .select("id")
      .eq("fingerprint", data.fingerprint)
      .eq("active", true)
      .maybeSingle();

    if (existing) return { banned: true };

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
      fingerprint: data.fingerprint,
      reason: data.kind,
      evidence: { detail: data.detail, at: new Date().toISOString() } as never,
    });

    return { banned: true };
  });

export const checkBanStatus = createServerFn({ method: "POST" })
  .inputValidator((input: StatusInput) => ({
    fingerprint: clean(input?.fingerprint, 64),
    userId: input?.userId ? clean(input.userId, 64) : null,
  }))
  .handler(async ({ data }) => {
    if (!data.fingerprint && !data.userId) return { banned: false };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: banned } = await supabaseAdmin.rpc("is_banned", {
      _user_id: data.userId ?? "00000000-0000-0000-0000-000000000000",
      _fingerprint: data.fingerprint,
    });
    return { banned: !!banned };
  });
