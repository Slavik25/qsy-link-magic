import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  Gamepad2,
  Globe,
  Link2,
  MessageCircle,
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

// image: coloca aquí la ruta de la captura cuando la tengas (import desde src/assets)
const liveProfiles: {
  user: string;
  name: string;
  tag: string;
  views: string;
  image?: string;
}[] = [
  { user: "brayan", name: "Brayan Bicet", tag: "Creator", views: "84.2k" },
  { user: "nova", name: "Nova", tag: "Music", views: "62.9k" },
  { user: "kaito", name: "Kaito", tag: "Gaming", views: "51.4k" },
  { user: "lumen", name: "Lumen", tag: "Design", views: "43.7k" },
  { user: "sora", name: "Sora", tag: "Dev", views: "38.1k" },
  { user: "vega", name: "Vega", tag: "Streamer", views: "29.6k" },
];

const modules: {
  icon: typeof MessageCircle;
  title: string;
  desc: string;
  tag: string;
  image?: string;
  rows: string[];
}[] = [
  {
    icon: MessageCircle,
    title: "Módulo Discord",
    desc: "Estado en vivo, actividad y servidor conectado directamente en tu perfil.",
    tag: "En vivo",
    rows: ["Jugando · Valorant", "Servidor · qsy.gg/community", "Estado · En línea"],
  },
  {
    icon: Gamepad2,
    title: "Módulo Gaming",
    desc: "Steam, Roblox y Twitch: muestra qué juegas y cuándo estás online.",
    tag: "Popular",
    rows: ["Roblox · 1.2k visitas", "Steam · 412 horas", "Twitch · En directo"],
  },
  {
    icon: Music4,
    title: "Módulo Música",
    desc: "Spotify sincronizado con reproducción y portada animada.",
    tag: "Nuevo",
    rows: ["Reproduciendo ahora", "Portada animada", "Preview de 30s"],
  },
  {
    icon: QrCode,
    title: "Módulo QR",
    desc: "Genera y descarga tu QR con acento personalizado en un click.",
    tag: "Pro",
    rows: ["PNG y SVG", "Color de acento", "Logo centrado"],
  },
];

const domains = ["qsy.to", "qsy.gg", "qsy.link", "qsy.bio", "qsy.id", "qsy.cc"];

const connections = [
  "Discord", "Instagram", "TikTok", "YouTube", "Twitch", "X", "GitHub", "Steam",
  "Telegram", "Spotify", "Roblox", "Kick", "Pinterest", "Reddit", "SoundCloud",
  "Behance", "Dribbble", "LinkedIn", "Threads", "Snapchat",
];

function ProfileCard({ p }: { p: (typeof liveProfiles)[number] }) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-border/60 bg-card/50 backdrop-blur-xl transition-all duration-500 hover:border-primary/50 hover:shadow-[0_50px_110px_-60px_var(--primary)]">
      <div className="relative h-24 overflow-hidden">
        {p.image ? (
          <img
            src={p.image}
            alt={`Perfil QSY de ${p.name}`}
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div aria-hidden className="size-full aurora starfield opacity-90" />
        )}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
      </div>

      <div className="-mt-7 px-4 pb-4 text-left">
        <span className="grid size-12 place-items-center rounded-2xl border border-border/70 bg-background/80 font-mono text-xs font-bold text-primary backdrop-blur-xl">
          {p.user.slice(0, 2).toUpperCase()}
        </span>
        <div className="mt-3 flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold">{p.name}</p>
          <BadgeCheck className="size-3.5 shrink-0 text-primary" />
        </div>
        <p className="truncate font-mono text-[11px] text-muted-foreground">qsy.to/{p.user}</p>
        <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
          <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {p.tag}
          </span>
          <span className="text-xs font-semibold text-primary">{p.views}</span>
        </div>
      </div>
    </div>
  );
}


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

        {/* Dashboard mockup centrado */}
        <div className="relative mx-auto max-w-4xl px-4 pb-8 sm:px-6">
          <div
            className="rise mx-auto rounded-3xl border border-border/70 bg-card/60 p-3 shadow-[0_60px_140px_-70px_var(--primary)] backdrop-blur-xl"
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

      {/* Perfiles en vivo — columnas que pasan */}
      <section className="relative overflow-hidden border-y border-border/50 py-24">
        <div aria-hidden className="pointer-events-none absolute inset-0 starfield opacity-30" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 pill px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary pulse-glow" /> Comunidad activa
            </span>
            <h2 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Crea un perfil
              <br />
              <span className="text-gradient-violet">que sea tuyo.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground lg:mx-0">
              Miles de creadores ya tienen su QSY. Personaliza cada detalle y únete a la red.
            </p>
            <Button asChild size="lg" className="mt-8 group rounded-full px-8">
              <Link to="/explore">
                Explorar perfiles
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <div className="grid h-[560px] grid-cols-2 gap-4 overflow-hidden mask-fade-y">
            <div className="marquee-y flex flex-col gap-4">
              {[...liveProfiles, ...liveProfiles].map((p, i) => (
                <ProfileCard key={`a-${p.user}-${i}`} p={p} />
              ))}
            </div>
            <div className="marquee-y-slow flex flex-col gap-4">
              {[...liveProfiles.slice().reverse(), ...liveProfiles.slice().reverse()].map((p, i) => (
                <ProfileCard key={`b-${p.user}-${i}`} p={p} />
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

      {/* Módulos e integraciones */}
      <section className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Módulos e <span className="text-gradient-violet">integraciones.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Conecta tus plataformas favoritas y muéstralas en vivo dentro de tu perfil.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {modules.map((m) => (
            <div
              key={m.title}
              className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card/50 p-7 backdrop-blur-xl lift hover:border-primary/50"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -left-20 -bottom-20 size-48 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
              />
              <div className="flex items-start justify-between">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary transition-transform duration-500 group-hover:scale-110">
                  <m.icon className="size-5" />
                </span>
                <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                  {m.tag}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-semibold">{m.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dominios premium */}
      <section className="relative overflow-hidden border-y border-border/50 py-24">
        <div aria-hidden className="pointer-events-none absolute inset-0 aurora opacity-60" />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 pill px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <Globe className="size-3.5 text-primary" /> Dominios premium
          </span>
          <h2 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Elige tu <span className="text-gradient-violet">dominio.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Reserva tu handle en cualquiera de nuestros dominios, o conecta el tuyo propio.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {domains.map((d) => (
              <span
                key={d}
                className="pill px-5 py-2.5 font-mono text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
              >
                {d}/<span className="text-primary">tu_usuario</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Conexiones soportadas */}
      <section className="relative overflow-hidden py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Más de 60 <span className="text-gradient-violet">conexiones.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Todas tus plataformas, un solo lugar. Añade cuantas quieras.
          </p>
        </div>

        <div className="relative mt-12 space-y-3">
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
          <div className="marquee-track flex w-max gap-3">
            {[...connections, ...connections].map((c, i) => (
              <span key={`c1-${c}-${i}`} className="whitespace-nowrap pill px-5 py-2.5 text-sm text-muted-foreground">
                {c}
              </span>
            ))}
          </div>
          <div className="marquee-track-rev flex w-max gap-3">
            {[...connections.slice().reverse(), ...connections.slice().reverse()].map((c, i) => (
              <span key={`c2-${c}-${i}`} className="whitespace-nowrap pill px-5 py-2.5 text-sm text-muted-foreground">
                {c}
              </span>
            ))}
          </div>
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

const plans = [
  {
    name: "Free",
    price: "0",
    highlight: false,
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
    highlight: false,
    features: ["Todo lo de Pro", "Dominio propio", "Multi-perfil", "Soporte prioritario"],
  },
];
