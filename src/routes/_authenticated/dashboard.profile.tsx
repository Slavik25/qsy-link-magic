import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  ArrowLeft,
  Cog,
  Link2,
  LayoutGrid,
  Palette,
  Share2,
  Sparkles,
  Upload,
} from "lucide-react";
import { useMyProfile } from "@/lib/qsy-data";

export const Route = createFileRoute("/_authenticated/dashboard/profile")({
  component: ProfileEditorLayout,
});

const SECTIONS = [
  { to: "/dashboard/profile", label: "Assets", icon: Upload, exact: true },
  { to: "/dashboard/profile/customization", label: "Customization", icon: Palette },
  { to: "/dashboard/profile/effects", label: "Effects", icon: Sparkles },
  { to: "/dashboard/profile/connections", label: "Connections", icon: Link2 },
  { to: "/dashboard/profile/modules", label: "Modules", icon: LayoutGrid },
  { to: "/dashboard/profile/share", label: "Compartir", icon: Share2 },
  { to: "/dashboard/profile/advanced", label: "Advanced", icon: Cog },
] as const;

function ProfileEditorLayout() {
  const { data: profile } = useMyProfile();

  return (
    <div className="grid gap-6 lg:grid-cols-[248px_1fr]">
      <aside className="h-fit rounded-2xl border border-border/60 bg-card/40 p-4 backdrop-blur-xl lg:sticky lg:top-6">
        <div className="flex items-center gap-3 border-b border-border/50 pb-4">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={`Avatar de ${profile.username}`}
              className="size-9 rounded-full object-cover"
            />
          ) : (
            <span className="grid size-9 place-items-center rounded-full bg-surface-strong font-mono text-xs font-bold text-primary">
              {(profile?.username ?? "qs").slice(0, 2).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">@{profile?.username ?? "qsy"}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Activo</p>
          </div>
        </div>

        <nav className="mt-4 space-y-1">
          {SECTIONS.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              activeOptions={{ exact: "exact" in s ? s.exact : false }}
              activeProps={{ className: "border-border/70 bg-surface-strong text-foreground" }}
              inactiveProps={{ className: "border-transparent text-muted-foreground" }}
              className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors hover:text-foreground"
            >
              <s.icon className="size-4" />
              {s.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/dashboard/profiles"
          className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-border/60 px-3 py-2.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Volver a Perfiles
        </Link>
      </aside>

      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
