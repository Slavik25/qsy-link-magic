import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import type { ThemeConfig } from "@/lib/qsy";
import { detectEmbed, prettyTrackName } from "@/lib/media";

type Props = {
  theme: ThemeConfig;
  music?: { title?: string; artist?: string; cover?: string } | null | undefined;
  /** true cuando el reproductor se ancla a la pantalla (dock/corner) */
  floating?: boolean;
};

function fmt(s: number) {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function isFloatingPlayer(theme: ThemeConfig) {
  const p = theme.player_position ?? "inline";
  return p !== "inline" && p !== "card";
}

/**
 * Reproductor real del biolink. Renderiza el skin equipado desde la tienda
 * (theme.player_type / player_bg / player_position) sobre el audio del perfil.
 */
export function ProfilePlayer({ theme, music, floating = false }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [volume, setVolume] = useState((theme.audio_volume ?? 40) / 100);
  const [dur, setDur] = useState(0);

  const accent = theme.accent;
  const type = theme.player_type || "default";
  const embed = detectEmbed(theme.audio_url);
  const title =
    theme.audio_title?.trim() ||
    music?.title ||
    (theme.audio_url ? prettyTrackName(theme.audio_url) : "QSY Radio");
  const artist = theme.audio_artist?.trim() || music?.artist || "";

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = (theme.audio_volume ?? 40) / 100;
    void el
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
    const resume = () => {
      void el.play().then(() => setPlaying(true)).catch(() => undefined);
    };
    window.addEventListener("pointerdown", resume, { once: true });
    return () => window.removeEventListener("pointerdown", resume);
  }, [theme.audio_url]);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play().then(() => setPlaying(true)).catch(() => undefined);
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  const progress = dur > 0 ? (time / dur) * 100 : 0;

  const shell = useMemo(() => {
    const bg = theme.player_bg ?? "glass";
    if (bg === "solid") return "border-white/10 bg-black/70";
    if (bg === "transparent") return "border-transparent bg-transparent";
    return "border-white/15 bg-white/5 backdrop-blur-md";
  }, [theme.player_bg]);

  const FLOATING_POS: Record<string, string> = {
    "top-left": "fixed left-4 top-4 z-30 w-[min(17rem,78vw)]",
    "top-center": "fixed left-1/2 top-4 z-30 w-[min(19rem,84vw)] -translate-x-1/2",
    "top-right": "fixed right-4 top-4 z-30 w-[min(17rem,78vw)]",
    "mid-left": "fixed left-4 top-1/2 z-30 w-[min(17rem,78vw)] -translate-y-1/2",
    "mid-right": "fixed right-4 top-1/2 z-30 w-[min(17rem,78vw)] -translate-y-1/2",
    "bottom-left": "fixed bottom-4 left-4 z-30 w-[min(17rem,78vw)]",
    "bottom-center": "fixed bottom-4 left-1/2 z-30 w-[min(19rem,84vw)] -translate-x-1/2",
    "bottom-right": "fixed bottom-4 right-4 z-30 w-[min(17rem,78vw)]",
  };

  const posClass = floating
    ? (FLOATING_POS[theme.player_position ?? "bottom-center"] ??
      FLOATING_POS["bottom-center"]!)
    : "w-full max-w-sm";


  const playBtn = (size = "size-8") => (
    <button
      type="button"
      onClick={toggle}
      aria-label={playing ? "Pausar" : "Reproducir"}
      className={`grid ${size} shrink-0 place-items-center rounded-full transition-transform hover:scale-105`}
      style={{ background: accent, color: "#0b0b0b" }}
    >
      {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
    </button>
  );

  const setVol = (v: number) => {
    const el = audioRef.current;
    setVolume(v);
    if (el) {
      el.volume = v;
      el.muted = v === 0;
    }
    setMuted(v === 0);
  };

  const volCtl = (
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        onClick={() => setVol(muted || volume === 0 ? 0.4 : 0)}
        aria-label={muted ? "Activar sonido" : "Silenciar"}
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        {muted || volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        aria-label="Volumen"
        onChange={(e) => setVol(Number(e.target.value))}
        className="h-1 w-12 cursor-pointer appearance-none rounded-full bg-white/20"
        style={{ accentColor: accent }}
      />
    </div>
  );

  const bar = (
    <button
      type="button"
      aria-label="Avanzar canción"
      onClick={(e) => {
        const el = audioRef.current;
        if (!el || !dur) return;
        const r = e.currentTarget.getBoundingClientRect();
        el.currentTime = ((e.clientX - r.left) / r.width) * dur;
      }}
      className="block h-1 w-full overflow-hidden rounded-full bg-white/15"
    >
      <span
        className="block h-full rounded-full transition-[width] duration-300"
        style={{ width: `${progress}%`, background: accent }}
      />
    </button>
  );

  if (embed) {
    return (
      <div className={posClass}>
        <div className={`overflow-hidden rounded-2xl border ${shell}`}>
          <iframe
            title={`Reproductor ${embed.provider}`}
            src={embed.src}
            height={embed.height}
            loading="lazy"
            allow="autoplay; encrypted-media; clipboard-write; picture-in-picture; fullscreen"
            className="w-full border-0"
            style={{ height: embed.height }}
          />
        </div>
      </div>
    );
  }

  let body: React.ReactNode = null;

  if (type === "minimal") {
    body = (
      <div className={`flex items-center gap-3 rounded-full border px-2.5 py-1.5 ${shell}`}>
        {playBtn("size-7")}
        {bar}
        {volCtl}
      </div>
    );
  } else if (type === "text") {
    body = (
      <div className={`flex items-center gap-3 overflow-hidden rounded-full border px-2.5 py-1.5 ${shell}`}>
        {playBtn("size-7")}
        <div className="min-w-0 flex-1 overflow-hidden">
          <p
            className="qsy-marquee-text whitespace-nowrap text-xs font-medium"
            style={{ color: accent }}
          >
            ♫ {title} — {artist} &nbsp;&nbsp; ♫ {title} — {artist}
          </p>
        </div>
        {volCtl}
      </div>
    );
  } else if (type === "vinyl") {
    body = (
      <div className={`flex items-center gap-3 rounded-2xl border p-2.5 ${shell}`}>
        <div
          className={`relative size-11 shrink-0 overflow-hidden rounded-full ${
            playing ? "animate-[spin_4s_linear_infinite]" : ""
          }`}
          style={{
            background: music?.cover
              ? `url(${music.cover}) center/cover`
              : "conic-gradient(from 0deg,#000,#333,#000,#444,#000)",
          }}
        >
          <span
            className="absolute left-1/2 top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: accent }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{artist}</p>
          <div className="mt-2">
            {bar}
          </div>
        </div>
        {playBtn()}
        {volCtl}
      </div>
    );
  } else if (type === "wave") {
    body = (
      <div className={`flex items-center gap-3 rounded-2xl border p-2.5 ${shell}`}>
        {playBtn()}
        <div className="flex min-w-0 flex-1 items-end gap-[3px]">
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className="qsy-eq w-full rounded-full"
              style={{
                background: accent,
                height: `${8 + ((i * 7) % 20)}px`,
                animationDelay: `${(i % 8) * 0.09}s`,
                animationPlayState: playing ? "running" : "paused",
                opacity: 0.85,
              }}
            />
          ))}
        </div>
        {volCtl}
      </div>
    );
  } else if (type === "cassette") {
    body = (
      <div className={`rounded-2xl border p-2.5 ${shell}`}>
        <div className="flex items-center justify-between gap-3 rounded-xl bg-black/40 p-3">
          {[0, 1].map((i) => (
            <span
              key={i}
              className={`grid size-8 place-items-center rounded-full border-2 border-white/20 ${
                playing ? "animate-[spin_2.4s_linear_infinite]" : ""
              }`}
            >
              <span className="size-2.5 rounded-full" style={{ background: accent }} />
            </span>
          ))}
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate font-mono text-xs">{title}</p>
            <p className="truncate font-mono text-[10px] text-muted-foreground">{artist}</p>
          </div>
          {playBtn("size-7")}
        </div>
        <div className="mt-2 flex items-center gap-2">
          {bar}
          {volCtl}
        </div>
      </div>
    );
  } else if (type === "structured") {
    body = (
      <div
        className={`rounded-2xl border p-2.5 ${shell}`}
        style={
          theme.player_type === "structured"
            ? { boxShadow: `0 18px 50px -30px ${accent}` }
            : undefined
        }
      >
        <div className="flex items-center gap-3">
          <div
            className="size-10 shrink-0 rounded-lg"
            style={{
              background: music?.cover
                ? `url(${music.cover}) center/cover`
                : `linear-gradient(140deg, ${accent}, transparent)`,
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{title}</p>
            <p className="truncate text-xs text-muted-foreground">{artist}</p>
          </div>
          {playBtn()}
          {volCtl}
        </div>
        <div className="mt-3">
          {bar}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>{fmt(time)}</span>
          <span>{fmt(dur)}</span>
        </div>
      </div>
    );
  } else if (type === "dock") {
    body = (
      <div className={`flex items-center gap-3 rounded-full border px-3 py-2 ${shell}`}>
        {playBtn("size-7")}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">{title}</p>
          <div className="mt-1.5">
            {bar}
          </div>
        </div>
        <span className="shrink-0 text-[10px] text-muted-foreground">{fmt(time)}</span>
        {volCtl}
      </div>
    );
  } else {
    body = (
      <div className={`flex items-center gap-3 rounded-2xl border p-2.5 ${shell}`}>
        <div
          className="size-9 shrink-0 rounded-lg"
          style={{
            background: music?.cover
              ? `url(${music.cover}) center/cover`
              : `linear-gradient(140deg, ${accent}, transparent)`,
          }}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{artist}</p>
          <div className="mt-2">
            {bar}
          </div>
        </div>
        {playBtn()}
        {volCtl}
      </div>
    );
  }

  return (
    <div className={posClass}>
      {theme.audio_url && (
        <audio
          ref={audioRef}
          src={theme.audio_url}
          loop
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          <track kind="captions" />
        </audio>
      )}
      {body}
    </div>
  );
}
