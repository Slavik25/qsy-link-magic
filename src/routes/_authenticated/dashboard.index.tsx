import { createFileRoute, Link } from "@tanstack/react-router";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ArrowUpRight, BarChart3, Eye, MousePointerClick } from "lucide-react";
import { useAnalytics, useMyProfile } from "@/lib/qsy-data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: Overview,
});

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Eye;
}) {
  return (
    <div className="rounded-2xl glass p-5">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs uppercase tracking-wide">{label}</span>
        <Icon className="size-4" />
      </div>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Overview() {
  const { data: profile } = useMyProfile();
  const { data: stats } = useAnalytics(profile?.id, 7);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground">
            {profile ? `qsy.to/${profile.username}` : "Cargando…"}
          </p>
        </div>
        {profile && (
          <Button asChild variant="secondary">
            <Link to="/$username" params={{ username: profile.username }}>
              Ver perfil <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        )}
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Profile views" value={(stats?.views ?? 0).toLocaleString()} icon={Eye} />
        <Stat label="Link clicks" value={(stats?.clicks ?? 0).toLocaleString()} icon={MousePointerClick} />
        <Stat label="CTR" value={`${stats?.ctr ?? 0}%`} icon={BarChart3} />
      </div>

      <section className="rounded-2xl glass p-5">
        <h2 className="text-sm font-medium">Visitas · últimos 7 días</h2>
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats?.series ?? []}>
              <defs>
                <linearGradient id="qsyArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.4} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#qsyArea)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl glass p-5">
        <h2 className="text-sm font-medium">Visitas recientes</h2>
        <ul className="mt-4 divide-y divide-border/60 text-sm">
          {(stats?.recent ?? []).map((r: any, i: number) => (
            <li key={i} className="flex items-center justify-between py-2.5">
              <span className="text-muted-foreground">
                {r.country || "—"} · {r.device || "—"} · {r.browser || "—"}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleString()}
              </span>
            </li>
          ))}
          {(stats?.recent?.length ?? 0) === 0 && (
            <li className="py-4 text-muted-foreground">Todavía no hay visitas registradas.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
