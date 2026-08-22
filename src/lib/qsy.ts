import {
  Github,
  Globe,
  Instagram,
  Link as LinkIcon,
  MessageCircle,
  Music2,
  Gamepad2,
  Send,
  Twitch,
  Youtube,
  AtSign,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type ThemeConfig = {
  template: string;
  accent: string;
  blur: number;
  opacity: number;
  radius: number;
  glow: number;
  font: string;
  effects: string;
  background: string;
  background_type?: string;
  audio_url?: string;
  audio_title?: string;
  audio_artist?: string;
  audio_volume?: number;
  entry_enabled?: boolean;
  entry_text?: string;
  overlay?: number;
  username_effect?: string;
  /* Assets */
  cursor_url?: string;
  /* Customization */
  country?: string;
  avatar_shape?: "circle" | "rounded" | "square" | "hexagon";
  avatar_decoration?: string;
  profile_width?: "compact" | "normal" | "wide";
  card_bg_type?: "solid" | "gradient" | "image" | "video" | "transparent";
  card_alpha?: number;
  show_card?: boolean;
  color_text?: string;
  color_icon?: string;
  color_border?: string;
  /* Effects & media */
  player_type?: string;
  layout_key?: string;
  player_key?: string;
  player_position?: string;
  player_bg?: "solid" | "glass" | "transparent";
  border_decoration?: "none" | "scifi" | "cyberpunk";
  vfx_cursor_trail?: boolean;
  vfx_glow_name?: boolean;
  vfx_glow_links?: boolean;
  vfx_glow_badges?: boolean;
  vfx_sparkles?: boolean;
  vfx_mono_icons?: boolean;
  vfx_animated_title?: boolean;
  vfx_invert_card?: boolean;
  vfx_volume_control?: boolean;
  /* Connections */
  discord_id?: string;
  discord_avatar?: boolean;
  discord_decoration?: boolean;
  spotify_user?: string;
  video_overlay?: string;
  /* Modules */
  show_views?: boolean;
  show_likes?: boolean;
  typewriter?: string[];
  /* Advanced */
  profile_mode?: "public" | "unlisted" | "private";
  show_bio?: boolean;
  show_socials?: boolean;
  bg_effect?: string;
  meta_title?: string;
  meta_description?: string;
  meta_image?: string;
  meta_favicon?: string;
  custom_css?: string;
};


export const defaultTheme: ThemeConfig = {
  template: "glass",
  accent: "#c6f24e",
  blur: 18,
  opacity: 60,
  radius: 16,
  glow: 40,
  font: "inter",
  effects: "none",
  background: "",
  background_type: "image",
  audio_url: "",
  audio_title: "",
  audio_artist: "",
  audio_volume: 40,
  entry_enabled: false,
  entry_text: "click to enter...",
  overlay: 70,
  username_effect: "none",
  avatar_shape: "circle",
  avatar_decoration: "none",
  profile_width: "normal",
  card_bg_type: "solid",
  show_card: true,
  color_text: "#ffffff",
  color_icon: "#ffffff",
  color_border: "#ffffff",
  player_type: "default",
  layout_key: "layout-glass",
  player_key: "player-default",
  player_position: "bottom-center",
  player_bg: "glass",
  border_decoration: "none",
  vfx_cursor_trail: false,
  vfx_glow_name: true,
  vfx_glow_links: true,
  vfx_glow_badges: false,
  vfx_sparkles: false,
  vfx_mono_icons: false,
  vfx_animated_title: false,
  vfx_invert_card: false,
  vfx_volume_control: true,
  show_views: true,
  show_likes: true,
  typewriter: [],
  profile_mode: "public",
  show_bio: true,
  show_socials: true,
  bg_effect: "none",
  custom_css: "",

};

export type Profile = {
  id: string;
  user_id: string | null;
  username: string;
  display_name: string;
  bio: string;
  location: string;
  avatar_url: string | null;
  banner_url: string | null;
  verified: boolean;
  featured: boolean;
  theme: ThemeConfig;
  music: Record<string, unknown>;
  view_count: number;
  like_count?: number;
  rank?: string | null;
  domain?: string | null;
  created_at: string;
};


export type ProfileLink = {
  id: string;
  profile_id: string;
  title: string;
  url: string;
  icon: string;
  position: number;
  active: boolean;
};

export type Social = {
  id: string;
  profile_id: string;
  platform: string;
  url: string;
  position: number;
};

export const SOCIAL_PLATFORMS = [
  "discord",
  "instagram",
  "tiktok",
  "youtube",
  "twitch",
  "x",
  "github",
  "steam",
  "telegram",
  "spotify",
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

const ICONS: Record<string, LucideIcon> = {
  discord: MessageCircle,
  instagram: Instagram,
  tiktok: Music2,
  youtube: Youtube,
  twitch: Twitch,
  x: AtSign,
  github: Github,
  steam: Gamepad2,
  telegram: Send,
  spotify: Music2,
  globe: Globe,
  link: LinkIcon,
  sparkles: Sparkles,
};

export function iconFor(key: string): LucideIcon {
  return ICONS[key.toLowerCase()] ?? LinkIcon;
}

export function labelFor(platform: string) {
  return platform === "x" ? "X" : platform.charAt(0).toUpperCase() + platform.slice(1);
}

export function readTheme(value: unknown): ThemeConfig {
  if (!value || typeof value !== "object") return defaultTheme;
  return { ...defaultTheme, ...(value as Partial<ThemeConfig>) };
}

export function detectDevice() {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  return /Mobi|Android|iPhone/i.test(ua) ? "mobile" : "desktop";
}

export function detectBrowser() {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome/")) return "Chrome";
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Safari/")) return "Safari";
  return "Other";
}

export const TEMPLATES = [
  { id: "minimal", name: "Minimal", accent: "#e8e8e8", desc: "Silencio visual. Solo lo esencial." },
  { id: "dark", name: "Dark", accent: "#c6f24e", desc: "Negro profundo con acentos ácidos." },
  { id: "glass", name: "Glass", accent: "#9ae6ff", desc: "Capas translúcidas y desenfoque suave." },
  { id: "neon", name: "Neon", accent: "#7c5cff", desc: "Glow eléctrico y bordes vibrantes." },
  { id: "gaming", name: "Gaming", accent: "#ff4d6d", desc: "Alto contraste, energía competitiva." },
  { id: "creator", name: "Creator", accent: "#ffb347", desc: "Pensado para contenido y comunidad." },
  { id: "developer", name: "Developer", accent: "#22d3ee", desc: "Monoespaciado, técnico, directo." },
];
