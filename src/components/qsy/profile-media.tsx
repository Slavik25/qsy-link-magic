import { detectEmbed } from "@/lib/media";
import type { MediaItem, ThemeConfig } from "@/lib/qsy";

type Props = { theme: ThemeConfig; items: MediaItem[] };

/** Bloque de medios: reproduce enlaces de YouTube, Spotify, SoundCloud y Apple Music. */
export function ProfileMedia({ theme, items }: Props) {
  const valid = items
    .map((it) => ({ ...it, embed: detectEmbed(it.url) }))
    .filter((it) => it.embed);

  if (valid.length === 0) return null;

  return (
    <div className="mt-6 w-full space-y-3">
      {valid.map((it, i) => (
        <div
          key={`${it.url}-${i}`}
          className="overflow-hidden border"
          style={{
            borderRadius: "var(--p-radius)",
            borderColor: `color-mix(in oklab, ${theme.accent} 25%, transparent)`,
            background: "color-mix(in oklab, #000 45%, transparent)",
            backdropFilter: "blur(var(--p-blur))",
          }}
        >
          {it.title ? (
            <p className="px-4 pt-3 text-xs font-medium opacity-80">{it.title}</p>
          ) : null}
          <iframe
            src={it.embed!.src}
            title={it.title || it.embed!.provider}
            height={it.embed!.provider === "youtube" ? 220 : it.embed!.height}
            className="w-full border-0"
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      ))}
    </div>
  );
}
