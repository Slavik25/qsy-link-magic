import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  ExternalLink,
  LayoutGrid,
  Link2,
  LogOut,
  Music4,
  Palette,
  Settings,
  Share2,
  UserRound,
} from "lucide-react";
import { QsyLogo } from "@/components/qsy/logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useMyProfile } from "@/lib/qsy-data";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardLayout,
});

const nav = [
  { to: "/dashboard", label: "Overview", icon: LayoutGrid, exact: true },
  { to: "/dashboard/profile", label: "Profile", icon: UserRound },
  { to: "/dashboard/links", label: "Links", icon: Link2 },
  { to: "/dashboard/socials", label: "Socials", icon: Share2 },
  { to: "/dashboard/appearance", label: "Appearance", icon: Palette },
  { to: "/dashboard/music", label: "Music", icon: Music4 },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

function DashboardLayout() {
  const { data: profile } = useMyProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-border/60 p-4 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between">
          <Link to="/">
            <QsyLogo />
          </Link>
          {profile && (
            <Button asChild size="sm" variant="ghost">
              <Link to="/$username" params={{ username: profile.username }}>
                <ExternalLink className="size-4" />
              </Link>
            </Button>
          )}
        </div>

        <nav className="mt-6 flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: "exact" in item ? item.exact : false }}
              activeProps={{ className: "bg-surface-strong text-foreground" }}
              className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 hidden lg:block">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-8 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
}
