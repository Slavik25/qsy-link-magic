import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  ExternalLink,
  Gem,
  HelpCircle,
  LayoutGrid,
  Link2,
  LogOut,
  Medal,
  Music4,
  Palette,
  Search,
  Settings,
  Share2,
  Sparkles,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { QsyLogo } from "@/components/qsy/logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useMyProfile } from "@/lib/qsy-data";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardLayout,
});

const accountNav = [
  { to: "/dashboard", label: "Overview", exact: true },
  { to: "/dashboard/analytics", label: "Analytics" },
  { to: "/dashboard/badges", label: "Badges" },
  { to: "/dashboard/profile", label: "Perfil" },
  { to: "/dashboard/settings", label: "Settings" },
] as const;

const mainNav = [
  { to: "/dashboard/appearance", label: "Customize", icon: Palette },
  { to: "/dashboard/links", label: "Links", icon: Link2 },
  { to: "/dashboard/socials", label: "Socials", icon: Share2 },
  { to: "/dashboard/music", label: "Music", icon: Music4 },
  { to: "/dashboard/premium", label: "Premium", icon: Gem },
  { to: "/templates", label: "Templates", icon: Sparkles },
] as const;

function DashboardLayout() {
  const { data: profile } = useMyProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(true);

  const q = query.trim().toLowerCase();
  const filteredAccount = useMemo(
    () => accountNav.filter((i) => !q || i.label.toLowerCase().includes(q)),
    [q],
  );
  const filteredMain = useMemo(
    () => mainNav.filter((i) => !q || i.label.toLowerCase().includes(q)),
    [q],
  );

  const uid = profile ? parseInt(profile.id.replace(/\D/g, "").slice(0, 7) || "0", 10) : 0;

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
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="flex flex-col gap-6 border-b border-border/60 bg-card/40 p-4 backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <QsyLogo />
          </Link>
          {profile && (
            <Button asChild size="icon" variant="ghost" aria-label="Ver mi página">
              <Link to="/$username" params={{ username: profile.username }}>
                <ExternalLink className="size-4" />
              </Link>
            </Button>
          )}
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar funciones..."
            className="h-10 w-full rounded-xl border border-border/60 bg-background/60 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60"
          />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {filteredAccount.length > 0 && (
            <>
              <button
                onClick={() => setAccountOpen((v) => !v)}
                className="flex w-full items-center gap-2 rounded-xl bg-primary/12 px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-primary/20"
              >
                <UserRound className="size-4 text-primary" />
                Account
                <ChevronDown
                  className={`ml-auto size-4 transition-transform ${accountOpen ? "" : "-rotate-90"}`}
                />
              </button>
              {accountOpen && (
                <div className="mt-1 space-y-0.5 pl-9">
                  {filteredAccount.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      activeOptions={{ exact: "exact" in item ? item.exact : false }}
                      activeProps={{ className: "text-foreground" }}
                      className="block rounded-lg py-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="pt-2">
            {filteredMain.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{ className: "bg-surface-strong text-foreground" }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-surface-strong/60 hover:text-foreground"
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="space-y-3">
          <div className="rounded-2xl border border-border/60 bg-background/50 p-3">
            <p className="text-[13px] font-medium leading-snug">
              ¿Tienes dudas o necesitas ayuda?
            </p>
            <Button asChild size="sm" variant="secondary" className="mt-2 w-full rounded-xl">
              <a href="mailto:soporte@qsy.rip">
                <HelpCircle className="size-4" /> Centro de ayuda
              </a>
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">Mira tu página</p>
            {profile && (
              <Button asChild size="sm" className="mt-2 w-full rounded-xl">
                <Link to="/$username" params={{ username: profile.username }}>
                  <ExternalLink className="size-4" /> Mi página
                </Link>
              </Button>
            )}
          </div>

          <Button onClick={share} variant="secondary" className="w-full rounded-xl">
            <Share2 className="size-4" /> Compartir mi perfil
          </Button>

          <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/50 p-2.5">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={`Avatar de ${profile.username}`}
                className="size-9 rounded-full object-cover"
              />
            ) : (
              <span className="grid size-9 place-items-center rounded-full bg-surface-strong font-mono text-[11px] font-bold text-primary">
                {(profile?.username ?? "qs").slice(0, 2).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{profile?.username ?? "…"}</p>
              <p className="truncate text-[10px] text-muted-foreground">
                UID {uid.toLocaleString("es-ES")}
              </p>
            </div>
            <button
              onClick={signOut}
              aria-label="Cerrar sesión"
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-8 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export { LayoutGrid, BarChart3, Medal };
