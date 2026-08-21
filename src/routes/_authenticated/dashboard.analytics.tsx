import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, CalendarDays, Eye, MousePointerClick, Zap } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAnalytics, useMyProfile } from "@/lib/qsy-data";

export const Route = createFileRoute("/_authenticated/dashboard/analytics")({
  component: AnalyticsPage,
  head: () => ({
    meta: [
      { title: "Analytics · Dashboard QSY" },
      { name: "description", content: "Mide visitas, clics y audiencia de tu biolink QSY en tiempo real." },
    ],
  }),
});

const RANGES = [
  { value: "1", label: "Últimas 24 horas" },
  { value: "3", label: "Últimos 3 días" },
  { value: "7", label: "Últimos 7 días" },
  { value: "30", label: "Últimos 30 días" },
  { value: "90", label: "Últimos 90 días" },
];

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Eye;
}) {
  return (
    <div className="rounded-2xl border border-primary/25 bg-primary/[0.07] p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium">{label}</p>
        <Icon className="size-4 text-primary" />
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Panel({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: [string, number][];
  empty: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <section className="rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl">
      <h2 className="text-sm font-medium">{title}</h2>
      {rows.length === 0 ? (
        <div className="grid h-32 place-items-center text-center">
          <div>
            <p className="text-sm font-medium">{empty}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Comparte tu página de QSY en redes para conseguir más datos.
            </p>
          </div>
        </div>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {rows.map(([label, count]) => (
            <li key={label}>
              <div className="flex justify-between text-sm">
                <span className="truncate">{label}</span>
                <span className="text-muted-foreground">{count}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-surface-strong">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AnalyticsPage() {
  const [days, setDays] = useState("7");
  const n = Number(days);
  const { data: profile } = useMyProfile();
  const { data: stats } = useAnalytics(profile?.id, n);

  const rangeLabel = RANGES.find((r) => r.value === days)?.label.toLowerCase() ?? "";
  const avgDaily = Math.round(((stats?.views ?? 0) / Math.max(1, n)) * 10) / 10;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <BarChart3 className="size-5 text-primary" /> Analytics de la cuenta
        </h1>
        <p className="text-sm text-muted-foreground">
          Mide el rendimiento de tu perfil y quién lo está visitando.
        </p>
      </header>

      <div className="rounded-2xl border border-border/60 bg-card/40 p-4 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-primary">Rango temporal</span>
          <span className="rounded-full border border-border/60 px-2.5 py-0.5 text-[11px] text-muted-foreground">
            Actualizado hace menos de un minuto
          </span>
          <div className="ml-auto flex items-center gap-2">
            <CalendarDays className="size-4 text-muted-foreground" />
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger className="w-[190px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RANGES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Clics totales"
          value={(stats?.clicks ?? 0).toLocaleString("es-ES")}
          hint={`En ${rangeLabel}`}
          icon={MousePointerClick}
        />
        <StatCard
          label="Click rate"
          value={`${stats?.ctr ?? 0}%`}
          hint={`En ${rangeLabel}`}
          icon={Zap}
        />
        <StatCard
          label="Visitas al perfil"
          value={(stats?.views ?? 0).toLocaleString("es-ES")}
          hint={`+${stats?.views ?? 0} visitas en ${rangeLabel}`}
          icon={Eye}
        />
        <StatCard
          label="Media diaria"
          value={avgDaily.toLocaleString("es-ES")}
          hint={`En ${rangeLabel}`}
          icon={BarChart3}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl">
          <h2 className="text-sm font-medium">Visitas al perfil</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.series ?? []}>
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="currentColor"
                  opacity={0.4}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <Panel
          title="Dispositivos"
          rows={stats?.devices ?? []}
          empty="Aún no hay datos de dispositivos"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Links más clickeados" rows={stats?.topLinks ?? []} empty="Nadie ha hecho clic todavía" />
        <Panel title="Navegadores" rows={stats?.browsers ?? []} empty="Aún no hay navegadores" />
        <Panel title="Top referrers" rows={stats?.referrers ?? []} empty="Aún no hay referrers" />
      </div>

      <Panel title="Top países por visitas" rows={stats?.countries ?? []} empty="Aún no hay datos de países" />
    </div>
  );
}
