import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AssetUploader } from "@/components/qsy/asset-uploader";
import { Panel, SaveBar, useProfileDraft } from "@/components/qsy/profile-editor-ui";
import { useUploadLimits } from "@/lib/upload-limits";
import { detectEmbed, prettyTrackName, splitTrackName } from "@/lib/media";

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
  const { limit, boosted, rank } = useUploadLimits();
  const t = draft.theme;

  return (
    <Panel
      title="Assets"
      description={
        boosted
          ? `Haz clic o arrastra archivos para subirlos. Con ${rank === "seraph" ? "Seraph" : "Obsidian"} tus límites están ampliados: fondos hasta ${limit(15)}MB y audios hasta ${limit(10)}MB.`
          : `Haz clic o arrastra archivos para subirlos. Fondos hasta ${limit(15)}MB, audios hasta ${limit(10)}MB. Con Obsidian o Seraph los límites se multiplican.`
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <AssetUploader
          label="Avatar"
          hint={`PNG, JPG o GIF · máx. ${limit(8)}MB`}
          accept="image/*"
          maxMb={limit(8)}
          value={draft.avatar_url}
          onChange={(url) => set("avatar_url", url)}
        />
        <AssetUploader
          label="Banner"
          hint={`Imagen ancha · máx. ${limit(10)}MB`}
          accept="image/*"
          maxMb={limit(10)}
          value={draft.banner_url}
          onChange={(url) => set("banner_url", url)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <AssetUploader
          label="Background"
          hint={`Imagen o vídeo · máx. ${limit(15)}MB`}
          accept="image/*,video/mp4,video/webm"
          maxMb={limit(15)}
          value={t.background}
          onChange={(url) => {
            setTheme("background", url);
            setTheme("background_type", /\.(mp4|webm)(\?|$)/i.test(url) ? "video" : "image");
          }}
        />
        <AssetUploader
          label="Audio"
          hint={`MP3 u OGG · máx. ${limit(10)}MB`}
          accept="audio/*"
          maxMb={limit(10)}
          preview="audio"
          value={t.audio_url ?? ""}
          onChange={(url) => setTheme("audio_url", url)}
          onFileName={(name) => {
            const parsed = splitTrackName(prettyTrackName(name));
            setTheme("audio_title", parsed.title);
            if (parsed.artist) setTheme("audio_artist", parsed.artist);
          }}
        />
        <AssetUploader
          label="Cursor"
          hint={`PNG o CUR · máx. ${limit(2)}MB`}
          accept="image/png,image/*"
          maxMb={limit(2)}
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
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Música · MP3, YouTube, Spotify, SoundCloud o Apple Music
            </Label>
            <Input
              value={t.audio_url ?? ""}
              maxLength={500}
              placeholder="https://open.spotify.com/track/… · https://youtu.be/… · https://…/cancion.mp3"
              onChange={(e) => {
                const v = e.target.value;
                setTheme("audio_url", v);
                if (v && !detectEmbed(v) && !t.audio_title) {
                  const parsed = splitTrackName(prettyTrackName(v));
                  setTheme("audio_title", parsed.title);
                  if (parsed.artist) setTheme("audio_artist", parsed.artist);
                }
              }}
            />
            {detectEmbed(t.audio_url) && (
              <p className="text-[11px] text-primary">
                Detectado: {detectEmbed(t.audio_url)?.provider} · se mostrará el reproductor de la
                plataforma en tu biolink.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Título de la canción
            </Label>
            <Input
              value={t.audio_title ?? ""}
              maxLength={120}
              placeholder="Se detecta del archivo subido…"
              onChange={(e) => setTheme("audio_title", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Artista</Label>
            <Input
              value={t.audio_artist ?? ""}
              maxLength={120}
              placeholder="Artista o autor"
              onChange={(e) => setTheme("audio_artist", e.target.value)}
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
