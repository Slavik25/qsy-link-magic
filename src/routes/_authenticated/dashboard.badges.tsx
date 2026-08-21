import { createFileRoute } from "@tanstack/react-router";
import { Gem } from "lucide-react";
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
  img?: string;
  icon?: typeof Gem;
  action?: string;
  unlocked?: (v: { verified: boolean; views: number }) => boolean;
};

const BADGES: BadgeDef[] = [
  { key: "booster", name: "Server Booster", description: "Boostea el servidor oficial de QSY en Discord al menos 2 veces.", img: "/badges/booster.svg", action: "Boost" },
  { key: "staff", name: "Staff", description: "Miembro oficial del equipo de QSY.", img: "/badges/staff.svg", action: "Discord" },
  { key: "moderator", name: "Moderador", description: "Moderador oficial de QSY.", img: "/badges/moderador.svg", action: "Discord" },
  { key: "premium", name: "Premium", description: "Supporter oficial del paquete Premium.", icon: Gem, action: "Obtener" },
  { key: "vip", name: "V.I.P", description: "Contribuidor V.I.P oficial.", img: "/badges/vip.svg", action: "Obtener V.I.P" },
  {
    key: "verified",
    name: "Verificado",
    description: "Creador verificado o partner reconocido.",
    img: "/badges/verifiedusergreen.svg",
    action: "Comprar",
    unlocked: (v) => v.verified,
  },
  { key: "donor", name: "Donator", description: "Donó para apoyar el crecimiento de la plataforma.", img: "/badges/donator.png", action: "Comprar" },
  { key: "early", name: "Early Supporter", description: "Insignia OG para los primeros 50 usuarios registrados.", img: "/badges/earlysupporter.svg", action: "Ver OG Tags" },
  { key: "king", name: "King", description: "Contribuidor especial y rey del ranking.", img: "/badges/king.svg", action: "Discord" },
  { key: "partner", name: "Partner", description: "Partner oficial de QSY.", img: "/badges/partner.svg", action: "Discord" },
  { key: "activedev", name: "Active Developer", description: "Contribuyó directamente al desarrollo del código.", img: "/badges/developeractivo.svg", action: "Discord" },
  { key: "discorddev", name: "Discord Developer", description: "Desarrollador verificado en el ecosistema de Discord.", img: "/badges/bluediscorddeveloper.svg", action: "Discord" },
  { key: "buggold", name: "Bug Hunter Gold", description: "Encontró vulnerabilidades críticas y ayudó a asegurar el sistema.", img: "/badges/discordbughuntergold.svg", action: "Discord" },
  { key: "bug", name: "Bug Hunter", description: "Reportó bugs de la plataforma al equipo técnico.", img: "/badges/discordbughuntergreen.svg", action: "Reportar bug" },
  { key: "year1", name: "1 Year Member", description: "Lleva más de 1 año en QSY.", icon: CalendarClock },
  { key: "year2", name: "Veteran (2 años)", description: "Lleva más de 2 años en QSY.", icon: Shield },
  { key: "year5", name: "Legend (5 años)", description: "Lleva más de 5 años en QSY.", icon: Medal },
  { key: "year7", name: "Ancient (7 años)", description: "Lleva más de 7 años en QSY.", icon: Hourglass },
  { key: "year10", name: "Immortal (10 años)", description: "Lleva más de 10 años en QSY.", icon: Infinity },
];

  { key: "early", name: "Early Supporter", description: "Estuviste desde el principio.", img: "/badges/earlysupporter.svg" },
  { key: "dev", name: "Developer Activo", description: "Colaboras en el desarrollo de QSY.", img: "/badges/developeractivo.svg" },
  { key: "discorddev", name: "Discord Developer", description: "Desarrollas bots e integraciones.", img: "/badges/bluediscorddeveloper.svg" },
  { key: "bug", name: "Bug Hunter", description: "Reporta un bug al equipo.", img: "/badges/discordbughuntergreen.svg", action: "Reportar" },
  {
    key: "buggold",
    name: "Bug Hunter Gold",
    description: "Reporta bugs críticos de forma recurrente.",
    img: "/badges/discordbughuntergold.svg",
  },
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
                className={`grid size-10 shrink-0 place-items-center rounded-xl border ${
                  unlocked
                    ? "border-primary/40 bg-primary/15"
                    : "border-white/5 bg-surface-strong grayscale opacity-60"
                }`}
              >
                <img src={b.img} alt={b.name} className="size-6" loading="lazy" />
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
