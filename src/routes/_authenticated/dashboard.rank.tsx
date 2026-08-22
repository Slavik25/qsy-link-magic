import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Crown, Gem, Loader2, Sparkles, X } from "lucide-react";
import { createDodoCheckout } from "@/lib/dodo.functions";
import type { PaidRank } from "@/lib/payments";

export const Route = createFileRoute("/_authenticated/dashboard/rank")({
  component: RankPage,
  head: () => ({
    meta: [
      { title: "Subir de rango · QSY" },
      {
        name: "description",
        content:
          "Compara los rangos QSY: Free, Obsidian y Seraph. Perfiles ilimitados, dominios premium, analíticas avanzadas y catálogo completo.",
      },
      { property: "og:title", content: "Subir de rango · QSY" },
      { property: "og:description", content: "Beneficios de Obsidian y Seraph en QSY." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type Tier = {
  key: string;
  name: string;
  price: string;
  period: string;
  tagline: string;
  accent: string;
  highlight?: boolean;
  perks: { label: string; on: boolean }[];
};

const TIERS: Tier[] = [
  {
    key: "free",
    name: "Free",
    price: "0 €",
    period: "para siempre",
    tagline: "Lo esencial para lanzar tu biolink.",
    accent: "border-border/60 bg-card/40",
    perks: [
      { label: "2 perfiles", on: true },
      { label: "Enlaces ilimitados", on: true },
      { label: "Layouts y reproductores básicos", on: true },
      { label: "Analíticas de 7 días", on: true },
      { label: "Dominios qsy.rip / qsy.es / qsy.bio", on: false },
      { label: "Decoraciones premium", on: false },
      { label: "Insignia de rango", on: false },
      { label: "Soporte prioritario", on: false },
    ],
  },
  {
    key: "obsidian",
    name: "Obsidian",
    price: "4,99 €",
    period: "/ mes",
    tagline: "Para creadores que quieren destacar.",
    accent: "border-primary/50 bg-primary/10",
    highlight: true,
    perks: [
      { label: "6 perfiles independientes", on: true },
      { label: "Todo el catálogo de layouts y reproductores", on: true },
      { label: "Decoraciones de avatar premium", on: true },
      { label: "Dominio qsy.rip personalizado", on: true },
      { label: "Analíticas avanzadas (90 días + países)", on: true },
      { label: "Insignia Obsidian en tu perfil", on: true },
      { label: "Fondos de video y splash screen", on: true },
      { label: "Sin marca QSY", on: true },
      { label: "+500 QSY Coins al mes", on: true },
      { label: "Dominio propio (tudominio.com)", on: false },
    ],
  },
  {
    key: "seraph",
    name: "Seraph",
    price: "9,99 €",
    period: "/ mes",
    tagline: "El rango máximo. Todo desbloqueado, siempre.",
    accent: "border-amber-300/50 bg-amber-300/10",
    perks: [
      { label: "Todo lo de Obsidian", on: true },
      { label: "Perfiles ilimitados", on: true },
      { label: "Dominio propio con SSL", on: true },
      { label: "Todos los dominios qsy (.rip / .es / .bio)", on: true },
      { label: "Username reservado y protegido", on: true },
      { label: "Insignia Seraph animada + nombre con glow", on: true },
      { label: "Prioridad en Explorar y plantillas destacadas", on: true },
      { label: "Analíticas en tiempo real e export CSV", on: true },
      { label: "Mural con moderación avanzada", on: true },
      { label: "+2.000 QSY Coins al mes y acceso anticipado", on: true },
    ],
  },
];

type Row = { feature: string; free: string; obsidian: string; seraph: string };

const FEATURES: Row[] = [
  { feature: "Precio", free: "GRATIS", obsidian: "4,99 € / mes", seraph: "9,99 € / mes" },
  { feature: "QSY Coins de bienvenida", free: "0", obsidian: "500", seraph: "2.000" },
  { feature: "Perfiles", free: "2", obsidian: "6", seraph: "Ilimitados" },
  { feature: "Dominios (qsy.rip / .es / .bio)", free: "1 base", obsidian: "qsy.rip", seraph: "Los 3 + dominio propio" },
  { feature: "Insignia exclusiva", free: "—", obsidian: "Insignia Obsidian + V.I.P", seraph: "Insignia Seraph animada + V.I.P" },
  { feature: "Decoraciones de perfil", free: "Limitadas", obsidian: "Todas", seraph: "Todas" },
  { feature: "Efectos y fondos", free: "—", obsidian: "✓", seraph: "✓" },
  { feature: "Layouts y reproductores", free: "Básicos", obsidian: "Todos", seraph: "Todos" },
  { feature: "Personalización avanzada", free: "—", obsidian: "✓", seraph: "✓" },
  { feature: "Analíticas", free: "7 días", obsidian: "90 días + países", seraph: "Tiempo real + CSV" },
  { feature: "Límite de subida", free: "25 MB", obsidian: "40 MB", seraph: "100 MB" },
  { feature: "Sin marca QSY", free: "—", obsidian: "✓", seraph: "✓" },
  { feature: "Soporte prioritario", free: "—", obsidian: "—", seraph: "✓ Discord" },
];

function Cell({ value, tone }: { value: string; tone: "free" | "obsidian" | "seraph" }) {
  const muted = value === "—" || value === "0" || value === "GRATIS" || value === "Limitadas";
  const color =
    tone === "seraph"
      ? "text-amber-200"
      : tone === "obsidian"
        ? "text-violet-300"
        : "text-foreground";
  if (value === "✓" || value.startsWith("✓")) {
    return <span className="text-emerald-400">{value}</span>;
  }
  return (
    <span className={muted ? "text-muted-foreground/60" : tone === "free" ? "" : `${color} font-medium`}>
      {value}
    </span>
  );
}

function FeatureTable() {
  return (
    <section className="space-y-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Precios y características
      </h2>
      <div className="overflow-x-auto rounded-3xl border border-border/60 bg-card/40 backdrop-blur-xl">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border/60 text-[11px] uppercase tracking-[0.14em]">
              <th className="px-5 py-4 text-left font-semibold">Característica</th>
              <th className="px-5 py-4 text-left font-semibold text-muted-foreground">Free</th>
              <th className="px-5 py-4 text-left font-semibold text-violet-300">Obsidian</th>
              <th className="px-5 py-4 text-left font-semibold text-amber-200">Seraph</th>
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((r) => (
              <tr key={r.feature} className="border-b border-border/40 last:border-0 hover:bg-primary/5">
                <td className="px-5 py-3.5 font-medium">{r.feature}</td>
                <td className="px-5 py-3.5"><Cell value={r.free} tone="free" /></td>
                <td className="px-5 py-3.5"><Cell value={r.obsidian} tone="obsidian" /></td>
                <td className="px-5 py-3.5"><Cell value={r.seraph} tone="seraph" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="rounded-2xl border border-border/60 bg-card/40 px-5 py-4 text-xs text-muted-foreground">
        <strong className="text-foreground">¿Cómo comprar?</strong> Pulsa en «Subir a Obsidian» o «Subir a
        Seraph» para generar tu pedido. El pago es único y sin suscripciones; tu rango se activa en menos de
        24 horas.
      </p>
    </section>
  );
}

function RankPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Crown className="size-5 text-primary" /> Subir de rango
        </h1>
        <p className="text-sm text-muted-foreground">
          Compara los beneficios de Obsidian y Seraph y elige el rango que se ajusta a ti.
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-3">
        {TIERS.map((t, i) => (
          <article
            key={t.key}
            style={{ animationDelay: `${i * 70}ms` }}
            className={`qsy-pop relative flex flex-col rounded-3xl border p-6 backdrop-blur-xl transition-transform hover:-translate-y-1 ${t.accent}`}
          >
            {t.highlight && (
              <span className="absolute -top-3 left-6 rounded-full border border-primary/50 bg-background px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                Más popular
              </span>
            )}
            <div className="flex items-center gap-2">
              {t.key === "seraph" ? (
                <Sparkles className="size-4 text-amber-300" />
              ) : t.key === "obsidian" ? (
                <Gem className="size-4 text-primary" />
              ) : null}
              <h2 className="text-lg font-semibold">{t.name}</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t.tagline}</p>
            <p className="mt-4 text-3xl font-extrabold">
              {t.price} <span className="text-sm font-normal text-muted-foreground">{t.period}</span>
            </p>

            <ul className="mt-5 flex-1 space-y-2.5 text-sm">
              {t.perks.map((p) => (
                <li key={p.label} className="flex items-start gap-2">
                  {p.on ? (
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  ) : (
                    <X className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" />
                  )}
                  <span className={p.on ? "" : "text-muted-foreground/60 line-through"}>{p.label}</span>
                </li>
              ))}
            </ul>

            {t.key === "free" ? (
              <p className="mt-6 rounded-xl border border-border/60 px-4 py-2 text-center text-xs text-muted-foreground">
                Tu rango actual
              </p>
            ) : (
              <button
                className={`mt-6 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  t.key === "seraph"
                    ? "bg-amber-300 text-black hover:bg-amber-200"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                Subir a {t.name}
              </button>
            )}
          </article>
        ))}
      </section>

      <FeatureTable />

      <section className="rounded-3xl border border-border/60 bg-card/40 p-6">
        <h2 className="text-sm font-semibold">¿Prefieres no pagar?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Completa misiones para ganar QSY Coins y desbloquear layouts, reproductores y decoraciones una a una
          desde la tienda.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link
            to="/dashboard/missions"
            className="rounded-xl border border-primary/40 px-4 py-2 text-primary hover:bg-primary/10"
          >
            Ver misiones
          </Link>
          <Link
            to="/dashboard/premium"
            className="rounded-xl border border-border/60 px-4 py-2 hover:border-primary/40"
          >
            Ir a la tienda
          </Link>
        </div>
      </section>
    </div>
  );
}
