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
  entry_enabled?: boolean;
  entry_text?: string;
  overlay?: number;
  username_effect?: string;
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
  entry_enabled: false,
  entry_text: "click to enter...",
  overlay: 70,
  username_effect: "none",
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
