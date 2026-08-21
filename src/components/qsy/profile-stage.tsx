import { useState } from "react";
import type { ThemeConfig } from "@/lib/qsy";
import { ProfilePlayer, isFloatingPlayer } from "@/components/qsy/profile-player";

type Props = {
  theme: ThemeConfig;
  music?: { title?: string; artist?: string; cover?: string } | null;
  children: React.ReactNode;
};

/**
 * Renders the user-controlled stage around a public profile:
 * custom background (image or video), dark overlay, optional
 * "click to enter" splash and background audio with a mute toggle.
 */
export function ProfileStage({ theme, music, children }: Props) {
  const gate = !!theme.entry_enabled;
  const [entered, setEntered] = useState(!gate);

  const overlay = (theme.overlay ?? 70) / 100;
  const isVideo =
    theme.background_type === "video" ||
    /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(theme.background ?? "");


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

      <div
        className={`relative transition-all duration-700 ${
          entered ? "opacity-100 blur-0" : "pointer-events-none scale-[1.03] opacity-0 blur-md"
        }`}
      >
        {children}
      </div>

      {entered && theme.audio_url && isFloatingPlayer(theme) && (
        <ProfilePlayer theme={theme} music={music} floating />
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
