import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  AtSign,
  ChevronRight,
  Eye,
  Gem,
  Hash,
  Image as ImageIcon,
  Link2,
  Palette,
  Pencil,
  Sparkles,
  Type as TypeIcon,
  UserRound,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { DashBanner } from "@/components/qsy/dash-banner";
import { GlobalChat } from "@/components/qsy/global-chat";
import dashBanner from "@/assets/dash-banner.png.asset.json";
import cardProfile from "@/assets/card-32.png.asset.json";
import cardTemplates from "@/assets/card-33.png.asset.json";
import cardShop from "@/assets/card-34.png.asset.json";
import {
  useAnalytics,
  useLinks,
  useMyProfile,
  useShowcaseProfiles,
  useSocials,
} from "@/lib/qsy-data";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: Overview,
  head: () => ({
    meta: [
      { title: "Resumen · Dashboard QSY" },
      {
        name: "description",
        content: "Resumen de tu cuenta QSY: visitas, progreso del perfil y accesos rápidos.",
      },
    ],
  }),
});

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  color = "var(--color-primary)",
  delay = 0,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Eye;
  color?: string;
  delay?: number;
}) {
  return (
    <div
      className="pop-in shimmer-on-hover group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `color-mix(in oklab, ${color} 35%, transparent)` }}
      />
      <div className="relative flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        <span
          className="grid size-6 place-items-center rounded-md transition-transform duration-300 group-hover:scale-110"
          style={{ background: `color-mix(in oklab, ${color} 18%, transparent)`, color }}
        >
          <Icon className="size-3.5" />
        </span>
        {label}
      </div>
      <p className="relative mt-3 truncate text-2xl font-semibold">{value}</p>
      <p className="relative mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Overview() {
  const { data: profile } = useMyProfile();
  const { data: stats } = useAnalytics(profile?.id, 7);
  const { data: links = [] } = useLinks(profile?.id);
  const { data: socials = [] } = useSocials(profile?.id);
  const { data: showcase = [] } = useShowcaseProfiles(16);

  const uid = (profile as { uid?: number } | undefined)?.uid ?? 0;

  const tasks = [
    { label: "Sube un avatar", done: !!profile?.avatar_url, to: "/dashboard/profile", icon: UserRound },
    { label: "Añade una descripción", done: !!profile?.bio, to: "/dashboard/profile", icon: TypeIcon },
    { label: "Personaliza el fondo", done: !!profile?.theme.background, to: "/dashboard/profiles", icon: ImageIcon },
    { label: "Añade tus redes", done: links.length > 0, to: "/dashboard/links", icon: AtSign },
    { label: "Crea tu primer link", done: links.length > 0, to: "/dashboard/links", icon: Link2 },
    { label: "Llega a 10 visitas", done: (profile?.view_count ?? 0) >= 10, to: "/dashboard/analytics", icon: Eye },
  ] as const;

  const completed = tasks.filter((t) => t.done).length;
  const percent = Math.round((completed / tasks.length) * 100);

  const quick = [
    {
      to: "/dashboard/profiles",
      title: "Gestionar perfiles",
      desc: "Personaliza y actualiza tus páginas.",
      icon: UserRound,
      image: cardProfile.url,
    },
    {
      to: "/templates",
      title: "Descubrir plantillas",
      desc: "Encuentra el look perfecto.",
      icon: Palette,
      image: cardTemplates.url,
    },
    {
      to: "/dashboard/premium",
      title: "Ver la tienda",
      desc: "Obtén ítems y temas exclusivos.",
      icon: Gem,
      image: cardShop.url,
    },
  ] as const;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 pop-in xl:grid-cols-[1fr_320px]">
        <DashBanner
          eyebrow="Resumen"
          title={`¡Hola, ${profile?.display_name || profile?.username || "qsy"}!`}
          description="Esta es una vista general de tu cuenta: estadísticas, progreso y accesos rápidos."
          image={dashBanner.url}
        />

        <aside className="pop-in flex flex-col items-center justify-center gap-3 rounded-3xl border border-border/60 bg-card/40 p-6 text-center backdrop-blur-xl">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={`Avatar de ${profile.username}`}
              className="size-16 rounded-full object-cover ring-2 ring-primary/30"
            />
          ) : (
            <span className="grid size-16 place-items-center rounded-full bg-surface-strong font-mono text-lg font-bold text-primary ring-2 ring-primary/30">
              {(profile?.username ?? "qs").slice(0, 2).toUpperCase()}
            </span>
          )}
          <div>
            <p className="truncate text-sm font-semibold">{profile?.display_name || profile?.username}</p>
            <span className="mt-1 inline-block rounded-md bg-surface-strong px-2 py-0.5 text-[10px] font-bold tracking-wider text-muted-foreground">
              FREE
            </span>
          </div>
          <Button asChild className="pulse-glow w-full rounded-xl">
            <Link to="/dashboard/premium">Mejorar plan</Link>
          </Button>
        </aside>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="URL principal"
          value={`@${profile?.username ?? "…"}`}
          hint="Cámbiala desde Perfil"
          icon={Pencil}
          color="#a78bfa"
          delay={0}
        />
        <StatCard
          label="Conexiones"
          value={String(links.length + socials.length)}
          hint={`${links.length} links · ${socials.length} redes`}
          icon={Link2}
          color="#38bdf8"
          delay={80}
        />
        <StatCard label="UID" value={uid.toLocaleString("es-ES")} hint="Identificador único" icon={Hash} color="#fbbf24" delay={160} />
        <StatCard
          label="Visitas únicas"
          value={(profile?.view_count ?? 0).toLocaleString("es-ES")}
          hint={
            (stats?.views ?? 0) > 0 ? `+${stats?.views} en 7 días` : "Sin visitas aún"
          }
          icon={Eye}
          color="#34d399"
          delay={240}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {quick.map((q, i) => (
          <Link
            key={q.title}
            to={q.to}
            style={{ animationDelay: `${120 + i * 90}ms` }}
            className="pop-in shimmer-on-hover group relative flex h-24 items-center overflow-hidden rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_18px_50px_-20px_var(--color-primary)]"
          >
            <img
              src={q.image}
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 h-full w-2/3 object-cover object-right transition-transform duration-500 group-hover:scale-105"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-card via-card/85 to-transparent"
            />
            <div className="relative flex min-w-0 items-center gap-3 px-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-primary/40 bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <q.icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{q.title}</span>
                <span className="block truncate text-xs text-muted-foreground">{q.desc}</span>
              </span>
            </div>
          </Link>
        ))}
      </section>

      {showcase.length > 0 && (
        <section>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Explorar</p>
          <div className="mt-3 flex gap-4 overflow-x-auto rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl">
            {showcase.map((p) => (
              <Link
                key={p.username}
                to="/$username"
                params={{ username: p.username }}
                className="group flex w-16 shrink-0 flex-col items-center gap-2"
              >
                {p.avatar_url ? (
                  <img
                    src={p.avatar_url}
                    alt={`Avatar de ${p.username}`}
                    className="size-12 rounded-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                ) : (
                  <span className="grid size-12 place-items-center rounded-full bg-surface-strong font-mono text-xs font-bold text-primary transition-transform duration-200 group-hover:scale-105">
                    {p.username.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <span className="w-full truncate text-center text-[10px] text-muted-foreground group-hover:text-foreground">
                  @{p.username}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="pop-in rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <div className="min-w-0">
              <h2 className="truncate text-base font-medium">Visitas al perfil</h2>
              <p className="truncate text-xs text-muted-foreground">Últimos 7 días de tu página pública.</p>
            </div>
            <Button asChild size="sm" variant="secondary" className="shrink-0 rounded-full text-xs">
              <Link to="/dashboard/analytics">Ver más</Link>
            </Button>
          </div>

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

        <div className="pop-in rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl" style={{ animationDelay: "120ms" }}>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h2 className="truncate text-base font-medium">Progreso del perfil</h2>
            <span className="shrink-0 text-xs text-muted-foreground">{percent}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-strong">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-primary/70 to-primary transition-all duration-700"
              style={{ width: `${percent}%` }}
            />
          </div>

          {percent < 100 && (
            <p className="mt-4 flex items-start gap-2 rounded-xl border border-border/60 bg-background/50 p-3 text-xs text-muted-foreground">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-primary" />
              Completa tu perfil para que sea más atractivo y fácil de descubrir.
            </p>
          )}

          <div className="mt-4 space-y-2">
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
                <span className="min-w-0 flex-1 truncate">{t.label}</span>
                <ChevronRight className="size-4 shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>

          <Button asChild variant="secondary" className="mt-4 w-full rounded-xl">
            <Link to="/dashboard/profiles">
              <Sparkles className="size-4" /> Personalizar mi página
            </Link>
          </Button>
        </div>
      </section>

      <section>
        <GlobalChat />
      </section>
    </div>
  );
}
