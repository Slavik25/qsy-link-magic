import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { ThemeConfig } from "@/lib/qsy";

export type StreakWidgetProps = {
  userId: string;
  accent: string;
  theme: ThemeConfig;
  /** Valor fijo para previsualizar en el editor sin consultar la base de datos. */
  previewDays?: number;
};

function styleClasses(style: ThemeConfig["streak_style"], accent: string) {
  switch (style) {
    case "chip":
      return {
        className: "rounded-md border px-2 py-1",
        style: { borderColor: `color-mix(in oklab, ${accent} 45%, transparent)`, background: `color-mix(in oklab, ${accent} 12%, transparent)` },
      };
    case "pill":
      return {
        className: "rounded-full border px-3 py-1",
        style: { borderColor: `color-mix(in oklab, ${accent} 45%, transparent)`, background: `color-mix(in oklab, ${accent} 14%, transparent)` },
      };
    case "glow":
      return {
        className: "rounded-full px-3 py-1 font-semibold",
        style: {
          background: `color-mix(in oklab, ${accent} 22%, transparent)`,
          boxShadow: `0 0 18px color-mix(in oklab, ${accent} 45%, transparent)`,
        },
      };
    case "badge":
      return {
        className: "rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider",
        style: { background: accent, color: "#0b0b12" },
      };
    default:
      return { className: "", style: {} as React.CSSProperties };
  }
}

/** Widget gratuito de racha para el biolink público. */
export function ProfileStreak({ userId, accent, theme, previewDays }: StreakWidgetProps) {
  const [days, setDays] = useState<number | null>(previewDays ?? null);

  useEffect(() => {
    if (previewDays !== undefined) {
      setDays(previewDays);
      return;
    }
    let cancelled = false;
    void (async () => {
      const { data } = await supabase
        .from("user_streaks")
        .select("current_days, last_claim_date")
        .eq("user_id", userId)
        .maybeSingle();
      if (cancelled) return;
      if (!data) {
        setDays(0);
        return;
      }
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const last = data.last_claim_date as string | null;
      const alive = !!last && last >= yesterday;
      setDays(alive ? (data.current_days ?? 0) : 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, previewDays]);

  if (days === null) return null;

  const showCount = theme.streak_show_count !== false;
  const skin = styleClasses(theme.streak_style ?? "plain", accent);
  const label = showCount
    ? `${days} ${days === 1 ? "día" : "días"} de racha`
    : days > 0
      ? "Racha activa"
      : "Racha apagada";

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${skin.className}`}
      style={skin.style}
      title={`Racha de ${days} días seguidos en QSY`}
    >
      <Flame
        className="size-3"
        style={{ color: theme.streak_style === "badge" ? "#0b0b12" : days > 0 ? accent : "#71717a" }}
      />
      {label}
    </span>
  );
}
