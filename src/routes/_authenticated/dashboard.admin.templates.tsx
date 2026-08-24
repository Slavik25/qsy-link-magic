import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminCard, Empty, Pill } from "@/components/qsy/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TemplatePreview } from "@/components/qsy/template-preview";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/admin-data";
import { useTemplateQueue } from "@/lib/community-templates";

export const Route = createFileRoute("/_authenticated/dashboard/admin/templates")({
  component: AdminTemplates,
});

const TABS = ["pending", "approved", "rejected"] as const;
const LABEL: Record<string, string> = {
  pending: "Pendientes",
  approved: "Publicadas",
  rejected: "Rechazadas",
};
const TONE: Record<string, string> = { pending: "open", approved: "ok", rejected: "danger" };

function AdminTemplates() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<(typeof TABS)[number]>("pending");
  const [note, setNote] = useState<Record<string, string>>({});
  const { data: items } = useTemplateQueue(tab);

  async function decide(id: string, name: string, status: "approved" | "rejected") {
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("community_templates")
      .update({
        status,
        review_note: note[id] ?? "",
        reviewed_by: auth.user?.id ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) {
      toast.error("No se pudo actualizar", { description: error.message });
      return;
    }
    await logAdminAction(`template:${status}`, name, { id, note: note[id] ?? "" });
    toast.success(status === "approved" ? "Plantilla publicada" : "Plantilla rechazada");
    void qc.invalidateQueries({ queryKey: ["community-templates"] });
  }

  async function remove(id: string, name: string) {
    await supabase.from("community_templates").delete().eq("id", id);
    await logAdminAction("template:delete", name, { id });
    void qc.invalidateQueries({ queryKey: ["community-templates"] });
  }

  return (
    <AdminCard
      title="Plantillas de la comunidad"
      desc="Revisa, publica o rechaza los diseños enviados por los usuarios"
      action={
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg border px-2.5 py-1 text-[11px] transition-colors ${
                tab === t
                  ? "border-primary/60 bg-primary/15 text-primary"
                  : "border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {LABEL[t]}
            </button>
          ))}
        </div>
      }
    >
      {items?.length ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {items.map((t) => (
            <article key={t.id} className="rounded-2xl border border-border/60 bg-surface p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Pill tone={TONE[t.status] ?? "default"}>{LABEL[t.status]}</Pill>
                <span className="font-medium">{t.name}</span>
                <span className="text-muted-foreground">por @{t.author_name || "anónimo"}</span>
                <span className="ml-auto text-muted-foreground">{t.uses} usos</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{t.description || "Sin descripción."}</p>
              <div className="mt-3">
                <TemplatePreview
                  theme={t.theme}
                  {...(t.preview_username ? { username: t.preview_username } : {})}
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Input
                  value={note[t.id] ?? t.review_note}
                  onChange={(e) => setNote((n) => ({ ...n, [t.id]: e.target.value }))}
                  placeholder="Nota de revisión (opcional)"
                  className="h-9 min-w-40 flex-1 rounded-xl text-xs"
                />
                {t.status !== "approved" && (
                  <Button size="sm" onClick={() => decide(t.id, t.name, "approved")}>
                    Publicar
                  </Button>
                )}
                {t.status !== "rejected" && (
                  <Button size="sm" variant="secondary" onClick={() => decide(t.id, t.name, "rejected")}>
                    Rechazar
                  </Button>
                )}
                <button
                  onClick={() => remove(t.id, t.name)}
                  className="rounded-lg border border-border/60 px-2 py-1 text-[10px] text-muted-foreground hover:border-destructive/60 hover:text-destructive"
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty text="No hay plantillas en este estado." />
      )}
    </AdminCard>
  );
}
