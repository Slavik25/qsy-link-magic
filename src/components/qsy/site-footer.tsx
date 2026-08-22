import { Link } from "@tanstack/react-router";
import { QsyLogo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xs space-y-3">
          <QsyLogo />
          <p className="text-sm text-muted-foreground">
            Tu identidad. Un solo link. Perfiles públicos para todo lo que eres, haces y creas.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
          <div className="space-y-2">
            <p className="font-medium">Producto</p>
            <Link to="/rank" className="block text-muted-foreground hover:text-foreground">
              Ranking
            </Link>
            <Link to="/templates" className="block text-muted-foreground hover:text-foreground">
              Templates
            </Link>
            <a href="/#pricing" className="block text-muted-foreground hover:text-foreground">
              Pricing
            </a>
          </div>
          <div className="space-y-2">
            <p className="font-medium">Cuenta</p>
            <Link to="/login" className="block text-muted-foreground hover:text-foreground">
              Login
            </Link>
            <Link to="/register" className="block text-muted-foreground hover:text-foreground">
              Crear cuenta
            </Link>
            <Link to="/dashboard" className="block text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
          </div>
          <div className="space-y-2">
            <p className="font-medium">Demo</p>
            <Link
              to="/$username"
              params={{ username: "qsy" }}
              className="block text-muted-foreground hover:text-foreground"
            >
              qsy.rip/qsy
            </Link>
            <Link
              to="/$username"
              params={{ username: "nova" }}
              className="block text-muted-foreground hover:text-foreground"
            >
              qsy.rip/nova
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-border/60 pt-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} QSY — Tu identidad. Un solo link.
      </div>
    </footer>
  );
}
