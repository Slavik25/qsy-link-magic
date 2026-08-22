import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { AdminCard, Empty } from "@/components/qsy/admin-ui";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction, timeAgo } from "@/lib/admin-data";

export const Route = createFileRoute("/_authenticated/dashboard/admin/reports")({
  component: AdminReports,
});

type ReportRow = {
  id: string;
  message_id: string | null;
  message_text: string;
  message_author_id: string | null;
  message_author_name: string;
  reporter_name: string;
  reason: string;
  note: string;
  status: string;
  created_at: string;
};

const TABS = [
  { key: "pending", label: "Pendientes" },
  { key: "resolved", label: "Resueltos" },
  { key: "dismissed", label: "Descartados" },
] as const;

function AdminReports() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("pending");

  const { data: reports, isLoading } = useQuery({
    queryKey: ["chat-reports", tab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_reports")
        .select(
          "id, message_id, message_text, message_author_id, message_author_name, reporter_name, reason, note, status, created_at",
        )
        .eq("status", tab)
        .order("created_at", { ascending: false })
        .limit(150);
      if (error) throw error;
      return (data ?? []) as ReportRow[];
    },
    refetchInterval: 15000,
  });

  function refresh() {
    void qc.invalidateQueries({ queryKey: ["chat-reports"] });
    void qc.invalidateQueries({ queryKey: ["global-chat"] });
  }

  async function setStatus(report: ReportRow, status: "resolved" | "dismissed") {
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("chat_reports")
      .update({ status, resolved_by: auth.user?.id ?? null, resolved_at: new Date().toISOString() })
      .eq("id", report.id);
    if (error) {
      toast.error("No se pudo actualizar", { description: error.message });
      return;
    }
    await logAdminAction(`report:${status}`, report.id);
    toast.success(status === "resolved" ? "Reporte resuelto" : "Reporte descartado");
    refresh();
  }

  async function deleteMessage(report: ReportRow) {
    if (report.message_id) {
      const { error } = await supabase.from("global_chat_messages").delete().eq("id", report.message_id);
      if (error) {
        toast.error("No se pudo borrar el mensaje", { description: error.message });
        return;
      }
    }
    await logAdminAction("chat:delete", report.message_id ?? report.id);
    await setStatus(report, "resolved");
  }

  return (
    <AdminCard
      title="Cola de moderación del chat"
      desc="Mensajes reportados por la comunidad, listos para revisar"
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
              tab === t.key
                ? "border-primary/60 bg-primary/15 text-primary"
                : "border-border/60 text-muted-foreground hover:border-primary/40"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Cargando reportes…</p>
      ) : reports?.length ? (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border/60 bg-surface p-4">
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span className="rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 font-medium text-destructive">
                  {r.reason}
                </span>
                <span>
                  reportado por <span className="text-foreground">@{r.reporter_name}</span>
                </span>
                <span>· {timeAgo(r.created_at)}</span>
                <span>· {new Date(r.created_at).toLocaleString("es-ES")}</span>
              </div>
              <p className="mt-2 break-words rounded-xl bg-card/60 px-3 py-2 text-sm">
                <span className="font-medium">@{r.message_author_name}:</span> {r.message_text}
              </p>
              {r.note && <p className="mt-1 text-[11px] text-muted-foreground">Nota: {r.note}</p>}

              {tab === "pending" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="destructive" onClick={() => deleteMessage(r)}>
                    <Trash2 className="mr-1.5 size-3.5" /> Eliminar mensaje
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setStatus(r, "resolved")}>
                    <Check className="mr-1.5 size-3.5" /> Marcar resuelto
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setStatus(r, "dismissed")}>
                    <X className="mr-1.5 size-3.5" /> Descartar
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Empty text="No hay reportes en esta bandeja." />
      )}
    </AdminCard>
  );
}
