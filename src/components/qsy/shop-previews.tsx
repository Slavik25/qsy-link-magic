import { Pause, Play, SkipForward } from "lucide-react";
import { SiTwitch } from "react-icons/si";
import type { GamingStyleDef, LayoutDef, PlayerDef } from "@/lib/shop";
import { gamingSkin } from "./gaming-skins";

/** Mini maqueta real de cómo se ve cada reproductor en el biolink. */
export function PlayerPreview({ player }: { player: PlayerDef }) {
  const t = player.player_type;
  const shell =
    player.player_bg === "solid"
      ? "border-border/60 bg-black/60"
      : player.player_bg === "glass"
        ? "border-white/15 bg-white/5 backdrop-blur-md"
        : "border-transparent bg-transparent";

  return (
    <div
      className="relative flex h-32 items-center justify-center overflow-hidden rounded-2xl border border-border/60 p-3"
      style={{ background: player.preview }}
    >
      {t === "minimal" && (
        <div
          className={`flex w-full items-center gap-2 rounded-full border px-3 py-2 ${shell} ${
            player.player_position === "top-right" ? "ml-auto max-w-[70%]" : ""
          }`}
        >
          <Play className="size-3.5 shrink-0 text-primary" />
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/15">
            <div className="h-full w-2/5 rounded-full bg-primary" />
          </div>
        </div>
      )}

      {t === "default" && (
        <div className={`flex w-full items-center gap-3 rounded-xl border p-2.5 ${shell}`}>
          <div className="size-9 shrink-0 rounded-md bg-gradient-to-br from-primary/70 to-primary/20" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-medium">QSY Radio</p>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/15">
              <div className="h-full w-1/3 rounded-full bg-primary" />
            </div>
          </div>
          <Pause className="size-3.5 text-primary" />
        </div>
      )}

      {t === "structured" && (
        <div
          className={`w-full rounded-xl border p-3 ${shell} ${
            player.key === "player-neon" ? "shadow-[0_0_24px_hsl(var(--primary)/0.45)] border-primary/50" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="size-11 shrink-0 rounded-lg bg-gradient-to-br from-primary/80 to-primary/10" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold">Midnight Drive</p>
              <p className="truncate text-[10px] text-muted-foreground">QSY Radio</p>
            </div>
            <SkipForward className="size-3.5 text-primary" />
          </div>
          <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/15">
            <div className="h-full w-1/2 rounded-full bg-primary" />
          </div>
          <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
            <span>1:24</span>
            <span>3:02</span>
          </div>
        </div>
      )}

      {t === "text" && (
        <div className={`w-full overflow-hidden rounded-full border px-3 py-2 ${shell}`}>
          <p className="qsy-marquee-text whitespace-nowrap text-[11px] font-medium text-primary">
            ♫ Midnight Drive — QSY Radio ♫ Midnight Drive — QSY Radio
          </p>
        </div>
      )}

      {t === "vinyl" && (
        <div className={`flex w-full items-center gap-3 rounded-xl border p-2.5 ${shell}`}>
          <div className="relative size-12 shrink-0 animate-[spin_4s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,#000,#333,#000,#444,#000)]">
            <span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-medium">Side A · Midnight</p>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/15">
              <div className="h-full w-1/4 rounded-full bg-primary" />
            </div>
          </div>
        </div>
      )}

      {t === "wave" && (
        <div className={`flex w-full items-end gap-1 rounded-xl border p-3 ${shell}`}>
          {[10, 22, 14, 30, 18, 26, 12, 24, 16, 28, 11, 20].map((h, i) => (
            <span
              key={i}
              className="w-1.5 flex-1 rounded-full bg-primary/80"
              style={{
                height: h,
                animation: `qsy-eq 1.1s ease-in-out ${i * 0.08}s infinite alternate`,
              }}
            />
          ))}
        </div>
      )}

      {t === "cassette" && (
        <div className={`w-full rounded-md border p-3 ${shell}`}>
          <div className="flex items-center justify-around rounded-sm border border-white/10 bg-black/40 px-4 py-2">
            <span className="size-7 animate-[spin_3s_linear_infinite] rounded-full border-4 border-primary/70 border-dashed" />
            <span className="h-1 flex-1 bg-white/20" />
            <span className="size-7 animate-[spin_3s_linear_infinite] rounded-full border-4 border-primary/40 border-dashed" />
          </div>
          <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            QSY Mixtape
          </p>
        </div>
      )}

      {t === "dock" && (
        <div className="flex h-full w-full items-end">
          <div className={`mx-auto flex items-center gap-3 rounded-2xl border px-4 py-2 ${shell}`}>
            <Play className="size-3.5 text-primary" />
            <span className="text-[11px]">Midnight Drive</span>
            <SkipForward className="size-3.5 text-muted-foreground" />
          </div>
        </div>
      )}
      {t === "orbit" && (
        <div className="flex w-full items-center justify-center">
          <div className="relative grid size-16 place-items-center">
            <span className="absolute inset-0 rounded-full border-2 border-white/10" />
            <span className="absolute inset-0 animate-[spin_3s_linear_infinite] rounded-full border-2 border-transparent border-t-primary" />
            <Play className="size-5 text-primary" />
          </div>
        </div>
      )}

      {t === "poster" && (
        <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-primary/60 via-primary/20 to-black">
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3">
            <p className="truncate text-[11px] font-semibold">Midnight Drive</p>
            <p className="truncate text-[10px] text-muted-foreground">QSY Radio</p>
            <div className="mt-1.5 flex items-center gap-2">
              <Play className="size-3.5 text-primary" />
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
                <span className="block h-full w-2/5 rounded-full bg-primary" />
              </span>
            </div>
          </div>
        </div>
      )}

      {t === "lcd" && (
        <div className="w-full rounded-md border border-emerald-400/40 bg-[#07160d] p-3 font-mono">
          <p className="truncate text-[11px] text-emerald-300">▶ MIDNIGHT DRIVE</p>
          <p className="mt-1 text-[10px] text-emerald-500/70">QSY RADIO · 01:24 / 03:02</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-sm bg-emerald-900/70">
            <div className="h-full w-2/5 bg-emerald-400" />
          </div>
        </div>
      )}

      {t === "spectrum" && (
        <div className={`flex w-full items-center gap-3 rounded-xl border p-2.5 ${shell}`}>
          <div className="size-11 shrink-0 rounded-lg bg-gradient-to-br from-primary/80 to-primary/10" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-medium">Midnight Drive</p>
            <p className="truncate text-[10px] text-muted-foreground">QSY Radio</p>
          </div>
          <div className="flex h-8 items-end gap-0.5">
            {[14, 22, 10, 26, 16, 20].map((h, i) => (
              <span
                key={i}
                className="w-1 rounded-full bg-primary/80"
                style={{ height: h, animation: `qsy-eq 1s ease-in-out ${i * 0.1}s infinite alternate` }}
              />
            ))}
          </div>
        </div>
      )}

      {t === "capsule" && (
        <div className={`flex w-full items-center gap-2 rounded-full border px-2 py-1.5 ${shell}`}>
          <span className="size-7 shrink-0 animate-[spin_5s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,#000,#555,#000)] ring-2 ring-primary/50" />
          <p className="truncate text-[11px]">Midnight Drive</p>
          <span className="ml-auto h-0.5 w-10 overflow-hidden rounded-full bg-white/20">
            <span className="block h-full w-1/2 bg-primary" />
          </span>
          <Play className="size-3 shrink-0 text-primary" />
        </div>
      )}

      {t === "terminal" && (
        <div className="w-full rounded-md border border-emerald-500/40 bg-black/80 p-3 font-mono text-emerald-400">
          <p className="text-[10px]">$ qsy play midnight_drive.mp3</p>
          <p className="mt-1 text-[10px]">[████████░░░░░░░░] 42%</p>
          <p className="mt-1 text-[10px] text-emerald-500/60">▌now playing · QSY Radio</p>
        </div>
      )}

      {t === "hologram" && (
        <div className="relative w-full overflow-hidden rounded-xl border border-cyan-300/40 bg-cyan-400/10 p-3 shadow-[0_0_28px_rgba(34,211,238,.35)] backdrop-blur-md">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "repeating-linear-gradient(180deg,rgba(255,255,255,.18) 0 1px,transparent 1px 3px)",
            }}
          />
          <div className="relative flex items-center gap-3">
            <div className="size-10 shrink-0 rounded-lg bg-gradient-to-br from-cyan-300/70 to-violet-500/30" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-cyan-100">Midnight Drive</p>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-1/2 rounded-full bg-cyan-300" />
              </div>
            </div>
            <Pause className="size-3.5 text-cyan-200" />
          </div>
        </div>
      )}


      <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
        {player.player_position ?? "en tarjeta"}
      </span>
    </div>
  );
}

const shapeClass: Record<string, string> = {
  circle: "rounded-full",
  rounded: "rounded-xl",
  square: "rounded-none",
  hexagon: "rounded-[30%]",
};

/** Mini maqueta real del biolink con el layout aplicado. */
export function LayoutPreview({ layout }: { layout: LayoutDef }) {
  const wide = layout.profile_width === "wide";
  const compact = layout.profile_width === "compact";
  const card = layout.show_card !== false;
  const mono = layout.template === "terminal";

  const cardStyle =
    layout.card_bg_type === "gradient"
      ? { background: layout.preview }
      : layout.card_bg_type === "image" || layout.card_bg_type === "video"
        ? { background: "linear-gradient(160deg,rgba(255,255,255,.14),rgba(0,0,0,.5))" }
        : { background: "rgba(10,10,16,.72)" };

  return (
    <div
      className="relative flex h-40 items-center justify-center overflow-hidden p-4"
      style={{ background: layout.preview }}
    >
      <div
        style={card ? cardStyle : undefined}
        className={[
          "flex flex-col items-center gap-2 px-4 py-3 transition-all",
          compact ? "w-[58%]" : wide ? "w-full" : "w-[78%]",
          card
            ? layout.template === "brutal"
              ? "border-2 border-white/70"
              : layout.template === "terminal"
                ? "border border-emerald-400/50 rounded-none"
                : layout.template === "holo"
                  ? "rounded-2xl border border-cyan-300/50 shadow-[0_0_28px_rgba(34,211,238,.35)]"
                  : layout.template === "neon"
                    ? "rounded-2xl border border-primary/60 shadow-[0_0_24px_hsl(var(--primary)/0.5)]"
                    : "rounded-2xl border border-white/12 backdrop-blur-md"
            : "",
        ].join(" ")}
      >
        {layout.template === "poster" && (
          <div className="-mx-4 -mt-3 mb-1 h-8 w-[calc(100%+2rem)] rounded-t-2xl bg-gradient-to-r from-primary/60 to-primary/10" />
        )}
        <span
          className={`${layout.key === "layout-poster" ? "size-10" : "size-8"} bg-gradient-to-br from-primary/80 to-primary/20 ring-2 ring-white/20 ${
            shapeClass[layout.avatar_shape] ?? "rounded-full"
          }`}
        />
        <span className={`h-1.5 w-16 rounded-full bg-white/60 ${mono ? "rounded-none" : ""}`} />
        <span className="h-1 w-24 rounded-full bg-white/25" />
        <div className={`mt-1 grid w-full gap-1.5 ${wide ? "grid-cols-2" : "grid-cols-1"}`}>
          {Array.from({ length: wide ? 4 : compact ? 2 : 3 }).map((_, i) => (
            <span
              key={i}
              className={`h-3 w-full bg-white/12 ${
                layout.template === "brutal" || mono ? "rounded-none border border-white/25" : "rounded-md"
              }`}
            />
          ))}
        </div>
      </div>
      <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
        {layout.profile_width}
      </span>
    </div>
  );
}

/** Mini maqueta de las tarjetas de Steam / Twitch / Roblox. */
export function GamingPreview({ item }: { item: GamingStyleDef }) {
  const color = "#9146ff";
  const skin = gamingSkin(item.style, color, false);
  return (
    <div
      className="relative flex h-32 items-center justify-center overflow-hidden rounded-2xl border border-border/60 p-3"
      style={{ background: item.style === "prism" ? "#0b0b12" : item.preview }}
    >
      <div
        className={`relative flex w-full items-center gap-3 overflow-hidden p-3 ${skin.mono ? "font-mono" : ""} ${skin.className}`}
        style={skin.style}
      >
        {skin.glow && (
          <span
            aria-hidden
            className="pointer-events-none absolute -right-6 -top-8 size-20 rounded-full opacity-30 blur-2xl"
            style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }}
          />
        )}
        {skin.topLine && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-70"
            style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
          />
        )}
        {skin.scanlines && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "repeating-linear-gradient(180deg,rgba(255,255,255,.18) 0 1px,transparent 1px 3px)",
            }}
          />
        )}
        <span
          className="relative grid size-9 shrink-0 place-items-center"
          style={{
            borderRadius: skin.avatar ?? "0.75rem",
            background: `color-mix(in oklab, ${color} 25%, transparent)`,
            color,
          }}
        >
          <SiTwitch className="size-4" />
        </span>
        <span className="relative min-w-0 flex-1">
          <span
            className="block text-[9px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: item.style === "chrome" ? "#0b0b12" : color }}
          >
            Twitch
          </span>
          <span
            className="block truncate text-[11px] font-semibold"
            style={{ color: item.style === "chrome" ? "#0b0b12" : undefined }}
          >
            qsy_live
          </span>
        </span>
        <span
          className="relative text-[10px] font-bold"
          style={{ color: item.style === "chrome" ? "#0b0b12" : color }}
        >
          12.4K
        </span>
      </div>
    </div>
  );
}
