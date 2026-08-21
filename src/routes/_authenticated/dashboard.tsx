import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  BadgeCheck,
  Bell,
  ChevronRight,
  Gem,
  Gift,
  Image as ImageIcon,
  LayoutGrid,
  Link2,
  LogOut,
  type LucideIcon,
  Menu,
  Settings,
  Share2,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { QsyLogo } from "@/components/qsy/logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useMyProfile } from "@/lib/qsy-data";
import { useIsAdmin } from "@/lib/admin-data";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardLayout,
});

type NavItem = { to: string; label: string; icon: LucideIcon; exact?: boolean; tag?: string };

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Resumen", icon: LayoutGrid, exact: true },
  { to: "/dashboard/profiles", label: "Perfiles", icon: UserRound },
  { to: "/dashboard/links", label: "Conexiones", icon: Link2 },
  { to: "/dashboard/badges", label: "Insignias", icon: BadgeCheck },
  
  { to: "/dashboard/analytics", label: "Analíticas", icon: TrendingUp },
  { to: "/dashboard/premium", label: "Tienda", icon: Gem, tag: "PRO" },
  { to: "/templates", label: "Plantillas", icon: ImageIcon },
  { to: "/explore", label: "Explorar", icon: Sparkles },
  { to: "/dashboard/settings", label: "Configuración", icon: Settings },
];

function useCrumb() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/dashboard/profile") return "Editar perfil";
  return NAV.find((n) => (n.exact ? pathname === n.to : pathname.startsWith(n.to)))?.label ?? "Resumen";
}

function DashboardLayout() {
  const { data: profile } = useMyProfile();
  const { data: isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const crumb = useCrumb();
  const [open, setOpen] = useState(false);

  const uid = (profile as { uid?: number } | undefined)?.uid ?? 0;

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  async function share() {
    const url = `${window.location.origin}/${profile?.username ?? ""}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado", { description: url });
    } catch {
      toast.error("No se pudo copiar el link");
    }
  }

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[252px_1fr]">
      {/* Sidebar */}
      <aside
        className={`z-40 flex-col border-border/60 bg-card/40 backdrop-blur-xl lg:sticky lg:top-0 lg:flex lg:h-screen lg:border-r ${
          open ? "fixed inset-0 flex" : "hidden"
        }`}
      >
        <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-border/60 px-5">
          <Link to="/" className="flex items-center" onClick={() => setOpen(false)}>
            <QsyLogo />
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
            className="text-muted-foreground lg:hidden"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: !!item.exact }}
              activeProps={{
                className: "border-border bg-surface-strong text-foreground shadow-[0_0_28px_-14px_var(--primary)]",
              }}
              className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm text-muted-foreground transition-all duration-200 hover:border-border/60 hover:bg-surface-strong/50 hover:text-foreground"
            >
              <item.icon className="size-[18px] shrink-0" />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.tag && (
                <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-primary">
                  {item.tag}
                </span>
              )}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/dashboard/admin"
              onClick={() => setOpen(false)}
              activeProps={{
                className: "border-primary/60 bg-primary/15 text-foreground",
              }}
              className="group flex items-center gap-3 rounded-xl border border-primary/30 px-3 py-2.5 text-sm text-primary transition-all duration-200 hover:bg-primary/10"
            >
              <ShieldAlert className="size-[18px] shrink-0" />
              <span className="min-w-0 flex-1 truncate">Administración</span>
              <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-primary">
                ADMIN
              </span>
            </Link>
          )}
        </nav>

        <div className="space-y-3 border-t border-border/60 p-3">
          <Link
            to="/dashboard/premium"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/50 p-3 transition-colors hover:border-primary/50"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
              <Gift className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">Regalar Premium</span>
              <span className="block truncate text-xs text-muted-foreground">Regálalo a un amigo</span>
            </span>
          </Link>

          <Button onClick={share} className="w-full rounded-2xl">
            <Share2 className="size-4" /> Compartir mi perfil
          </Button>

          <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/50 p-2.5">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={`Avatar de ${profile.username}`}
                className="size-9 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-strong font-mono text-[11px] font-bold text-primary">
                {(profile?.username ?? "qs").slice(0, 2).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">Cerrar sesión</p>
              <p className="truncate text-[11px] text-muted-foreground">/{profile?.username ?? "…"}</p>
            </div>
            <button
              onClick={signOut}
              aria-label="Cerrar sesión"
              className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-destructive"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-[68px] items-center gap-4 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl sm:px-6">
          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            className="text-muted-foreground lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          <div className="flex min-w-0 items-center gap-2 text-xs">
            <span className="hidden truncate uppercase tracking-[0.18em] text-muted-foreground sm:inline">
              qsy.rip
            </span>
            <span className="hidden text-muted-foreground/50 sm:inline">/</span>
            <span className="truncate font-medium">{crumb}</span>
          </div>

          <nav className="ml-auto hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link to="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <Link to="/explore" className="transition-colors hover:text-foreground">
              Explorar
            </Link>
            <Link to="/templates" className="transition-colors hover:text-foreground">
              Plantillas
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-4">
            {profile && (
              <Button asChild size="sm" className="rounded-full">
                <Link to="/$username" params={{ username: profile.username }}>
                  Mi página <ChevronRight className="size-4" />
                </Link>
              </Button>
            )}
            <span
              aria-hidden
              className="grid size-9 place-items-center rounded-full border border-border/60 bg-card/60 text-muted-foreground"
            >
              <Bell className="size-4" />
            </span>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <Outlet />
        </main>

        <footer className="border-t border-border/60 px-4 py-6 text-center text-xs text-muted-foreground sm:px-8">
          © {new Date().getFullYear()} qsy.rip · UID {uid.toLocaleString("es-ES")} · Todos los derechos
          reservados.
        </footer>
      </div>
    </div>
  );
}
