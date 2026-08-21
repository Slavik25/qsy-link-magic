import type { ReactNode } from "react";

export function AdminCard({
  title,
  desc,
  action,
  children,
  className = "",
}: {
  title: string;
  desc?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`qsy-pop rounded-3xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {desc && <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "danger" | "success";
}) {
  const toneClass =
    tone === "danger"
      ? "text-destructive"
      : tone === "success"
        ? "text-primary"
        : "text-gradient-violet";
  return (
    <div className="qsy-pop rounded-2xl border border-border/60 bg-surface p-4 transition-colors hover:border-primary/40">
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${toneClass}`}>
        {typeof value === "number" ? value.toLocaleString("es-ES") : value}
      </p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/60 px-4 py-10 text-center text-xs text-muted-foreground">
      {text}
    </div>
  );
}

export function Pill({ children, tone = "default" }: { children: ReactNode; tone?: string }) {
  const map: Record<string, string> = {
    default: "border-border/60 text-muted-foreground",
    open: "border-chart-5/50 bg-chart-5/10 text-chart-5",
    danger: "border-destructive/50 bg-destructive/10 text-destructive",
    ok: "border-primary/50 bg-primary/10 text-primary",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
        map[tone] ?? map["default"]
      }`}
    >
      {children}
    </span>
  );
}
