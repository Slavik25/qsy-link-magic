/** Catálogo de tipografías para el biolink. Gratis para todos los usuarios. */
export type ProfileFont = {
  key: string;
  name: string;
  /** Familia de Google Fonts; vacío = tipografía del sistema, no se descarga nada. */
  google?: string;
  stack: string;
  category: "Sans" | "Serif" | "Display" | "Mono" | "Handwriting";
};

export const PROFILE_FONTS: ProfileFont[] = [
  { key: "inter", name: "Inter", google: "Inter:wght@300;400;600;800", stack: "'Inter', system-ui, sans-serif", category: "Sans" },
  { key: "system", name: "Sistema", stack: "system-ui, -apple-system, 'Segoe UI', sans-serif", category: "Sans" },
  { key: "mono", name: "Mono", stack: "ui-monospace, 'JetBrains Mono', SFMono-Regular, monospace", category: "Mono" },
  { key: "space", name: "Space Grotesk", google: "Space+Grotesk:wght@400;600;700", stack: "'Space Grotesk', sans-serif", category: "Sans" },
  { key: "sora", name: "Sora", google: "Sora:wght@300;400;600;800", stack: "'Sora', sans-serif", category: "Sans" },
  { key: "outfit", name: "Outfit", google: "Outfit:wght@300;400;600;800", stack: "'Outfit', sans-serif", category: "Sans" },
  { key: "manrope", name: "Manrope", google: "Manrope:wght@300;400;600;800", stack: "'Manrope', sans-serif", category: "Sans" },
  { key: "poppins", name: "Poppins", google: "Poppins:wght@300;400;600;800", stack: "'Poppins', sans-serif", category: "Sans" },
  { key: "syne", name: "Syne", google: "Syne:wght@400;600;800", stack: "'Syne', sans-serif", category: "Display" },
  { key: "bebas", name: "Bebas Neue", google: "Bebas+Neue", stack: "'Bebas Neue', sans-serif", category: "Display" },
  { key: "archivo", name: "Archivo Black", google: "Archivo+Black", stack: "'Archivo Black', sans-serif", category: "Display" },
  { key: "unbounded", name: "Unbounded", google: "Unbounded:wght@400;600;800", stack: "'Unbounded', sans-serif", category: "Display" },
  { key: "playfair", name: "Playfair Display", google: "Playfair+Display:wght@400;600;800", stack: "'Playfair Display', serif", category: "Serif" },
  { key: "instrument", name: "Instrument Serif", google: "Instrument+Serif", stack: "'Instrument Serif', serif", category: "Serif" },
  { key: "cormorant", name: "Cormorant", google: "Cormorant+Garamond:wght@400;600;700", stack: "'Cormorant Garamond', serif", category: "Serif" },
  { key: "lora", name: "Lora", google: "Lora:wght@400;600;700", stack: "'Lora', serif", category: "Serif" },
  { key: "jetbrains", name: "JetBrains Mono", google: "JetBrains+Mono:wght@400;600;800", stack: "'JetBrains Mono', monospace", category: "Mono" },
  { key: "spacemono", name: "Space Mono", google: "Space+Mono:wght@400;700", stack: "'Space Mono', monospace", category: "Mono" },
  { key: "vt323", name: "VT323", google: "VT323", stack: "'VT323', monospace", category: "Mono" },
  { key: "caveat", name: "Caveat", google: "Caveat:wght@400;600;700", stack: "'Caveat', cursive", category: "Handwriting" },
  { key: "pacifico", name: "Pacifico", google: "Pacifico", stack: "'Pacifico', cursive", category: "Handwriting" },
  { key: "greatvibes", name: "Great Vibes", google: "Great+Vibes", stack: "'Great Vibes', cursive", category: "Handwriting" },
];

export function fontByKey(key?: string | null): ProfileFont {
  return PROFILE_FONTS.find((f) => f.key === key) ?? PROFILE_FONTS[0]!;
}

export function fontHref(font: ProfileFont) {
  return font.google
    ? `https://fonts.googleapis.com/css2?family=${font.google}&display=swap`
    : null;
}

/** Inyecta la hoja de estilos de la fuente solo cuando hace falta (una vez por familia). */
export function ensureFontLoaded(key?: string | null) {
  if (typeof document === "undefined") return;
  const font = fontByKey(key);
  const href = fontHref(font);
  if (!href) return;
  const id = `qsy-font-${font.key}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}
