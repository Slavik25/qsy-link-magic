import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AssetUploader } from "@/components/qsy/asset-uploader";
import { Panel, SaveBar, useProfileDraft } from "@/components/qsy/profile-editor-ui";

export const Route = createFileRoute("/_authenticated/dashboard/profile/")({
  component: AssetsSection,
  head: () => ({
    meta: [
      { title: "Assets · Editor de perfil QSY" },
      { name: "description", content: "Sube avatar, banner, fondo, audio y cursor para tu biolink QSY." },
    ],
  }),
});

function AssetsSection() {
  const { draft, set, setTheme, save, saving } = useProfileDraft();
  const t = draft.theme;

  return (
    <Panel
      title="Assets"
      description="Haz clic o arrastra archivos para subirlos. Fondos hasta 15MB, audios hasta 10MB."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <AssetUploader
          label="Avatar"
          hint="PNG, JPG o GIF · máx. 8MB"
          accept="image/*"
          value={draft.avatar_url}
          onChange={(url) => set("avatar_url", url)}
        />
        <AssetUploader
          label="Banner"
          hint="Imagen ancha · máx. 10MB"
          accept="image/*"
          maxMb={10}
          value={draft.banner_url}
          onChange={(url) => set("banner_url", url)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <AssetUploader
          label="Background"
          hint="Imagen o vídeo · máx. 15MB"
          accept="image/*,video/mp4,video/webm"
          maxMb={15}
          value={t.background}
          onChange={(url) => {
            setTheme("background", url);
            setTheme("background_type", /\.(mp4|webm)(\?|$)/i.test(url) ? "video" : "image");
          }}
        />
        <AssetUploader
          label="Audio"
          hint="MP3 u OGG · máx. 10MB"
          accept="audio/*"
          maxMb={10}
          preview="audio"
          value={t.audio_url ?? ""}
          onChange={(url) => setTheme("audio_url", url)}
        />
        <AssetUploader
          label="Cursor"
          hint="PNG o CUR · máx. 2MB"
          accept="image/png,image/*"
          maxMb={2}
          value={t.cursor_url ?? ""}
          onChange={(url) => setTheme("cursor_url", url)}
        />
      </div>

      <div className="space-y-4">
        <p className="text-sm font-semibold">URLs de Assets</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Avatar URL</Label>
            <Input
              value={draft.avatar_url}
              maxLength={500}
              placeholder="Pega enlace directo de imagen (Avatar)…"
              onChange={(e) => set("avatar_url", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Banner URL</Label>
            <Input
              value={draft.banner_url}
              maxLength={500}
              placeholder="Pega enlace directo de imagen (Banner)…"
              onChange={(e) => set("banner_url", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Background URL
            </Label>
            <Input
              value={t.background}
              maxLength={500}
              placeholder="Pega enlace directo de vídeo o imagen (Fondo)…"
              onChange={(e) => setTheme("background", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Audio URL</Label>
            <Input
              value={t.audio_url ?? ""}
              maxLength={500}
              placeholder="Pega enlace directo de audio (MP3)…"
              onChange={(e) => setTheme("audio_url", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Cursor URL</Label>
            <Input
              value={t.cursor_url ?? ""}
              maxLength={500}
              placeholder="Pega enlace directo de cursor (cur/png)…"
              onChange={(e) => setTheme("cursor_url", e.target.value)}
            />
          </div>
        </div>
      </div>

      <SaveBar onSave={save} saving={saving} />
    </Panel>
  );
}
