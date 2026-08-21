import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { readTheme, type Profile, type ProfileLink, type Social } from "./qsy";

function shape(row: any): Profile {
  return { ...row, theme: readTheme(row.theme), music: row.music ?? {} } as Profile;
}

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => (await supabase.auth.getSession()).data.session,
  });
}

export function useMyProfile() {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", auth.user.id)
        .maybeSingle();
      if (error) throw error;
      return data ? shape(data) : null;
    },
  });
}

export function useProfileByUsername(username: string) {
  return useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username.toLowerCase())
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const profile = shape(data);
      const [links, socials, views] = await Promise.all([
        supabase
          .from("links")
          .select("*")
          .eq("profile_id", profile.id)
          .eq("active", true)
          .order("position"),
        supabase.from("socials").select("*").eq("profile_id", profile.id).order("position"),
        supabase
          .from("profile_views")
          .select("id", { count: "exact", head: true })
          .eq("profile_id", profile.id),
      ]);
      return {
        profile,
        links: (links.data ?? []) as ProfileLink[],
        socials: (socials.data ?? []) as Social[],
        views: views.count ?? 0,
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
