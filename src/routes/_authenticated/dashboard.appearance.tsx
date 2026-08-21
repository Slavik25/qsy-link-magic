import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ProfileView } from "@/components/qsy/profile-view";
import { supabase } from "@/integrations/supabase/client";
import { useLinks, useMyProfile, useSocials } from "@/lib/qsy-data";
import { TEMPLATES, defaultTheme, type ThemeConfig } from "@/lib/qsy";

export const Route = createFileRoute("/_authenticated/dashboard/appearance")({
  component: AppearanceEditor,
});

function AppearanceEditor() {
  const { data: profile } = useMyProfile();
  const { data: links = [] } = useLinks(profile?.id);
  const { data: socials = [] } = useSocials(profile?.id);
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);

  useEffect(() => {
    if (profile) setTheme(profile.theme);
  }, [profile]);

  const set = <K extends keyof ThemeConfig>(key: K, value: ThemeConfig[K]) =>
    setTheme((t) => ({ ...t, [key]: value }));

  async function save() {
    const { error } = await supabase.from("profiles").update({ theme }).eq("id", profile!.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Apariencia guardada");
    void queryClient.invalidateQueries({ queryKey: ["my-profile"] });
  }

  const sliders: { key: keyof ThemeConfig; label: string; max: number }[] = [
    { key: "blur", label: "Blur", max: 40 },
    { key: "opacity", label: "Opacity", max: 100 },
    { key: "radius", label: "Border radius", max: 32 },
    { key: "glow", label: "Glow", max: 100 },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Appearance</h1>

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
          <div className="grid gap-4 sm:grid-cols-2">
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
            <div className="space-y-2">
              <Label htmlFor="bg">Background (URL)</Label>
              <Input
                id="bg"
                maxLength={500}
                value={theme.background}
                onChange={(e) => set("background", e.target.value)}
                placeholder="https://…"
              />
            </div>
          </div>

          {sliders.map((s) => (
            <div key={s.key} className="space-y-2">
              <div className="flex justify-between text-sm">
                <Label>{s.label}</Label>
                <span className="text-muted-foreground">{theme[s.key] as number}</span>
              </div>
              <Slider
                value={[theme[s.key] as number]}
                max={s.max}
                step={1}
                onValueChange={([v]) => set(s.key, v as never)}
              />
            </div>
          ))}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Font</Label>
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
              <Label>Effects</Label>
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

          <Button onClick={save} disabled={!profile}>
            Guardar apariencia
          </Button>
        </section>
      </div>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        <p className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">Preview en vivo</p>
        {profile && (
          <ProfileView
            compact
            profile={{ ...profile, theme }}
            links={links.filter((l) => l.active)}
            socials={socials}
            views={0}
            music={profile.music as { title?: string; artist?: string }}
          />
        )}
      </aside>
    </div>
  );
}
