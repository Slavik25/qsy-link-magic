export type EmbedInfo = {
  provider: "youtube" | "spotify" | "soundcloud" | "apple";
  src: string;
  height: number;
};

/** Detecta enlaces de plataformas y devuelve la URL de embed reproducible. */
export function detectEmbed(raw?: string | null): EmbedInfo | null {
  const url = (raw ?? "").trim();
  if (!url) return null;

  const yt =
    url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/i);
  if (yt?.[1]) {
    return {
      provider: "youtube",
      src: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&loop=1&playlist=${yt[1]}&rel=0&enablejsapi=1&playsinline=1`,
      height: 180,
    };
  }

  const sp = url.match(/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(track|album|playlist|artist|episode|show)\/([\w]+)/i);
  if (sp?.[1] && sp[2]) {
    return {
      provider: "spotify",
      src: `https://open.spotify.com/embed/${sp[1].toLowerCase()}/${sp[2]}?utm_source=generator&theme=0`,
      height: sp[1].toLowerCase() === "track" ? 152 : 232,
    };
  }

  if (/soundcloud\.com\//i.test(url)) {
    return {
      provider: "soundcloud",
      src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%238b5cf6&auto_play=false&hide_related=true&show_comments=false&show_teaser=false&visual=false`,
      height: 140,
    };
  }

  const am = url.match(/music\.apple\.com\/(.+)$/i);
  if (am?.[1]) {
    return { provider: "apple", src: `https://embed.music.apple.com/${am[1]}`, height: 175 };
  }

  return null;
}

/** Nombre "bonito" a partir de un archivo o URL directa de audio. */
export function prettyTrackName(nameOrUrl: string) {
  const base = decodeURIComponent(nameOrUrl.split("/").pop() ?? nameOrUrl)
    .split("?")[0]!
    .replace(/\.[a-z0-9]{2,5}$/i, "")
    .replace(/[_+]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  return base || "Audio";
}

/** Separa "Artista - Título" si el nombre lo incluye. */
export function splitTrackName(name: string): { title: string; artist?: string } {
  const parts = name.split(/\s+[-–—]\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return { artist: parts[0].trim(), title: parts.slice(1).join(" - ").trim() };
  }
  return { title: name };
}
