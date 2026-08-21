import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  Gamepad2,
  Link2,
  MousePointerClick,
  Music4,
  Palette,
  QrCode,
  Share2,
  Sparkles,
  Type,
  UserRound,
  Zap,
} from "lucide-react";
import { SiteNav } from "@/components/qsy/site-nav";
import { SiteFooter } from "@/components/qsy/site-footer";
import { Button } from "@/components/ui/button";

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
  { icon: Music4, title: "Música", desc: "Añade tu track favorito y reprodúcelo en tu perfil." },
  { icon: BarChart3, title: "Analytics", desc: "Visitas, clicks, CTR, país, dispositivo y referrer." },
  { icon: Palette, title: "Temas personalizados", desc: "Blur, opacidad, glow, radios, colores y efectos." },
];

const chips = [
  { icon: BadgeCheck, label: "Perfil verificado" },
  { icon: Sparkles, label: "Efectos de texto" },
  { icon: Palette, label: "Temas custom" },
  { icon: Music4, label: "Música de fondo" },
  { icon: Zap, label: "Carga instantánea" },
  { icon: QrCode, label: "QR descargable" },
  { icon: Type, label: "23+ tipografías" },
  { icon: Gamepad2, label: "Módulos gaming" },
  { icon: MousePointerClick, label: "Cursores custom" },
  { icon: BarChart3, label: "Analytics en vivo" },
];

const heroStats = [
  { label: "Visitas totales", value: "14,203,982" },
  { label: "Creadores activos", value: "14,204" },
  { label: "Links servidos", value: "94,392" },
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
    <div className="min-h-screen overflow-x-hidden">
      <SiteNav />

      <section className="relative overflow-hidden aurora">
        <div aria-hidden className="pointer-events-none absolute inset-0 starfield drift opacity-70" />
        <div aria-hidden className="pointer-events-none absolute inset-0 starfield twinkle opacity-40" />
        <div aria-hidden className="pointer-events-none absolute inset-0 grid-bg opacity-20" />

        <div className="relative mx-auto max-w-4xl px-4 pb-14 pt-16 text-center sm:px-6 sm:pt-24">
          <span className="rise inline-flex items-center gap-2 pill px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary pulse-glow" />
            Unifica todas tus redes
          </span>

          <h1
            className="rise mt-8 text-5xl font-extrabold leading-[0.92] tracking-tight sm:text-7xl lg:text-8xl"
            style={{ animationDelay: "80ms" }}
          >
            Tu identidad
            <br />
            <span className="text-gradient-violet">digital simplificada.</span>
          </h1>

          <p
            className="rise mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            Bio-link · Redes en vivo · Música · Analytics en tiempo real. Todo lo que eres,
            haces y creas desde un único perfil.
          </p>

          <div
            className="rise mx-auto mt-10 flex max-w-xl items-center gap-2 rounded-2xl border border-primary/40 bg-background/60 p-2 pl-4 shadow-[0_0_70px_-25px_var(--primary)] backdrop-blur-xl transition-colors focus-within:border-primary"
            style={{ animationDelay: "240ms" }}
          >
            <span className="shrink-0 font-mono text-sm text-primary">qsy.to/</span>
            <input
              value={handle}
              onChange={(e) =>
                setHandle(e.target.value.replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 24))
              }
              placeholder="tu_usuario"
              aria-label="Tu usuario QSY"
              className="min-w-0 flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button asChild size="sm" className="group shrink-0 rounded-xl">
              <Link to="/register">
                Registrarse gratis
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>

          <div
            className="rise mt-5 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "320ms" }}
          >
            <Button asChild variant="ghost" size="sm" className="hover-scale">
              <Link to="/explore">Explorar perfiles</Link>
            </Button>
            <span className="text-xs text-muted-foreground">
              100% gratis · sin tarjeta · listo en 2 min
            </span>
          </div>
        </div>

        {/* Mockups */}
        <div className="relative mx-auto max-w-6xl px-4 pb-8 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
            <div
              className="rise tilt-card rounded-3xl border border-border/70 bg-card/60 p-3 shadow-[0_60px_140px_-70px_var(--primary)] backdrop-blur-xl"
              style={{ animationDelay: "380ms" }}
            >
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
              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  {heroStats.slice(0, 3).map((s) => (
                    <div key={s.label} className="rounded-xl border border-border/60 bg-surface p-4 text-left">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        {s.label}
                      </p>
                      <p className="mt-2 text-xl font-bold text-gradient-violet sm:text-2xl">
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex h-36 items-end gap-1.5">
                  {bars.map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%`, animationDelay: `${500 + i * 60}ms` }}
                      className="bar-grow flex-1 rounded-t bg-gradient-to-t from-primary/20 to-primary"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden lg:block" aria-hidden="true" />
          </div>
        </div>

        {/* Stats band */}
        <div className="relative mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6">
          <div className="rounded-3xl border border-border/70 bg-card/40 p-8 text-center backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Más de 90,000 visitas al mes confirman la red
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {heroStats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-border/60 bg-surface p-5 lift hover:border-primary/50"
                >
                  <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {s.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gradient-violet">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
        <span className="inline-flex items-center gap-2 pill px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" /> Todo incluido · 100% gratis
        </span>
        <h2 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
          Tu perfil.
          <br />
          <span className="text-gradient-violet">Sin límites.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          Cada característica diseñada para que tu perfil destaque entre millones.
        </p>

        <div className="mt-12 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card/50 p-6 backdrop-blur-xl lift hover:border-primary/50 hover:shadow-[0_50px_110px_-60px_var(--primary)]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
              />
              <span className="grid size-11 place-items-center rounded-2xl bg-primary/15 text-primary transition-transform duration-500 group-hover:scale-110 group-hover:bg-primary/25">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Marquee chips */}
      <section className="relative overflow-hidden py-6">
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
        <div className="marquee-track flex w-max gap-3">
          {[...chips, ...chips].map((c, i) => (
            <span
              key={`${c.label}-${i}`}
              className="inline-flex items-center gap-2 whitespace-nowrap pill px-4 py-2 text-xs text-muted-foreground"
            >
              <c.icon className="size-3.5 text-primary" />
              {c.label}
            </span>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild size="lg" className="group rounded-full px-8">
            <Link to="/register">
              <Zap className="size-4" />
              Crear mi perfil ahora
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            100% gratis · sin tarjeta de crédito · listo en 2 min
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Precios <span className="text-gradient-violet">simples.</span>
        </h2>
        <p className="mt-3 text-muted-foreground">Empieza gratis. Escala cuando quieras.</p>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-3xl border p-6 text-left backdrop-blur-xl lift ${
                p.highlight
                  ? "border-primary/60 bg-primary/10 shadow-[0_50px_120px_-60px_var(--primary)]"
                  : "border-border/70 bg-card/50 hover:border-primary/40"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-semibold">{p.name}</h3>
                {p.highlight && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    POPULAR
                  </span>
                )}
              </div>
              <p className="mt-4 text-4xl font-extrabold">
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
                className="mt-6 w-full rounded-xl"
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
