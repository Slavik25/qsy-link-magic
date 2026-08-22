import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Crown, Move, ZoomIn, ZoomOut } from "lucide-react";
import { SiteNav } from "@/components/qsy/site-nav";
import { SiteFooter } from "@/components/qsy/site-footer";
import { supabase } from "@/integrations/supabase/client";
import { readTheme } from "@/lib/qsy";

export const Route = createFileRoute("/rank")({
  head: () => ({
    meta: [
      { title: "The Void Rank — Ranking de perfiles QSY" },
      {
        name: "description",
        content:
          "Índice de influencia de QSY: explora el mapa estelar con los perfiles más vistos y queridos de la comunidad.",
      },
      { property: "og:title", content: "The Void Rank — Ranking de perfiles QSY" },
      {
        property: "og:description",
        content: "Explora el mapa estelar con los perfiles más influyentes de QSY.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/rank" }],
  }),
  component: RankPage,
});

type Soul = {
  username: string;
  display_name: string;
  avatar_url: string | null;
  accent: string;
  views: number;
  likes: number;
  score: number;
  x: number;
  y: number;
  size: number;
};

function useSouls() {
  return useQuery({
    queryKey: ["void-rank"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, display_name, avatar_url, theme, view_count, like_count")
        .order("view_count", { ascending: false })
        .limit(120);
      if (error) throw error;

      const rows = (data ?? []).map((r: any) => {
        const views = r.view_count ?? 0;
        const likes = r.like_count ?? 0;
        return {
          username: r.username as string,
          display_name: (r.display_name || r.username) as string,
          avatar_url: r.avatar_url as string | null,
          accent: readTheme(r.theme).accent,
          views,
          likes,
          score: views + likes * 5,
        };
      });
      rows.sort((a, b) => b.score - a.score);

      const max = Math.max(1, rows[0]?.score ?? 1);
      return rows.map((r, i): Soul => {
        // Golden-angle spiral: the strongest souls sit closest to the core.
        const angle = i * 2.399963;
        const radius = 60 + Math.sqrt(i + 0.6) * 118;
        return {
          ...r,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          size: 18 + Math.round((r.score / max) * 52),
        };
      });
    },
  });
}

function RankPage() {
  const { data: souls = [], isLoading } = useSouls();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState<Soul | null>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const movedRef = useRef(false);

  const top = useMemo(() => souls.slice(0, 10), [souls]);

  const MIN_ZOOM = 0.4;
  const MAX_ZOOM = 2.4;

  // Zoom anchored on a point measured from the viewport centre (the map's origin).
  const zoomAt = (nextRaw: number, ax: number, ay: number) => {
    setZoom((z) => {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextRaw));
      const k = next / z;
      setPan((p) => ({ x: ax - (ax - p.x) * k, y: ay - (ay - p.y) * k }));
      return next;
    });
  };
  const zoomAtRef = useRef(zoomAt);
  zoomAtRef.current = zoomAt;
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      const rect = el.getBoundingClientRect();
      const ax = e.clientX - rect.left - rect.width / 2;
      const ay = e.clientY - rect.top - rect.height / 2;
      zoomAtRef.current(zoomRef.current * Math.exp(-dy * 0.0018), ax, ay);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);


  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <main className="relative">
        <section className="relative overflow-hidden pt-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 45%, color-mix(in oklab, var(--primary) 22%, transparent), transparent 72%)",
            }}
          />

          <header className="relative mx-auto max-w-3xl px-4 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
              <Crown className="size-3.5" /> Influence Index
            </span>
            <h1 className="mt-5 text-4xl font-black italic tracking-tight sm:text-6xl">
              THE <span className="text-primary">VOID</span> RANK
            </h1>
            <p className="mt-3 text-[11px] uppercase tracking-[0.42em] text-muted-foreground">
              {souls.length} almas manifestadas
            </p>
          </header>

          <div
            ref={viewportRef}
            style={{ touchAction: "none" }}
            className="relative mt-8 h-[640px] w-full cursor-grab overflow-hidden active:cursor-grabbing"
            onPointerDown={(e) => {
              drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
              movedRef.current = false;
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              if (!d) return;
              const dx = e.clientX - d.x;
              const dy = e.clientY - d.y;
              if (Math.abs(dx) + Math.abs(dy) > 5) movedRef.current = true;
              setPan({ x: d.px + dx, y: d.py + dy });
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerLeave={() => (drag.current = null)}
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 starfield opacity-60" />

            <div
              className="absolute left-1/2 top-1/2"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transition: drag.current ? "none" : "transform 220ms ease-out",
              }}
            >
              {souls.map((s, i) => (
                <Link
                  key={s.username}
                  to="/$username"
                  params={{ username: s.username }}
                  onMouseEnter={() => setActive(s)}
                  onFocus={() => setActive(s)}
                  onMouseLeave={() => setActive(null)}
                  onClick={(e) => {
                    // Ignore the click that ends a pan gesture.
                    if (movedRef.current) e.preventDefault();
                  }}
                  aria-label={`Ver el biolink de ${s.display_name} — puesto ${i + 1}`}
                  className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-full outline-none"
                  style={{ left: s.x, top: s.y, width: s.size, height: s.size }}
                >
                  <span
                    className="block size-full overflow-hidden rounded-full border transition-transform duration-300 group-hover:scale-125"
                    style={{
                      borderColor: `color-mix(in oklab, ${s.accent} 60%, transparent)`,
                      background: `radial-gradient(circle at 32% 28%, ${s.accent}, color-mix(in oklab, ${s.accent} 20%, black))`,
                      boxShadow: `0 0 ${Math.round(s.size * 0.9)}px color-mix(in oklab, ${s.accent} 55%, transparent)`,
                    }}
                  >
                    {s.avatar_url && (
                      <img
                        src={s.avatar_url}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover opacity-80"
                      />
                    )}
                  </span>
                  <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border/60 bg-background/85 px-2 py-1 text-[10px] font-medium opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                    #{i + 1} {s.display_name}
                  </span>
                </Link>
              ))}
            </div>

            {isLoading && (
              <p className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
                Invocando almas…
              </p>
            )}

            <div className="pointer-events-auto absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-full border border-border/60 bg-background/70 px-5 py-3 backdrop-blur-xl">
              <button
                type="button"
                aria-label="Alejar"
                onClick={() => zoomAt(zoom / 1.25, 0, 0)}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <ZoomOut className="size-4" />
              </button>
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                <Move className="size-3.5 text-primary" /> Arrastra y usa el scroll
              </span>
              <button
                type="button"
                aria-label="Acercar"
                onClick={() => zoomAt(zoom * 1.25, 0, 0)}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <ZoomIn className="size-4" />
              </button>
            </div>

            {active && (
              <div className="pointer-events-none absolute right-6 top-6 w-56 rounded-2xl border border-border/60 bg-background/80 p-4 backdrop-blur-xl">
                <p className="truncate text-sm font-semibold">{active.display_name}</p>
                <p className="truncate text-xs text-muted-foreground">@{active.username}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="rounded-lg border border-border/50 py-2">
                    <p className="font-mono text-sm">{active.views.toLocaleString()}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Visitas</p>
                  </div>
                  <div className="rounded-lg border border-border/50 py-2">
                    <p className="font-mono text-sm">{active.likes.toLocaleString()}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Likes</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-center text-[11px] font-semibold uppercase tracking-[0.34em] text-muted-foreground">
            Top 10 del vacío
          </h2>
          <ol className="mt-6 space-y-2">
            {top.map((s, i) => (
              <li key={s.username}>
                <Link
                  to="/$username"
                  params={{ username: s.username }}
                  className="flex items-center gap-4 rounded-xl border border-border/60 bg-card/40 px-4 py-3 backdrop-blur transition-colors hover:bg-card/70"
                >
                  <span className="w-8 font-mono text-sm text-primary">#{i + 1}</span>
                  <img
                    src={s.avatar_url || "https://i.pravatar.cc/80"}
                    alt=""
                    loading="lazy"
                    width={36}
                    height={36}
                    className="size-9 rounded-full object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{s.display_name}</span>
                    <span className="block truncate text-xs text-muted-foreground">@{s.username}</span>
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {s.score.toLocaleString()} pts
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
