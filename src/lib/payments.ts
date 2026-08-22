export type PaidRank = "obsidian" | "seraph";

export const RANK_PRICES: Record<PaidRank, number> = {
  obsidian: 599,
  seraph: 1499,
};

export function formatUsd(cents: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(cents / 100);
}
