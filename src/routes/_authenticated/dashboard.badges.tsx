import { createFileRoute } from "@tanstack/react-router";
import {
  BadgeCheck,
  Bug,
  Crown,
  Gem,
  Gift,
  Image as ImageIcon,
  Rocket,
  Server,
  Snowflake,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMyProfile } from "@/lib/qsy-data";

export const Route = createFileRoute("/_authenticated/dashboard/badges")({
  component: BadgesPage,
  head: () => ({
    meta: [
      { title: "Badges · QSY" },
      { name: "description", content: "Desbloquea y gestiona los badges de tu perfil QSY." },
    ],
  }),
});

type BadgeDef = {
  key: string;
  name: string;
  description: string;
  icon: typeof Star;
  action?: string;
  unlocked?: (v: { verified: boolean; views: number }) => boolean;
};

const BADGES: BadgeDef[] = [
  { key: "staff", name: "Staff", description: "Formas parte del equipo de QSY.", icon: Rocket },
  { key: "helper", name: "Helper", description: "Ayudas activamente a la comunidad.", icon: Sparkles, action: "Unirme" },
  { key: "premium", name: "Premium", description: "Consigue el paquete premium.", icon: Gem, action: "Obtener" },
  {
    key: "verified",
    name: "Verified",
    description: "Creador verificado en QSY.",
    icon: BadgeCheck,
    action: "Solicitar",
    unlocked: (v) => v.verified,
  },
  { key: "donor", name: "Donor", description: "Apoya el proyecto con una donación.", icon: Gift, action: "Donar" },
  { key: "gifter", name: "Gifter", description: "Regala QSY Premium a alguien.", icon: Gift, action: "Regalar" },
  { key: "host", name: "Image Host", description: "Acceso al hosting de imágenes.", icon: ImageIcon, action: "Obtener" },
  { key: "domain", name: "Domain Legend", description: "Añade un dominio propio a QSY.", icon: Server, action: "Añadir" },
  { key: "og", name: "OG", description: "Estuviste desde el principio.", icon: Crown },
  { key: "booster", name: "Server Booster", description: "Boostea el servidor de Discord.", icon: Rocket, action: "Boost" },
  { key: "bug", name: "Bug Hunter", description: "Reporta un bug al equipo.", icon: Bug, action: "Reportar" },
  {
    key: "views100",
    name: "100 visitas",
    description: "Alcanza 100 visitas en tu perfil.",
    icon: Trophy,
    unlocked: (v) => v.views >= 100,
  },
  { key: "winter", name: "Winter 2026", description: "Badge exclusivo de la temporada de invierno.", icon: Snowflake },
  { key: "winner", name: "Winner", description: "Gana un evento de QSY.", icon: Trophy },
];

function BadgesPage() {
  const { data: profile } = useMyProfile();
  const state = { verified: !!profile?.verified, views: profile?.view_count ?? 0 };
  const unlockedCount = BADGES.filter((b) => b.unlocked?.(state)).length;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Badges</h1>
        <p className="text-sm text-muted-foreground">
          {unlockedCount} de {BADGES.length} desbloqueados · muéstralos en tu perfil público.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {BADGES.map((b) => {
          const unlocked = b.unlocked?.(state) ?? false;
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
                className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                  unlocked ? "bg-primary/20 text-primary" : "bg-surface-strong text-muted-foreground"
                }`}
              >
                <b.icon className="size-5" />
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
                <Button size="sm" variant="secondary" className="rounded-lg text-xs">
                  {b.action}
                </Button>
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
        <Button className="mt-4 rounded-xl">Mejorar ahora</Button>
      </section>
    </div>
  );
}
