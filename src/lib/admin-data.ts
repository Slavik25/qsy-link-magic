import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useIsAdmin() {
  return useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return false;
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: auth.user.id,
        _role: "admin",
      });
      if (error) return false;
      return !!data;
    },
    staleTime: 60_000,
  });
}

export async function logAdminAction(action: string, target?: string, meta: Record<string, unknown> = {}) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;
  const { data: me } = await supabase
    .from("profiles")
    .select("username")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  await supabase.from("admin_audit_log").insert({
    actor_id: auth.user.id,
    actor_name: me?.username ?? "admin",
    action,
    target: target ?? null,
    meta: meta as never,
  });
}

export type AdminProfile = {
  id: string;
  uid: number;
  username: string;
  display_name: string;
  avatar_url: string | null;
  banner_url: string | null;
  verified: boolean;
  featured: boolean;
  view_count: number;
  like_count: number;
  created_at: string;
  user_id: string | null;
  bio: string;
  rank?: string;
  domain?: string;
};


export function useAdminUsers(search: string) {
  return useQuery({
    queryKey: ["admin-users", search],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select(
          "id, uid, username, display_name, avatar_url, banner_url, verified, featured, view_count, like_count, created_at, user_id, bio, rank, domain",
        )
        .order("uid", { ascending: true })
        .limit(200);
      if (search.trim()) query = query.ilike("username", `%${search.trim().toLowerCase()}%`);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as AdminProfile[];
    },
  });
}

export function useAdminOverview() {
  return useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const since24 = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      const since7 = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
      const [
        profiles,
        links,
        badges,
        wall,
        views24,
        newUsers7,
        reportsOpen,
        threatsOpen,
        bans,
        totals,
        series,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("links").select("id", { count: "exact", head: true }),
        supabase.from("profile_badges").select("id", { count: "exact", head: true }),
        supabase.from("wall_posts").select("id", { count: "exact", head: true }),
        supabase.from("profile_views").select("id", { count: "exact", head: true }).gte("created_at", since24),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since7),
        supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("threats").select("id", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("sanctions").select("id", { count: "exact", head: true }).eq("active", true),
        supabase.from("profiles").select("view_count, like_count"),
        supabase.from("profile_views").select("created_at").gte("created_at", since7),
      ]);

      const rows = (totals.data ?? []) as { view_count: number; like_count: number }[];
      const buckets = new Map<string, number>();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 3600 * 1000);
        buckets.set(d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" }), 0);
      }
      for (const r of series.data ?? []) {
        const key = new Date(r.created_at as string).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
        });
        if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }

      return {
        users: profiles.count ?? 0,
        links: links.count ?? 0,
        badges: badges.count ?? 0,
        wall: wall.count ?? 0,
        views24: views24.count ?? 0,
        newUsers7: newUsers7.count ?? 0,
        reportsOpen: reportsOpen.count ?? 0,
        threatsOpen: threatsOpen.count ?? 0,
        activeBans: bans.count ?? 0,
        totalViews: rows.reduce((s, r) => s + (r.view_count ?? 0), 0),
        totalLikes: rows.reduce((s, r) => s + (r.like_count ?? 0), 0),
        series: [...buckets.entries()].map(([label, value]) => ({ label, value })),
      };
    },
  });
}

export function useGlobalActivity(limit = 40) {
  return useQuery({
    queryKey: ["admin-activity", limit],
    queryFn: async () => {
      const [profiles, views, clicks, wall] = await Promise.all([
        supabase.from("profiles").select("username, created_at").order("created_at", { ascending: false }).limit(limit),
        supabase.from("profile_views").select("created_at, country, device, referrer").order("created_at", { ascending: false }).limit(limit),
        supabase.from("link_clicks").select("created_at, label, country").order("created_at", { ascending: false }).limit(limit),
        supabase.from("wall_posts").select("created_at, author_name, message").order("created_at", { ascending: false }).limit(limit),
      ]);
      type Ev = { at: string; kind: string; text: string };
      const events: Ev[] = [
        ...(profiles.data ?? []).map((r) => ({
          at: r.created_at as string,
          kind: "signup",
          text: `Nuevo perfil @${r.username}`,
        })),
        ...(views.data ?? []).map((r) => ({
          at: r.created_at as string,
          kind: "view",
          text: `Visita · ${r.country ?? "??"} · ${r.device ?? "desconocido"}`,
        })),
        ...(clicks.data ?? []).map((r) => ({
          at: r.created_at as string,
          kind: "click",
          text: `Click en ${r.label ?? "link"} · ${r.country ?? "??"}`,
        })),
        ...(wall.data ?? []).map((r) => ({
          at: r.created_at as string,
          kind: "wall",
          text: `${r.author_name}: ${String(r.message).slice(0, 60)}`,
        })),
      ];
      return events.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, limit);
    },
  });
}

export function useAdminTable<T = Record<string, unknown>>(
  table:
    | "sanctions"
    | "reports"
    | "threats"
    | "ip_logs"
    | "banned_usernames"
    | "admin_audit_log"
    | "devblog_posts"
    | "service_status"
    | "boosts"
    | "wall_posts"
    | "profile_badges",
  orderBy = "created_at",
) {
  return useQuery({
    queryKey: ["admin-table", table],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order(orderBy, { ascending: false })
        .limit(300);
      if (error) throw error;
      return (data ?? []) as unknown as T[];
    },
  });
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
}
