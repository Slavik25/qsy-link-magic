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
export type DecorationDef = ShopItem & { image: string | null };

export const SHOP_DECORATIONS: DecorationDef[] = [
  {
    key: "none",
    name: "Sin decoración",
    description: "Avatar limpio, sin marco.",
    price: 0,
    image: null,
  },
  {
    key: "pink-bunny",
    name: "Pink Bunny",
    description: "Decoración de avatar Pink Bunny.",
    price: 0,
    image: "https://o.keta.rip/decorations/frame-1781737464562/1781737464562-55366440177b1d86.png",
  },
  {
    key: "cat-ears",
    name: "Cat Ears",
    description: "Decoración de avatar Cat Ears.",
    price: 0,
    image: "https://o.keta.rip/decorations/frame-1781737600977/1781737600977-9cad4707a43d1f54.png",
  },
  {
    key: "enojon",
    name: "Enojon",
    description: "Decoración de avatar Enojon.",
    price: 0,
    image: "https://o.keta.rip/decorations/frame-1781737755467/1781737755468-54c7d39710221259.png",
  },
  {
    key: "rex",
    name: "Rex",
    description: "Decoración de avatar Rex.",
    price: 250,
    image: "https://o.keta.rip/decorations/frame-1783359954117/1783359954117-b8de639fd3e1faa9.png",
  },
  {
    key: "enojon-rosita",
    name: "Enojon Rosita",
    description: "Decoración de avatar Enojon Rosita.",
    price: 200,
    image: "https://o.keta.rip/decorations/frame-1782654382050/1782654382050-b1b9e0df982f39cf.png",
  },
  {
    key: "chococat",
    name: "Chococat",
    description: "Decoración de avatar Chococat.",
    price: 300,
    image: "https://o.keta.rip/decorations/frame-1782654402792/1782654402793-ddf0e69afcd360d7.png",
  },
  {
    key: "polvo-blanco",
    name: "Polvo Blanco",
    description: "Decoración de avatar Polvo Blanco.",
    price: 250,
    image: "https://o.keta.rip/decorations/frame-1782654424096/1782654424097-0e8d7f5ca066ed94.png",
  },
  {
    key: "dientes",
    name: "Dientes",
    description: "Decoración de avatar Dientes.",
    price: 200,
    image: "https://o.keta.rip/decorations/frame-1782654447694/1782654447694-b6c3b99e84de0779.png",
  },
  {
    key: "colegiala-kun",
    name: "Colegiala-kun",
    description: "Decoración de avatar Colegiala-kun.",
    price: 350,
    image: "https://o.keta.rip/decorations/frame-1782654460269/1782654460269-67da41a4d8860ba0.png",
  },
  {
    key: "brillitos",
    name: "Brillitos",
    description: "Decoración de avatar Brillitos.",
    price: 0,
    image: "https://o.keta.rip/decorations/frame-1782654516721/1782654516721-827a3a9b9fe92bd0.png",
  },
  {
    key: "alitas",
    name: "Alitas",
    description: "Decoración de avatar Alitas.",
    price: 300,
    image: "https://o.keta.rip/decorations/frame-1782654528910/1782654528910-402d5eaf661e031c.png",
  },
  {
    key: "enamorado",
    name: "Enamorado",
    description: "Decoración de avatar Enamorado.",
    price: 250,
    image: "https://o.keta.rip/decorations/frame-1782654535488/1782654535489-73d317a7a69011f9.png",
  },
  {
    key: "hello-kitty",
    name: "Hello Kitty",
    description: "Decoración de avatar Hello Kitty.",
    price: 400,
    premium: true,
    image: "https://o.keta.rip/decorations/frame-1782140719683/1782140719683-ffa133d73bc47026.png",
  },
  {
    key: "misterio",
    name: "???",
    description: "Decoración de avatar ???.",
    price: 600,
    premium: true,
    image: "https://o.keta.rip/decorations/frame-1782140867667/1782140867667-118beef15e427a5a.png",
  },
  {
    key: "skill-issue",
    name: "Skill Issue",
    description: "Decoración de avatar Skill Issue.",
    price: 300,
    image: "https://o.keta.rip/decorations/frame-1782654558837/1782654558837-7a5d4d1f1654f7fe.png",
  },
  {
    key: "cinnamon-roll",
    name: "Cinnamon Roll",
    description: "Decoración de avatar Cinnamon Roll.",
    price: 400,
    premium: true,
    image: "https://o.keta.rip/decorations/frame-1782654571452/1782654571452-7d751caf6709432f.png",
  },
  {
    key: "my-melody",
    name: "My Melody",
    description: "Decoración de avatar My Melody.",
    price: 400,
    premium: true,
    image: "https://o.keta.rip/decorations/frame-1782654577556/1782654577556-7d8c282a2ffa3c93.png",
  },
  {
    key: "fantasmita",
    name: "Fantasmita",
    description: "Decoración de avatar Fantasmita.",
    price: 350,
    image: "https://o.keta.rip/decorations/frame-1782654588792/1782654588792-bdf97979d69c0aad.png",
  },
  {
    key: "luna",
    name: "Luna",
    description: "Decoración de avatar Luna.",
    price: 500,
    premium: true,
    image: "https://o.keta.rip/decorations/frame-1782654661260/1782654661260-bf531084f81a0c61.png",
  },
  {
    key: "marcianitos",
    name: "Marcianitos",
    description: "Decoración de avatar Marcianitos.",
    price: 500,
    premium: true,
    image: "https://o.keta.rip/decorations/frame-1783359363870/1783359363870-25db32ec5b5f27da.png",
  },
];

export function decorationByKey(key?: string) {
  return SHOP_DECORATIONS.find((d) => d.key === key);
}
