export type ShopItem = {
  key: string;
  name: string;
  description: string;
  price: number;
  premium?: boolean;
};

export type PlayerDef = ShopItem & {
  player_type: string;
  player_bg: "solid" | "glass" | "transparent";
  player_position?: string;
  preview: string;
};

/** Reproductores de música (theme.player_type + theme.player_bg) */
export const SHOP_PLAYERS: PlayerDef[] = [
  {
    key: "player-default",
    name: "Classic",
    description: "Reproductor estándar con carátula y controles.",
    price: 0,
    player_type: "default",
    player_bg: "glass",
    preview: "linear-gradient(140deg,#2b1d4d,#0b0b12)",
  },
  {
    key: "player-minimal",
    name: "Minimal",
    description: "Solo play/pausa y barra fina. Ultra discreto.",
    price: 0,
    player_type: "minimal",
    player_bg: "transparent",
    preview: "linear-gradient(140deg,#1a1a24,#0b0b12)",
  },
  {
    key: "player-structured",
    name: "Structured",
    description: "Carátula grande, título, artista y progreso detallado.",
    price: 250,
    premium: true,
    player_type: "structured",
    player_bg: "solid",
    preview: "linear-gradient(140deg,#3a1d4d,#0b0b12)",
  },
  {
    key: "player-text",
    name: "Marquee Text",
    description: "Título en marquesina animada, sin carátula.",
    price: 250,
    premium: true,
    player_type: "text",
    player_bg: "transparent",
    preview: "linear-gradient(140deg,#123,#0b0b12)",
  },
  {
    key: "player-vinyl",
    name: "Vinyl",
    description: "Carátula circular giratoria estilo tocadiscos.",
    price: 300,
    premium: true,
    player_type: "vinyl",
    player_bg: "glass",
    preview: "linear-gradient(140deg,#4d2b1d,#0b0b12)",
  },
  {
    key: "player-wave",
    name: "Waveform",
    description: "Barras de espectro animadas al ritmo de la canción.",
    price: 350,
    premium: true,
    player_type: "wave",
    player_bg: "transparent",
    preview: "linear-gradient(140deg,#1d4d47,#0b0b12)",
  },
  {
    key: "player-cassette",
    name: "Cassette",
    description: "Estética retro de cinta con bobinas en movimiento.",
    price: 400,
    premium: true,
    player_type: "cassette",
    player_bg: "solid",
    preview: "linear-gradient(140deg,#4d3d1d,#0b0b12)",
  },
  {
    key: "player-dock",
    name: "Floating Dock",
    description: "Barra flotante inferior con controles completos.",
    price: 200,
    player_type: "dock",
    player_bg: "glass",
    player_position: "bottom-center",
    preview: "linear-gradient(140deg,#1d2b4d,#0b0b12)",
  },
  {
    key: "player-corner",
    name: "Corner Pill",
    description: "Píldora compacta anclada arriba a la derecha.",
    price: 150,
    player_type: "minimal",
    player_bg: "glass",
    player_position: "top-right",
    preview: "linear-gradient(140deg,#2b4d1d,#0b0b12)",
  },
  {
    key: "player-neon",
    name: "Neon Deck",
    description: "Panel con glow de neón y progreso luminoso.",
    price: 450,
    premium: true,
    player_type: "structured",
    player_bg: "glass",
    preview: "linear-gradient(140deg,#4d1d5e,#0b0b12)",
  },
];

export type LayoutDef = ShopItem & {
  template: string;
  profile_width: "compact" | "normal" | "wide";
  avatar_shape: "circle" | "rounded" | "square" | "hexagon";
  card_bg_type?: "solid" | "gradient" | "image" | "video" | "transparent";
  show_card?: boolean;
  preview: string;
};

/** Layouts personalizados (theme.template + ajustes) */
export const SHOP_LAYOUTS: LayoutDef[] = [
  {
    key: "layout-glass",
    name: "Glass",
    description: "El clásico QSY: tarjeta de cristal centrada.",
    price: 0,
    template: "glass",
    profile_width: "normal",
    avatar_shape: "circle",
    card_bg_type: "solid",
    show_card: true,
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
    card_bg_type: "solid",
    show_card: true,
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
    card_bg_type: "solid",
    show_card: true,
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
    card_bg_type: "solid",
    show_card: true,
    preview: "linear-gradient(140deg,#0f4d4d,#0b0b12)",
  },
  {
    key: "layout-floating",
    name: "Floating",
    description: "Sin recuadro: el contenido flota sobre el fondo.",
    price: 0,
    template: "glass",
    profile_width: "normal",
    avatar_shape: "circle",
    card_bg_type: "transparent",
    show_card: false,
    preview: "linear-gradient(140deg,#101018,#0b0b12)",
  },
  {
    key: "layout-aurora",
    name: "Aurora",
    description: "Fondo de tarjeta en degradado violeta luminoso.",
    price: 250,
    template: "aurora",
    profile_width: "normal",
    avatar_shape: "circle",
    card_bg_type: "gradient",
    show_card: true,
    preview: "linear-gradient(140deg,#6d28d9,#1e1b4b,#0b0b12)",
  },
  {
    key: "layout-terminal",
    name: "Terminal",
    description: "Estilo consola: bordes duros y tipografía mono.",
    price: 300,
    template: "terminal",
    profile_width: "compact",
    avatar_shape: "square",
    card_bg_type: "solid",
    show_card: true,
    preview: "linear-gradient(140deg,#0f2417,#0b0b12)",
  },
  {
    key: "layout-cinema",
    name: "Cinema",
    description: "Tarjeta ancha pensada para fondos de video.",
    price: 450,
    premium: true,
    template: "cinema",
    profile_width: "wide",
    avatar_shape: "rounded",
    card_bg_type: "video",
    show_card: true,
    preview: "linear-gradient(140deg,#1b1b2f,#3a0d3a,#0b0b12)",
  },
  {
    key: "layout-sakura",
    name: "Sakura",
    description: "Rosado suave con bordes redondeados y glow cálido.",
    price: 350,
    template: "sakura",
    profile_width: "normal",
    avatar_shape: "circle",
    card_bg_type: "gradient",
    show_card: true,
    preview: "linear-gradient(140deg,#f472b6,#4c1d95,#0b0b12)",
  },
  {
    key: "layout-brutal",
    name: "Brutalist",
    description: "Bloques sólidos, cero blur y contraste extremo.",
    price: 300,
    template: "brutal",
    profile_width: "compact",
    avatar_shape: "square",
    card_bg_type: "solid",
    show_card: true,
    preview: "linear-gradient(140deg,#2b2b2b,#0b0b12)",
  },
  {
    key: "layout-holo",
    name: "Holographic",
    description: "Reflejos iridiscentes y borde cromado animado.",
    price: 500,
    premium: true,
    template: "holo",
    profile_width: "normal",
    avatar_shape: "hexagon",
    card_bg_type: "gradient",
    show_card: true,
    preview: "linear-gradient(140deg,#22d3ee,#a855f7,#0b0b12)",
  },
  {
    key: "layout-poster",
    name: "Poster",
    description: "Banner gigante arriba con avatar superpuesto XL.",
    price: 400,
    premium: true,
    template: "poster",
    profile_width: "wide",
    avatar_shape: "rounded",
    card_bg_type: "image",
    show_card: true,
    preview: "linear-gradient(140deg,#4d1d1d,#0b0b12)",
  },
  {
    key: "layout-noir",
    name: "Noir",
    description: "Blanco y negro, sin glow. Elegancia mínima.",
    price: 0,
    template: "minimal",
    profile_width: "compact",
    avatar_shape: "circle",
    card_bg_type: "solid",
    show_card: true,
    preview: "linear-gradient(140deg,#1c1c1c,#050505)",
  },
  {
    key: "layout-stack",
    name: "Stack",
    description: "Enlaces apilados a ancho completo sobre el fondo.",
    price: 0,
    template: "dark",
    profile_width: "normal",
    avatar_shape: "rounded",
    card_bg_type: "transparent",
    show_card: false,
    preview: "linear-gradient(140deg,#161622,#0b0b12)",
  },
  {
    key: "layout-vapor",
    name: "Vaporwave",
    description: "Degradado rosa/cian con retícula retro de los 90.",
    price: 250,
    template: "vapor",
    profile_width: "normal",
    avatar_shape: "square",
    card_bg_type: "gradient",
    show_card: true,
    preview: "linear-gradient(140deg,#ff6ec7,#22d3ee,#0b0b12)",
  },
  {
    key: "layout-arcade",
    name: "Arcade",
    description: "Píxeles, bordes duros y paleta de recreativa.",
    price: 300,
    template: "arcade",
    profile_width: "compact",
    avatar_shape: "square",
    card_bg_type: "solid",
    show_card: true,
    preview: "linear-gradient(140deg,#1d1d4d,#7c1d4d,#0b0b12)",
  },
  {
    key: "layout-ivory",
    name: "Ivory",
    description: "Tarjeta clara y cálida para perfiles editoriales.",
    price: 200,
    template: "ivory",
    profile_width: "normal",
    avatar_shape: "rounded",
    card_bg_type: "gradient",
    show_card: true,
    preview: "linear-gradient(140deg,#f5efe6,#8b7f70,#0b0b12)",
  },
  {
    key: "layout-nebula",
    name: "Nebula",
    description: "Nebulosa animada dentro de la tarjeta, avatar hexagonal.",
    price: 450,
    premium: true,
    template: "nebula",
    profile_width: "wide",
    avatar_shape: "hexagon",
    card_bg_type: "gradient",
    show_card: true,
    preview: "linear-gradient(140deg,#5b21b6,#0ea5e9,#0b0b12)",
  },
  {
    key: "layout-y2k",
    name: "Y2K",
    description: "Cromo líquido, brillos y estética 2000s.",
    price: 500,
    premium: true,
    template: "y2k",
    profile_width: "normal",
    avatar_shape: "circle",
    card_bg_type: "gradient",
    show_card: true,
    preview: "linear-gradient(140deg,#c0c9ff,#f0abfc,#0b0b12)",
  },
];

/** Estilos para el nombre de usuario (theme.username_effect) */
export type NameStyleDef = ShopItem & { effect: string };

export const SHOP_NAME_STYLES: NameStyleDef[] = [
  { key: "name-none", name: "Normal", description: "Sin efecto, el nombre limpio.", price: 0, effect: "none" },
  { key: "name-glow", name: "Glow", description: "Resplandor suave con tu color de acento.", price: 0, effect: "glow" },
  { key: "name-gradient", name: "Gradient", description: "Degradado del acento al blanco.", price: 0, effect: "gradient" },
  { key: "name-outline", name: "Outline", description: "Solo contorno, relleno transparente.", price: 0, effect: "outline" },
  { key: "name-shine", name: "Shine", description: "Barrido de luz que recorre las letras.", price: 150, effect: "shine" },
  { key: "name-rainbow", name: "Rainbow", description: "Arcoíris animado en bucle infinito.", price: 250, effect: "rainbow" },
  { key: "name-glitch", name: "Glitch", description: "Desfase RGB estilo error de señal.", price: 300, effect: "glitch" },
  { key: "name-neon", name: "Neon Sign", description: "Tubo de neón con parpadeo eléctrico.", price: 350, effect: "neon" },
  { key: "name-typewriter", name: "Typewriter", description: "Cursor parpadeante estilo terminal.", price: 200, effect: "typewriter" },
  { key: "name-chrome", name: "Chrome", description: "Metal líquido con reflejos cromados.", price: 400, premium: true, effect: "chrome" },
  { key: "name-fire", name: "Inferno", description: "Degradado ardiente con brillo naranja.", price: 450, premium: true, effect: "fire" },
  { key: "name-ice", name: "Frost", description: "Hielo azul con destellos fríos.", price: 400, premium: true, effect: "ice" },
  { key: "name-sparkle", name: "Sparkle", description: "Purpurina animada sobre las letras.", price: 500, premium: true, effect: "sparkle" },
];

/** Efectos animados de fondo (theme.bg_effect) */
export type BgEffectDef = ShopItem & { effect: string; preview: string };

export const SHOP_BG_EFFECTS: BgEffectDef[] = [
  { key: "bg-none", name: "Ninguno", description: "Fondo limpio, sin capas animadas.", price: 0, effect: "none", preview: "linear-gradient(140deg,#111,#0b0b12)" },
  { key: "bg-stars", name: "Estrellas", description: "Campo de estrellas con parpadeo lento.", price: 0, effect: "stars", preview: "linear-gradient(140deg,#0b1030,#0b0b12)" },
  { key: "bg-aurora", name: "Aurora", description: "Cortinas de luz violeta en movimiento.", price: 0, effect: "aurora", preview: "linear-gradient(140deg,#4c1d95,#0e7490,#0b0b12)" },
  { key: "bg-night", name: "Noche", description: "Viñeta profunda con niebla azulada.", price: 0, effect: "night", preview: "linear-gradient(140deg,#0b1a2b,#0b0b12)" },
  { key: "bg-rain", name: "Lluvia", description: "Gotas cayendo en diagonal.", price: 150, effect: "rain", preview: "linear-gradient(140deg,#1b2b3a,#0b0b12)" },
  { key: "bg-snow", name: "Nieve", description: "Copos flotando suavemente.", price: 150, effect: "snow", preview: "linear-gradient(140deg,#243447,#0b0b12)" },
  { key: "bg-bubbles", name: "Burbujas", description: "Burbujas ascendentes translúcidas.", price: 200, effect: "bubbles", preview: "linear-gradient(140deg,#0f3d4d,#0b0b12)" },
  { key: "bg-confetti", name: "Confetti", description: "Confeti multicolor en caída constante.", price: 200, effect: "confetti", preview: "linear-gradient(140deg,#4d1d3a,#0b0b12)" },
  { key: "bg-fireflies", name: "Luciérnagas", description: "Puntos cálidos flotando en la oscuridad.", price: 250, effect: "fireflies", preview: "linear-gradient(140deg,#1d2b12,#0b0b12)" },
  { key: "bg-matrix", name: "Matrix", description: "Lluvia de código verde.", price: 300, effect: "matrix", preview: "linear-gradient(140deg,#052b16,#0b0b12)" },
  { key: "bg-oldtv", name: "Old TV", description: "Scanlines y ruido de tubo catódico.", price: 300, effect: "oldtv", preview: "linear-gradient(140deg,#2b2b2b,#0b0b12)" },
  { key: "bg-grid", name: "Retro Grid", description: "Retícula infinita con horizonte neón.", price: 350, effect: "grid", preview: "linear-gradient(140deg,#3b0d5e,#0b0b12)" },
  { key: "bg-plasma", name: "Plasma", description: "Manchas de plasma en mutación continua.", price: 450, premium: true, effect: "plasma", preview: "linear-gradient(140deg,#7c1d6f,#1d4d7c,#0b0b12)" },
  { key: "bg-dither", name: "Dither", description: "Trama de puntos animada estilo retro.", price: 400, premium: true, effect: "dither", preview: "linear-gradient(140deg,#333,#0b0b12)" },
  { key: "bg-nebula", name: "Nebulosa", description: "Nube estelar en rotación permanente.", price: 500, premium: true, effect: "nebula", preview: "linear-gradient(140deg,#4338ca,#a21caf,#0b0b12)" },
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

export function layoutByKey(key?: string) {
  return SHOP_LAYOUTS.find((l) => l.key === key);
}

export function playerByKey(key?: string) {
  return SHOP_PLAYERS.find((p) => p.key === key);
}

/** Un item es usable si es gratis o si el usuario lo desbloqueó. */
export function isOwned(item: ShopItem, unlocks: Iterable<string>) {
  if (item.price === 0) return true;
  for (const k of unlocks) if (k === item.key) return true;
  return false;
}
