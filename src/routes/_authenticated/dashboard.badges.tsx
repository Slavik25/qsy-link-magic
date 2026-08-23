import { createFileRoute, Link } from "@tanstack/react-router";
import { Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMyProfile, useProfileBadges } from "@/lib/qsy-data";
import { BADGES } from "@/lib/badges";

export const Route = createFileRoute("/_authenticated/dashboard/badges")({
  component: BadgesPage,
  head: () => ({
    meta: [
      { title: "Badges · QSY" },
      { name: "description", content: "Desbloquea y gestiona los badges de tu perfil QSY." },
    ],
  }),
});

function BadgesPage() {
  const { data: profile } = useMyProfile();
  const { data: granted = [] } = useProfileBadges(profile?.id);
  const state = { verified: !!profile?.verified, views: profile?.view_count ?? 0 };
  const isUnlocked = (key: string, fn?: (v: typeof state) => boolean) =>
    granted.includes(key) || (fn?.(state) ?? false);
  const unlockedCount = BADGES.filter((b) => isUnlocked(b.key, b.unlocked)).length;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Badges</h1>
        <p className="text-sm text-muted-foreground">
          {unlockedCount} de {BADGES.length} desbloqueados · muéstralos en tu perfil público.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {BADGES.map((b) => {
          const unlocked = isUnlocked(b.key, b.unlocked);
          return (
            <div
              key={b.key}
              className={`flex items-center gap-3 rounded-2xl border p-4 transition-colors ${
                unlocked
                  ? "border-primary/50 bg-primary/10"
                  : "border-border/60 bg-card/40 hover:border-border"
              }`}
            >
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-xl border ${
                  unlocked ? "border-primary/40 bg-primary/15" : "border-white/5 bg-surface-strong"
                }`}
              >
                {b.img ? (
                  <img src={b.img} alt={b.name} className="size-6" loading="lazy" />
                ) : b.icon ? (
                  <b.icon className="size-5" style={{ color: b.color ?? "currentColor" }} />
                ) : null}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{b.name}</p>
                <p className="truncate text-xs text-muted-foreground">{b.description}</p>
              </div>
              {unlocked ? (
                <span className="rounded-full border border-primary/50 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                  Activo
                </span>
              ) : b.action ? (
                b.href?.startsWith("http") ? (
                  <Button asChild size="sm" variant="secondary" className="rounded-lg text-xs">
                    <a href={b.href} target="_blank" rel="noreferrer">
                      {b.action}
                    </a>
                  </Button>
                ) : (
                  <Button asChild size="sm" variant="secondary" className="rounded-lg text-xs">
                    <Link to={b.href ?? "/dashboard/premium"}>{b.action}</Link>
                  </Button>
                )
              ) : null}
            </div>
          );
        })}
      </div>

      <section className="overflow-hidden rounded-2xl border border-primary/30 bg-primary/10 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Gem className="size-5 text-primary" /> Sube a Premium
        </h2>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Con QSY Premium puedes reordenar, recolorear y activar cada badge de forma individual.
        </p>
        <Button asChild className="mt-4 rounded-xl">
          <Link to="/dashboard/premium">Mejorar ahora</Link>
        </Button>
      </section>
    </div>
  );
}
