import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { AssetUploader } from "@/components/qsy/asset-uploader";
import { ProfileView } from "@/components/qsy/profile-view";
import { supabase } from "@/integrations/supabase/client";
import { useLinks, useMyProfile, useSocials } from "@/lib/qsy-data";
import { TEMPLATES, defaultTheme, type ThemeConfig } from "@/lib/qsy";

export const Route = createFileRoute("/_authenticated/dashboard/appearance")({
  component: AppearanceEditor,
  head: () => ({
    meta: [
      { title: "Customize · Dashboard QSY" },
      {
        name: "description",
        content: "Personaliza tu biolink QSY: fondo, audio, pantalla de entrada, colores y efectos.",
      },
    ],
  }),
});

function AppearanceEditor() {
  const { data: profile } = useMyProfile();
  const { data: links = [] } = useLinks(profile?.id);
  const { data: socials = [] } = useSocials(profile?.id);
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setTheme({ ...defaultTheme, ...profile.theme });
  }, [profile]);

  const set = <K extends keyof ThemeConfig>(key: K, value: ThemeConfig[K]) =>
    setTheme((t) => ({ ...t, [key]: value }));

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ theme }).eq("id", profile!.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Apariencia guardada");
    void queryClient.invalidateQueries({ queryKey: ["my-profile"] });
  }

  const sliders: { key: keyof ThemeConfig; label: string; max: number }[] = [
    { key: "blur", label: "Blur de las tarjetas", max: 40 },
    { key: "opacity", label: "Opacidad de las tarjetas", max: 100 },
    { key: "radius", label: "Redondeo de bordes", max: 32 },
    { key: "glow", label: "Intensidad del glow", max: 100 },
    { key: "overlay", label: "Oscurecer el fondo", max: 100 },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Customize</h1>
          <p className="text-sm text-muted-foreground">
            Tu perfil, tus reglas. Sube tus propios archivos y ajústalo a tu gusto.
          </p>
        </header>

        <section className="rounded-2xl glass p-6">
          <h2 className="text-sm font-medium">Assets</h2>
          <p className="text-xs text-muted-foreground">
            Archivos que subes tú: se guardan en tu cuenta y se muestran en tu perfil público.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <AssetUploader
              label="Fondo"
              hint="Imagen o vídeo · máx. 15MB"
              accept="image/*,video/mp4,video/webm"
              maxMb={15}
              value={theme.background}
              onChange={(url) => {
                setTheme((t) => ({
                  ...t,
                  background: url,
                  background_type: /\.(mp4|webm)(\?|$)/i.test(url) ? "video" : "image",
                }));
              }}
            />
            <AssetUploader
              label="Audio de fondo"
              hint="MP3 u OGG · máx. 10MB"
              accept="audio/*"
              maxMb={10}
              preview="audio"
              value={theme.audio_url ?? ""}
              onChange={(url) => set("audio_url", url)}
            />
          </div>
          <div className="mt-3 space-y-2">
            <Label htmlFor="bg-url">…o pega una URL de fondo</Label>
            <Input
              id="bg-url"
              maxLength={500}
              value={theme.background}
              placeholder="https://…"
              onChange={(e) => set("background", e.target.value)}
            />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl glass p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium">Pantalla de entrada</h2>
              <p className="text-xs text-muted-foreground">
                Muestra un &ldquo;click to enter&rdquo; antes de revelar tu perfil (y activa tu audio).
              </p>
            </div>
            <Switch
              checked={!!theme.entry_enabled}
              onCheckedChange={(v) => set("entry_enabled", v)}
              aria-label="Activar pantalla de entrada"
            />
          </div>
          {theme.entry_enabled && (
            <div className="space-y-2">
              <Label htmlFor="entry-text">Texto de entrada</Label>
              <Input
                id="entry-text"
                maxLength={60}
                value={theme.entry_text ?? ""}
                placeholder="click to enter..."
                onChange={(e) => set("entry_text", e.target.value)}
              />
            </div>
          )}
        </section>

        <section className="rounded-2xl glass p-6">
          <h2 className="text-sm font-medium">Template</h2>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme((p) => ({ ...p, template: t.id, accent: t.accent }))}
                className={`rounded-xl border p-3 text-left text-xs transition-colors ${
                  theme.template === t.id ? "border-primary bg-surface-strong" : "border-border"
                }`}
              >
                <span className="block size-4 rounded-full" style={{ background: t.accent }} />
                <span className="mt-2 block">{t.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-5 rounded-2xl glass p-6">
          <div className="space-y-2">
            <Label htmlFor="accent">Color de acento</Label>
            <div className="flex gap-2">
              <input
                id="accent"
                type="color"
                value={theme.accent}
                onChange={(e) => set("accent", e.target.value)}
                className="h-9 w-12 cursor-pointer rounded-md border border-border bg-transparent"
              />
              <Input value={theme.accent} maxLength={9} onChange={(e) => set("accent", e.target.value)} />
            </div>
          </div>

          {sliders.map((s) => (
            <div key={s.key} className="space-y-2">
              <div className="flex justify-between text-sm">
                <Label>{s.label}</Label>
                <span className="text-muted-foreground">{(theme[s.key] as number) ?? 0}</span>
              </div>
              <Slider
                value={[(theme[s.key] as number) ?? 0]}
                max={s.max}
                step={1}
                onValueChange={([v]) => set(s.key, v as never)}
              />
            </div>
          ))}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipografía</Label>
              <div className="flex gap-2">
                {["inter", "mono"].map((f) => (
                  <Button
                    key={f}
                    size="sm"
                    variant={theme.font === f ? "default" : "secondary"}
                    onClick={() => set("font", f)}
                  >
                    {f === "inter" ? "Inter" : "Mono"}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Efectos</Label>
              <div className="flex gap-2">
                {["none", "grain", "glow"].map((f) => (
                  <Button
                    key={f}
                    size="sm"
                    variant={theme.effects === f ? "default" : "secondary"}
                    onClick={() => set("effects", f)}
                  >
                    {f}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={save} disabled={!profile || saving} className="rounded-xl">
            {saving ? "Guardando…" : "Guardar apariencia"}
          </Button>
        </section>
      </div>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        <p className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">Preview en vivo</p>
        <div
          className="overflow-hidden rounded-2xl"
          style={
            theme.background && theme.background_type !== "video"
              ? {
                  backgroundImage: `linear-gradient(rgb(8 8 8 / ${(theme.overlay ?? 70) / 100}), rgb(8 8 8 / ${(theme.overlay ?? 70) / 100})), url(${theme.background})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          {profile && (
            <ProfileView
              compact
              profile={{ ...profile, theme }}
              links={links.filter((l) => l.active)}
              socials={socials}
              views={profile.view_count}
              music={profile.music as { title?: string; artist?: string }}
            />
          )}
        </div>
      </aside>
    </div>
  );
}
