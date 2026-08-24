import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Mission = {
  key: string;
  name: string;
  description: string;
  goal: number;
  reward: number;
  difficulty: "difícil" | "muy difícil" | "extrema";
};

/** Misiones duras: la única forma de conseguir QSY Coins. */
export const MISSIONS: Mission[] = [
  { key: "bio_complete", name: "Identidad completa", description: "Ten un perfil con bio de más de 20 caracteres, avatar y banner.", goal: 1, reward: 250, difficulty: "difícil" },
  { key: "two_profiles", name: "Doble vida", description: "Crea y mantén 2 biolinks independientes.", goal: 2, reward: 150, difficulty: "difícil" },
  { key: "links_10", name: "Coleccionista", description: "Añade 10 conexiones entre todos tus perfiles.", goal: 10, reward: 200, difficulty: "difícil" },
  { key: "chat_50", name: "Voz de la comunidad", description: "Envía 50 mensajes en el chat global.", goal: 50, reward: 250, difficulty: "difícil" },
  { key: "wall_25", name: "Muro vivo", description: "Recibe 25 mensajes en los muros de tus perfiles.", goal: 25, reward: 350, difficulty: "muy difícil" },
  { key: "likes_50", name: "Querido por todos", description: "Acumula 50 likes en tus perfiles.", goal: 50, reward: 400, difficulty: "muy difícil" },
  { key: "views_100", name: "Primeras cien", description: "Alcanza 100 visitas totales.", goal: 100, reward: 300, difficulty: "difícil" },
  { key: "badges_5", name: "Vitrina", description: "Consigue 5 insignias otorgadas por el staff.", goal: 5, reward: 600, difficulty: "muy difícil" },
  { key: "views_1000", name: "Viral", description: "Alcanza 1.000 visitas totales.", goal: 1000, reward: 800, difficulty: "extrema" },
  { key: "verified", name: "Sello azul", description: "Consigue la verificación oficial de QSY.", goal: 1, reward: 1000, difficulty: "extrema" },
];

export function useWallet() {
  return useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return 0;
      const { data } = await supabase
        .from("user_wallets")
        .select("coins")
        .eq("user_id", auth.user.id)
        .maybeSingle();
      return data?.coins ?? 0;
    },
  });
}

export function useUnlocks() {
  return useQuery({
    queryKey: ["unlocks"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return [] as string[];
      const { data } = await supabase.from("user_unlocks").select("item_key").eq("user_id", auth.user.id);
      return (data ?? []).map((r) => r.item_key as string);
    },
  });
}

export function useMissionState() {
  return useQuery({
    queryKey: ["missions"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return { progress: {} as Record<string, number>, claimed: [] as string[] };
      const [{ data: claims }, ...progressResults] = await Promise.all([
        supabase.from("mission_claims").select("mission_key").eq("user_id", auth.user.id),
        ...MISSIONS.map((m) => supabase.rpc("mission_progress", { _key: m.key })),
      ]);
      const progress: Record<string, number> = {};
      MISSIONS.forEach((m, i) => {
        progress[m.key] = Number(progressResults[i]?.data ?? 0);
      });
      return {
        progress,
        claimed: (claims ?? []).map((c) => c.mission_key as string),
      };
    },
  });
}

export async function claimMission(key: string) {
  const { data, error } = await supabase.rpc("claim_mission", { _key: key });
  if (error) throw error;
  return Number(data ?? 0);
}

export async function purchaseItem(key: string) {
  const { data, error } = await supabase.rpc("purchase_item", { _key: key });
  if (error) throw error;
  return Number(data ?? 0);
}

/** Compra 24 h de destacado para un perfil propio. Devuelve la fecha de expiración. */
export async function purchaseFeatured(profileId: string) {
  const { data, error } = await supabase.rpc("purchase_featured", { _profile_id: profileId });
  if (error) throw error;
  return String(data);
}

export const FEATURED_PRICE = 1500;

/* ============ Recompensa diaria / racha ============ */

export type StreakState = {
  current: number;
  best: number;
  total: number;
  lastClaim: string | null;
  claimedToday: boolean;
};

/** Recompensa que otorga reclamar el día `streak` de la racha. */
export function dailyReward(streak: number) {
  const base = Math.min(25 + (Math.max(1, streak) - 1) * 10, 150);
  return base + (streak % 7 === 0 ? 200 : 0);
}

export function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

export function useStreak() {
  return useQuery({
    queryKey: ["streak"],
    queryFn: async (): Promise<StreakState> => {
      const empty: StreakState = { current: 0, best: 0, total: 0, lastClaim: null, claimedToday: false };
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return empty;
      const { data } = await supabase
        .from("user_streaks")
        .select("current_days, best_days, total_claims, last_claim_date")
        .eq("user_id", auth.user.id)
        .maybeSingle();
      if (!data) return empty;
      const today = todayUTC();
      const last = data.last_claim_date as string | null;
      // Si se saltó un día, la racha mostrada vuelve a cero.
      const broken = !!last && last < new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      return {
        current: broken ? 0 : (data.current_days ?? 0),
        best: data.best_days ?? 0,
        total: data.total_claims ?? 0,
        lastClaim: last,
        claimedToday: last === today,
      };
    },
  });
}

export async function claimDaily() {
  const { data, error } = await supabase.rpc("claim_daily_reward");
  if (error) throw error;
  return (data ?? {}) as {
    streak: number;
    reward: number;
    bonus: number;
    balance: number;
    milestone: number | null;
    milestone_item: string | null;
    milestone_reward: number;
  };
}

/** Hitos escalonados de racha (deben coincidir con claim_daily_reward en la base de datos). */
export const STREAK_MILESTONES = [
  { days: 7, reward: 250, item: "name-lavender", itemName: "Nombre Lavender" },
  { days: 30, reward: 750, item: "bg-glitch", itemName: "Fondo Glitch" },
  { days: 90, reward: 2000, item: "layout-solar", itemName: "Layout Solaris" },
] as const;

export type StreakClaim = {
  claim_date: string;
  streak: number;
  reward: number;
  bonus: number;
  milestone_days: number | null;
  milestone_reward: number;
  milestone_item: string | null;
  balance_after: number;
};

export function useStreakHistory() {
  return useQuery({
    queryKey: ["streak-history"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return { claims: [] as StreakClaim[], milestones: [] as number[] };
      const [claims, milestones] = await Promise.all([
        supabase
          .from("streak_claims")
          .select("claim_date, streak, reward, bonus, milestone_days, milestone_reward, milestone_item, balance_after")
          .eq("user_id", auth.user.id)
          .order("claim_date", { ascending: false })
          .limit(180),
        supabase.from("streak_milestones").select("days").eq("user_id", auth.user.id),
      ]);
      return {
        claims: (claims.data ?? []) as StreakClaim[],
        milestones: (milestones.data ?? []).map((m) => m.days as number),
      };
    },
  });
}
