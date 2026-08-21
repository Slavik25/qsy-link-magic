import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { useAnalytics, useMyProfile } from "@/lib/qsy-data";

export const Route = createFileRoute("/_authenticated/dashboard/analytics")({
  component: AnalyticsPage,
});

const RANGES = [
  { label: "24h", days: 1 },
  { label: "7 días", days: 7 },
  { label: "30 días", days: 30 },
  { label: "90 días", days: 90 },
];

function Breakdown({ title, rows }: { title: string; rows: [string, number][] }) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <section className="rounded-2xl glass p-5">
      <h2 className="text-sm font-medium">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {rows.length === 0 && <li className="text-sm text-muted-foreground">Sin datos.</li>}
        {rows.map(([label, count]) => (
          <li key={label}>
            <div className="flex justify-between text-sm">
              <span className="truncate">{label}</span>
              <span className="text-muted-foreground">{count}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-surface-strong">
              <div className="h-full rounded-full bg-primary" style={{ width: `${(count / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function AnalyticsPage() {
  const [days, setDays] = useState(7);
  const { data: profile } = useMyProfile();
  const { data: stats } = useAnalytics(profile?.id, days);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <Button
              key={r.days}
              size="sm"
              variant={days === r.days ? "default" : "secondary"}
              onClick={() => setDays(r.days)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Views", (stats?.views ?? 0).toLocaleString()],
          ["Clicks", (stats?.clicks ?? 0).toLocaleString()],
          ["CTR", `${stats?.ctr ?? 0}%`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl glass p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl glass p-5">
        <h2 className="text-sm font-medium">Visitas</h2>
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.series ?? []}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.4} />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Breakdown title="Países" rows={stats?.countries ?? []} />
        <Breakdown title="Dispositivos" rows={stats?.devices ?? []} />
        <Breakdown title="Navegadores" rows={stats?.browsers ?? []} />
        <Breakdown title="Referrers" rows={stats?.referrers ?? []} />
        <Breakdown title="Links más clickeados" rows={stats?.topLinks ?? []} />
      </div>
    </div>
  );
}
