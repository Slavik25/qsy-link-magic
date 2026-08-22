import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ColorField,
  Group,
  OptionGrid,
  Panel,
  Pills,
  SaveBar,
  ShopEquipGrid,
  ToggleRow,
  useProfileDraft,
} from "@/components/qsy/profile-editor-ui";
import {
  SHOP_BG_EFFECTS,
  SHOP_LAYOUTS,
  SHOP_NAME_STYLES,
  bgEffectByEffect,
  nameStyleByEffect,
  type BgEffectDef,
  type LayoutDef,
  type NameStyleDef,
} from "@/lib/shop";
import type { ThemeConfig } from "@/lib/qsy";

export const Route = createFileRoute("/_authenticated/dashboard/profile/customization")({
  component: CustomizationSection,
  head: () => ({
    meta: [
      { title: "Customization · Editor de perfil QSY" },
      { name: "description", content: "Colores, formas, ancho y estilo general de tu tarjeta pública." },
    ],
  }),
});

const SHAPES = [
  { id: "circle", label: "Círculo", radius: "9999px" },
  { id: "rounded", label: "Redondeado", radius: "14px" },
  { id: "square", label: "Cuadrado", radius: "2px" },
  { id: "hexagon", label: "Hexágono", radius: "6px" },
];

const WIDTHS = [
  { id: "compact", label: "Compacto", w: 22 },
  { id: "normal", label: "Normal", w: 34 },
  { id: "wide", label: "Amplio", w: 46 },
];

function CustomizationSection() {
  const { draft, set, setTheme, setThemeMany, save, saving } = useProfileDraft();
  const t = draft.theme;

  function equipLayout(key: string) {
    const l = SHOP_LAYOUTS.find((x) => x.key === key);
    if (!l) return;
    setThemeMany({
      layout_key: l.key,
      template: l.template,
      profile_width: l.profile_width,
      avatar_shape: l.avatar_shape,
      ...(l.card_bg_type ? { card_bg_type: l.card_bg_type } : {}),
      ...(l.show_card !== undefined ? { show_card: l.show_card } : {}),
    });
  }

  return (
    <Panel
      title="Customization"
      description="Diseña tu tarjeta pública: colores, formas, ancho y estilo general."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Nombre visible
          </Label>
          <Input
            maxLength={60}
            value={draft.display_name}
            onChange={(e) => set("display_name", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Ubicación / país
          </Label>
          <Input
            maxLength={80}
            placeholder="19 · Argentina · Multimedia"
            value={draft.location}
            onChange={(e) => set("location", e.target.value)}
          />
        </div>
      </div>

      <Group label="Layouts">
        <ShopEquipGrid
          items={SHOP_LAYOUTS}
          activeKey={t.layout_key ?? "layout-glass"}
          onEquip={equipLayout}
          renderPreview={(item) => (
            <div className="h-24 w-full" style={{ background: (item as LayoutDef).preview }} />
          )}
        />
      </Group>

      <Group label="Estilo del nombre de usuario">
        <ShopEquipGrid
          items={SHOP_NAME_STYLES}
          activeKey={nameStyleByEffect(t.username_effect)?.key ?? "name-none"}
          onEquip={(key) => {
            const s = SHOP_NAME_STYLES.find((x) => x.key === key);
            if (s) setTheme("username_effect", s.effect);
          }}
          renderPreview={(item) => (
            <div
              className="grid h-24 w-full place-items-center bg-black/40"
              style={{ ["--p-accent" as string]: t.accent }}
            >
              <span
                className={`text-xl font-bold ${
                  (item as NameStyleDef).effect === "none"
                    ? ""
                    : `qsy-name-${(item as NameStyleDef).effect}`
                }`}
              >
                {draft.display_name || "qsy"}
              </span>
            </div>
          )}
        />
      </Group>

      <Group label="Efecto de fondo">
        <ShopEquipGrid
          items={SHOP_BG_EFFECTS}
          activeKey={bgEffectByEffect(t.bg_effect)?.key ?? "bg-none"}
          onEquip={(key) => {
            const b = SHOP_BG_EFFECTS.find((x) => x.key === key);
            if (b) setTheme("bg_effect", b.effect);
          }}
          renderPreview={(item) => (
            <div
              className="relative h-24 w-full overflow-hidden"
              style={{ background: (item as BgEffectDef).preview }}
            >
              {(item as BgEffectDef).effect !== "none" && (
                <span
                  aria-hidden
                  className={`absolute inset-0 qsy-bg-${(item as BgEffectDef).effect}`}
                  style={{ position: "absolute" }}
                />
              )}
            </div>
          )}
        />
      </Group>

      <Group label="Forma del avatar">
        <OptionGrid
          value={t.avatar_shape ?? "circle"}
          onChange={(v) => setTheme("avatar_shape", v as ThemeConfig["avatar_shape"])}
          options={SHAPES.map((s) => ({
            id: s.id,
            label: s.label,
            preview: (
              <span
                className="size-7"
                style={{ background: t.accent, borderRadius: s.radius }}
                aria-hidden
              />
            ),
          }))}
        />
      </Group>

      <Group label="Ancho del perfil">
        <OptionGrid
          columns={3}
          value={t.profile_width ?? "normal"}
          onChange={(v) => setTheme("profile_width", v as ThemeConfig["profile_width"])}
          options={WIDTHS.map((w) => ({
            id: w.id,
            label: w.label,
            preview: (
              <span
                className="h-6 rounded-md border border-border"
                style={{ width: w.w }}
                aria-hidden
              />
            ),
          }))}
        />
      </Group>

      <Group label="Tarjeta del perfil">
        <ToggleRow
          title="Mostrar cuadro de la tarjeta"
          description="Desactívalo para eliminar el recuadro y dejar el contenido flotando sobre el fondo."
          checked={t.show_card !== false}
          onChange={(v) => setTheme("show_card", v)}
        />
      </Group>

      <Group label="Tipo de fondo (card)">
        <Pills
          value={t.card_bg_type ?? "solid"}
          onChange={(v) => setTheme("card_bg_type", v as ThemeConfig["card_bg_type"])}
          options={[
            { id: "solid", label: "Solid" },
            { id: "gradient", label: "Gradient" },
            { id: "image", label: "Image" },
            { id: "video", label: "Video" },
            { id: "transparent", label: "Transparent" },
          ]}
        />
      </Group>

      <Group label="Transparencia del layout">
        <div className="rounded-xl border border-border bg-card/40 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Opacidad del fondo del layout</p>
              <p className="text-xs text-muted-foreground">
                Baja el valor para que el layout se vuelva transparente y se vea el fondo del perfil.
              </p>
            </div>
            <span className="rounded-md border border-border px-2 py-1 font-mono text-xs">
              {t.card_bg_type === "transparent" ? 0 : (t.card_alpha ?? 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={t.card_bg_type === "transparent" ? 0 : (t.card_alpha ?? 100)}
            onChange={(e) => {
              const v = Number(e.target.value);
              setThemeMany({
                card_alpha: v,
                card_bg_type:
                  v === 0 ? "transparent" : t.card_bg_type === "transparent" ? "solid" : (t.card_bg_type ?? "solid"),
                ...(t.show_card === false ? { show_card: true } : {}),
              });
            }}
            className="relative z-10 mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[var(--primary)]"
            aria-label="Opacidad del fondo del layout"
          />
          <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
            <span>Transparente</span>
            <span>Sólido</span>
          </div>
        </div>
      </Group>

      <Group label="Colores de tarjeta">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ColorField
            label="Primary text"
            value={t.color_text ?? "#ffffff"}
            onChange={(v) => setTheme("color_text", v)}
          />
          <ColorField label="Accent / glow" value={t.accent} onChange={(v) => setTheme("accent", v)} />
          <ColorField
            label="Icon color"
            value={t.color_icon ?? "#ffffff"}
            onChange={(v) => setTheme("color_icon", v)}
          />
          <ColorField
            label="Card border"
            value={t.color_border ?? "#ffffff"}
            onChange={(v) => setTheme("color_border", v)}
          />
        </div>
      </Group>

      <Group label="Discord">
        <div className="space-y-4 rounded-xl border border-border bg-card/40 p-4">
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Mi perfil de Discord (ID de usuario)
            </Label>
            <Input
              maxLength={25}
              inputMode="numeric"
              placeholder="Ej. 302189582391443456"
              value={t.discord_id ?? ""}
              onChange={(e) => setTheme("discord_id", e.target.value.replace(/\D/g, ""))}
            />
            <p className="text-[11px] text-muted-foreground">
              Muestra tu avatar, estado y actividad en el biolink (requiere estar en el servidor de Lanyard).
            </p>
          </div>
          <ToggleRow
            title="Mostrar mi perfil de Discord"
            description="Tarjeta con tu estado en vivo dentro del biolink."
            checked={t.discord_show_profile !== false}
            onChange={(v) => setTheme("discord_show_profile", v)}
          />
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Mi servidor de Discord (ID del servidor)
            </Label>
            <Input
              maxLength={25}
              inputMode="numeric"
              placeholder="Ej. 913293848392010283"
              value={t.discord_server_id ?? ""}
              onChange={(e) => setTheme("discord_server_id", e.target.value.replace(/\D/g, ""))}
            />
            <p className="text-[11px] text-muted-foreground">
              Muestra nombre, miembros en línea y botón para unirse (activa el widget del servidor en Discord).
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Invitación del servidor (para mostrar el logo)
            </Label>
            <Input
              maxLength={80}
              placeholder="Ej. https://discord.gg/qsy"
              value={t.discord_invite ?? ""}
              onChange={(e) => setTheme("discord_invite", e.target.value.trim())}
            />
            <p className="text-[11px] text-muted-foreground">
              Pega un enlace de invitación permanente: de ahí obtenemos el icono real del servidor.
            </p>
          </div>
          <ToggleRow
            title="Mostrar mi servidor"
            description="Tarjeta de invitación al servidor en el biolink."
            checked={t.discord_show_server !== false}
            onChange={(v) => setTheme("discord_show_server", v)}
          />
        </div>
      </Group>

      <div className="space-y-2">
        <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Bio descriptiva
        </Label>
        <Textarea
          rows={4}
          maxLength={200}
          value={draft.bio}
          placeholder="Bienvenido a mi página personal QSY."
          onChange={(e) => set("bio", e.target.value)}
        />
      </div>

      <SaveBar onSave={save} saving={saving} />
    </Panel>
  );
}
