import { Crown, Gem, Sparkles } from "lucide-react";
import type { QsyRank } from "@/lib/domains";

export function normalizeRank(value?: string | null): QsyRank {
  return value === "seraph" || value === "obsidian" ? value : "free";
}

const STYLES: Record<
  QsyRank,
  { label: string; className: string; icon: typeof Crown; dot: string }
> = {
  free: {
    label: "Free",
    className: "border-border/60 bg-card/50 text-muted-foreground",
    icon: Sparkles,
    dot: "bg-muted-foreground/60",
  },
  obsidian: {
    label: "Obsidian",
    className:
      "border-violet-400/40 bg-gradient-to-r from-violet-500/25 via-fuchsia-500/15 to-transparent text-violet-100 qsylight:text-violet-700 qsylight:border-violet-500/50 qsylight:from-violet-500/20 shadow-[0_0_26px_-12px_theme(colors.violet.400)] qsy-shimmer",
    icon: Gem,
    dot: "bg-violet-500",
  },
  seraph: {
    label: "Seraph",
    className:
      "border-amber-400/60 bg-gradient-to-r from-amber-300/25 via-amber-200/15 to-transparent text-amber-100 qsylight:text-amber-700 qsylight:border-amber-500/60 qsylight:from-amber-400/25 shadow-[0_0_28px_-10px_theme(colors.amber.300)] qsy-shimmer",
    icon: Crown,
    dot: "bg-amber-400",
  },
};

type Props = {
  rank?: string | null;
  /** Prefix such as "Plan" shown before the rank name. */
  prefix?: string;
  size?: "sm" | "md";
  className?: string;
};

/** Pill that shows the user's plan/rank with rank-specific styling. */
export function RankBadge({ rank, prefix, size = "md", className = "" }: Props) {
  const r = normalizeRank(rank);
  const style = STYLES[r];
  const Icon = style.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-[0.16em] ${
        size === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-[11px]"
      } ${style.className} ${className}`}
    >
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} />
      {prefix ? <span className="opacity-70">{prefix}</span> : null}
      {style.label}
      <span className={`size-1.5 rounded-full ${style.dot}`} aria-hidden />
    </span>
  );
}

/** Inline colored rank name, for use inside sentences. */
export function RankName({ rank, className = "" }: { rank?: string | null; className?: string }) {
  const r = normalizeRank(rank);
  const tone =
    r === "seraph" ? "text-amber-300 qsylight:text-amber-700" : r === "obsidian" ? "text-violet-300 qsylight:text-violet-700" : "text-primary";
  return <span className={`font-semibold ${tone} ${className}`}>{STYLES[r].label}</span>;
}

export const RANK_PROFILE_LIMIT: Record<QsyRank, number> = {
  free: 2,
  obsidian: 3,
  seraph: 5,
};
