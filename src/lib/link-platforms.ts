export type LinkPlatform = {
  id: string;
  name: string;
  color: string;
  /** Prefix prepended to the value the user types (empty = full URL). */
  base?: string;
  placeholder: string;
  /** input mode for the value field */
  kind?: "url" | "handle" | "email" | "text";
};

/** Catalog of link types a user can add to their QSY profile. */
export const LINK_PLATFORMS: LinkPlatform[] = [
  { id: "instagram", name: "Instagram", color: "#e1306c", base: "https://instagram.com/", placeholder: "usuario", kind: "handle" },
  { id: "tiktok", name: "TikTok", color: "#25f4ee", base: "https://tiktok.com/@", placeholder: "usuario", kind: "handle" },
  { id: "youtube", name: "YouTube", color: "#ff0033", base: "https://youtube.com/@", placeholder: "canal", kind: "handle" },
  { id: "x", name: "X", color: "#e7e7e7", base: "https://x.com/", placeholder: "usuario", kind: "handle" },
  { id: "discord", name: "Discord", color: "#5865f2", base: "https://discord.gg/", placeholder: "invitación", kind: "handle" },
  { id: "twitch", name: "Twitch", color: "#9146ff", base: "https://twitch.tv/", placeholder: "usuario", kind: "handle" },
  { id: "spotify", name: "Spotify", color: "#1db954", placeholder: "https://open.spotify.com/…" },
  { id: "soundcloud", name: "SoundCloud", color: "#ff5500", base: "https://soundcloud.com/", placeholder: "usuario", kind: "handle" },
  { id: "applemusic", name: "Apple Music", color: "#fa233b", placeholder: "https://music.apple.com/…" },
  { id: "lastfm", name: "Last.fm", color: "#d51007", base: "https://last.fm/user/", placeholder: "usuario", kind: "handle" },
  { id: "telegram", name: "Telegram", color: "#2aabee", base: "https://t.me/", placeholder: "usuario", kind: "handle" },
  { id: "snapchat", name: "Snapchat", color: "#fffc00", base: "https://snapchat.com/add/", placeholder: "usuario", kind: "handle" },
  { id: "threads", name: "Threads", color: "#cfcfcf", base: "https://threads.net/@", placeholder: "usuario", kind: "handle" },
  { id: "facebook", name: "Facebook", color: "#1877f2", base: "https://facebook.com/", placeholder: "usuario", kind: "handle" },
  { id: "reddit", name: "Reddit", color: "#ff4500", base: "https://reddit.com/user/", placeholder: "usuario", kind: "handle" },
  { id: "pinterest", name: "Pinterest", color: "#e60023", base: "https://pinterest.com/", placeholder: "usuario", kind: "handle" },
  { id: "linkedin", name: "LinkedIn", color: "#0a66c2", base: "https://linkedin.com/in/", placeholder: "usuario", kind: "handle" },
  { id: "bluesky", name: "Bluesky", color: "#0085ff", base: "https://bsky.app/profile/", placeholder: "usuario.bsky.social", kind: "handle" },
  { id: "vk", name: "VK", color: "#0077ff", base: "https://vk.com/", placeholder: "usuario", kind: "handle" },
  { id: "github", name: "GitHub", color: "#d6d6d6", base: "https://github.com/", placeholder: "usuario", kind: "handle" },
  { id: "gitlab", name: "GitLab", color: "#fc6d26", base: "https://gitlab.com/", placeholder: "usuario", kind: "handle" },
  { id: "steam", name: "Steam", color: "#66c0f4", base: "https://steamcommunity.com/id/", placeholder: "usuario", kind: "handle" },
  { id: "roblox", name: "Roblox", color: "#e2231a", base: "https://roblox.com/users/", placeholder: "id/profile", kind: "handle" },
  { id: "kick", name: "Kick", color: "#53fc18", base: "https://kick.com/", placeholder: "usuario", kind: "handle" },
  { id: "playstation", name: "PlayStation", color: "#2e6ff2", placeholder: "PSN ID", kind: "text" },
  { id: "xbox", name: "Xbox", color: "#107c10", placeholder: "Gamertag", kind: "text" },
  { id: "namemc", name: "NameMC", color: "#8bc34a", base: "https://namemc.com/profile/", placeholder: "usuario", kind: "handle" },
  { id: "statsfm", name: "stats.fm", color: "#1ed760", base: "https://stats.fm/", placeholder: "usuario", kind: "handle" },
  { id: "tellonym", name: "Tellonym", color: "#ff2c55", base: "https://tellonym.me/", placeholder: "usuario", kind: "handle" },
  { id: "onlyfans", name: "OnlyFans", color: "#00aff0", base: "https://onlyfans.com/", placeholder: "usuario", kind: "handle" },
  { id: "patreon", name: "Patreon", color: "#ff424d", base: "https://patreon.com/", placeholder: "usuario", kind: "handle" },
  { id: "kofi", name: "Ko-fi", color: "#ff5e5b", base: "https://ko-fi.com/", placeholder: "usuario", kind: "handle" },
  { id: "buymeacoffee", name: "Buy Me a Coffee", color: "#ffdd00", base: "https://buymeacoffee.com/", placeholder: "usuario", kind: "handle" },
  { id: "payhip", name: "Payhip", color: "#4ac26b", base: "https://payhip.com/", placeholder: "tienda", kind: "handle" },
  { id: "paypal", name: "PayPal", color: "#00457c", base: "https://paypal.me/", placeholder: "usuario", kind: "handle" },
  { id: "cashapp", name: "Cash App", color: "#00d54b", base: "https://cash.app/$", placeholder: "cashtag", kind: "handle" },
  { id: "venmo", name: "Venmo", color: "#3d95ce", base: "https://venmo.com/", placeholder: "usuario", kind: "handle" },
  { id: "bitcoin", name: "Bitcoin", color: "#f7931a", placeholder: "dirección BTC", kind: "text" },
  { id: "ethereum", name: "Ethereum", color: "#8a92b2", placeholder: "dirección ETH", kind: "text" },
  { id: "litecoin", name: "Litecoin", color: "#a5a8a9", placeholder: "dirección LTC", kind: "text" },
  { id: "solana", name: "Solana", color: "#14f195", placeholder: "dirección SOL", kind: "text" },
  { id: "monero", name: "Monero", color: "#ff6600", placeholder: "dirección XMR", kind: "text" },
  { id: "signal", name: "Signal", color: "#3a76f0", placeholder: "https://signal.me/…" },
  { id: "email", name: "Email", color: "#c6f24e", base: "mailto:", placeholder: "tu@email.com", kind: "email" },
  { id: "link", name: "Custom URL", color: "#a78bfa", placeholder: "https://tusitio.com" },
];

export function platformById(id: string): LinkPlatform {
  return LINK_PLATFORMS.find((p) => p.id === id) ?? LINK_PLATFORMS[LINK_PLATFORMS.length - 1]!;
}

/** Builds the stored href for a platform + user-typed value. */
export function buildUrl(platform: LinkPlatform, value: string) {
  const v = value.trim();
  if (!v) return "";
  if (platform.kind === "text") return v;
  if (!platform.base) return /^https?:\/\//i.test(v) ? v : `https://${v}`;
  if (/^https?:\/\//i.test(v) || v.startsWith("mailto:")) return v;
  return `${platform.base}${v.replace(/^@/, "")}`;
}
