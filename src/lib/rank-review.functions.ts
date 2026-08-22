import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type RankCandidate = {
  profileId: string;
  username: string;
  rank: string;
  userId: string | null;
  gifts: number;
  paidOrders: number;
  reviewId: string | null;
  status: "pending" | "legit_gift" | "manual_adjust" | null;
  note: string;
  resolvedAt: string | null;
};

/** Lista los rangos premium y su respaldo (regalo o pago) para revisión manual. */
export const listRankCandidates = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ ok: boolean; rows: RankCandidate[] }> => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) return { ok: false, rows: [] };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: profiles }, { data: gifts }, { data: orders }, { data: reviews }] =
      await Promise.all([
        supabaseAdmin
          .from("profiles")
          .select("id, username, rank, user_id")
          .neq("rank", "free")
          .order("username"),
        supabaseAdmin.from("rank_gifts").select("recipient_user_id"),
        supabaseAdmin.from("payment_orders").select("recipient_user_id, status").eq("status", "paid"),
        supabaseAdmin
          .from("rank_reviews")
          .select("id, profile_id, status, note, resolved_at, created_at")
          .order("created_at", { ascending: false }),
      ]);

    const giftCount = new Map<string, number>();
    for (const g of gifts ?? []) {
      const key = g.recipient_user_id as string | null;
      if (key) giftCount.set(key, (giftCount.get(key) ?? 0) + 1);
    }
    const paidCount = new Map<string, number>();
    for (const o of orders ?? []) {
      const key = o.recipient_user_id as string | null;
      if (key) paidCount.set(key, (paidCount.get(key) ?? 0) + 1);
    }
    const latestReview = new Map<string, (typeof reviews extends null ? never : NonNullable<typeof reviews>)[number]>();
    for (const r of reviews ?? []) {
      if (!latestReview.has(r.profile_id as string)) latestReview.set(r.profile_id as string, r);
    }

    const rows: RankCandidate[] = (profiles ?? []).map((p) => {
      const review = latestReview.get(p.id as string);
      return {
        profileId: p.id as string,
        username: p.username as string,
        rank: p.rank as string,
        userId: (p.user_id as string | null) ?? null,
        gifts: p.user_id ? (giftCount.get(p.user_id as string) ?? 0) : 0,
        paidOrders: p.user_id ? (paidCount.get(p.user_id as string) ?? 0) : 0,
        reviewId: (review?.id as string) ?? null,
        status: (review?.status as RankCandidate["status"]) ?? null,
        note: (review?.note as string) ?? "",
        resolvedAt: (review?.resolved_at as string | null) ?? null,
      };
    });

    return { ok: true, rows };
  });

type OpenInput = { profileId: string; reason?: string };

/** Abre un caso de revisión para un rango premium sin respaldo claro. */
export const openRankReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: OpenInput) => ({
    profileId: String(input?.profileId ?? ""),
    reason: String(input?.reason ?? "").slice(0, 300),
  }))
  .handler(async ({ context, data }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) return { ok: false as const, error: "no autorizado" };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, username, rank")
      .eq("id", data.profileId)
      .maybeSingle();
    if (!profile) return { ok: false as const, error: "perfil no encontrado" };

    const { data: existing } = await supabaseAdmin
      .from("rank_reviews")
      .select("id")
      .eq("profile_id", profile.id)
      .eq("status", "pending")
      .maybeSingle();
    if (existing) return { ok: true as const, reviewId: existing.id as string };

    const { data: created, error } = await supabaseAdmin
      .from("rank_reviews")
      .insert({
        profile_id: profile.id,
        username: profile.username,
        rank: profile.rank,
        reason: data.reason || "rango premium sin pago ni regalo registrado",
      })
      .select("id")
      .maybeSingle();
    if (error) return { ok: false as const, error: error.message };

    await supabaseAdmin.from("audit_events").insert({
      kind: "role",
      action: "rank_review_opened",
      actor_user_id: context.userId,
      actor_name: "admin",
      profile_id: profile.id,
      source: "admin_panel",
      detail: { username: profile.username, rank: profile.rank, reason: data.reason },
    });

    return { ok: true as const, reviewId: (created?.id as string) ?? null };
  });
