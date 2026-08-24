import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Geo = {
  country: string | null;
  city: string | null;
  region: string | null;
  lat: number | null;
  lon: number | null;
  isp: string | null;
  timezone: string | null;
  proxy: boolean;
};

const EMPTY: Geo = {
  country: null,
  city: null,
  region: null,
  lat: null,
  lon: null,
  isp: null,
  timezone: null,
  proxy: false,
};

/** Geolocaliza una IP con un servicio público gratuito (sin clave). */
async function geolocate(ip: string): Promise<Geo> {
  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      headers: { accept: "application/json" },
    });
    if (!res.ok) return EMPTY;
    const j = (await res.json()) as Record<string, unknown>;
    if (j["success"] === false) return EMPTY;
    const conn = (j["connection"] ?? {}) as Record<string, unknown>;
    const tz = (j["timezone"] ?? {}) as Record<string, unknown>;
    const sec = (j["security"] ?? {}) as Record<string, unknown>;
    return {
      country: (j["country"] as string) ?? null,
      city: (j["city"] as string) ?? null,
      region: (j["region"] as string) ?? null,
      lat: typeof j["latitude"] === "number" ? (j["latitude"] as number) : null,
      lon: typeof j["longitude"] === "number" ? (j["longitude"] as number) : null,
      isp: ((conn["isp"] as string) || (conn["org"] as string)) ?? null,
      timezone: (tz["id"] as string) ?? null,
      proxy: Boolean(sec["proxy"] || sec["vpn"] || sec["tor"]),
    };
  } catch {
    return EMPTY;
  }
}

type TrackInput = {
  path?: string | null;
  event?: string | null;
  userId?: string | null;
  username?: string | null;
  profileId?: string | null;
};

/**
 * Registra un acceso con su geolocalización. Reutiliza la geolocalización
 * cacheada de la misma IP para no golpear el servicio externo en cada visita.
 */
export const trackVisit = createServerFn({ method: "POST" })
  .inputValidator((input: TrackInput) => ({
    path: String(input?.path ?? "/").slice(0, 200),
    event: String(input?.event ?? "pageview").slice(0, 40),
    userId: input?.userId ? String(input.userId).slice(0, 64) : null,
    username: input?.username ? String(input.username).slice(0, 64) : null,
    profileId: input?.profileId ? String(input.profileId).slice(0, 64) : null,
  }))
  .handler(async ({ data }) => {
    const { requestIp, requestUserAgent } = await import("./tripwire-request.server");
    const ip = requestIp();
    if (!ip) return { logged: false as const };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: cached } = await supabaseAdmin
      .from("ip_logs")
      .select("country, city, region, lat, lon, isp, timezone, proxy")
      .eq("ip", ip)
      .not("lat", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const geo: Geo = cached?.lat != null ? ({ ...EMPTY, ...cached } as Geo) : await geolocate(ip);

    await supabaseAdmin.from("ip_logs").insert({
      ip,
      user_id: data.userId,
      profile_id: data.profileId,
      username: data.username,
      event: data.event,
      path: data.path,
      user_agent: requestUserAgent(),
      country: geo.country,
      city: geo.city,
      region: geo.region,
      lat: geo.lat,
      lon: geo.lon,
      isp: geo.isp,
      timezone: geo.timezone,
      proxy: geo.proxy,
    } as never);

    return { logged: true as const };
  });

/** Consulta manual de una IP desde el panel (solo administradores). */
export const lookupIp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { ip: string }) => ({ ip: String(input?.ip ?? "").trim().slice(0, 64) }))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    if (!data.ip) throw new Error("IP vacía");
    return { ip: data.ip, ...(await geolocate(data.ip)) };
  });
