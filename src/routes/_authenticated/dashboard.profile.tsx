import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AssetUploader } from "@/components/qsy/asset-uploader";
import { supabase } from "@/integrations/supabase/client";
import { useMyProfile } from "@/lib/qsy-data";

type ProfileForm = z.infer<typeof schema>;


export const Route = createFileRoute("/_authenticated/dashboard/profile")({
  component: ProfileEditor,
});

const schema = z.object({
  username: z.string().trim().min(3).max(24).regex(/^[a-z0-9_]+$/, "Solo minúsculas, números y _"),
  display_name: z.string().trim().min(1, "Nombre requerido").max(60),
  bio: z.string().trim().max(200),
  location: z.string().trim().max(80),
  avatar_url: z.string().trim().max(500),
  banner_url: z.string().trim().max(500),
});

function ProfileEditor() {
  const { data: profile } = useMyProfile();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    username: "",
    display_name: "",
    bio: "",
    location: "",
    avatar_url: "",
    banner_url: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      username: profile.username,
      display_name: profile.display_name ?? "",
      bio: profile.bio ?? "",
      location: profile.location ?? "",
      avatar_url: profile.avatar_url ?? "",
      banner_url: profile.banner_url ?? "",
    });
  }, [profile]);

  async function save() {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("profiles").update(parsed.data).eq("id", profile!.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Perfil actualizado");
    void queryClient.invalidateQueries({ queryKey: ["my-profile"] });
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>

      <div className="space-y-4 rounded-2xl glass p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              maxLength={24}
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.toLowerCase() }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="display">Display name</Label>
            <Input id="display" maxLength={60} {...field("display_name")} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" maxLength={200} rows={3} {...field("bio")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" maxLength={80} placeholder="19 · Argentina · Multimedia" {...field("location")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <AssetUploader
            label="Foto de perfil"
            hint="PNG, JPG o GIF · máx. 8MB"
            accept="image/*"
            value={form.avatar_url}
            onChange={(url) => setForm((f) => ({ ...f, avatar_url: url }))}
          />
          <AssetUploader
            label="Banner"
            hint="Imagen ancha · máx. 10MB"
            accept="image/*"
            maxMb={10}
            value={form.banner_url}
            onChange={(url) => setForm((f) => ({ ...f, banner_url: url }))}
          />
        </div>

        <Button onClick={save} disabled={saving || !profile}>
          {saving ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}
