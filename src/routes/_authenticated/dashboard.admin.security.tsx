import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminCard, Empty, Pill, Stat } from "@/components/qsy/admin-ui";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction, timeAgo, useAdminTable } from "@/lib/admin-data";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/dashboard/admin/security")({
  component: AdminSecurity,
});

type Threat = {
  id: string;
  kind: string;
  detail: string;
  severity: string;
  status: string;
  source_ip: string | null;
  created_at: string;
};
type IpLog = {
  id: string;
  ip: string;
  country: string | null;
  path: string | null;
  user_agent: string | null;
  created_at: string;
};
type Audit = {
  id: string;
  action: string;
  actor_name: string;
  target: string | null;
  created_at: string;
};

type SiteBan = {
  id: string;
  fingerprint: string | null;
  reason: string | null;
  user_id: string | null;
  active: boolean;
  created_at: string;
  evidence: { detail?: string } | null;
};

function AdminSecurity() {
  const qc = useQueryClient();
  const { data: bans } = useQuery({
    queryKey: ["admin-site-bans"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_bans")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      return (data ?? []) as unknown as SiteBan[];
    },
  });

  async function setBanActive(ban: SiteBan, active: boolean) {
    const { error } = await supabase.from("site_bans").update({ active }).eq("id", ban.id);
    if (error) {
      toast.error("No se pudo actualizar", { description: error.message });
      return;
    }
    await logAdminAction(active ? "siteban:keep" : "siteban:lift", ban.fingerprint ?? ban.id);
    toast.success(active ? "Baneo mantenido" : "Usuario desbaneado");
    void qc.invalidateQueries({ queryKey: ["admin-site-bans"] });
  }

  const { data: threats } = useAdminTable<Threat>("threats");
  const { data: ips } = useAdminTable<IpLog>("ip_logs");
  const { data: audit } = useAdminTable<Audit>("admin_audit_log");

  const attacks = (threats ?? []).filter((t) => t.severity === "high" || t.severity === "critical");

  async function close(t: Threat) {
    const { error } = await supabase.from("threats").update({ status: "closed" }).eq("id", t.id);
    if (error) {
      toast.error("Error", { description: error.message });
      return;
    }
    await logAdminAction("threat:close", t.id);
    toast.success("Amenaza cerrada");
    void qc.invalidateQueries({ queryKey: ["admin-table", "threats"] });
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Ataques graves" value={attacks.length} tone="danger" />
        <Stat label="Amenazas abiertas" value={(threats ?? []).filter((t) => t.status === "open").length} tone="danger" />
        <Stat label="IPs registradas" value={ips?.length ?? 0} />
      </div>

      <AdminCard title="Ataques y amenazas" desc="Eventos de seguridad detectados en la plataforma">
        {threats?.length ? (
          <ul className="space-y-2">
            {threats.map((t) => (
              <li
                key={t.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-surface px-4 py-3 text-xs"
              >
                <Pill tone={t.severity === "low" ? "default" : "danger"}>{t.severity}</Pill>
                <span className="font-medium">{t.kind}</span>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{t.detail}</span>
                {t.source_ip && <span className="font-mono text-[10px]">{t.source_ip}</span>}
                <span className="text-[10px] text-muted-foreground">{timeAgo(t.created_at)}</span>
                {t.status === "open" && (
                  <Button size="sm" variant="secondary" onClick={() => close(t)}>
                    Cerrar
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <Empty text="Sin amenazas registradas. Todo tranquilo." />
        )}
      </AdminCard>

      <AdminCard
        title="Baneos por consola"
        desc="Gente cazada intentando hackear la web desde la consola"
      >
        {bans?.length ? (
          <ul className="divide-y divide-border/50">
            {bans.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center gap-3 py-3 text-xs">
                <Pill>{b.active ? "Baneado" : "Perdonado"}</Pill>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {b.fingerprint?.slice(0, 14) ?? "—"}
                </span>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">
                  {b.reason ?? "console_attack"} · {b.evidence?.detail ?? "sin detalle"}
                </span>
                <span className="text-[10px] text-muted-foreground">{timeAgo(b.created_at)}</span>
                {b.active ? (
                  <Button size="sm" variant="outline" onClick={() => setBanActive(b, false)}>
                    Desbanear
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setBanActive(b, true)}>
                    Volver a banear
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <Empty text="Nadie cayó en las trampas todavía." />
        )}
      </AdminCard>

      <AdminCard title="Rastreo de IP" desc="Últimos accesos registrados">
        {ips?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-xs">
              <thead className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                <tr className="border-b border-border/60">
                  <th className="py-2 pr-3">IP</th>
                  <th className="py-2 pr-3">País</th>
                  <th className="py-2 pr-3">Ruta</th>
                  <th className="py-2 pr-3">Agente</th>
                  <th className="py-2">Cuándo</th>
                </tr>
              </thead>
              <tbody>
                {ips.map((r) => (
                  <tr key={r.id} className="border-b border-border/40">
                    <td className="py-2 pr-3 font-mono">{r.ip}</td>
                    <td className="py-2 pr-3">{r.country ?? "—"}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{r.path ?? "—"}</td>
                    <td className="max-w-[220px] truncate py-2 pr-3 text-muted-foreground">
                      {r.user_agent ?? "—"}
                    </td>
                    <td className="py-2 text-[10px] text-muted-foreground">{timeAgo(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty text="Sin registros de IP." />
        )}
      </AdminCard>

      <AdminCard title="Auditoría" desc="Todas las acciones del equipo administrador">
        {audit?.length ? (
          <ul className="divide-y divide-border/50">
            {audit.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-2.5 text-xs">
                <span className="font-mono text-[10px] text-primary">{a.action}</span>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">
                  {a.actor_name} → {a.target ?? "—"}
                </span>
                <span className="text-[10px] text-muted-foreground">{timeAgo(a.created_at)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty text="Sin acciones registradas." />
        )}
      </AdminCard>
    </div>
  );
}
