import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Monitor, Music2, Gamepad2 } from "lucide-react";
import { SiSteam, SiTwitch, SiRoblox } from "react-icons/si";
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
        icon={<Gamepad2 className="size-4 text-sky-400" />}
        title="Gaming Modules"
        description="Muestra tarjetas en vivo de Steam, Twitch y Roblox en tu bio: avatar, estado y estadísticas."
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#66c0f4]">
              <SiSteam className="size-3.5" /> Steam
            </span>
            <Input
              maxLength={64}
              placeholder="Vanity URL o SteamID64 (ej. gaben)"
              value={t.steam_id ?? ""}
              onChange={(e) => setTheme("steam_id", e.target.value.trim())}
            />
          </div>
          <div className="space-y-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9146ff]">
              <SiTwitch className="size-3.5" /> Twitch
            </span>
            <Input
              maxLength={40}
              placeholder="Usuario de Twitch"
              value={t.twitch_user ?? ""}
              onChange={(e) => setTheme("twitch_user", e.target.value.trim())}
            />
          </div>
          <div className="space-y-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#e2231a]">
              <SiRoblox className="size-3.5" /> Roblox
            </span>
            <Input
              maxLength={40}
              placeholder="Usuario o ID de Roblox"
              value={t.roblox_user ?? ""}
              onChange={(e) => setTheme("roblox_user", e.target.value.trim())}
            />
          </div>
        </div>
        <ToggleRow
          title="Mostrar módulos de gaming"
          description="Activa o desactiva las tarjetas en tu perfil público."
          checked={t.gaming_enabled !== false}
          onChange={(v) => setTheme("gaming_enabled", v)}
        />
        <ToggleRow
          title="Estilo transparente"
          description="Quita el fondo y el borde de las tarjetas."
          checked={Boolean(t.gaming_transparent)}
          onChange={(v) => setTheme("gaming_transparent", v)}
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
