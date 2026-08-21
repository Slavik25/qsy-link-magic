import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Coins, Target } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MISSIONS, claimMission, useMissionState, useWallet } from "@/lib/economy";

export const Route = createFileRoute("/_authenticated/dashboard/missions")({
  component: MissionsPage,
  head: () => ({
    meta: [
      { title: "Misiones · QSY" },
      {
        name: "description",
        content: "Completa misiones difíciles, gana QSY Coins y desbloquea decoraciones para tu biolink.",
      },
      { property: "og:title", content: "Misiones · QSY" },
      { property: "og:description", content: "Gana QSY Coins completando misiones difíciles." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const TONE: Record<string, string> = {
  "difícil": "border-chart-5/50 bg-chart-5/10 text-chart-5",
  "muy difícil": "border-orange-500/50 bg-orange-500/10 text-orange-400",
  extrema: "border-destructive/50 bg-destructive/10 text-destructive",
};

function MissionsPage() {
  const qc = useQueryClient();
  const { data: coins } = useWallet();
  const { data: state } = useMissionState();

  async function claim(key: string) {
    try {
      const balance = await claimMission(key);
      toast.success("Recompensa reclamada", { description: `Saldo: ${balance} QSY Coins` });
      await qc.invalidateQueries({ queryKey: ["wallet"] });
      await qc.invalidateQueries({ queryKey: ["missions"] });
    } catch (e) {
      toast.error("No se pudo reclamar", { description: (e as Error).message });
    }
  }

  const claimed = new Set(state?.claimed ?? []);
  const completed = MISSIONS.filter((m) => (state?.progress[m.key] ?? 0) >= m.goal).length;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Target className="size-5 text-primary" /> Misiones
          </h1>
          <p className="text-sm text-muted-foreground">
            Retos difíciles que te dan QSY Coins para comprar decoraciones, layouts y reproductores.
          </p>
        </div>
        <div className="qsy-pop flex items-center gap-3 rounded-2xl border border-primary/40 bg-primary/10 px-5 py-3">
          <Coins className="size-5 text-primary" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Tu saldo</p>
            <p className="text-xl font-bold text-primary">{(coins ?? 0).toLocaleString("es-ES")} QSY</p>
          </div>
        </div>
      </header>

      <p className="text-xs text-muted-foreground">
        {completed}/{MISSIONS.length} misiones completadas · {claimed.size} recompensas reclamadas
      </p>

      <section className="grid gap-4 md:grid-cols-2">
        {MISSIONS.map((m) => {
          const progress = state?.progress[m.key] ?? 0;
          const done = progress >= m.goal;
          const isClaimed = claimed.has(m.key);
          const pct = Math.min(100, Math.round((progress / m.goal) * 100));
          return (
            <article
              key={m.key}
              className="qsy-pop rounded-3xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl transition-colors hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">{m.name}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{m.description}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${TONE[m.difficulty]}`}
                >
                  {m.difficulty}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                  {Math.min(progress, m.goal).toLocaleString("es-ES")} / {m.goal.toLocaleString("es-ES")}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-primary">
                  <Coins className="size-3" /> +{m.reward}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-strong">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <Button
                className="mt-4 w-full rounded-xl"
                variant={isClaimed ? "secondary" : "default"}
                disabled={!done || isClaimed}
                onClick={() => claim(m.key)}
              >
                {isClaimed ? (
                  <>
                    <Check className="size-4" /> Reclamada
                  </>
                ) : done ? (
                  "Reclamar recompensa"
                ) : (
                  "En progreso"
                )}
              </Button>
            </article>
          );
        })}
      </section>
    </div>
  );
}
