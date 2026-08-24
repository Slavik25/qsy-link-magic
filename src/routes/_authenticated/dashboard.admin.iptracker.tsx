import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Globe2, Search } from "lucide-react";
import { AdminCard, Empty, Pill, Stat } from "@/components/qsy/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorldMap, type MapPoint } from "@/components/qsy/world-map";
import { supabase } from "@/integrations/supabase/client";
import { timeAgo } from "@/lib/admin-data";
import { lookupIp } from "@/lib/ip-tracker.functions";

export const Route = createFileRoute("/_authenticated/dashboard/admin/iptracker")({
  component: AdminIpTracker,
});

type IpRow = {
  id: string;
  ip: string;
  country: string | null;
  city: string | null;
  region: string | null;
  lat: number | null;
  lon: number | null;
  isp: string | null;
  timezone: string | null;
  proxy: boolean | null;
  username: string | null;
  user_id: string | null;
  event: string | null;
  path: string | null;
  user_agent: string | null;
  created_at: string;
};

type AuditRow = {
  id: string;
  kind: string;
  action: string;
  actor_name: string;
  actor_user_id: string | null;
  ip: string | null;
  detail: unknown;
  created_at: string;
};

function place(r: IpRow) {
  return [r.city, r.region, r.country].filter(Boolean).join(", ") || "Ubicación desconocida";
}

function AdminIpTracker() {
  const [query, setQuery] = useState("");
  const [manual, setManual] = useState("");
  const [lookup, setLookup] = useState<Record<string, unknown> | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const { data: logs } = useQuery({
    queryKey: ["admin-ip-tracker"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ip_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as unknown as IpRow[];
    },
    refetchInterval: 30_000,
  });

  const { data: activity } = useQuery({
    queryKey: ["admin-ip-activity", selected],
    enabled: !!selected,
    queryFn: async () => {
      const rows = (logs ?? []).filter((r) => r.ip === selected || r.username === selected);
      const userIds = [...new Set(rows.map((r) => r.user_id).filter(Boolean))] as string[];
      let q = supabase
        .from("audit_events")
        .select("id, kind, action, actor_name, actor_user_id, ip, detail, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      q = userIds.length
        ? q.or(`ip.eq.${selected},actor_user_id.in.(${userIds.join(",")})`)
        : q.eq("ip", selected!);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as AuditRow[];
    },
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = logs ?? [];
    if (!q) return rows;
    return rows.filter((r) =>
      [r.ip, r.username, r.country, r.city, r.isp, r.path].some((v) =>
        (v ?? "").toLowerCase().includes(q),
      ),
    );
  }, [logs, query]);

  const points = useMemo<MapPoint[]>(() => {
    const byIp = new Map<string, MapPoint>();
    for (const r of filtered) {
      if (r.lat == null || r.lon == null) continue;
      const found = byIp.get(r.ip);
      if (found) found.hits += 1;
      else
        byIp.set(r.ip, {
          id: r.ip,
          ip: r.ip,
          lat: r.lat,
          lon: r.lon,
          label: `${place(r)}${r.username ? ` · @${r.username}` : ""}`,
          hits: 1,
        });
    }
    return [...byIp.values()];
  }, [filtered]);

  const uniqueIps = new Set(filtered.map((r) => r.ip)).size;
  const countries = new Set(filtered.map((r) => r.country).filter(Boolean)).size;
  const proxies = filtered.filter((r) => r.proxy).length;

  const detail = selected ? filtered.filter((r) => r.ip === selected || r.username === selected) : [];

  async function runLookup() {
    try {
      const res = await lookupIp({ data: { ip: manual } });
      setLookup(res as Record<string, unknown>);
    } catch (e) {
      toast.error("No se pudo geolocalizar", { description: (e as Error).message });
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Registros" value={filtered.length} />
        <Stat label="IPs únicas" value={uniqueIps} />
        <Stat label="Países" value={countries} />
        <Stat label="VPN / Proxy" value={proxies} tone={proxies ? "danger" : "default"} />
      </div>

      <AdminCard title="Mapa de conexiones" desc="Cada punto es una IP registrada; tocá uno para ver su historial">
        <WorldMap points={points} onSelect={(ip) => setSelected(ip)} />
      </AdminCard>

      <AdminCard title="Geolocalizador manual" desc="Consultá cualquier IP al instante">
        <div className="flex flex-wrap gap-2">
          <Input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="8.8.8.8"
            className="max-w-[220px]"
          />
          <Button onClick={runLookup} className="gap-2">
            <Globe2 className="size-4" /> Localizar
          </Button>
        </div>
        {lookup && (
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl border border-border/60 bg-surface p-4 text-xs sm:grid-cols-4">
            {Object.entries(lookup).map(([k, v]) => (
              <div key={k}>
                <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{k}</div>
                <div className="truncate">{String(v ?? "—")}</div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      <AdminCard title="Registro de accesos" desc="Últimos 500 eventos con IP, cuenta y ubicación">
        <div className="mb-3 flex items-center gap-2">
          <Search className="size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por IP, usuario, país, ISP o ruta"
            className="max-w-sm"
          />
        </div>
        {filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-xs">
              <thead className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                <tr className="border-b border-border/60">
                  <th className="py-2 pr-3">IP</th>
                  <th className="py-2 pr-3">Cuenta</th>
                  <th className="py-2 pr-3">Ubicación</th>
                  <th className="py-2 pr-3">ISP</th>
                  <th className="py-2 pr-3">Evento</th>
                  <th className="py-2 pr-3">Ruta</th>
                  <th className="py-2">Cuándo</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 200).map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelected(r.ip)}
                    className="cursor-pointer border-b border-border/40 hover:bg-surface-strong"
                  >
                    <td className="py-2 pr-3 font-mono">
                      {r.ip} {r.proxy && <Pill tone="danger">vpn</Pill>}
                    </td>
                    <td className="py-2 pr-3">{r.username ? `@${r.username}` : "anon"}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{place(r)}</td>
                    <td className="max-w-[160px] truncate py-2 pr-3 text-muted-foreground">{r.isp ?? "—"}</td>
                    <td className="py-2 pr-3">{r.event ?? "pageview"}</td>
                    <td className="max-w-[180px] truncate py-2 pr-3 text-muted-foreground">{r.path ?? "—"}</td>
                    <td className="py-2 text-[10px] text-muted-foreground">{timeAgo(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty text="Todavía no hay accesos registrados." />
        )}
      </AdminCard>

      {selected && (
        <AdminCard
          title={`Historial de ${selected}`}
          desc="Todo lo que hizo esta IP y las cuentas asociadas"
        >
          <div className="mb-3 flex flex-wrap gap-2">
            {[...new Set(detail.map((d) => d.username).filter(Boolean))].map((u) => (
              <Pill key={u as string}>@{u}</Pill>
            ))}
            <Button size="sm" variant="outline" onClick={() => setSelected(null)}>
              Cerrar
            </Button>
          </div>
          <ul className="divide-y divide-border/50">
            {detail.slice(0, 50).map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-3 py-2 text-xs">
                <span className="font-mono text-[10px] text-primary">{d.event ?? "pageview"}</span>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">
                  {d.path ?? "—"} · {place(d)}
                </span>
                <span className="text-[10px] text-muted-foreground">{timeAgo(d.created_at)}</span>
              </li>
            ))}
            {(activity ?? []).map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 py-2 text-xs">
                <span className="font-mono text-[10px] text-primary">{a.action}</span>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">
                  {a.actor_name} · {a.kind}
                </span>
                <span className="text-[10px] text-muted-foreground">{timeAgo(a.created_at)}</span>
              </li>
            ))}
          </ul>
          {!detail.length && !(activity ?? []).length && <Empty text="Sin actividad para esta IP." />}
        </AdminCard>
      )}
    </div>
  );
}
