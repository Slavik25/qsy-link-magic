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
  Play,
  Download,

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
import { usePlatformStats, useShowcaseProfiles } from "@/lib/qsy-data";

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

const bars = [28, 44, 36, 62, 48, 74, 58, 88, 66, 94, 72, 100];

const modules: {
  icon: typeof MessageCircle;
  title: string;
  desc: string;
  tag: string;
  kind: "discord" | "gaming" | "music" | "qr";
  image?: string;
}[] = [
  {
    icon: MessageCircle,
    title: "Módulo Discord",
    desc: "Estado en vivo, actividad y servidor conectado directamente en tu perfil.",
    tag: "En vivo",
    kind: "discord",
  },
  {
    icon: Gamepad2,
    title: "Módulo Gaming",
    desc: "Steam, Roblox y Twitch: muestra qué juegas y cuándo estás online.",
    tag: "Popular",
    kind: "gaming",
  },
  {
    icon: Music4,
    title: "Módulo Música",
    desc: "Spotify sincronizado con reproducción y portada animada.",
    tag: "Nuevo",
    kind: "music",
  },
  {
    icon: QrCode,
    title: "Módulo QR",
    desc: "Genera y descarga tu QR con acento personalizado en un click.",
    tag: "Pro",
    kind: "qr",
  },
];

const waveform = [18, 34, 52, 30, 68, 84, 46, 92, 58, 74, 38, 62, 88, 44, 26, 56, 78, 40];

const qrCells = Array.from({ length: 49 }, (_, i) => {
  const x = i % 7;
  const y = Math.floor(i / 7);
  const corner = (x < 2 && y < 2) || (x > 4 && y < 2) || (x < 2 && y > 4);
  return corner || (x * 3 + y * 5 + x * y) % 3 === 0;
});

function PreviewFrame({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-full overflow-hidden rounded-[26px] border border-border/70 bg-background/70 backdrop-blur-2xl">
      <div aria-hidden className="pointer-events-none absolute inset-0 starfield twinkle opacity-30" />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/3 size-64 rounded-full bg-primary/15 blur-3xl"
      />
      <div className="relative flex items-center gap-2 border-b border-border/60 px-4 py-2.5">
        <span className="size-2 rounded-full bg-border" />
        <span className="size-2 rounded-full bg-border" />
        <span className="size-2 rounded-full bg-primary/70" />
        <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="relative h-[calc(100%-41px)]">{children}</div>
    </div>
  );
}

function DiscordPreview() {
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-6">
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/70 backdrop-blur-xl">
        <div aria-hidden className="h-14 bg-gradient-to-r from-primary/70 via-accent/60 to-primary/20" />
        <div className="-mt-8 px-5 pb-5">
          <div className="flex items-end justify-between">
            <div className="relative">
              <span className="grid size-16 place-items-center rounded-2xl border-4 border-card bg-background font-mono text-[11px] font-bold text-primary">
                QSY
              </span>
              <span className="absolute -bottom-1 -right-1 size-4 rounded-full border-[3px] border-card bg-primary pulse-glow" />
            </div>
            <span className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-primary">
              <span className="size-1.5 rounded-full bg-primary pulse-glow" /> Live
            </span>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold">
            qsy <BadgeCheck className="size-3.5 text-primary" />
          </p>
          <p className="text-[11px] text-muted-foreground">@qsy · miembro desde 2021</p>
          <div className="mt-3 flex gap-1.5">
            {["Early", "Nitro", "Boost", "HypeSquad"].map((b) => (
              <span
                key={b}
                className="rounded-md border border-border/60 bg-background/60 px-1.5 py-0.5 text-[9px] text-muted-foreground"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/60 p-3.5 backdrop-blur-xl">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Jugando a
        </p>
        <div className="mt-2.5 flex items-center gap-3">
          <span className="size-11 shrink-0 rounded-xl bg-gradient-to-br from-primary/80 to-accent/50" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">Valorant · Ascent</p>
            <p className="truncate text-[10px] text-muted-foreground">Partida competitiva</p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
              <span className="block h-full w-2/3 rounded-full bg-gradient-to-r from-primary to-accent" />
            </div>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">42:18</span>
        </div>
      </div>
    </div>
  );
}

function GamingPreview() {
  const games = [
    { name: "Roblox", meta: "1.2k visitas", pct: 82, spark: [30, 50, 40, 70, 60, 90] },
    { name: "Steam", meta: "412 horas", pct: 64, spark: [20, 35, 55, 45, 70, 62] },
    { name: "Twitch", meta: "En directo · 1.4k", pct: 93, spark: [40, 60, 55, 80, 75, 96] },
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-6">
      {games.map((g, i) => (
        <div
          key={g.name}
          className="group/g flex items-center gap-3 rounded-2xl border border-border/60 bg-card/60 px-4 py-3 backdrop-blur-xl transition-colors hover:border-primary/40"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <Gamepad2 className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold">{g.name}</span>
              <span className="text-muted-foreground">{g.meta}</span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
              <span
                className="block h-full rounded-full bg-gradient-to-r from-primary to-accent"
                style={{ width: `${g.pct}%` }}
              />
            </div>
          </div>
          <div className="flex h-7 w-14 items-end gap-[2px]">
            {g.spark.map((h, j) => (
              <span
                key={j}
                className="flex-1 rounded-sm bg-primary/50 bar-grow"
                style={{ height: `${h}%`, animationDelay: `${j * 70}ms` }}
              />
            ))}
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between rounded-2xl border border-dashed border-border/60 px-4 py-2.5 text-[10px] text-muted-foreground">
        <span>Sincronización automática cada 60s</span>
        <span className="font-mono text-primary">ONLINE</span>
      </div>
    </div>
  );
}

function MusicPreview() {
  return (
    <div className="flex h-full flex-col justify-center gap-4 p-6">
      <div className="flex items-center gap-4 rounded-3xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl border border-border/60">
          <div className="size-full bg-gradient-to-br from-primary via-accent to-primary/20" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-10 place-items-center rounded-full bg-background/70 backdrop-blur-xl">
              <Play className="size-4 fill-current text-primary" />
            </span>
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Reproduciendo ahora
          </p>
          <p className="mt-1 truncate text-base font-semibold">Midnight Signal</p>
          <p className="truncate text-[11px] text-muted-foreground">Nova · Single · 2026</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="font-mono text-[9px] text-muted-foreground">1:12</span>
            <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-border">
              <span className="block h-full w-2/5 rounded-full bg-gradient-to-r from-primary to-accent" />
            </span>
            <span className="font-mono text-[9px] text-muted-foreground">3:04</span>
          </div>
        </div>
      </div>
      <div className="flex h-16 items-end gap-[3px] rounded-2xl border border-border/60 bg-card/40 px-4 py-3">
        {waveform.map((h, i) => (
          <span
            key={i}
            className="flex-1 rounded-full bg-gradient-to-t from-primary/30 to-primary bar-grow"
            style={{ height: `${h}%`, animationDelay: `${i * 45}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function QrPreview() {
  return (
    <div className="flex h-full items-center justify-center gap-6 p-6">
      <div className="relative rounded-3xl border border-border/60 bg-card/70 p-4 backdrop-blur-xl">
        <div className="grid grid-cols-7 gap-1">
          {qrCells.map((on, i) => (
            <span
              key={i}
              className={`size-3 rounded-[4px] ${on ? "bg-primary" : "bg-border/60"}`}
              style={{ opacity: on ? 1 : 0.7 }}
            />
          ))}
        </div>
        <span className="absolute inset-x-4 top-1/2 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-70" />
        <p className="mt-3 text-center font-mono text-[10px] text-muted-foreground">qsy.rip/qsy</p>
      </div>
      <div className="space-y-2.5 text-left">
        {["PNG · SVG · PDF", "Color de acento", "Logo centrado", "Escaneo ilimitado"].map((r) => (
          <p key={r} className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Check className="size-3.5 text-primary" /> {r}
          </p>
        ))}
        <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-[10px] font-medium text-primary">
          <Download className="size-3" /> Descargar QR
        </span>
      </div>
    </div>
  );
}

function ModulePreview({ kind }: { kind: (typeof modules)[number]["kind"] }) {
  if (kind === "discord") return <DiscordPreview />;
  if (kind === "gaming") return <GamingPreview />;
  if (kind === "music") return <MusicPreview />;
  return <QrPreview />;
}


function ModulesShowcase() {
  const [active, setActive] = useState(0);
  const m = modules[active]!;

  return (
    <section className="relative overflow-hidden py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0 aurora opacity-50" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 pill px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" /> Módulos potentes
          </span>
          <h2 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
            Módulos que se
            <br />
            <span className="text-gradient-violet">sienten vivos.</span>
          </h2>
          <p className="mt-4 max-w-lg text-muted-foreground">
            Cada módulo se actualiza en tiempo real dentro de tu perfil. Sin código, sin
            configuración: conecta y listo.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
          <div className="flex flex-col gap-2.5">
            {modules.map((mod, i) => {
              const on = i === active;
              return (
                <button
                  key={mod.title}
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  aria-pressed={on}
                  className={`group relative overflow-hidden rounded-3xl border p-5 text-left transition-all duration-500 ${
                    on
                      ? "border-primary/50 bg-card/70 shadow-[0_40px_100px_-60px_var(--primary)]"
                      : "border-border/60 bg-card/30 hover:border-border"
                  } backdrop-blur-xl`}
                >
                  <span
                    aria-hidden
                    className={`absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-primary to-accent transition-transform duration-500 ${
                      on ? "scale-y-100" : "scale-y-0"
                    }`}
                  />
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid size-11 shrink-0 place-items-center rounded-2xl transition-all duration-500 ${
                        on ? "bg-primary/25 text-primary scale-105" : "bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <mod.icon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate text-sm font-semibold">{mod.title}</h3>
                        <span className="shrink-0 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-primary">
                          {mod.tag}
                        </span>
                      </div>
                      <p
                        className={`mt-1 text-[11px] leading-relaxed text-muted-foreground transition-all duration-500 ${
                          on ? "max-h-16 opacity-100" : "max-h-0 overflow-hidden opacity-0 lg:max-h-16 lg:opacity-60"
                        }`}
                      >
                        {mod.desc}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}

            <div className="mt-2 flex items-center justify-between rounded-3xl border border-dashed border-border/60 px-5 py-4">
              <p className="text-[11px] text-muted-foreground">
                +60 conexiones disponibles
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary"
              >
                Probar ahora <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>

          <div className="relative min-h-[460px]">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 rounded-[40px] bg-primary/10 blur-3xl"
            />
            <div key={m.kind} className="relative h-[460px] rise">
              <PreviewFrame title={`qsy.rip/qsy · ${m.tag}`}>
                {m.image ? (
                  <img
                    src={m.image}
                    alt={`${m.title} en QSY`}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                ) : (
                  <ModulePreview kind={m.kind} />
                )}
              </PreviewFrame>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


const specs: {
  icon: typeof UserRound;
  title: string;
  desc: string;
  span: string;
  visual: "profile" | "links" | "analytics" | "theme" | "socials" | "music";
}[] = [
  {
    icon: UserRound,
    title: "Perfiles personalizados",
    desc: "Avatar, banner, bio, ubicación y badge verificado.",
    span: "sm:col-span-3 lg:col-span-2",
    visual: "profile",
  },
  {
    icon: BarChart3,
    title: "Analytics en vivo",
    desc: "Visitas, clicks, CTR, país, dispositivo y referrer.",
    span: "sm:col-span-3 lg:col-span-4",
    visual: "analytics",
  },
  {
    icon: Link2,
    title: "Links ilimitados",
    desc: "Ordena, activa y mide cada enlace en segundos.",
    span: "sm:col-span-3 lg:col-span-3",
    visual: "links",
  },
  {
    icon: Palette,
    title: "Temas personalizados",
    desc: "Blur, opacidad, glow, radios, colores y efectos.",
    span: "sm:col-span-3 lg:col-span-3",
    visual: "theme",
  },
  {
    icon: Share2,
    title: "Redes sociales",
    desc: "Discord, Instagram, TikTok, GitHub, Steam y más.",
    span: "sm:col-span-3 lg:col-span-4",
    visual: "socials",
  },
  {
    icon: Music4,
    title: "Música",
    desc: "Añade tu track favorito y reprodúcelo en tu perfil.",
    span: "sm:col-span-3 lg:col-span-2",
    visual: "music",
  },
];

function SpecVisual({ kind }: { kind: (typeof specs)[number]["visual"] }) {
  if (kind === "analytics") {
    return (
      <div className="flex h-20 items-end gap-1.5">
        {bars.map((b, i) => (
          <span
            key={i}
            className="flex-1 rounded-t-md bg-gradient-to-t from-primary/20 to-primary bar-grow"
            style={{ height: `${b}%`, animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>
    );
  }
  if (kind === "links") {
    return (
      <div className="space-y-2">
        {["Portfolio", "Tienda", "Discord"].map((l, i) => (
          <div
            key={l}
            className="flex items-center justify-between rounded-xl border border-border/60 bg-background/50 px-3 py-2 text-[11px] transition-transform duration-500 group-hover:translate-x-1"
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            <span className="flex items-center gap-2">
              <Link2 className="size-3 text-primary" /> {l}
            </span>
            <ArrowRight className="size-3 text-muted-foreground" />
          </div>
        ))}
      </div>
    );
  }
  if (kind === "profile") {
    return (
      <div className="rounded-2xl border border-border/60 bg-background/50 p-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-primary/20 font-mono text-[10px] font-bold text-primary">
            QSY
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-xs font-semibold">
              QSY <BadgeCheck className="size-3.5 text-primary" />
            </p>
            <p className="text-[10px] text-muted-foreground">qsy.rip/qsy</p>
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          <span className="block h-1.5 w-full rounded-full bg-border" />
          <span className="block h-1.5 w-2/3 rounded-full bg-border" />
        </div>
      </div>
    );
  }
  if (kind === "theme") {
    return (
      <div className="flex items-center gap-2">
        {["from-primary to-accent", "from-accent to-primary/40", "from-primary/60 to-background", "from-foreground/70 to-muted"].map(
          (g, i) => (
            <span
              key={i}
              className={`size-10 rounded-xl bg-gradient-to-br ${g} border border-border/60 transition-transform duration-500 group-hover:-translate-y-1`}
              style={{ transitionDelay: `${i * 70}ms` }}
            />
          ),
        )}
        <div className="ml-2 flex-1 space-y-2">
          <span className="block h-1.5 w-full rounded-full bg-border">
            <span className="block h-full w-3/5 rounded-full bg-primary" />
          </span>
          <span className="block h-1.5 w-full rounded-full bg-border">
            <span className="block h-full w-1/3 rounded-full bg-accent" />
          </span>
        </div>
      </div>
    );
  }
  if (kind === "socials") {
    return (
      <div className="flex flex-wrap gap-2">
        {["Discord", "Instagram", "TikTok", "GitHub", "Steam", "Spotify", "X", "Twitch"].map((s, i) => (
          <span
            key={s}
            className="rounded-full border border-border/60 bg-background/50 px-3 py-1 text-[10px] text-muted-foreground transition-colors duration-500 group-hover:border-primary/40 group-hover:text-foreground"
            style={{ transitionDelay: `${i * 40}ms` }}
          >
            {s}
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent">
        <Play className="size-4 fill-current text-primary-foreground" />
      </span>
      <div className="flex h-8 flex-1 items-end gap-[3px]">
        {waveform.slice(0, 12).map((h, i) => (
          <span
            key={i}
            className="flex-1 rounded-full bg-primary/60 bar-grow"
            style={{ height: `${h}%`, animationDelay: `${i * 55}ms` }}
          />
        ))}
      </div>
    </div>
  );
}


const domains = ["qsy.rip", "qsy.es", "qsy.bio"];

const connections = [
  "Discord", "Instagram", "TikTok", "YouTube", "Twitch", "X", "GitHub", "Steam",
  "Telegram", "Spotify", "Roblox", "Kick", "Pinterest", "Reddit", "SoundCloud",
  "Behance", "Dribbble", "LinkedIn", "Threads", "Snapchat",
];

type ShowcaseProfile = {
  username: string;
  display_name?: string | null;
  avatar_url?: string | null;
  banner_url?: string | null;
  verified?: boolean | null;
  view_count?: number | null;
  bio?: string | null;
};

function compact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function ProfileCard({ p }: { p: ShowcaseProfile }) {
  const name = p.display_name || p.username;
  return (
    <Link
      to="/$username"
      params={{ username: p.username }}
      className="group block overflow-hidden rounded-3xl border border-border/60 bg-card/50 backdrop-blur-xl transition-all duration-500 hover:border-primary/50 hover:shadow-[0_50px_110px_-60px_var(--primary)]"
    >
      <div className="relative h-24 overflow-hidden">
        {p.banner_url ? (
          <img
            src={p.banner_url}
            alt={`Perfil QSY de ${name}`}
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div aria-hidden className="size-full aurora starfield opacity-90" />
        )}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
      </div>

      <div className="-mt-7 px-4 pb-4 text-left">
        {p.avatar_url ? (
          <img
            src={p.avatar_url}
            alt={`Avatar de ${name}`}
            loading="lazy"
            className="size-12 rounded-2xl border border-border/70 object-cover"
          />
        ) : (
          <span className="grid size-12 place-items-center rounded-2xl border border-border/70 bg-background/80 font-mono text-xs font-bold text-primary backdrop-blur-xl">
            {p.username.slice(0, 2).toUpperCase()}
          </span>
        )}
        <div className="mt-3 flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold">{name}</p>
          {p.verified ? <BadgeCheck className="size-3.5 shrink-0 text-primary" /> : null}
        </div>
        <p className="truncate font-mono text-[11px] text-muted-foreground">qsy.rip/{p.username}</p>
        <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
          <span className="truncate rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {p.bio ? p.bio.slice(0, 18) : "QSY"}
          </span>
          <span className="text-xs font-semibold text-primary">
            {compact(p.view_count ?? 0)}
          </span>
        </div>
      </div>
    </Link>
  );
}



function Landing() {
  const [handle, setHandle] = useState("");
  const { data: stats } = usePlatformStats();
  const { data: showcase } = useShowcaseProfiles(8);

  const heroStats = [
    { label: "Visitas totales", value: (stats?.views ?? 0).toLocaleString("es-ES") },
    { label: "Creadores activos", value: (stats?.creators ?? 0).toLocaleString("es-ES") },
    { label: "Links servidos", value: (stats?.links ?? 0).toLocaleString("es-ES") },
    { label: "Badges verificados", value: (stats?.verified ?? 0).toLocaleString("es-ES") },
  ];

  const cards: ShowcaseProfile[] = showcase?.length ? showcase : [];
  const colA = cards.length ? [...cards, ...cards] : [];
  const colB = cards.length ? [...cards].reverse().concat([...cards].reverse()) : [];


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
            <span className="shrink-0 font-mono text-sm text-primary">qsy.rip/</span>
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
              {colA.map((p, i) => (
                <ProfileCard key={`a-${p.username}-${i}`} p={p} />
              ))}
            </div>
            <div className="marquee-y-slow flex flex-col gap-4">
              {colB.map((p, i) => (
                <ProfileCard key={`b-${p.username}-${i}`} p={p} />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Especificaciones */}
      <section id="features" className="relative overflow-hidden py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(var(--foreground)_1px,transparent_1px),linear-gradient(90deg,var(--foreground)_1px,transparent_1px)] [background-size:64px_64px] mask-fade-y"
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-6 border-b border-border/60 pb-10 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 pill px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-primary pulse-glow" /> Especificaciones · 100% gratis
              </span>
              <h2 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
                La estructura
                <br />
                <span className="text-gradient-violet">definitiva.</span>
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground md:text-right">
              Seis piezas que trabajan juntas para que tu perfil cargue al instante, se vea único y
              te diga exactamente qué funciona.
            </p>
          </div>

          <div className="mt-10 grid gap-4 text-left sm:grid-cols-6">
            {specs.map((s, i) => (
              <article
                key={s.title}
                className={`group relative flex flex-col overflow-hidden rounded-[28px] border border-border/70 bg-card/40 p-7 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/50 hover:bg-card/60 hover:shadow-[0_70px_140px_-70px_var(--primary)] ${s.span}`}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-24 -top-24 size-56 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
                />

                <div className="relative flex items-start justify-between">
                  <span className="grid size-11 place-items-center rounded-2xl border border-border/60 bg-background/60 text-primary transition-all duration-500 group-hover:border-primary/50 group-hover:bg-primary/15 group-hover:scale-105">
                    <s.icon className="size-5" />
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground/50">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="relative mt-6 text-lg font-semibold tracking-tight">{s.title}</h3>
                <p className="relative mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>

                <div className="relative mt-auto pt-7">
                  <SpecVisual kind={s.visual} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>




      {/* Módulos e integraciones */}
      <ModulesShowcase />



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
