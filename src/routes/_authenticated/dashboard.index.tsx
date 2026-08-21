import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  AtSign,
  ChevronRight,
  Eye,
  Hash,
  Image as ImageIcon,
  Link2,
  Pencil,
  Settings,
  Share2,
  Type as TypeIcon,
  UserRound,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { useAnalytics, useLinks, useMyProfile, useSocials } from "@/lib/qsy-data";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: Overview,
  head: () => ({
    meta: [
      { title: "Overview · Dashboard QSY" },
      { name: "description", content: "Resumen de tu cuenta QSY: visitas, progreso del perfil y accesos rápidos." },
    ],
  }),
});

function OverviewCard({
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
    <div className="rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-3 truncate text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Overview() {
  const { data: profile } = useMyProfile();
  const { data: stats } = useAnalytics(profile?.id, 7);
  const { data: links = [] } = useLinks(profile?.id);
  const { data: socials = [] } = useSocials(profile?.id);

  const uid = profile ? parseInt(profile.id.replace(/\D/g, "").slice(0, 7) || "0", 10) : 0;

  const tasks = [
    { label: "Sube un avatar", done: !!profile?.avatar_url, to: "/dashboard/profile", icon: UserRound },
    { label: "Añade una descripción", done: !!profile?.bio, to: "/dashboard/profile", icon: TypeIcon },
    { label: "Personaliza el fondo", done: !!profile?.theme.background, to: "/dashboard/appearance", icon: ImageIcon },
    { label: "Añade tus redes", done: socials.length > 0, to: "/dashboard/socials", icon: AtSign },
    { label: "Crea tu primer link", done: links.length > 0, to: "/dashboard/links", icon: Link2 },
    { label: "Llega a 10 visitas", done: (profile?.view_count ?? 0) >= 10, to: "/dashboard/analytics", icon: Eye },
  ] as const;

  const completed = tasks.filter((t) => t.done).length;
  const percent = Math.round((completed / tasks.length) * 100);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-xl font-semibold tracking-tight">Resumen de la cuenta</h1>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <OverviewCard
            label="Username"
            value={profile?.username ?? "…"}
            hint="Puedes cambiarlo en Perfil"
            icon={Pencil}
          />
          <OverviewCard
            label="Links"
            value={String(links.length)}
            hint={`${socials.length} redes conectadas`}
            icon={Link2}
          />
          <OverviewCard
            label="UID"
            value={uid.toLocaleString("es-ES")}
            hint={`Miembro desde ${profile ? new Date(profile.created_at).toLocaleDateString("es-ES") : "—"}`}
            icon={Hash}
          />
          <OverviewCard
            label="Visitas al perfil"
            value={(profile?.view_count ?? 0).toLocaleString("es-ES")}
            hint={`+${stats?.views ?? 0} en los últimos 7 días`}
            icon={Eye}
          />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight">Estadísticas de la cuenta</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-medium">Progreso del perfil</h3>
              <span className="text-xs text-muted-foreground">{percent}% completado</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-strong">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${percent}%` }}
              />
            </div>

            {percent < 100 && (
              <div className="mt-5 rounded-xl border border-border/60 bg-background/50 p-4">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <AlertCircle className="size-4 text-primary" /> ¡Tu perfil aún no está completo!
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Complétalo para hacerlo más atractivo y fácil de descubrir.
                </p>
              </div>
            )}

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {tasks.map((t) => (
                <Link
                  key={t.label}
                  to={t.to}
                  className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                    t.done
                      ? "border-primary/40 bg-primary/10 text-foreground"
                      : "border-border/60 bg-background/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <t.icon className="size-4 shrink-0" />
                  <span className="truncate">{t.label}</span>
                  <ChevronRight className="ml-auto size-4 shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl">
            <h3 className="text-base font-medium">Gestiona tu cuenta</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Cambia tu username, tu nombre y más.
            </p>
            <div className="mt-4 space-y-2">
              {[
                { to: "/dashboard/profile", label: "Cambiar username", icon: Pencil },
                { to: "/dashboard/profile", label: "Cambiar nombre visible", icon: UserRound },
                { to: "/dashboard/appearance", label: "Personalizar apariencia", icon: ImageIcon },
                { to: "/dashboard/settings", label: "Ajustes de la cuenta", icon: Settings },
              ].map((a) => (
                <Button key={a.label} asChild variant="secondary" className="w-full justify-start rounded-xl">
                  <Link to={a.to}>
                    <a.icon className="size-4" /> {a.label}
                  </Link>
                </Button>
              ))}
            </div>

            {profile && (
              <Button asChild className="mt-4 w-full rounded-xl">
                <Link to="/$username" params={{ username: profile.username }}>
                  <Share2 className="size-4" /> Ver mi página
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Analytics de la cuenta</h2>
          <Button asChild size="sm" variant="secondary" className="rounded-full text-xs">
            <Link to="/dashboard/analytics">Ver más</Link>
          </Button>
        </div>
        <div className="mt-4 rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl">
          <h3 className="text-sm font-medium">
            Visitas en los últimos <span className="text-primary">7 días</span>
          </h3>
          <div className="mt-4 h-56">
            {(stats?.views ?? 0) === 0 ? (
              <div className="grid h-full place-items-center text-center">
                <div>
                  <p className="text-sm font-medium">Aún no hay datos de visitas</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Comparte tu página de QSY en redes para empezar a recibir tráfico.
                  </p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.series ?? []}>
                  <defs>
                    <linearGradient id="qsyArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fill="url(#qsyArea)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
