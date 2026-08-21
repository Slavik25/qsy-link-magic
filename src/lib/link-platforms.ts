import type { IconType } from "react-icons";
import {
  SiApplemusic,
  SiBehance,
  SiBitcoin,
  SiBluesky,
  SiBuymeacoffee,
  SiCashapp,
  SiDeviantart,
  SiDiscord,
  SiDribbble,
  SiEthereum,
  SiFacebook,
  SiFigma,
  SiGithub,
  SiGitlab,
  SiGumroad,
  SiInstagram,
  SiItchdotio,
  SiKakaotalk,
  SiKick,
  SiKofi,
  SiLastdotfm,
  SiLetterboxd,
  SiLine,
  SiLinktree,
  SiLitecoin,
  SiMastodon,
  SiMedium,
  SiMonero,
  SiMyanimelist,
  SiNotion,
  SiOnlyfans,
  SiOpensea,
  SiPatreon,
  SiPaypal,
  SiPinterest,
  SiPlaystation,
  SiReddit,
  SiRoblox,
  SiSignal,
  SiSlack,
  SiSnapchat,
  SiSolana,
  SiSoundcloud,
  SiSpotify,
  SiSteam,
  SiSubstack,
  SiTelegram,
  SiThreads,
  SiTiktok,
  SiTumblr,
  SiTwitch,
  SiUnsplash,
  SiVimeo,
  SiVk,
  SiWechat,
  SiWhatsapp,
  SiX,
  SiYoutube,
  SiZoom,
} from "react-icons/si";
import { FaLinkedinIn, FaXbox, FaGlobe, FaEnvelope } from "react-icons/fa6";

export type LinkCategory =
  | "social"
  | "video"
  | "music"
  | "messaging"
  | "finance"
  | "gaming"
  | "monetization"
  | "professional"
  | "other";

export const LINK_CATEGORIES: { id: LinkCategory | "all"; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "social", label: "Redes Sociales" },
  { id: "video", label: "Streaming y Vídeo" },
  { id: "music", label: "Música y Audio" },
  { id: "messaging", label: "Mensajería" },
  { id: "finance", label: "Finanzas y Crypto" },
  { id: "gaming", label: "Gaming" },
  { id: "monetization", label: "Monetización" },
  { id: "professional", label: "Profesional" },
  { id: "other", label: "Otras" },
];

export type LinkPlatform = {
  id: string;
  name: string;
  color: string;
  Icon: IconType;
  category: LinkCategory;
  /** Prefix prepended to the value the user types (empty = full URL). */
  base?: string;
  placeholder: string;
  /** input mode for the value field */
  kind?: "url" | "handle" | "email" | "text";
};

/** Catalog of link types a user can add to their QSY profile. */
export const LINK_PLATFORMS: LinkPlatform[] = [
  // Redes sociales
  { id: "discord", name: "Discord", color: "#5865f2", Icon: SiDiscord, category: "social", base: "https://discord.gg/", placeholder: "invitación", kind: "handle" },
  { id: "x", name: "X (Twitter)", color: "#e7e7e7", Icon: SiX, category: "social", base: "https://x.com/", placeholder: "usuario", kind: "handle" },
  { id: "instagram", name: "Instagram", color: "#e1306c", Icon: SiInstagram, category: "social", base: "https://instagram.com/", placeholder: "usuario", kind: "handle" },
  { id: "facebook", name: "Facebook", color: "#1877f2", Icon: SiFacebook, category: "social", base: "https://facebook.com/", placeholder: "usuario", kind: "handle" },
  { id: "snapchat", name: "Snapchat", color: "#fffc00", Icon: SiSnapchat, category: "social", base: "https://snapchat.com/add/", placeholder: "usuario", kind: "handle" },
  { id: "tiktok", name: "TikTok", color: "#25f4ee", Icon: SiTiktok, category: "social", base: "https://tiktok.com/@", placeholder: "usuario", kind: "handle" },
  { id: "reddit", name: "Reddit", color: "#ff4500", Icon: SiReddit, category: "social", base: "https://reddit.com/user/", placeholder: "usuario", kind: "handle" },
  { id: "bluesky", name: "Bluesky", color: "#0085ff", Icon: SiBluesky, category: "social", base: "https://bsky.app/profile/", placeholder: "usuario.bsky.social", kind: "handle" },
  { id: "tumblr", name: "Tumblr", color: "#cfcfcf", Icon: SiTumblr, category: "social", base: "https://", placeholder: "usuario.tumblr.com", kind: "handle" },
  { id: "vk", name: "VKontakte", color: "#0077ff", Icon: SiVk, category: "social", base: "https://vk.com/", placeholder: "usuario", kind: "handle" },
  { id: "threads", name: "Threads", color: "#cfcfcf", Icon: SiThreads, category: "social", base: "https://threads.net/@", placeholder: "usuario", kind: "handle" },
  { id: "mastodon", name: "Mastodon", color: "#6364ff", Icon: SiMastodon, category: "social", placeholder: "https://mastodon.social/@tu", kind: "url" },
  { id: "pinterest", name: "Pinterest", color: "#e60023", Icon: SiPinterest, category: "social", base: "https://pinterest.com/", placeholder: "usuario", kind: "handle" },

  // Streaming y vídeo
  { id: "youtube", name: "YouTube", color: "#ff0033", Icon: SiYoutube, category: "video", base: "https://youtube.com/@", placeholder: "canal", kind: "handle" },
  { id: "twitch", name: "Twitch", color: "#9146ff", Icon: SiTwitch, category: "video", base: "https://twitch.tv/", placeholder: "usuario", kind: "handle" },
  { id: "kick", name: "Kick", color: "#53fc18", Icon: SiKick, category: "video", base: "https://kick.com/", placeholder: "usuario", kind: "handle" },
  { id: "vimeo", name: "Vimeo", color: "#1ab7ea", Icon: SiVimeo, category: "video", base: "https://vimeo.com/", placeholder: "usuario", kind: "handle" },
  { id: "letterboxd", name: "Letterboxd", color: "#00e054", Icon: SiLetterboxd, category: "video", base: "https://letterboxd.com/", placeholder: "usuario", kind: "handle" },

  // Música y audio
  { id: "spotify", name: "Spotify", color: "#1db954", Icon: SiSpotify, category: "music", placeholder: "https://open.spotify.com/…" },
  { id: "soundcloud", name: "SoundCloud", color: "#ff5500", Icon: SiSoundcloud, category: "music", base: "https://soundcloud.com/", placeholder: "usuario", kind: "handle" },
  { id: "applemusic", name: "Apple Music", color: "#fa233b", Icon: SiApplemusic, category: "music", placeholder: "https://music.apple.com/…" },
  { id: "lastfm", name: "Last.fm", color: "#d51007", Icon: SiLastdotfm, category: "music", base: "https://last.fm/user/", placeholder: "usuario", kind: "handle" },
  { id: "statsfm", name: "stats.fm", color: "#1ed760", Icon: SiSpotify, category: "music", base: "https://stats.fm/", placeholder: "usuario", kind: "handle" },

  // Mensajería
  { id: "telegram", name: "Telegram", color: "#2aabee", Icon: SiTelegram, category: "messaging", base: "https://t.me/", placeholder: "usuario", kind: "handle" },
  { id: "whatsapp", name: "WhatsApp", color: "#25d366", Icon: SiWhatsapp, category: "messaging", base: "https://wa.me/", placeholder: "34600000000", kind: "handle" },
  { id: "signal", name: "Signal", color: "#3a76f0", Icon: SiSignal, category: "messaging", placeholder: "https://signal.me/…" },
  { id: "wechat", name: "WeChat", color: "#07c160", Icon: SiWechat, category: "messaging", placeholder: "WeChat ID", kind: "text" },
  { id: "line", name: "LINE", color: "#06c755", Icon: SiLine, category: "messaging", placeholder: "https://line.me/…" },
  { id: "kakaotalk", name: "KakaoTalk", color: "#ffe812", Icon: SiKakaotalk, category: "messaging", placeholder: "https://open.kakao.com/…" },
  { id: "email", name: "Email", color: "#c6f24e", Icon: FaEnvelope, category: "messaging", base: "mailto:", placeholder: "tu@email.com", kind: "email" },

  // Finanzas y crypto
  { id: "paypal", name: "PayPal", color: "#00457c", Icon: SiPaypal, category: "finance", base: "https://paypal.me/", placeholder: "usuario", kind: "handle" },
  { id: "cashapp", name: "Cash App", color: "#00d54b", Icon: SiCashapp, category: "finance", base: "https://cash.app/$", placeholder: "cashtag", kind: "handle" },
  { id: "bitcoin", name: "Bitcoin", color: "#f7931a", Icon: SiBitcoin, category: "finance", placeholder: "dirección BTC", kind: "text" },
  { id: "ethereum", name: "Ethereum", color: "#8a92b2", Icon: SiEthereum, category: "finance", placeholder: "dirección ETH", kind: "text" },
  { id: "litecoin", name: "Litecoin", color: "#a5a8a9", Icon: SiLitecoin, category: "finance", placeholder: "dirección LTC", kind: "text" },
  { id: "solana", name: "Solana", color: "#14f195", Icon: SiSolana, category: "finance", placeholder: "dirección SOL", kind: "text" },
  { id: "monero", name: "Monero", color: "#ff6600", Icon: SiMonero, category: "finance", placeholder: "dirección XMR", kind: "text" },
  { id: "opensea", name: "OpenSea", color: "#2081e2", Icon: SiOpensea, category: "finance", base: "https://opensea.io/", placeholder: "usuario", kind: "handle" },

  // Gaming
  { id: "steam", name: "Steam", color: "#66c0f4", Icon: SiSteam, category: "gaming", base: "https://steamcommunity.com/id/", placeholder: "usuario", kind: "handle" },
  { id: "roblox", name: "Roblox", color: "#e2231a", Icon: SiRoblox, category: "gaming", base: "https://roblox.com/users/", placeholder: "id/profile", kind: "handle" },
  { id: "playstation", name: "PlayStation", color: "#2e6ff2", Icon: SiPlaystation, category: "gaming", placeholder: "PSN ID", kind: "text" },
  { id: "xbox", name: "Xbox", color: "#107c10", Icon: FaXbox, category: "gaming", placeholder: "Gamertag", kind: "text" },
  { id: "itchio", name: "itch.io", color: "#fa5c5c", Icon: SiItchdotio, category: "gaming", base: "https://", placeholder: "usuario.itch.io", kind: "handle" },
  { id: "myanimelist", name: "MyAnimeList", color: "#2e51a2", Icon: SiMyanimelist, category: "gaming", base: "https://myanimelist.net/profile/", placeholder: "usuario", kind: "handle" },

  // Monetización
  { id: "onlyfans", name: "OnlyFans", color: "#00aff0", Icon: SiOnlyfans, category: "monetization", base: "https://onlyfans.com/", placeholder: "usuario", kind: "handle" },
  { id: "patreon", name: "Patreon", color: "#ff424d", Icon: SiPatreon, category: "monetization", base: "https://patreon.com/", placeholder: "usuario", kind: "handle" },
  { id: "kofi", name: "Ko-fi", color: "#ff5e5b", Icon: SiKofi, category: "monetization", base: "https://ko-fi.com/", placeholder: "usuario", kind: "handle" },
  { id: "buymeacoffee", name: "Buy Me a Coffee", color: "#ffdd00", Icon: SiBuymeacoffee, category: "monetization", base: "https://buymeacoffee.com/", placeholder: "usuario", kind: "handle" },
  { id: "gumroad", name: "Gumroad", color: "#ff90e8", Icon: SiGumroad, category: "monetization", base: "https://", placeholder: "usuario.gumroad.com", kind: "handle" },
  { id: "substack", name: "Substack", color: "#ff6719", Icon: SiSubstack, category: "monetization", base: "https://", placeholder: "tu.substack.com", kind: "handle" },

  // Profesional
  { id: "linkedin", name: "LinkedIn", color: "#0a66c2", Icon: FaLinkedinIn, category: "professional", base: "https://linkedin.com/in/", placeholder: "usuario", kind: "handle" },
  { id: "github", name: "GitHub", color: "#d6d6d6", Icon: SiGithub, category: "professional", base: "https://github.com/", placeholder: "usuario", kind: "handle" },
  { id: "gitlab", name: "GitLab", color: "#fc6d26", Icon: SiGitlab, category: "professional", base: "https://gitlab.com/", placeholder: "usuario", kind: "handle" },
  { id: "behance", name: "Behance", color: "#1769ff", Icon: SiBehance, category: "professional", base: "https://behance.net/", placeholder: "usuario", kind: "handle" },
  { id: "dribbble", name: "Dribbble", color: "#ea4c89", Icon: SiDribbble, category: "professional", base: "https://dribbble.com/", placeholder: "usuario", kind: "handle" },
  { id: "figma", name: "Figma", color: "#f24e1e", Icon: SiFigma, category: "professional", base: "https://figma.com/@", placeholder: "usuario", kind: "handle" },
  { id: "medium", name: "Medium", color: "#e7e7e7", Icon: SiMedium, category: "professional", base: "https://medium.com/@", placeholder: "usuario", kind: "handle" },
  { id: "notion", name: "Notion", color: "#e7e7e7", Icon: SiNotion, category: "professional", placeholder: "https://notion.site/…" },
  { id: "slack", name: "Slack", color: "#e01e5a", Icon: SiSlack, category: "professional", placeholder: "https://slack.com/…" },
  { id: "zoom", name: "Zoom", color: "#2d8cff", Icon: SiZoom, category: "professional", placeholder: "https://zoom.us/j/…" },

  // Otras
  { id: "deviantart", name: "DeviantArt", color: "#05cc47", Icon: SiDeviantart, category: "other", base: "https://deviantart.com/", placeholder: "usuario", kind: "handle" },
  { id: "unsplash", name: "Unsplash", color: "#e7e7e7", Icon: SiUnsplash, category: "other", base: "https://unsplash.com/@", placeholder: "usuario", kind: "handle" },
  { id: "linktree", name: "Linktree", color: "#43e660", Icon: SiLinktree, category: "other", base: "https://linktr.ee/", placeholder: "usuario", kind: "handle" },
  { id: "link", name: "Custom URL", color: "#a78bfa", Icon: FaGlobe, category: "other", placeholder: "https://tusitio.com" },
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
