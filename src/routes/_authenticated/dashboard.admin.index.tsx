import { createFileRoute } from "@tanstack/react-router";
import { AdminCard, Empty, Stat } from "@/components/qsy/admin-ui";
import { timeAgo, useAdminOverview, useGlobalActivity } from "@/lib/admin-data";

export const Route = createFileRoute("/_authenticated/dashboard/admin/")({
  component: AdminOverview,
});

const KIND_LABEL: Record<string, string> = {
  signup: "Registro",
  view: "Visita",
  click: "Click",
  wall: "Muro",
};

function AdminOverview() {
  const { data: o } = useAdminOverview();
  const { data: activity } = useGlobalActivity(30);
  const max = Math.max(1, ...(o?.series ?? []).map((s) => s.value));

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Usuarios" value={o?.users ?? 0} hint={`+${o?.newUsers7 ?? 0} en 7 días`} />
        <Stat label="Visitas totales" value={o?.totalViews ?? 0} hint={`${o?.views24 ?? 0} en 24 h`} />
        <Stat label="Likes totales" value={o?.totalLikes ?? 0} />
        <Stat label="Conexiones" value={o?.links ?? 0} />
        <Stat label="Denuncias abiertas" value={o?.reportsOpen ?? 0} tone="danger" />
        <Stat label="Amenazas abiertas" value={o?.threatsOpen ?? 0} tone="danger" />
        <Stat label="Sanciones activas" value={o?.activeBans ?? 0} tone="danger" />
        <Stat label="Mensajes en muros" value={o?.wall ?? 0} />
      </div>

      <AdminCard title="Analíticas globales" desc="Visitas registradas en toda la red durante los últimos 7 días">
        <div className="flex h-44 items-end gap-2">
          {(o?.series ?? []).map((s) => (
            <div key={s.label} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="bar-grow w-full rounded-t-md bg-gradient-to-t from-primary/20 to-primary"
                style={{ height: `${Math.max(4, (s.value / max) * 100)}%` }}
                title={`${s.value} visitas`}
              />
              <span className="text-[9px] text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard title="Actividad global" desc="Todo lo que ocurre en QSY en tiempo real">
        {activity?.length ? (
          <ul className="divide-y divide-border/50">
            {activity.map((e, i) => (
              <li key={`${e.at}-${i}`} className="flex items-center gap-3 py-2.5 text-xs">
                <span className="w-16 shrink-0 rounded-md border border-border/60 px-1.5 py-0.5 text-center text-[9px] uppercase tracking-wider text-muted-foreground">
                  {KIND_LABEL[e.kind] ?? e.kind}
                </span>
                <span className="min-w-0 flex-1 truncate">{e.text}</span>
                <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo(e.at)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty text="Sin actividad todavía." />
        )}
      </AdminCard>
    </div>
  );
}
