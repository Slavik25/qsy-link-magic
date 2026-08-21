import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useLinks, useMyProfile } from "@/lib/qsy-data";
import type { ProfileLink } from "@/lib/qsy";

export const Route = createFileRoute("/_authenticated/dashboard/links")({
  component: LinksEditor,
});

const schema = z.object({
  title: z.string().trim().min(1, "Título requerido").max(60),
  url: z.string().trim().url("URL inválida").max(500),
  icon: z.string().trim().max(24),
});

function LinksEditor() {
  const { data: profile } = useMyProfile();
  const { data: links = [] } = useLinks(profile?.id);
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState({ title: "", url: "", icon: "link" });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["links", profile?.id] });

  async function add() {
    const parsed = schema.safeParse(draft);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }
    const { error } = await supabase.from("links").insert({
      ...parsed.data,
      profile_id: profile!.id,
      position: links.length,
      active: true,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setDraft({ title: "", url: "", icon: "link" });
    void refresh();
  }

  async function update(link: ProfileLink, patch: Partial<ProfileLink>) {
    const { error } = await supabase.from("links").update(patch).eq("id", link.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    void refresh();
  }

  async function remove(link: ProfileLink) {
    const { error } = await supabase.from("links").delete().eq("id", link.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    void refresh();
  }

  async function move(index: number, dir: -1 | 1) {
    const a = links[index];
    const b = links[index + dir];
    if (!a || !b) return;
    await Promise.all([
      supabase.from("links").update({ position: b.position }).eq("id", a.id),
      supabase.from("links").update({ position: a.position }).eq("id", b.id),
    ]);
    void refresh();
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Links</h1>

      <div className="space-y-3 rounded-2xl glass p-6">
        <div className="grid gap-3 sm:grid-cols-[1fr_1.4fr_auto]">
          <div className="space-y-2">
            <Label htmlFor="t">Título</Label>
            <Input id="t" maxLength={60} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="u">URL</Label>
            <Input id="u" maxLength={500} placeholder="https://" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} />
          </div>
          <div className="flex items-end">
            <Button onClick={add} disabled={!profile}>
              <Plus className="size-4" /> Añadir
            </Button>
          </div>
        </div>
      </div>

      <ul className="space-y-3">
        {links.map((l, i) => (
          <li key={l.id} className="flex flex-wrap items-center gap-3 rounded-2xl glass p-4">
            <div className="flex flex-col gap-1">
              <button aria-label="Subir" onClick={() => move(i, -1)} className="text-muted-foreground hover:text-foreground">
                <ArrowUp className="size-4" />
              </button>
              <button aria-label="Bajar" onClick={() => move(i, 1)} className="text-muted-foreground hover:text-foreground">
                <ArrowDown className="size-4" />
              </button>
            </div>
            <Input
              className="w-40"
              maxLength={60}
              defaultValue={l.title}
              onBlur={(e) => e.target.value !== l.title && update(l, { title: e.target.value.slice(0, 60) })}
            />
            <Input
              className="min-w-0 flex-1"
              maxLength={500}
              defaultValue={l.url}
              onBlur={(e) => e.target.value !== l.url && update(l, { url: e.target.value.slice(0, 500) })}
            />
            <Switch checked={l.active} onCheckedChange={(v) => update(l, { active: v })} aria-label="Activo" />
            <button aria-label="Eliminar" onClick={() => remove(l)} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
        {links.length === 0 && (
          <li className="rounded-2xl glass p-6 text-sm text-muted-foreground">
            Aún no tienes links. Añade el primero arriba.
          </li>
        )}
      </ul>
    </div>
  );
}
