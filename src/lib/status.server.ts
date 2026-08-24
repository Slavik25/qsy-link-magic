import { createClient } from "@supabase/supabase-js";

export type ServiceCheck = {
  key: string;
  name: string;
  status: "operational" | "degraded" | "down" | "maintenance";
  latency_ms: number;
  note: string;
};

export type StatusSnapshot = {
  checked_at: string;
  overall: "operational" | "degraded" | "down" | "maintenance";
  services: ServiceCheck[];
  announcements: { id: string; name: string; status: string; note: string; updated_at: string }[];
};

function classify(ms: number, ok: boolean): ServiceCheck["status"] {
  if (!ok) return "down";
  if (ms > 1500) return "degraded";
  return "operational";
}

async function timed(fn: () => Promise<boolean>): Promise<{ ms: number; ok: boolean }> {
  const t0 = Date.now();
  try {
    const ok = await fn();
    return { ms: Date.now() - t0, ok };
  } catch {
    return { ms: Date.now() - t0, ok: false };
  }
}

export async function collectStatus(): Promise<StatusSnapshot> {
  const url = process.env["SUPABASE_URL"] ?? "";
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? "";
  const client = createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

  const [db, auth, storage, api] = await Promise.all([
    timed(async () => {
      const { error } = await client.from("profiles").select("id", { count: "exact", head: true });
      return !error;
    }),
    timed(async () => (await fetch(`${url}/auth/v1/health`, { headers: { apikey: key } })).ok),
    timed(async () => {
      const r = await fetch(`${url}/storage/v1/bucket`, { headers: { apikey: key } });
      return r.status < 500;
    }),
    timed(async () => {
      const { error } = await client.from("service_status").select("id").limit(1);
      return !error;
    }),
  ]);

  const services: ServiceCheck[] = [
    {
      key: "web",
      name: "Web y biolinks",
      status: "operational",
      latency_ms: 0,
      note: "Renderizado de perfiles y páginas públicas",
    },
    {
      key: "database",
      name: "Base de datos",
      status: classify(db.ms, db.ok),
      latency_ms: db.ms,
      note: "Perfiles, enlaces y estadísticas",
    },
    {
      key: "auth",
      name: "Autenticación",
      status: classify(auth.ms, auth.ok),
      latency_ms: auth.ms,
      note: "Registro, inicio de sesión y códigos de acceso",
    },
    {
      key: "storage",
      name: "Almacenamiento e Image Host",
      status: classify(storage.ms, storage.ok),
      latency_ms: storage.ms,
      note: "Avatares, banners, audio y galería",
    },
    {
      key: "api",
      name: "API interna",
      status: classify(api.ms, api.ok),
      latency_ms: api.ms,
      note: "Funciones de servidor y webhooks",
    },
  ];

  const { data: rows } = await client
    .from("service_status")
    .select("id,name,status,note,updated_at")
    .order("name");

  const announcements = (rows ?? []).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    status: r.status as string,
    note: (r.note as string) ?? "",
    updated_at: r.updated_at as string,
  }));

  const manualDown = announcements.some((a) => a.status === "down");
  const manualMaint = announcements.some((a) => a.status === "maintenance");
  const manualDeg = announcements.some((a) => a.status === "degraded");

  const overall: StatusSnapshot["overall"] = services.some((s) => s.status === "down") || manualDown
    ? "down"
    : manualMaint
      ? "maintenance"
      : services.some((s) => s.status === "degraded") || manualDeg
        ? "degraded"
        : "operational";

  return { checked_at: new Date().toISOString(), overall, services, announcements };
}
