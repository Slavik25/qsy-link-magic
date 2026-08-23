import { useMyProfile } from "@/lib/qsy-data";

/** Multiplicador de tamaño de subida según el rango del perfil. */
export function uploadMultiplier(rank?: string | null) {
  const r = (rank ?? "").toLowerCase();
  if (r === "seraph") return 6;
  if (r === "obsidian") return 3;
  return 1;
}

/** Límite en MB para el rango dado, a partir del límite base gratuito. */
export function uploadLimitMb(baseMb: number, rank?: string | null) {
  return Math.round(baseMb * uploadMultiplier(rank));
}

/** Hook con los límites de subida del perfil activo. */
export function useUploadLimits() {
  const { data: profile } = useMyProfile();
  const rank = (profile as { rank?: string | null } | null | undefined)?.rank ?? null;
  const multiplier = uploadMultiplier(rank);
  return {
    rank,
    multiplier,
    boosted: multiplier > 1,
    limit: (baseMb: number) => uploadLimitMb(baseMb, rank),
  };
}
