export type ShopItem = {
  key: string;
  name: string;
  description: string;
  price: number;
  premium?: boolean;
};

/** Reproductores de música (theme.player_type + theme.player_bg) */
export const SHOP_PLAYERS: (ShopItem & { player_type: string; player_bg: string })[] = [
  {
    key: "player-default",
    name: "Classic",
    description: "Reproductor estándar con carátula y controles.",
    price: 0,
    player_type: "default",
    player_bg: "glass",
  },
  {
    key: "player-minimal",
    name: "Minimal",
    description: "Solo play/pausa y barra fina. Ultra discreto.",
    price: 0,
    player_type: "minimal",
    player_bg: "transparent",
  },
  {
    key: "player-structured",
    name: "Structured",
    description: "Carátula grande, título, artista y progreso detallado.",
    price: 250,
    premium: true,
    player_type: "structured",
    player_bg: "solid",
  },
  {
    key: "player-text",
    name: "Marquee Text",
    description: "Título en marquesina animada, sin carátula.",
    price: 250,
    premium: true,
    player_type: "text",
    player_bg: "transparent",
  },
];

/** Layouts personalizados (theme.template + ajustes) */
export const SHOP_LAYOUTS: (ShopItem & {
  template: string;
  profile_width: "compact" | "normal" | "wide";
  avatar_shape: "circle" | "rounded" | "square" | "hexagon";
  preview: string;
})[] = [
  {
    key: "layout-glass",
    name: "Glass",
    description: "El clásico QSY: tarjeta de cristal centrada.",
    price: 0,
    template: "glass",
    profile_width: "normal",
    avatar_shape: "circle",
    preview: "linear-gradient(140deg,#2b1d4d,#0b0b12)",
  },
  {
    key: "layout-compact",
    name: "Pocket",
    description: "Tarjeta compacta, ideal para pocos enlaces.",
    price: 150,
    template: "glass",
    profile_width: "compact",
    avatar_shape: "rounded",
    preview: "linear-gradient(140deg,#123,#0b0b12)",
  },
  {
    key: "layout-wide",
    name: "Widescreen",
    description: "Tarjeta ancha en dos columnas para muchos enlaces.",
    price: 300,
    premium: true,
    template: "glass",
    profile_width: "wide",
    avatar_shape: "square",
    preview: "linear-gradient(140deg,#4d1d3a,#0b0b12)",
  },
  {
    key: "layout-hex",
    name: "Hexa Neon",
    description: "Avatar hexagonal y bordes neón sci-fi.",
    price: 400,
    premium: true,
    template: "neon",
    profile_width: "normal",
    avatar_shape: "hexagon",
    preview: "linear-gradient(140deg,#0f4d4d,#0b0b12)",
  },
];

/** Decoraciones de avatar estilo Discord (theme.avatar_decoration) */
export type DecorationDef = ShopItem & { ring: string; animation?: string };

export const SHOP_DECORATIONS: DecorationDef[] = [
  {
    key: "none",
    name: "Sin decoración",
    description: "Avatar limpio, sin marco.",
    price: 0,
    ring: "transparent",
  },
  {
    key: "aurora",
    name: "Aurora",
    description: "Marco degradado violeta que gira lentamente.",
    price: 200,
    ring: "conic-gradient(from 0deg,#a855f7,#22d3ee,#a855f7)",
    animation: "qsy-deco-spin 6s linear infinite",
  },
  {
    key: "inferno",
    name: "Inferno",
    description: "Llamas naranjas girando alrededor del avatar.",
    price: 250,
    ring: "conic-gradient(from 0deg,#f97316,#facc15,#ef4444,#f97316)",
    animation: "qsy-deco-spin 4s linear infinite",
  },
  {
    key: "matrix",
    name: "Matrix",
    description: "Anillo verde digital con pulso.",
    price: 250,
    ring: "conic-gradient(from 0deg,#22c55e,#052e16,#22c55e)",
    animation: "qsy-deco-spin 8s linear infinite",
  },
  {
    key: "sakura",
    name: "Sakura",
    description: "Marco rosa suave con brillo pastel.",
    price: 300,
    premium: true,
    ring: "conic-gradient(from 0deg,#f9a8d4,#fff1f2,#f472b6,#f9a8d4)",
    animation: "qsy-deco-spin 10s linear infinite",
  },
  {
    key: "gold",
    name: "Golden Crown",
    description: "Anillo dorado de edición limitada.",
    price: 500,
    premium: true,
    ring: "conic-gradient(from 0deg,#fbbf24,#fff7ed,#b45309,#fbbf24)",
    animation: "qsy-deco-spin 5s linear infinite",
  },
  {
    key: "cyber",
    name: "Cybercore",
    description: "Anillo cian con destellos futuristas.",
    price: 400,
    premium: true,
    ring: "conic-gradient(from 0deg,#22d3ee,#0ea5e9,#a5f3fc,#22d3ee)",
    animation: "qsy-deco-spin 3.5s linear infinite",
  },
];

export function decorationByKey(key?: string) {
  return SHOP_DECORATIONS.find((d) => d.key === key);
}
