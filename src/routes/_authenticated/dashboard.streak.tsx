import { createFileRoute } from "@tanstack/react-router";
import { Coins, Flame, Gift, Trophy } from "lucide-react";
import { DailyStreakCard } from "@/components/qsy/daily-streak";
import { STREAK_MILESTONES, useStreak, useStreakHistory } from "@/lib/economy";

export const Route = createFileRoute("/_authenticated/dashboard/streak")({
  component: StreakPage,
  head: () => ({
    meta: [
      { title: "Racha diaria · QSY" },
      {
        name: "description",
        content: "Reclama tus QSY Coins diarias, revisa tus hitos de racha y el historial completo de recompensas.",
      },
      { property: "og:title", content: "Racha diaria · QSY" },
      { property: "og:description", content: "Historial de recompensas diarias y días de racha reclamados en QSY." },
    ],
  }),
});

function fmt(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function StreakPage() {
  const { data: streak } = useStreak();
  const { data: history, isLoading } = useStreakHistory();

  const claims = history?.claims ?? [];
  const reached = history?.milestones ?? [];
  const totalCoins = claims.reduce((sum, c) => sum + c.reward, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Racha diaria</h1>
        <p className="text-sm text-muted-foreground">
          Entra cada día, reclama tus monedas y desbloquea diseños al alcanzar hitos.
        </p>
      </header>

      <DailyStreakCard />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Racha actual", value: `${streak?.current ?? 0} días`, icon: Flame },
          { label: "Mejor racha", value: `${streak?.best ?? 0} días`, icon: Trophy },
          { label: "Días reclamados", value: `${claims.length}`, icon: Gift },
          { label: "Coins por racha", value: totalCoins.toLocaleString(), icon: Coins },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/60 bg-card/40 p-4 backdrop-blur-xl">
            <s.icon className="size-4 text-muted-foreground" />
            <p className="mt-2 text-lg font-semibold">{s.value}</p>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl">
        <h2 className="text-sm font-semibold">Hitos de racha</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {STREAK_MILESTONES.map((m) => {
            const done = reached.includes(m.days);
            const current = streak?.current ?? 0;
            const pct = Math.min(100, Math.round((current / m.days) * 100));
            return (
              <div
                key={m.days}
                className={`rounded-xl border p-4 ${
                  done ? "border-emerald-500/50 bg-emerald-500/10" : "border-border/60 bg-surface-strong/30"
                }`}
              >
                <p className="text-sm font-semibold">{m.days} días seguidos</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  +{m.reward} coins · desbloquea {m.itemName}
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border/60">
                  <div
                    className={`h-full rounded-full ${done ? "bg-emerald-400" : "bg-primary"}`}
                    style={{ width: `${done ? 100 : pct}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {done ? "Conseguido" : `${current}/${m.days}`}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl">
        <h2 className="text-sm font-semibold">Historial de recompensas</h2>
        {isLoading ? (
          <p className="mt-3 text-sm text-muted-foreground">Cargando historial…</p>
        ) : claims.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Todavía no reclamaste ninguna recompensa diaria.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="pb-2">Fecha</th>
                  <th className="pb-2">Día de racha</th>
                  <th className="pb-2">Coins</th>
                  <th className="pb-2">Extras</th>
                  <th className="pb-2 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((c) => (
                  <tr key={c.claim_date} className="border-t border-border/40">
                    <td className="py-2">{fmt(c.claim_date)}</td>
                    <td className="py-2">
                      <span className="inline-flex items-center gap-1.5">
                        <Flame className="size-3 text-orange-400" />
                        {c.streak}
                      </span>
                    </td>
                    <td className="py-2 font-medium text-emerald-400">+{c.reward}</td>
                    <td className="py-2 text-xs text-muted-foreground">
                      {[
                        c.bonus > 0 ? `bonus semanal +${c.bonus}` : null,
                        c.milestone_days ? `hito ${c.milestone_days}d +${c.milestone_reward}` : null,
                        c.milestone_item ? `desbloqueo ${c.milestone_item}` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </td>
                    <td className="py-2 text-right tabular-nums">{c.balance_after.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
