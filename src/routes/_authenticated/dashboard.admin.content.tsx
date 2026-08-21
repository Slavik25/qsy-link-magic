import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminCard, Empty, Pill } from "@/components/qsy/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction, timeAgo, useAdminTable } from "@/lib/admin-data";
import { BADGES } from "@/lib/badges";
import { TEMPLATES } from "@/lib/qsy";

export const Route = createFileRoute("/_authenticated/dashboard/admin/content")({
  component: AdminContent,
});

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  tag: string;
  cover_url: string | null;
  published: boolean;
  created_at: string;
};
type BadgeRow = { id: string; profile_id: string; badge_key: string; created_at: string };

function AdminContent() {
  const qc = useQueryClient();
  const { data: posts } = useAdminTable<Post>("devblog_posts");
  const { data: granted } = useAdminTable<BadgeRow>("profile_badges");
  const [draft, setDraft] = useState({ title: "", excerpt: "", body: "", tag: "update" });

  async function createPost() {
    if (!draft.title.trim()) return;
    const slug = draft.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const { error } = await supabase.from("devblog_posts").insert({ ...draft, slug, published: true });
    if (error) {
      toast.error("No se pudo publicar", { description: error.message });
      return;
    }
    await logAdminAction("devblog:create", slug);
    toast.success("Publicación creada");
    setDraft({ title: "", excerpt: "", body: "", tag: "update" });
    void qc.invalidateQueries({ queryKey: ["admin-table", "devblog_posts"] });
  }

  async function togglePublish(p: Post) {
    await supabase.from("devblog_posts").update({ published: !p.published }).eq("id", p.id);
    void qc.invalidateQueries({ queryKey: ["admin-table", "devblog_posts"] });
  }

  async function removePost(id: string) {
    await supabase.from("devblog_posts").delete().eq("id", id);
    void qc.invalidateQueries({ queryKey: ["admin-table", "devblog_posts"] });
  }

  async function revokeBadge(id: string) {
    await supabase.from("profile_badges").delete().eq("id", id);
    await logAdminAction("badge:revoke", id);
    void qc.invalidateQueries({ queryKey: ["admin-table", "profile_badges"] });
  }

  return (
    <div className="space-y-5">
      <AdminCard title="Devblog" desc="Publica novedades y decoraciones de la plataforma">
        <div className="grid gap-2 sm:grid-cols-2">
          <Input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="Título"
            className="rounded-xl text-xs"
          />
          <Input
            value={draft.tag}
            onChange={(e) => setDraft({ ...draft, tag: e.target.value })}
            placeholder="Etiqueta (update, fix, feature)"
            className="rounded-xl text-xs"
          />
          <Input
            value={draft.excerpt}
            onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
            placeholder="Resumen corto"
            className="rounded-xl text-xs sm:col-span-2"
          />
          <Textarea
            value={draft.body}
            onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            placeholder="Contenido de la publicación…"
            className="min-h-28 rounded-xl text-xs sm:col-span-2"
          />
        </div>
        <Button size="sm" className="mt-3" onClick={createPost}>
          Publicar
        </Button>

        <div className="mt-4 space-y-2">
          {posts?.length ? (
            posts.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-surface px-4 py-3 text-xs"
              >
                <Pill tone={p.published ? "ok" : "default"}>{p.published ? "Público" : "Borrador"}</Pill>
                <span className="font-medium">{p.title}</span>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{p.excerpt}</span>
                <span className="text-[10px] text-muted-foreground">{timeAgo(p.created_at)}</span>
                <Button size="sm" variant="secondary" onClick={() => togglePublish(p)}>
                  {p.published ? "Ocultar" : "Publicar"}
                </Button>
                <button
                  onClick={() => removePost(p.id)}
                  className="rounded-lg border border-border/60 p-1.5 text-muted-foreground hover:border-destructive/60 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))
          ) : (
            <Empty text="Todavía no hay publicaciones." />
          )}
        </div>
      </AdminCard>

      <AdminCard title="Insignias otorgadas" desc="Revoca insignias asignadas a perfiles">
        {granted?.length ? (
          <div className="flex flex-wrap gap-2">
            {granted.map((g) => (
              <button
                key={g.id}
                onClick={() => revokeBadge(g.id)}
                title="Click para revocar"
                className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-surface px-3 py-2 text-[11px] hover:border-destructive/60 hover:text-destructive"
              >
                {BADGES.find((b) => b.key === g.badge_key)?.name ?? g.badge_key} ✕
              </button>
            ))}
          </div>
        ) : (
          <Empty text="Sin insignias otorgadas." />
        )}
      </AdminCard>

      <AdminCard title="Diseños y galería" desc="Plantillas disponibles para los biolinks">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <div
              key={t.id}
              className="qsy-pop rounded-2xl border border-border/60 bg-surface p-4 transition-colors hover:border-primary/40"
            >
              <div
                className="h-20 rounded-xl border border-border/50"
                style={{ background: `linear-gradient(135deg, ${t.accent}55, #0a0713)` }}
              />
              <p className="mt-3 text-xs font-semibold">{t.name}</p>
              <p className="text-[11px] text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}
