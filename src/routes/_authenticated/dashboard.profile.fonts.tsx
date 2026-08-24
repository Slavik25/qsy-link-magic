import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Panel, SaveBar, useProfileDraft } from "@/components/qsy/profile-editor-ui";
import { PROFILE_FONTS, ensureFontLoaded, fontByKey } from "@/lib/fonts";

export const Route = createFileRoute("/_authenticated/dashboard/profile/fonts")({
  component: FontsSection,
  head: () => ({
    meta: [
      { title: "Tipografías · Editor de perfil QSY" },
      {
        name: "description",
        content: "Elige entre más de 20 tipografías gratuitas para tu biolink y ajusta grosor, espaciado y tamaño.",
      },
      { property: "og:title", content: "Tipografías · Editor de perfil QSY" },
      { property: "og:description", content: "Personaliza la tipografía de tu biolink QSY sin coste." },
    ],
  }),
});

const CATEGORIES = ["Sans", "Serif", "Display", "Mono", "Handwriting"] as const;

function FontsSection() {
  const { draft, setTheme, save, saving } = useProfileDraft();
  const t = draft.theme;
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number] | "Todas">("Todas");

  useEffect(() => {
    PROFILE_FONTS.forEach((f) => ensureFontLoaded(f.key));
  }, []);

  const fonts = useMemo(
    () => (filter === "Todas" ? PROFILE_FONTS : PROFILE_FONTS.filter((f) => f.category === filter)),
    [filter],
  );
  const active = fontByKey(t.font);

  return (
    <Panel
      title="Tipografías"
      description="Todas las fuentes son gratuitas para cualquier usuario. Elige una y ajusta su aspecto."
    >
      <div
        className="rounded-2xl border border-border/50 bg-surface-strong/30 p-6 text-center"
        style={{
          fontFamily: active.stack,
          fontWeight: t.font_weight ?? 600,
          letterSpacing: `${t.font_spacing ?? 0}em`,
        }}
      >
        <p className="text-xs uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "inherit" }}>
          Vista previa
        </p>
        <p className="mt-2 text-3xl" style={{ fontSize: `${2 * (t.font_scale ?? 1)}rem` }}>
          {draft.display_name || draft.username || "tu nombre"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">@{draft.username || "usuario"} · {active.name}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["Todas", ...CATEGORIES] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              filter === c
                ? "border-primary/60 bg-primary/15 text-foreground"
                : "border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {fonts.map((f) => {
          const selected = f.key === active.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setTheme("font", f.key)}
              className={`relative rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 ${
                selected ? "border-primary/70 bg-primary/10" : "border-border/60 bg-surface-strong/30"
              }`}
            >
              {selected && (
                <Check className="absolute right-2 top-2 size-4 text-primary" aria-label="Seleccionada" />
              )}
              <p className="truncate text-xl" style={{ fontFamily: f.stack }}>
                Aa Bb 123
              </p>
              <p className="mt-2 truncate text-xs font-medium">{f.name}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{f.category}</p>
            </button>
          );
        })}
      </div>

      <section className="space-y-5 rounded-2xl border border-border/50 bg-surface-strong/30 p-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Grosor</Label>
            <span className="rounded-md border border-border px-2 py-1 font-mono text-xs">
              {t.font_weight ?? 600}
            </span>
          </div>
          <Slider
            min={300}
            max={800}
            step={100}
            value={[t.font_weight ?? 600]}
            onValueChange={([v]) => setTheme("font_weight", v)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Espaciado entre letras</Label>
            <span className="rounded-md border border-border px-2 py-1 font-mono text-xs">
              {(t.font_spacing ?? 0).toFixed(2)}em
            </span>
          </div>
          <Slider
            min={-0.05}
            max={0.2}
            step={0.01}
            value={[t.font_spacing ?? 0]}
            onValueChange={([v]) => setTheme("font_spacing", v)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Escala del texto</Label>
            <span className="rounded-md border border-border px-2 py-1 font-mono text-xs">
              {(t.font_scale ?? 1).toFixed(2)}x
            </span>
          </div>
          <Slider
            min={0.85}
            max={1.3}
            step={0.05}
            value={[t.font_scale ?? 1]}
            onValueChange={([v]) => setTheme("font_scale", v)}
          />
        </div>
      </section>

      <SaveBar onSave={save} saving={saving} />
    </Panel>
  );
}
