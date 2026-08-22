import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Eye, MessagesSquare } from "lucide-react";
import { AdminCard, Empty } from "@/components/qsy/admin-ui";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { timeAgo } from "@/lib/admin-data";

export const Route = createFileRoute("/_authenticated/dashboard/admin/audit")({
  component: AdminAudit,
});

type AuditRow = {
  id: string;
  kind: string;
  action: string;
  actor_name: string;
  actor_user_id: string | null;
  source: string;
  ip: string | null;
  user_agent: string | null;
  detail: Record<string, unknown> | null;
  created_at: string;
};

const FILTERS = [
  { key: "all", label: "Todo" },
  { key: "shop", label: "Tienda" },
  { key: "role", label: "Roles" },
  { key: "counter", label: "Contadores" },
  { key: "like", label: "Likes" },
  { key: "view", label: "Visitas" },
  { key: "chat", label: "Chat" },
] as const;


function AdminAudit() {
  const [kind, setKind] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [q, setQ] = useState("");

  const { data: rows, isLoading } = useQuery({
    queryKey: ["audit-events", kind],
    queryFn: async () => {
      let query = supabase
        .from("audit_events")
        .select("id, kind, action, actor_name, actor_user_id, source, ip, user_agent, detail, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (kind !== "all") query = query.eq("kind", kind);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as AuditRow[];
    },
    refetchInterval: 20000,
  });

  const filtered = (rows ?? []).filter((r) => {
    const needle = q.trim().toLowerCase();
    if (!needle) return true;
    return (
      r.actor_name.toLowerCase().includes(needle) ||
      (r.ip ?? "").includes(needle) ||
      r.action.toLowerCase().includes(needle)
    );
  });

  return (
    <AdminCard
      title="Historial de auditoría"
      desc="Cada visita registrada y cada mensaje del chat, con fecha, origen y usuario"
      action={
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar usuario, IP o acción…"
          className="h-9 w-56"
        />
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setKind(f.key)}
            className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
              kind === f.key
                ? "border-primary/60 bg-primary/15 text-primary"
                : "border-border/60 text-muted-foreground hover:border-primary/40"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {(() => {
        const alerts = (rows ?? []).filter(
          (r) =>
            r.action.includes("blocked") ||
            r.action.includes("rejected") ||
            r.action === "price_mismatch_detected",
        );
        if (!alerts.length) return null;
        return (
          <div className="mb-4 rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            <strong>{alerts.length}</strong> alerta(s) de manipulación detectadas (precios, monedas o
            permisos). Último intento: {alerts[0]?.actor_name ?? "—"} — {alerts[0]?.action ?? "—"}.

          </div>
        );
      })()}

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Cargando historial…</p>
      ) : filtered.length ? (

        <div className="space-y-2">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-start gap-3 rounded-2xl border border-border/60 bg-surface px-4 py-3"
            >
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                {r.kind === "chat" ? (
                  <MessagesSquare className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-medium">@{r.actor_name}</span>{" "}
                  <span className="text-muted-foreground">{r.action}</span>
                </p>
                <p className="mt-0.5 break-all text-[11px] text-muted-foreground">
                  {new Date(r.created_at).toLocaleString("es-ES")} · {timeAgo(r.created_at)} ·{" "}
                  origen {r.source} · IP {r.ip ?? "desconocida"}
                </p>
                {r.detail && Object.keys(r.detail).length > 0 && (
                  <p className="mt-1 break-all font-mono text-[10px] text-muted-foreground/80">
                    {JSON.stringify(r.detail)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty text="Sin eventos registrados todavía." />
      )}
    </AdminCard>
  );
}
