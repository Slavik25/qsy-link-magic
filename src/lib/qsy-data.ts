import { useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { readTheme, type Profile, type ProfileLink, type Social } from "./qsy";

/** Columnas públicas de un perfil: nunca incluye identificadores internos de cuenta. */
const PUBLIC_PROFILE_COLUMNS =
  "id, user_id, username, display_name, bio, location, avatar_url, banner_url, verified, theme, music, featured, featured_until, created_at, updated_at, view_count, like_count, uid, rank, domain, username_set";

function shape(row: any): Profile {
  return { ...row, theme: readTheme(row.theme), music: row.music ?? {} } as Profile;
}

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => (await supabase.auth.getSession()).data.session,
  });
}

/* ---------- Active profile (each profile is a fully independent row) ---------- */

const ACTIVE_KEY = "qsy:active-profile";
const listeners = new Set<() => void>();
let activeId: string | null =
  typeof window !== "undefined" ? window.localStorage.getItem(ACTIVE_KEY) : null;

export function setActiveProfileId(id: string | null) {
  activeId = id;
  if (typeof window !== "undefined") {
    if (id) window.localStorage.setItem(ACTIVE_KEY, id);
    else window.localStorage.removeItem(ACTIVE_KEY);
  }
  listeners.forEach((l) => l());
}

export function useActiveProfileId() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    () => activeId,
    () => null,
  );
}

/** All profiles owned by the signed-in user. Each row is independent. */
export function useMyProfiles() {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return [] as Profile[];
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(shape);
    },
  });
}

/** The profile currently being edited/managed in the dashboard. */
export function useMyProfile() {
  const active = useActiveProfileId();
  const query = useMyProfiles();
  const list = query.data ?? [];
  const chosen = list.find((p) => p.id === active) ?? list[0] ?? null;
  return { ...query, data: query.data ? chosen : undefined };
}

export function useProfileByUsername(username: string) {
  return useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(PUBLIC_PROFILE_COLUMNS)
        .eq("username", username.toLowerCase())
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const profile = shape(data);
      const [links, socials, badges, views] = await Promise.all([
        supabase
          .from("links")
          .select("*")
          .eq("profile_id", profile.id)
          .eq("active", true)
          .order("position"),
        supabase.from("socials").select("*").eq("profile_id", profile.id).order("position"),
        supabase
          .from("profile_badges")
          .select("badge_key,position,created_at")
          .eq("profile_id", profile.id)
          .order("position"),
        Promise.resolve({ count: (data as any).view_count ?? 0 }),
      ]);
      return {
        profile,
        links: (links.data ?? []) as ProfileLink[],
        socials: (socials.data ?? []) as Social[],
        badges: (badges.data ?? []).map((b: { badge_key: string; created_at?: string }) => ({
          key: b.badge_key,
          obtained_at: b.created_at ?? null,
        })),
        views: views.count ?? 0,
        likes: ((data as any).like_count as number) ?? 0,
      };
    },
  });
}

export function useLinks(profileId?: string) {
  return useQuery({
    queryKey: ["links", profileId],
    enabled: !!profileId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("profile_id", profileId!)
        .order("position");
      if (error) throw error;
      return (data ?? []) as ProfileLink[];
    },
  });
}

export function useSocials(profileId?: string) {
  return useQuery({
    queryKey: ["socials", profileId],
    enabled: !!profileId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("socials")
        .select("*")
        .eq("profile_id", profileId!)
        .order("position");
      if (error) throw error;
      return (data ?? []) as Social[];
    },
  });
}

export function useAnalytics(profileId: string | undefined, days: number) {
  return useQuery({
    queryKey: ["analytics", profileId, days],
    enabled: !!profileId,
    queryFn: async () => {
      const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
      const [views, clicks] = await Promise.all([
        supabase
          .from("profile_views")
          .select("created_at,country,device,browser,referrer")
          .eq("profile_id", profileId!)
          .gte("created_at", since)
          .order("created_at", { ascending: false }),
        supabase
          .from("link_clicks")
          .select("created_at,label,country,device,referrer")
          .eq("profile_id", profileId!)
          .gte("created_at", since)
          .order("created_at", { ascending: false }),
      ]);
      const v = views.data ?? [];
      const c = clicks.data ?? [];
      const buckets = new Map<string, number>();
      const points = days <= 1 ? 24 : Math.min(days, 30);
      const step = (days * 24 * 3600 * 1000) / points;
      for (let i = points - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * step);
        buckets.set(
          days <= 1
            ? `${d.getHours()}h`
            : d.toLocaleDateString(undefined, { day: "2-digit", month: "short" }),
          0,
        );
      }
      const keys = [...buckets.keys()];
      for (const row of v) {
        const age = Date.now() - new Date(row.created_at as string).getTime();
        const idx = points - 1 - Math.min(points - 1, Math.floor(age / step));
        const key = keys[idx];
        if (key) buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }
      const tally = (rows: any[], field: string) => {
        const map = new Map<string, number>();
        for (const r of rows) {
          const k = (r[field] as string) || "unknown";
          map.set(k, (map.get(k) ?? 0) + 1);
        }
        return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
      };
      return {
        views: v.length,
        clicks: c.length,
        ctr: v.length ? Math.round((c.length / v.length) * 1000) / 10 : 0,
        series: keys.map((k) => ({ label: k, value: buckets.get(k) ?? 0 })),
        countries: tally(v, "country"),
        devices: tally(v, "device"),
        browsers: tally(v, "browser"),
        referrers: tally(v, "referrer"),
        recent: v.slice(0, 8),
        topLinks: tally(c, "label"),
      };
    },
  });
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: async () => {
      const [profiles, links, socials, badges, views] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("links").select("id", { count: "exact", head: true }),
        supabase.from("socials").select("id", { count: "exact", head: true }),
        supabase.from("profile_badges").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("view_count"),
      ]);
      const totalViews = (views.data ?? []).reduce(
        (sum, r: any) => sum + (r.view_count ?? 0),
        0,
      );
      return {
        views: totalViews,
        creators: profiles.count ?? 0,
        links: (links.count ?? 0) + (socials.count ?? 0),
        verified: badges.count ?? 0,
      };
    },
  });
}

export function useShowcaseProfiles(limit = 8) {
  return useQuery({
    queryKey: ["showcase-profiles", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, display_name, avatar_url, banner_url, verified, view_count, bio")
        .order("verified", { ascending: false })
        .order("view_count", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Perfiles marcados como destacados por el equipo desde el panel de admin. */
export function useFeaturedProfiles(limit = 6) {
  return useQuery({
    queryKey: ["featured-profiles", limit],
    queryFn: async () => {
      void supabase.rpc("expire_featured");
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, bio, avatar_url, banner_url, verified, rank, view_count, like_count, featured_until")
        .eq("featured", true)
        .or(`featured_until.is.null,featured_until.gt.${nowIso}`)
        .order("view_count", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });
}


export function useProfileBadges(profileId?: string) {
  return useQuery({
    queryKey: ["profile-badges", profileId],
    enabled: !!profileId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile_badges")
        .select("badge_key,position")
        .eq("profile_id", profileId!)
        .order("position");
      if (error) throw error;
      return (data ?? []).map((r: { badge_key: string }) => r.badge_key);
    },
  });
}
