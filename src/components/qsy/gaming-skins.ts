import type { CSSProperties } from "react";

export type GamingSkin = {
  /** Clases extra para la tarjeta. */
  className: string;
  /** Estilos inline de la tarjeta. */
  style: CSSProperties;
  /** Muestra el resplandor radial de fondo. */
  glow: boolean;
  /** Muestra la línea superior luminosa. */
  topLine: boolean;
  /** Usa tipografía monoespaciada. */
  mono?: boolean;
  /** Superpone scanlines holográficas. */
  scanlines?: boolean;
  /** Radio del avatar. */
  avatar?: string;
};

/**
 * Traduce un diseño de la tienda a estilos concretos para las tarjetas
 * de Steam / Twitch / Roblox del biolink.
 */
export function gamingSkin(style: string | undefined, color: string, transparent: boolean): GamingSkin {
  const base: GamingSkin = {
    className: "",
    style: {
      borderRadius: "var(--p-radius)",
      border: `1px solid color-mix(in oklab, ${color} 35%, transparent)`,
      background: "var(--p-surface)",
      backdropFilter: "blur(var(--p-blur))",
      boxShadow: `0 12px 34px -20px ${color}`,
    },
    glow: true,
    topLine: true,
  };

  if (transparent) {
    return {
      ...base,
      style: { borderRadius: "var(--p-radius)", border: "0", background: "transparent" },
      glow: false,
      topLine: false,
    };
  }

  switch (style) {
    case "ghost":
      return {
        ...base,
        style: { borderRadius: "var(--p-radius)", border: "0", background: "transparent" },
        glow: false,
        topLine: false,
      };
    case "outline":
      return {
        ...base,
        style: {
          borderRadius: "var(--p-radius)",
          border: `1px solid ${color}`,
          background: "transparent",
        },
        glow: false,
        topLine: false,
      };
    case "compact":
      return {
        ...base,
        className: "!py-2",
        style: {
          borderRadius: "999px",
          border: `1px solid color-mix(in oklab, ${color} 30%, transparent)`,
          background: "color-mix(in oklab, ${c} 10%, transparent)".replace("${c}", color),
        },
        glow: false,
        topLine: false,
        avatar: "999px",
      };
    case "neon":
      return {
        ...base,
        style: {
          borderRadius: "var(--p-radius)",
          border: `1px solid ${color}`,
          background: "color-mix(in oklab, #000 65%, transparent)",
          boxShadow: `0 0 18px -2px ${color}, inset 0 0 22px -14px ${color}`,
        },
        glow: true,
        topLine: true,
      };
    case "lcd":
      return {
        ...base,
        style: {
          borderRadius: "6px",
          border: `1px solid color-mix(in oklab, ${color} 55%, transparent)`,
          background: `color-mix(in oklab, ${color} 12%, #04120b)`,
          boxShadow: `inset 0 0 24px -12px ${color}`,
        },
        glow: false,
        topLine: false,
        mono: true,
        avatar: "4px",
      };
    case "terminal":
      return {
        ...base,
        style: {
          borderRadius: "4px",
          border: "1px solid rgba(16,185,129,.45)",
          background: "rgba(0,0,0,.82)",
          boxShadow: "inset 0 0 30px -18px rgba(16,185,129,.9)",
        },
        glow: false,
        topLine: false,
        mono: true,
        avatar: "4px",
      };
    case "gradient":
      return {
        ...base,
        style: {
          borderRadius: "var(--p-radius)",
          border: `1px solid color-mix(in oklab, ${color} 40%, transparent)`,
          background: `linear-gradient(120deg, color-mix(in oklab, ${color} 38%, transparent), transparent 78%), var(--p-surface)`,
          backdropFilter: "blur(var(--p-blur))",
          boxShadow: `0 16px 40px -24px ${color}`,
        },
        glow: true,
        topLine: false,
      };
    case "glassdeep":
      return {
        ...base,
        style: {
          borderRadius: "18px",
          border: "1px solid rgba(255,255,255,.18)",
          background: "rgba(255,255,255,.07)",
          backdropFilter: "blur(18px)",
          boxShadow: "0 18px 40px -26px rgba(0,0,0,.9)",
        },
        glow: false,
        topLine: true,
      };
    case "brutal":
      return {
        ...base,
        style: {
          borderRadius: "0px",
          border: "2px solid rgba(255,255,255,.85)",
          background: "rgba(8,8,10,.85)",
          boxShadow: `6px 6px 0 0 ${color}`,
        },
        glow: false,
        topLine: false,
        avatar: "0px",
      };
    case "holo":
      return {
        ...base,
        className: "qsy-gaming-holo",
        style: {
          borderRadius: "16px",
          border: "1px solid rgba(103,232,249,.45)",
          background: "linear-gradient(140deg, rgba(34,211,238,.16), rgba(168,85,247,.14))",
          backdropFilter: "blur(14px)",
          boxShadow: "0 0 30px -10px rgba(34,211,238,.6)",
        },
        glow: true,
        topLine: true,
        scanlines: true,
      };
    case "chrome":
      return {
        ...base,
        style: {
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,.35)",
          background:
            "linear-gradient(150deg,#e8e8ee 0%,#8b8b99 22%,#2a2a33 48%,#9a9aa8 74%,#e8e8ee 100%)",
          color: "#0b0b12",
          boxShadow: "0 16px 40px -26px rgba(255,255,255,.7)",
        },
        glow: false,
        topLine: false,
      };
    case "aurora":
      return {
        ...base,
        className: "qsy-gaming-aurora",
        style: {
          borderRadius: "18px",
          border: "1px solid transparent",
          background: "rgba(10,10,16,.72)",
          backdropFilter: "blur(14px)",
          boxShadow: `0 20px 46px -28px ${color}`,
        },
        glow: true,
        topLine: false,
      };
    case "prism":
      return {
        ...base,
        className: "qsy-gaming-prism",
        style: {
          borderRadius: "18px",
          border: "1px solid rgba(255,255,255,.2)",
          background: "rgba(6,6,10,.8)",
          backdropFilter: "blur(12px)",
        },
        glow: false,
        topLine: false,
      };
    default:
      return base;
  }
}
