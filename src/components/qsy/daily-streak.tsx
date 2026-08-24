import { useQueryClient } from "@tanstack/react-query";
import { Coins, Flame, Gift } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { claimDaily, dailyReward, useStreak } from "@/lib/economy";

/** Tarjeta de recompensa diaria: reclama QSY Coins una vez por día y mantiene la racha. */
export function DailyStreakCard() {
  const qc = useQueryClient();
  const { data: streak, isLoading } = useStreak();

  const current = streak?.current ?? 0;
  const claimedToday = streak?.claimedToday ?? false;
  const nextDay = claimedToday ? current + 1 : current + 1;
  const reward = dailyReward(nextDay);

  async function claim() {
    try {
      const res = await claimDaily();
      toast.success(`+${res.reward} QSY Coins`, {
        description:
          res.bonus > 0
            ? `Racha de ${res.streak} días · bonus semanal +${res.bonus}`
            : `Racha de ${res.streak} días seguidos`,
      });
      await qc.invalidateQueries({ queryKey: ["wallet"] });
      await qc.invalidateQueries({ queryKey: ["streak"] });
    } catch (e) {
      toast.error("No se pudo reclamar", { description: (e as Error).message });
    }
  }

  return (
    <section className="pop-in rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-orange-500/40 bg-orange-500/10 text-orange-400">
            <Flame className="size-5" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Recompensa diaria</h2>
            <p className="text-xs text-muted-foreground">
              {isLoading
                ? "Cargando tu racha…"
                : claimedToday
                  ? `Ya reclamaste hoy · vuelve mañana por ${reward} coins`
                  : `Entra cada día y suma coins · hoy ganas ${reward}`}
            </p>
          </div>
        </div>

        <Button
          onClick={claim}
          disabled={isLoading || claimedToday}
          className="rounded-xl"
          variant={claimedToday ? "outline" : "default"}
        >
          <Gift className="size-4" />
          {claimedToday ? "Reclamado" : `Reclamar +${reward}`}
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {Array.from({ length: 7 }, (_, i) => {
          const day = i + 1;
          const done = current % 7 === 0 && current > 0 ? true : current % 7 >= day;
          return (
            <div
              key={day}
              title={`Día ${day} · ${dailyReward(day)} coins`}
              className={`flex h-12 flex-col items-center justify-center rounded-lg border text-[10px] font-semibold ${
                done
                  ? "border-orange-500/50 bg-orange-500/15 text-orange-300"
                  : "border-border/60 bg-surface-strong/30 text-muted-foreground"
              }`}
            >
              <span>D{day}</span>
              <span className="inline-flex items-center gap-0.5">
                <Coins className="size-2.5" />
                {dailyReward(day)}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground">
        Racha actual: <span className="font-semibold text-foreground">{current} días</span> · Mejor racha:{" "}
        {streak?.best ?? 0} · Cada 7 días seguidos ganas +200 coins extra.
      </p>
    </section>
  );
}
