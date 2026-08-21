import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Monitor, Music2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Panel, SaveBar, ToggleRow, useProfileDraft } from "@/components/qsy/profile-editor-ui";

export const Route = createFileRoute("/_authenticated/dashboard/profile/connections")({
  component: ConnectionsSection,
  head: () => ({
    meta: [
      { title: "Connections · Editor de perfil QSY" },
      { name: "description", content: "Vincula Discord, Spotify y overlays de vídeo a tu bio-web QSY." },
    ],
  }),
});

function Block({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-border/50 bg-surface-strong/30 p-5">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
      {children}
    </section>
  );
}

function ConnectionsSection() {
  const { draft, setTheme, save, saving } = useProfileDraft();
  const t = draft.theme;

  return (
    <Panel
      title="Connections"
      description="Vincula cuentas e integra estados interactivos a tu bio-web."
    >
      <Block
        icon={<MessageCircle className="size-4 text-indigo-400" />}
        title="Discord Rich Presence"
        description="Ingresa tu Discord ID numérico para renderizar tu actividad en vivo en tu perfil público."
      >
        <Input
          maxLength={40}
          placeholder="Ej. 302189582391443456"
          value={t.discord_id ?? ""}
          onChange={(e) => setTheme("discord_id", e.target.value.replace(/\D/g, ""))}
        />
        <ToggleRow
          title="Usar avatar de Discord"
          description="Reemplaza tu avatar con el de Discord automáticamente."
          checked={Boolean(t.discord_avatar)}
          onChange={(v) => setTheme("discord_avatar", v)}
        />
        <ToggleRow
          title="Decoración de avatar Discord"
          description="Muestra la decoración de avatar de Discord en tu perfil."
          checked={Boolean(t.discord_decoration)}
          onChange={(v) => setTheme("discord_decoration", v)}
        />
      </Block>

      <Block
        icon={<Music2 className="size-4 text-emerald-400" />}
        title="Spotify Integration"
        description="Muestra la música que estás escuchando en tiempo real en tu bio."
      >
        <Input
          maxLength={60}
          placeholder="Username de Spotify…"
          value={t.spotify_user ?? ""}
          onChange={(e) => setTheme("spotify_user", e.target.value)}
        />
      </Block>

      <Block
        icon={<Monitor className="size-4 text-primary" />}
        title="Video Overlay URL"
        description="URL de un vídeo o GIF que se superpone encima del fondo del perfil."
      >
        <Input
          maxLength={500}
          placeholder="https://cdn.qsy.rip/overlay.webm"
          value={t.video_overlay ?? ""}
          onChange={(e) => setTheme("video_overlay", e.target.value)}
        />
      </Block>

      <SaveBar onSave={save} saving={saving} />
    </Panel>
  );
}
