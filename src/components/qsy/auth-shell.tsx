import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, Check } from "lucide-react";
import qsyLogo from "@/assets/qsy-logo.png.asset.json";
import qsyLogoLight from "@/assets/qsy-logo-dark.png.asset.json";

const perks = [
  "Perfiles con música de fondo",
  "Efectos visuales de última generación",
  "Analytics globales en tiempo real",
  "Temas y dominios personalizados",
];

export function AuthShell({
  side = "right",
  eyebrow,
  title,
  subtitle,
  children,
}: {
  side?: "left" | "right";
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden aurora">
      <div aria-hidden className="pointer-events-none absolute inset-0 starfield drift opacity-70" />
      <div aria-hidden className="pointer-events-none absolute inset-0 starfield twinkle opacity-40" />
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-bg opacity-15" />

      <div
        className={`relative mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 ${
          side === "left" ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        <section className="rise text-center lg:text-left">
          <Link to="/" className="inline-flex items-center">
            <img src={qsyLogo.url} alt="QSY" className="h-11 w-auto object-contain qsy-logo-on-dark" />
            <img src={qsyLogoLight.url} alt="QSY" className="h-11 w-auto object-contain qsy-logo-on-light" />
          </Link>

          <h2 className="mt-8 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Tu perfil premium en{" "}
            <span className="text-gradient-violet">un solo link.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-sm text-sm text-muted-foreground lg:mx-0">
            Música, enlaces, redes, analytics y temas — todo personalizable en tu URL única.
          </p>
          <div className="mx-auto mt-8 max-w-sm space-y-3 border-t border-border/60 pt-8 text-left lg:mx-0">
            {perks.map((p, i) => (
              <div
                key={p}
                className="rise flex items-center gap-3 text-sm text-muted-foreground"
                style={{ animationDelay: `${180 + i * 90}ms` }}
              >
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/20 text-primary">
                  <Check className="size-3" />
                </span>
                {p}
              </div>
            ))}
          </div>
        </section>

        <section
          className="rise rounded-3xl border border-border/70 bg-card/50 p-6 shadow-[0_60px_140px_-70px_var(--primary)] backdrop-blur-xl sm:p-8"
          style={{ animationDelay: "120ms" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold uppercase tracking-[0.08em] sm:text-2xl">{title}</h1>
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {subtitle}
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex shrink-0 items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="size-3.5" />
              Inicio
            </Link>
          </div>
          <p className="sr-only">{eyebrow}</p>
          <div className="mt-8">{children}</div>
        </section>
      </div>
    </div>
  );
}
