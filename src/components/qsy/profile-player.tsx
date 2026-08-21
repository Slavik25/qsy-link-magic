import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import type { ThemeConfig } from "@/lib/qsy";

type Props = {
  theme: ThemeConfig;
  music?: { title?: string; artist?: string; cover?: string } | null;
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
  const [dur, setDur] = useState(0);

  const accent = theme.accent;
  const type = theme.player_type || "default";
  const title = music?.title || "QSY Radio";
  const artist = music?.artist || "@" + (theme.template ?? "qsy");

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = 0.4;
    void el
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
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

  const posClass = floating
    ? theme.player_position === "top-right"
      ? "fixed right-4 top-4 z-30 w-auto max-w-[min(20rem,80vw)]"
      : theme.player_position === "top-left"
        ? "fixed left-4 top-4 z-30 w-auto max-w-[min(20rem,80vw)]"
        : theme.player_position === "bottom-left"
          ? "fixed bottom-4 left-4 z-30 w-[min(22rem,90vw)]"
          : theme.player_position === "bottom-right"
            ? "fixed bottom-4 right-4 z-30 w-[min(22rem,90vw)]"
            : "fixed bottom-4 left-1/2 z-30 w-[min(26rem,92vw)] -translate-x-1/2"
    : "w-full max-w-md";

  const PlayBtn = ({ size = "size-9" }: { size?: string }) => (
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

  const MuteBtn = () => (
    <button
      type="button"
      onClick={() => {
        const el = audioRef.current;
        if (el) el.muted = !el.muted;
        setMuted((m) => !m);
      }}
      aria-label={muted ? "Activar sonido" : "Silenciar"}
      className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
    >
      {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
    </button>
  );

  const Bar = () => (
    <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${progress}%`, background: accent }}
      />
    </div>
  );

  let body: React.ReactNode = null;

  if (type === "minimal") {
    body = (
      <div className={`flex items-center gap-3 rounded-full border px-3 py-2 ${shell}`}>
        <PlayBtn size="size-7" />
        <Bar />
        <MuteBtn />
      </div>
    );
  } else if (type === "text") {
    body = (
      <div className={`flex items-center gap-3 overflow-hidden rounded-full border px-3 py-2 ${shell}`}>
        <PlayBtn size="size-7" />
        <div className="min-w-0 flex-1 overflow-hidden">
          <p
            className="qsy-marquee-text whitespace-nowrap text-xs font-medium"
            style={{ color: accent }}
          >
            ♫ {title} — {artist} &nbsp;&nbsp; ♫ {title} — {artist}
          </p>
        </div>
        <MuteBtn />
      </div>
    );
  } else if (type === "vinyl") {
    body = (
      <div className={`flex items-center gap-3 rounded-2xl border p-3 ${shell}`}>
        <div
          className={`relative size-14 shrink-0 overflow-hidden rounded-full ${
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
            <Bar />
          </div>
        </div>
        <PlayBtn />
        <MuteBtn />
      </div>
    );
  } else if (type === "wave") {
    body = (
      <div className={`flex items-center gap-3 rounded-2xl border p-3 ${shell}`}>
        <PlayBtn />
        <div className="flex min-w-0 flex-1 items-end gap-[3px]">
          {Array.from({ length: 22 }).map((_, i) => (
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
        <MuteBtn />
      </div>
    );
  } else if (type === "cassette") {
    body = (
      <div className={`rounded-2xl border p-3 ${shell}`}>
        <div className="flex items-center justify-between gap-3 rounded-xl bg-black/40 p-3">
          {[0, 1].map((i) => (
            <span
              key={i}
              className={`grid size-9 place-items-center rounded-full border-2 border-white/20 ${
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
          <PlayBtn size="size-8" />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Bar />
          <MuteBtn />
        </div>
      </div>
    );
  } else if (type === "structured") {
    body = (
      <div
        className={`rounded-2xl border p-3 ${shell}`}
        style={
          theme.player_type === "structured"
            ? { boxShadow: `0 18px 50px -30px ${accent}` }
            : undefined
        }
      >
        <div className="flex items-center gap-3">
          <div
            className="size-12 shrink-0 rounded-lg"
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
          <PlayBtn />
          <MuteBtn />
        </div>
        <div className="mt-3">
          <Bar />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>{fmt(time)}</span>
          <span>{fmt(dur)}</span>
        </div>
      </div>
    );
  } else if (type === "dock") {
    body = (
      <div className={`flex items-center gap-3 rounded-full border px-4 py-2.5 ${shell}`}>
        <PlayBtn size="size-8" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">{title}</p>
          <div className="mt-1.5">
            <Bar />
          </div>
        </div>
        <span className="shrink-0 text-[10px] text-muted-foreground">{fmt(time)}</span>
        <MuteBtn />
      </div>
    );
  } else {
    body = (
      <div className={`flex items-center gap-3 rounded-2xl border p-3 ${shell}`}>
        <div
          className="size-11 shrink-0 rounded-lg"
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
            <Bar />
          </div>
        </div>
        <PlayBtn />
        <MuteBtn />
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
