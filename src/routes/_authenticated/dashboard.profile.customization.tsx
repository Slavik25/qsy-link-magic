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
  useProfileDraft,
} from "@/components/qsy/profile-editor-ui";
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
  const { draft, set, setTheme, save, saving } = useProfileDraft();
  const t = draft.theme;

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
