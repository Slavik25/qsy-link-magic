/** Dominios QSY disponibles. Solo el rango Seraph puede elegir. */
export const QSY_DOMAINS = [
  { key: "qsy.rip", label: "qsy.rip", description: "El clásico. Corto, oscuro y directo." },
  { key: "qsy.es", label: "qsy.es", description: "Ideal para la comunidad hispana." },
  { key: "qsy.bio", label: "qsy.bio", description: "Perfecto para creadores y marcas." },
] as const;

export type QsyDomain = (typeof QSY_DOMAINS)[number]["key"];

export const DEFAULT_DOMAIN: QsyDomain = "qsy.rip";

export const RANKS = ["free", "obsidian", "seraph"] as const;
export type QsyRank = (typeof RANKS)[number];

export const RANK_LABEL: Record<QsyRank, string> = {
  free: "Free",
  obsidian: "Obsidian",
  seraph: "Seraph",
};

export function isDomain(value: unknown): value is QsyDomain {
  return QSY_DOMAINS.some((d) => d.key === value);
}

/** Host visible del perfil (solo Seraph puede cambiarlo). */
export function profileHost(profile?: { rank?: string | null; domain?: string | null } | null) {
  if (profile?.rank === "seraph" && isDomain(profile.domain)) return profile.domain;
  return DEFAULT_DOMAIN;
}

/** URL pública del perfil respetando el dominio elegido. */
export function profileUrl(username: string, domain?: string | null) {
  return `https://${isDomain(domain) ? domain : DEFAULT_DOMAIN}/${username}`;
}

