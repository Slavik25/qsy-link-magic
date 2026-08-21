import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import type { ThemeConfig } from "@/lib/qsy";

type Props = {
  theme: ThemeConfig;
  children: React.ReactNode;
};

/**
 * Renders the user-controlled stage around a public profile:
 * custom background (image or video), dark overlay, optional
 * "click to enter" splash and background audio with a mute toggle.
 */
export function ProfileStage({ theme, children }: Props) {
  const gate = !!theme.entry_enabled;
  const [entered, setEntered] = useState(!gate);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!entered || !theme.audio_url) return;
    const el = audioRef.current;
    if (!el) return;
    el.volume = 0.4;
    void el.play().catch(() => undefined);
  }, [entered, theme.audio_url]);

  const overlay = (theme.overlay ?? 70) / 100;
  const isVideo = theme.background_type === "video";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {theme.background && !isVideo && (
        <div
          aria-hidden
          className="fixed inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${theme.background})` }}
        />
      )}
      {theme.background && isVideo && (
        <video
          aria-hidden
          src={theme.background}
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 size-full object-cover"
        />
      )}
      {theme.background && (
        <div
          aria-hidden
          className="fixed inset-0"
          style={{ background: `rgb(8 8 8 / ${overlay})` }}
        />
      )}

      {theme.audio_url && (
        <audio ref={audioRef} src={theme.audio_url} loop muted={muted}>
          <track kind="captions" />
        </audio>
      )}

      <div
        className={`relative transition-all duration-700 ${
          entered ? "opacity-100 blur-0" : "pointer-events-none scale-[1.03] opacity-0 blur-md"
        }`}
      >
        {children}
      </div>

      {entered && theme.audio_url && (
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Activar sonido" : "Silenciar"}
          className="fixed left-4 top-4 z-30 grid size-10 place-items-center rounded-full glass text-foreground/80 transition-colors hover:text-foreground"
        >
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
      )}

      {!entered && (
        <button
          type="button"
          onClick={() => setEntered(true)}
          className="fixed inset-0 z-40 grid place-items-center bg-background/80 backdrop-blur-xl"
        >
          <span
            className="animate-pulse font-mono text-sm tracking-[0.2em] text-foreground/90 sm:text-base"
            style={{ textShadow: `0 0 24px ${theme.accent}` }}
          >
            {theme.entry_text || "click to enter..."}
          </span>
        </button>
      )}
    </div>
  );
}
