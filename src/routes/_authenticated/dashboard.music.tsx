import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useMyProfile } from "@/lib/qsy-data";

export const Route = createFileRoute("/_authenticated/dashboard/music")({
  component: MusicEditor,
});

const schema = z.object({
  title: z.string().trim().max(80),
  artist: z.string().trim().max(80),
  url: z.string().trim().max(500),
});

function MusicEditor() {
  const { data: profile } = useMyProfile();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: "", artist: "", url: "" });

  useEffect(() => {
    if (!profile) return;
    const m = profile.music as { title?: string; artist?: string; url?: string };
    setForm({ title: m.title ?? "", artist: m.artist ?? "", url: m.url ?? "" });
  }, [profile]);

  async function save() {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }
    const { error } = await supabase.from("profiles").update({ music: parsed.data }).eq("id", profile!.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Música actualizada");
    void queryClient.invalidateQueries({ queryKey: ["my-profile"] });
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Music</h1>
      <div className="space-y-4 rounded-2xl glass p-6">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input id="title" maxLength={80} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="artist">Artista</Label>
          <Input id="artist" maxLength={80} value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="url">Enlace (Spotify, YouTube…)</Label>
          <Input id="url" maxLength={500} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
        </div>
        <Button onClick={save} disabled={!profile}>
          Guardar
        </Button>
      </div>
    </div>
  );
}
