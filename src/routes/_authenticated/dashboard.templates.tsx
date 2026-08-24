import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { AdminCard, Empty, Pill } from "@/components/qsy/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TemplatePreview } from "@/components/qsy/template-preview";
import { supabase } from "@/integrations/supabase/client";
import { useMyProfile } from "@/lib/qsy-data";
import { applyTemplate, useApprovedTemplates, useMyTemplates } from "@/lib/community-templates";

export const Route = createFileRoute("/_authenticated/dashboard/templates")({
  component: DashboardTemplates,
});

const STATUS_UI: Record<string, { tone: string; label: string; icon: typeof Clock }> = {
  pending: { tone: "open", label: "En revisión", icon: Clock },
  approved: { tone: "ok", label: "Publicada", icon: CheckCircle2 },
  rejected: { tone: "danger", label: "Rechazada", icon: XCircle },
};

function DashboardTemplates() {
  const qc = useQueryClient();
  const { data: profile } = useMyProfile();
  const { data: mine } = useMyTemplates();
  const { data: community } = useApprovedTemplates();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function submitTemplate() {
    if (!profile) return;
    if (!name.trim()) {
      toast.error("Ponle un nombre a tu plantilla");
      return;
    }
    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from("community_templates").insert({
      user_id: auth.user!.id,
      author_name: profile.username,
      name: name.trim().slice(0, 60),
      description: description.trim().slice(0, 240),
      theme: profile.theme as never,
      source_profile_id: profile.id,
      preview_username: profile.username,
      status: "pending",
    });
    setSaving(false);
    if (error) {
      toast.error("No se pudo enviar", { description: error.message });
      return;
    }
    setName("");
    setDescription("");
    toast.success("Plantilla enviada", { description: "El equipo la revisará antes de publicarla." });
    void qc.invalidateQueries({ queryKey: ["community-templates"] });
  }

  async function remove(id: string) {
    await supabase.from("community_templates").delete().eq("id", id);
    void qc.invalidateQueries({ queryKey: ["community-templates"] });
  }

  async function apply(id: string, theme: Parameters<typeof applyTemplate>[2]) {
    if (!profile) return;
    try {
      await applyTemplate(id, profile.id, theme);
      toast.success("Plantilla aplicada a tu perfil");
      void qc.invalidateQueries({ queryKey: ["my-profile"] });
      void qc.invalidateQueries({ queryKey: ["community-templates"] });
    } catch (e) {
      toast.error("No se pudo aplicar", { description: (e as Error).message });
    }
  }

  return (
    <div className="space-y-5">
      <AdminCard
        title="Publica tu plantilla"
        desc="Enviamos el diseño actual de tu perfil a revisión. Si se aprueba, otros usuarios podrán usarlo."
      >
        {profile ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-3">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre de la plantilla"
                className="rounded-xl"
              />
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el estilo (colores, efectos, para quién es…)"
                className="min-h-24 rounded-xl"
              />
              <Button onClick={submitTemplate} disabled={saving}>
                {saving ? "Enviando…" : "Enviar a revisión"}
              </Button>
            </div>
            <div>
              <p className="mb-2 text-xs text-muted-foreground">Vista previa automática</p>
              <TemplatePreview theme={profile.theme} username={profile.username} />
            </div>
          </div>
        ) : (
          <Empty text="Crea un perfil antes de publicar plantillas." />
        )}
      </AdminCard>

      <AdminCard title="Mis plantillas" desc="Estado de tus envíos">
        {mine?.length ? (
          <ul className="space-y-2">
            {mine.map((t) => {
              const ui = STATUS_UI[t.status] ?? STATUS_UI["pending"]!;
              return (
                <li
                  key={t.id}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-surface px-4 py-3 text-xs"
                >
                  <Pill tone={ui.tone}>{ui.label}</Pill>
                  <span className="font-medium">{t.name}</span>
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">
                    {t.review_note || t.description || "—"}
                  </span>
                  <span className="text-muted-foreground">{t.uses} usos</span>
                  <button
                    onClick={() => remove(t.id)}
                    className="rounded-lg border border-border/60 px-2 py-1 text-[10px] text-muted-foreground hover:border-destructive/60 hover:text-destructive"
                  >
                    Eliminar
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty text="Aún no has enviado plantillas." />
        )}
      </AdminCard>

      <AdminCard
        title="Plantillas de la comunidad"
        desc="Aplica cualquier plantilla publicada a tu perfil activo"
      >
        {community?.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {community.map((t) => (
              <article key={t.id} className="rounded-2xl border border-border/60 bg-surface p-3">
                <TemplatePreview
                  theme={t.theme}
                  {...(t.preview_username ? { username: t.preview_username } : {})}
                />
                <h3 className="mt-3 text-sm font-medium">{t.name}</h3>
                <p className="text-xs text-muted-foreground">
                  por @{t.author_name || "anónimo"} · {t.uses} usos
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-3 w-full"
                  disabled={!profile}
                  onClick={() => apply(t.id, t.theme)}
                >
                  Aplicar a mi perfil
                </Button>
              </article>
            ))}
          </div>
        ) : (
          <Empty text="Todavía no hay plantillas publicadas." />
        )}
      </AdminCard>
    </div>
  );
}
