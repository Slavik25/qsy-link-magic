import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  Activity,
  Crown,
  Flag,
  Gauge,
  ScrollText,
  Gift,
  Image as ImageIcon,
  KeyRound,
  LayoutTemplate,
  Mail,
  MessageSquareWarning,
  Rocket,
  ShieldAlert,
  ShieldBan,
  Users,
} from "lucide-react";
import { useIsAdmin } from "@/lib/admin-data";

export const Route = createFileRoute("/_authenticated/dashboard/admin")({
  component: AdminLayout,
});

const TABS = [
  { to: "/dashboard/admin", label: "Resumen", icon: Gauge, exact: true },
  { to: "/dashboard/admin/users", label: "Usuarios", icon: Users },
  { to: "/dashboard/admin/moderation", label: "Moderación", icon: ShieldBan },
  { to: "/dashboard/admin/reports", label: "Reportes", icon: Flag },
  { to: "/dashboard/admin/ranks", label: "Rangos", icon: Crown },
  { to: "/dashboard/admin/audit", label: "Auditoría", icon: ScrollText },
  { to: "/dashboard/admin/security", label: "Seguridad", icon: ShieldAlert },
  { to: "/dashboard/admin/chat", label: "Chat", icon: MessageSquareWarning },
  { to: "/dashboard/admin/content", label: "Contenido", icon: ImageIcon },
  { to: "/dashboard/admin/templates", label: "Plantillas", icon: LayoutTemplate },
  { to: "/dashboard/admin/status", label: "Servicios", icon: Activity },
  { to: "/dashboard/admin/boosts", label: "Boosts", icon: Rocket },
  { to: "/dashboard/admin/shop", label: "Tienda", icon: Gift },
  { to: "/dashboard/admin/emails", label: "Emails", icon: Mail },
  { to: "/dashboard/admin/integrations", label: "Integraciones", icon: KeyRound },
] as const;

function AdminLayout() {
  const { data: isAdmin, isLoading } = useIsAdmin();

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center text-sm text-muted-foreground">
        Verificando permisos…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-destructive/40 bg-destructive/5 p-10 text-center">
        <ShieldAlert className="mx-auto size-10 text-destructive" />
        <h1 className="mt-4 text-xl font-bold">Acceso restringido</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Esta sección es exclusiva del equipo administrador de QSY.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-xl border border-border/70 px-4 py-2 text-sm hover:bg-surface-strong"
        >
          Volver al dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="qsy-pop overflow-hidden rounded-3xl border border-primary/40 bg-gradient-to-r from-primary/20 via-card/60 to-card/30 p-6 backdrop-blur-xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          <ShieldAlert className="size-3" /> Panel de administración
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Control total de <span className="text-gradient-violet">QSY</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Usuarios, analíticas, moderación, seguridad y servicios en un solo lugar.
        </p>
      </header>

      <nav className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            activeOptions={{ exact: !!(t as { exact?: boolean }).exact }}
            activeProps={{ className: "border-primary/60 bg-primary/15 text-foreground" }}
            className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/40 px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <t.icon className="size-3.5" />
            {t.label}
          </Link>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}
