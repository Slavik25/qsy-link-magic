import { createFileRoute } from "@tanstack/react-router";
import {
  Group,
  OptionGrid,
  Panel,
  Pills,
  SaveBar,
  ShopEquipGrid,
  ToggleRow,
  useProfileDraft,
} from "@/components/qsy/profile-editor-ui";
import { SHOP_DECORATIONS, SHOP_PLAYERS, type DecorationDef, type PlayerDef } from "@/lib/shop";
import type { ThemeConfig } from "@/lib/qsy";

export const Route = createFileRoute("/_authenticated/dashboard/profile/effects")({
  component: EffectsSection,
  head: () => ({
    meta: [
      { title: "Effects & Media · Editor de perfil QSY" },
      { name: "description", content: "Music player, decoraciones de borde y animaciones interactivas." },
    ],
  }),
});

const VFX: { key: keyof ThemeConfig; title: string; description: string }[] = [
  { key: "vfx_cursor_trail", title: "Estela del cursor (Cursor Trail)", description: "Un rastro de luz sigue tu puntero." },
  { key: "vfx_glow_name", title: "Glow en el nombre", description: "Resalta tu nombre visible con un brillo neón." },
  { key: "vfx_glow_links", title: "Glow en los links", description: "Resalta tus redes y botones sociales." },
  { key: "vfx_glow_badges", title: "Glow en las medallas", description: "Efecto de brillo activo sobre las insignias." },
  { key: "vfx_sparkles", title: "Efecto de destellos (Sparkles)", description: "Pequeñas estrellas que brillan en el fondo." },
  { key: "vfx_mono_icons", title: "Iconos monocromáticos", description: "Muestra todos los iconos sociales en blanco y negro." },
  { key: "vfx_animated_title", title: "Título animado (Animated Title)", description: "El título de la página parpadea o rota con efectos." },
  { key: "vfx_invert_card", title: "Invertir colores de tarjeta", description: "Invierte los colores del card de tu perfil." },
  { key: "vfx_volume_control", title: "Control de volumen visible", description: "Muestra el botón de volumen del audio en tu perfil." },
];

function EffectsSection() {
  const { draft, setTheme, setThemeMany, save, saving } = useProfileDraft();
  const t = draft.theme;

  function equipPlayer(key: string) {
    const p = SHOP_PLAYERS.find((x) => x.key === key);
    if (!p) return;
    setThemeMany({
      player_key: p.key,
      player_type: p.player_type,
      player_bg: p.player_bg,
      ...(p.player_position ? { player_position: p.player_position } : {}),
    });
  }

  return (
    <Panel
      title="Effects & Media"
      description="Personaliza el Music Player, decoraciones de borde y animaciones interactivas."
    >
      <Group label="Reproductores de la tienda">
        <ShopEquipGrid
          items={SHOP_PLAYERS}
          activeKey={t.player_key ?? "player-default"}
          onEquip={equipPlayer}
          renderPreview={(item) => (
            <div
              className="flex h-24 w-full items-center gap-2 p-4"
              style={{ background: (item as PlayerDef).preview }}
            >
              <span className="size-8 rounded-lg bg-white/15" />
              <span className="h-1.5 flex-1 rounded-full bg-white/20" />
            </div>
          )}
        />
      </Group>

      <Group label="Decoraciones de avatar">
        <ShopEquipGrid
          items={SHOP_DECORATIONS}
          activeKey={t.avatar_decoration ?? "none"}
          onEquip={(key) => setTheme("avatar_decoration", key)}
          renderPreview={(item) => {
            const image = (item as DecorationDef).image;
            return (
              <div className="relative grid h-24 w-full place-items-center bg-surface-strong/40">
                <span className="grid size-12 place-items-center overflow-hidden rounded-full bg-surface-strong">
                  {draft.avatar_url ? (
                    <img src={draft.avatar_url} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="font-mono text-[10px] text-primary">QSY</span>
                  )}
                </span>
                {image && (
                  <img
                    src={image}
                    alt=""
                    loading="lazy"
                    className="pointer-events-none absolute left-1/2 top-1/2 w-[72px] max-w-none -translate-x-1/2 -translate-y-1/2 select-none"
                  />
                )}
              </div>
            );
          }}
        />
      </Group>

      <Group label="Music player type">
        <OptionGrid
          value={t.player_type ?? "default"}
          onChange={(v) => setTheme("player_type", v as ThemeConfig["player_type"])}
          options={[
            {
              id: "default",
              label: "Default",
              preview: (
                <span className="flex w-full items-center gap-2 rounded-md bg-surface-strong p-2">
                  <span className="size-5 rounded bg-muted" />
                  <span className="h-1.5 flex-1 rounded-full bg-muted" />
                </span>
              ),
            },
            {
              id: "minimal",
              label: "Minimal",
              preview: (
                <span className="flex w-full items-center gap-2 rounded-full bg-surface-strong px-2 py-1.5">
                  <span className="size-2 rounded-full bg-muted" />
                  <span className="h-1 flex-1 rounded-full bg-muted" />
                </span>
              ),
            },
            {
              id: "structured",
              label: "Structured",
              preview: (
                <span className="block w-full space-y-1 rounded-md bg-surface-strong p-2">
                  <span className="block h-6 rounded bg-muted" />
                  <span className="block h-1 rounded-full bg-muted" />
                </span>
              ),
            },
            {
              id: "text",
              label: "Text/Title",
              preview: (
                <span className="block w-full rounded-md border border-border px-2 py-1.5 text-[10px] text-muted-foreground">
                  Song Title – Artist
                </span>
              ),
            },
          ]}
        />
      </Group>

      <div className="grid gap-6 sm:grid-cols-2">
        <Group label="Player position">
          <Pills
            value={t.player_position ?? "bottom-center"}
            onChange={(v) => setTheme("player_position", v)}
            options={[
              { id: "top-left", label: "Top left" },
              { id: "top-center", label: "Top center" },
              { id: "top-right", label: "Top right" },
              { id: "bottom-left", label: "Bottom left" },
              { id: "bottom-center", label: "Bottom center" },
              { id: "bottom-right", label: "Bottom right" },
            ]}
          />
        </Group>
        <Group label="Player background">
          <Pills
            value={t.player_bg ?? "glass"}
            onChange={(v) => setTheme("player_bg", v as ThemeConfig["player_bg"])}
            options={[
              { id: "solid", label: "Solid" },
              { id: "glass", label: "Glass" },
              { id: "transparent", label: "Transparent" },
            ]}
          />
        </Group>
      </div>

      <Group label="Card border decoration">
        <OptionGrid
          columns={3}
          value={t.border_decoration ?? "none"}
          onChange={(v) => setTheme("border_decoration", v as ThemeConfig["border_decoration"])}
          options={[
            { id: "none", label: "None", preview: <span className="h-8 w-16 rounded-md bg-surface-strong" /> },
            {
              id: "scifi",
              label: "Sci-fi",
              preview: <span className="h-8 w-16 rounded-md border-2 border-primary/70" />,
            },
            {
              id: "cyberpunk",
              label: "Cyberpunk",
              preview: (
                <span className="h-8 w-16 border border-dashed border-fuchsia-500/80" />
              ),
            },
          ]}
        />
      </Group>

      <Group label="VFX toggles">
        <div className="space-y-2">
          {VFX.map((v) => (
            <ToggleRow
              key={v.key}
              title={v.title}
              description={v.description}
              checked={Boolean(t[v.key])}
              onChange={(checked) => setTheme(v.key, checked as never)}
            />
          ))}
        </div>
      </Group>

      <SaveBar onSave={save} saving={saving} />
    </Panel>
  );
}
