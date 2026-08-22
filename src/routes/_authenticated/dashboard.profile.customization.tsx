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

      <Group label="Colores del biolink">
        <div className="grid gap-3 lg:grid-cols-2">
          <PaintField
            label="Nombre visible"
            sample={draft.display_name || "qsy"}
            angle={t.grad_angle ?? 90}
            color={t.color_name ?? "#ffffff"}
            color2={t.color_name_2 ?? "#c6f24e"}
            gradient={t.grad_name === true}
            onColor={(v) => setTheme("color_name", v)}
            onColor2={(v) => setTheme("color_name_2", v)}
            onGradient={(v) => setTheme("grad_name", v)}
          />
          <PaintField
            label="Usuario (@handle)"
            sample={`@${draft.display_name ? draft.display_name.toLowerCase() : "qsy"}`}
            angle={t.grad_angle ?? 90}
            color={t.color_username ?? "#a1a1aa"}
            color2={t.color_username_2 ?? "#ffffff"}
            gradient={t.grad_username === true}
            onColor={(v) => setTheme("color_username", v)}
            onColor2={(v) => setTheme("color_username_2", v)}
            onGradient={(v) => setTheme("grad_username", v)}
          />
          <PaintField
            label="Bio / descripción"
            sample="Bio"
            angle={t.grad_angle ?? 90}
            color={t.color_bio ?? "#e4e4e7"}
            color2={t.color_bio_2 ?? "#ffffff"}
            gradient={t.grad_bio === true}
            onColor={(v) => setTheme("color_bio", v)}
            onColor2={(v) => setTheme("color_bio_2", v)}
            onGradient={(v) => setTheme("grad_bio", v)}
          />
          <PaintField
            label="Visitas y likes"
            sample="0 visitas"
            angle={t.grad_angle ?? 90}
            color={t.color_stats ?? "#a1a1aa"}
            color2={t.color_stats_2 ?? "#ffffff"}
            gradient={t.grad_stats === true}
            onColor={(v) => setTheme("color_stats", v)}
            onColor2={(v) => setTheme("color_stats_2", v)}
            onGradient={(v) => setTheme("grad_stats", v)}
          />
          <PaintField
            label="Iconos de redes"
            sample="◆"
            angle={t.grad_angle ?? 90}
            color={t.color_icon ?? "#ffffff"}
            color2={t.color_icon_2 ?? "#c6f24e"}
            gradient={t.grad_icon === true}
            onColor={(v) => setTheme("color_icon", v)}
            onColor2={(v) => setTheme("color_icon_2", v)}
            onGradient={(v) => setTheme("grad_icon", v)}
          />
          <div className="space-y-3 rounded-xl border border-border/60 bg-surface-strong/30 p-3">
            <ColorField label="Accent / glow" value={t.accent} onChange={(v) => setTheme("accent", v)} />
            <ColorField
              label="Borde de la tarjeta"
              value={t.color_border ?? "#ffffff"}
              onChange={(v) => setTheme("color_border", v)}
            />
            <ColorField
              label="Fondo de iconos e insignias"
              value={t.color_icon_bg ?? "#ffffff"}
              onChange={(v) => setTheme("color_icon_bg", v)}
            />
          </div>
        </div>
        <div className="rounded-xl border border-border/60 bg-surface-strong/30 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Ángulo de los degradados</p>
            <span className="rounded-md border border-border px-2 py-1 font-mono text-xs">
              {t.grad_angle ?? 90}°
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            step={5}
            value={t.grad_angle ?? 90}
            onChange={(e) => setTheme("grad_angle", Number(e.target.value))}
            aria-label="Ángulo de los degradados"
            className="relative z-10 mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[var(--primary)]"
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
          <ToggleRow
            title="Tarjetas transparentes"
            description="Quita el fondo de las tarjetas de Discord y deja ver el fondo del perfil."
            checked={t.discord_transparent === true}
            onChange={(v) => setTheme("discord_transparent", v)}
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
