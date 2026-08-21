import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Check,
  Link2,
  Music4,
  Palette,
  Share2,
  UserRound,
} from "lucide-react";
import { SiteNav } from "@/components/qsy/site-nav";
import { SiteFooter } from "@/components/qsy/site-footer";
import { ProfileView } from "@/components/qsy/profile-view";
import { Button } from "@/components/ui/button";
import { defaultTheme } from "@/lib/qsy";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QSY — Tu identidad. Un solo link." },
      {
        name: "description",
        content:
          "QSY es la plataforma biolink para compartir tus redes, enlaces, música y contenido desde un único perfil.",
      },
      { property: "og:title", content: "QSY — Tu identidad. Un solo link." },
      {
        property: "og:description",
        content: "Crea tu perfil público QSY: links, redes, música, analytics y temas.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Landing,
});

const features = [
  { icon: UserRound, title: "Perfiles personalizados", desc: "Avatar, banner, bio, ubicación y badge verificado." },
  { icon: Link2, title: "Links ilimitados", desc: "Ordena, activa y mide cada enlace en segundos." },
  { icon: Share2, title: "Redes sociales", desc: "Discord, Instagram, TikTok, GitHub, Steam y más." },
  { icon: Music4, title: "Música", desc: "Añade tu track favorito a tu perfil." },
  { icon: BarChart3, title: "Analytics", desc: "Visitas, clicks, CTR, país, dispositivo y referrer." },
  { icon: Palette, title: "Temas personalizados", desc: "Blur, opacidad, glow, radios, colores y efectos." },
];

const heroStats = [
  { label: "Visitas totales", value: "14,203,982" },
  { label: "Creadores activos", value: "14,204" },
  { label: "Badges verificados", value: "1,280" },
];

const bars = [28, 44, 36, 62, 48, 74, 58, 88, 66, 94, 72, 100];

const plans = [
  {
    name: "Free",
    price: "0",
    features: ["Perfil público", "Hasta 10 links", "Redes sociales", "Analytics 7 días"],
  },
  {
    name: "Pro",
    price: "5",
    highlight: true,
    features: ["Links ilimitados", "Todos los templates", "Analytics 90 días", "Música y efectos", "Badge verificado"],
  },
  {
    name: "Studio",
    price: "15",
    features: ["Todo lo de Pro", "Dominio propio", "Multi-perfil", "Soporte prioritario"],
  },
];

function Landing() {
  const [handle, setHandle] = useState("");
  return (
    <div className="min-h-screen">
      <SiteNav />

      <section className="relative overflow-hidden aurora">
        <div aria-hidden className="pointer-events-none absolute inset-0 starfield opacity-70" />
        <div aria-hidden className="pointer-events-none absolute inset-0 grid-bg opacity-25" />
        <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28">
          <span className="inline-flex items-center gap-2 pill px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            Unifica todas tus redes
          </span>
          <h1 className="mt-8 text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
            Tu identidad
            <br />
            <span className="text-gradient-violet">digital simplificada.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
            Bio-link · Redes en vivo · Música · Analytics en tiempo real. Todo lo que eres,
            haces y creas desde un único perfil.
          </p>

          <div className="mx-auto mt-10 flex max-w-xl items-center gap-2 rounded-2xl border border-primary/40 bg-background/60 p-2 pl-4 backdrop-blur-xl shadow-[0_0_60px_-20px_var(--primary)]">
            <span className="font-mono text-sm text-primary">qsy.to/</span>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 24))}
              placeholder="tu_usuario"
              aria-label="Tu usuario QSY"
              className="min-w-0 flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button asChild size="sm" className="shrink-0 rounded-xl">
              <Link to="/register">
                Crear mi QSY <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link to="/explore">Explorar perfiles</Link>
            </Button>
            <span className="text-xs text-muted-foreground">
              100% gratis · sin tarjeta · listo en 2 min
            </span>
          </div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="rounded-3xl border border-border/70 bg-card/60 p-3 backdrop-blur-xl shadow-[0_50px_120px_-60px_var(--primary)]">
              <div className="flex items-center gap-2 px-2 pb-3">
                <span className="size-2.5 rounded-full bg-destructive/80" />
                <span className="size-2.5 rounded-full bg-chart-5/80" />
                <span className="size-2.5 rounded-full bg-primary/80" />
                <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                  qsy_dashboard.v1
                </span>
                <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  DASHBOARD ACTIVE
                </span>
              </div>
              <div className="grid gap-3 rounded-2xl border border-border/60 bg-background/60 p-4 sm:grid-cols-3">
                {heroStats.map((s) => (
                  <div key={s.label} className="rounded-xl border border-border/60 bg-surface p-4">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {s.label}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-gradient-violet">{s.value}</p>
                  </div>
                ))}
                <div className="sm:col-span-3">
                  <div className="flex h-32 items-end gap-1.5">
                    {bars.map((h, i) => (
                      <div
                        key={i}
                        style={{ height: `${h}%` }}
                        className="flex-1 rounded-t bg-gradient-to-t from-primary/25 to-primary"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="float-slow">
              <div className="mx-auto max-w-sm glow-ring rounded-3xl">
                <ProfileView
                  compact
                  views={12480}
                  music={{ title: "Midnight Static", artist: "Nova" }}
                  profile={{
                    username: "brayan",
                    display_name: "Brayan",
                    bio: "creating things that shouldn't exist.",
                    location: "19 · Argentina · Multimedia",
                    avatar_url: "https://i.pravatar.cc/240?img=12",
                    banner_url: null,
                    verified: true,
                    theme: { ...defaultTheme, glow: 60 },
                  }}
                  links={[
                    { id: "1", title: "Discord", url: "#", icon: "discord" },
                    { id: "2", title: "Instagram", url: "#", icon: "instagram" },
                    { id: "3", title: "Portfolio", url: "#", icon: "globe" },
                  ]}
                  socials={[
                    { id: "a", platform: "tiktok", url: "#" },
                    { id: "b", platform: "github", url: "#" },
                    { id: "c", platform: "spotify", url: "#" },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
        <span className="inline-flex items-center gap-2 pill px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Todo incluido
        </span>
        <h2 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
          Tu perfil.
          <br />
          <span className="text-gradient-violet">Sin límites.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          Cada característica diseñada para que tu perfil destaque entre millones.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-3xl border border-border/70 bg-card/50 p-6 text-left backdrop-blur-xl lift hover:border-primary/50 hover:shadow-[0_40px_90px_-50px_var(--primary)]"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary transition-colors group-hover:bg-primary/25">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Precios <span className="text-gradient-violet">simples.</span>
        </h2>
        <p className="mt-3 text-muted-foreground">Empieza gratis. Escala cuando quieras.</p>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-3xl border p-6 text-left backdrop-blur-xl ${
                p.highlight
                  ? "border-primary/60 bg-primary/10 shadow-[0_40px_100px_-50px_var(--primary)]"
                  : "border-border/70 bg-card/50"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-medium">{p.name}</h3>
                {p.highlight && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    POPULAR
                  </span>
                )}
              </div>
              <p className="mt-4 text-3xl font-semibold">
                ${p.price}
                <span className="text-sm font-normal text-muted-foreground">/mes</span>
              </p>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="size-4 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="mt-6 w-full"
                variant={p.highlight ? "default" : "secondary"}
              >
                <Link to="/register">Empezar</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
