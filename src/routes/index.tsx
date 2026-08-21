import { createFileRoute, Link } from "@tanstack/react-router";
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
  return (
    <div className="min-h-screen">
      <SiteNav />

      <section className="relative overflow-hidden hero-bg">
        <div aria-hidden className="absolute inset-0 grid-bg opacity-60" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              Nuevo · Templates y analytics en tiempo real
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              <span className="text-gradient">Tu identidad.</span>
              <br />
              Un solo link.
            </h1>
            <p className="mt-5 max-w-md text-base text-muted-foreground sm:text-lg">
              Comparte todo lo que eres, haces y creas desde un único perfil.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/register">
                  Crear mi QSY <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/explore">Explorar perfiles</Link>
              </Button>
            </div>
            <p className="mt-6 font-mono text-xs text-muted-foreground">qsy.to/tunombre</p>
          </div>

          <div className="relative float-slow">
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
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Todo tu mundo, en una página
        </h2>
        <p className="mt-3 max-w-lg text-muted-foreground">
          Un perfil rápido, oscuro y personalizable. Sin ruido, sin plantillas genéricas.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl glass p-6 lift hover:bg-surface-strong">
              <f.icon className="size-5 text-primary" />
              <h3 className="mt-4 font-medium">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Precios simples</h2>
        <p className="mt-3 text-muted-foreground">Empieza gratis. Escala cuando quieras.</p>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl p-6 ${
                p.highlight ? "glass-strong glow-ring" : "glass"
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
