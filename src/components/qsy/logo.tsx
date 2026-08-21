import { Link } from "@tanstack/react-router";

export function QsyLogo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2 ${className}`}>
      <span className="grid size-8 place-items-center rounded-lg bg-primary font-black tracking-tighter text-primary-foreground transition-transform duration-300 group-hover:scale-105">
        Q
      </span>
      <span className="text-lg font-semibold tracking-tight">QSY</span>
    </Link>
  );
}
