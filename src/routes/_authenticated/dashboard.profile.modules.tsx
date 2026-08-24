import { createFileRoute } from "@tanstack/react-router";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { detectEmbed } from "@/lib/media";
import type { MediaItem } from "@/lib/qsy";
import { Panel, SaveBar, ToggleRow, useProfileDraft } from "@/components/qsy/profile-editor-ui";
import { ProfileStreak } from "@/components/qsy/profile-streak";

const STREAK_POSITIONS = [
  { value: "stats", label: "Junto a las estadísticas" },
  { value: "under-name", label: "Debajo del nombre" },
  { value: "top-left", label: "Esquina superior izq." },
  { value: "top-right", label: "Esquina superior der." },
  { value: "bottom", label: "Al final de la tarjeta" },
] as const;

const STREAK_STYLES = [
  { value: "plain", label: "Simple" },
  { value: "chip", label: "Chip" },
  { value: "pill", label: "Píldora" },
  { value: "glow", label: "Glow" },
  { value: "badge", label: "Badge" },
] as const;

export const Route = createFileRoute("/_authenticated/dashboard/profile/modules")({
  component: ModulesSection,
  head: () => ({
    meta: [
      { title: "Modules · Editor de perfil QSY" },
      { name: "description", content: "Activa contador de visitas, likes, pantalla de inicio y mensajes." },
    ],
  }),
});

function ModulesSection() {
  const { draft, setTheme, save, saving } = useProfileDraft();
  const t = draft.theme;
  const messages = t.typewriter ?? [];
  const media = t.media ?? [];

  const setMedia = (i: number, patch: Partial<MediaItem>) =>
    setTheme("media", media.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));

  const setMessage = (i: number, value: string) =>
    setTheme("typewriter", messages.map((m, idx) => (idx === i ? value : m)));

  return (
    <Panel
      title="Modules"
      description="Controla los componentes de tu perfil y añade bloques de contenido interactivos."
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ToggleRow
          title="Contador de Visitas"
          description="Muestra las vistas en tu bio."
          checked={t.show_views !== false}
          onChange={(v) => setTheme("show_views", v)}
        />
        <ToggleRow
          title="Mostrar Likes"
          description="Muestra los likes que recibes."
          checked={t.show_likes !== false}
          onChange={(v) => setTheme("show_likes", v)}
        />
        <ToggleRow
          title="Widget de racha (gratis)"
          description="Muestra tus días seguidos entrando a QSY."
          checked={Boolean(t.show_streak)}
          onChange={(v) => setTheme("show_streak", v)}
        />
      </div>

      {t.show_streak && (
        <section className="space-y-4 rounded-2xl border border-border/50 bg-surface-strong/30 p-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em]">Widget de racha</h2>

          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Posición</Label>
            <div className="flex flex-wrap gap-2">
              {STREAK_POSITIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setTheme("streak_position", o.value)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    (t.streak_position ?? "stats") === o.value
                      ? "border-primary/60 bg-primary/15 text-foreground"
                      : "border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Estilo</Label>
            <div className="flex flex-wrap gap-2">
              {STREAK_STYLES.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setTheme("streak_style", o.value)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    (t.streak_style ?? "plain") === o.value
                      ? "border-primary/60 bg-primary/15 text-foreground"
                      : "border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <ToggleRow
            title="Mostrar el número de días"
            description="Si lo desactivas solo se verá si tu racha está activa o apagada."
            checked={t.streak_show_count !== false}
            onChange={(v) => setTheme("streak_show_count", v)}
          />

          <div className="flex items-center justify-center rounded-xl border border-border/50 bg-background/40 p-4">
            <ProfileStreak userId="preview" accent={t.accent} theme={t} previewDays={12} />
          </div>
        </section>
      )}

      <ToggleRow
        title="Pantalla de Inicio (Start Screen)"
        description="Muestra una pantalla de bienvenida antes de mostrar el perfil."
        checked={Boolean(t.entry_enabled)}
        onChange={(v) => setTheme("entry_enabled", v)}
      />

      {t.entry_enabled && (
        <div className="space-y-2">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Texto de la pantalla de inicio
          </Label>
          <Input
            maxLength={60}
            placeholder="Click to enter"
            value={t.entry_text ?? ""}
            onChange={(e) => setTheme("entry_text", e.target.value)}
          />
        </div>
      )}

      <section className="space-y-3 rounded-2xl border border-border/50 bg-surface-strong/30 p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em]">Typewriter messages</h2>
        <p className="text-xs text-muted-foreground">
          Mensajes animados que rotan por la descripción del perfil.
        </p>

        {messages.length === 0 ? (
          <p className="text-xs italic text-muted-foreground">No tienes mensajes programados aún.</p>
        ) : (
          <div className="space-y-2">
            {messages.map((m, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  maxLength={80}
                  value={m}
                  placeholder="Escribe un mensaje…"
                  onChange={(e) => setMessage(i, e.target.value)}
                />
                <Button
                  variant="secondary"
                  size="icon"
                  aria-label="Eliminar mensaje"
                  className="shrink-0 rounded-xl"
                  onClick={() => setTheme("typewriter", messages.filter((_, idx) => idx !== i))}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button
          variant="secondary"
          className="w-full rounded-xl"
          onClick={() => setTheme("typewriter", [...messages, ""])}
        >
          <Plus className="size-4" /> Añadir Mensaje
        </Button>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/50 bg-surface-strong/30 p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em]">Música y vídeos</h2>
        <p className="text-xs text-muted-foreground">
          Pega enlaces de YouTube, Spotify, SoundCloud o Apple Music y se mostrarán como
          reproductores dentro de tu biolink.
        </p>

        {media.length === 0 ? (
          <p className="text-xs italic text-muted-foreground">Todavía no añadiste ningún medio.</p>
        ) : (
          <div className="space-y-3">
            {media.map((m, i) => {
              const embed = detectEmbed(m.url);
              return (
                <div key={i} className="space-y-2 rounded-xl border border-border/50 p-3">
                  <div className="flex gap-2">
                    <Input
                      value={m.url}
                      placeholder="https://open.spotify.com/track/… o https://youtu.be/…"
                      onChange={(e) => setMedia(i, { url: e.target.value })}
                    />
                    <Button
                      variant="secondary"
                      size="icon"
                      aria-label="Eliminar medio"
                      className="shrink-0 rounded-xl"
                      onClick={() => setTheme("media", media.filter((_, idx) => idx !== i))}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                  <Input
                    maxLength={60}
                    value={m.title ?? ""}
                    placeholder="Título (opcional)"
                    onChange={(e) => setMedia(i, { title: e.target.value })}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    {m.url
                      ? embed
                        ? `Detectado: ${embed.provider}`
                        : "Enlace no soportado todavía."
                      : "Pega un enlace para previsualizarlo."}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <Button
          variant="secondary"
          className="w-full rounded-xl"
          onClick={() => setTheme("media", [...media, { url: "" }])}
        >
          <Plus className="size-4" /> Añadir música o vídeo
        </Button>
      </section>

      <SaveBar onSave={save} saving={saving} />
    </Panel>
  );
}
