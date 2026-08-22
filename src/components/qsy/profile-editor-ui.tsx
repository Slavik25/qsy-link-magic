import { useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Lock, Save } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useUnlocks } from "@/lib/economy";
import { isOwned, type ShopItem } from "@/lib/shop";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useMyProfile } from "@/lib/qsy-data";
import { defaultTheme, type ThemeConfig } from "@/lib/qsy";
import { logProfileRejection } from "@/lib/profile-audit";

export type Draft = {
  display_name: string;
  bio: string;
  location: string;
  avatar_url: string;
  banner_url: string;
  theme: ThemeConfig;
};

const EMPTY: Draft = {
  display_name: "",
  bio: "",
  location: "",
  avatar_url: "",
  banner_url: "",
  theme: defaultTheme,
};

/** Shared draft state for every section of the profile editor. */
export function useProfileDraft() {
  const { data: profile } = useMyProfile();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setDraft({
      display_name: profile.display_name ?? "",
      bio: profile.bio ?? "",
      location: profile.location ?? "",
      avatar_url: profile.avatar_url ?? "",
      banner_url: profile.banner_url ?? "",
      theme: { ...defaultTheme, ...profile.theme },
    });
  }, [profile]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const setTheme = <K extends keyof ThemeConfig>(key: K, value: ThemeConfig[K]) =>
    setDraft((d) => ({ ...d, theme: { ...d.theme, [key]: value } }));

  const setThemeMany = (patch: Partial<ThemeConfig>) =>
    setDraft((d) => ({ ...d, theme: { ...d.theme, ...patch } }));

  async function save() {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: draft.display_name,
        bio: draft.bio,
        location: draft.location,
        avatar_url: draft.avatar_url,
        banner_url: draft.banner_url,
        theme: draft.theme,
      })
      .eq("id", profile.id);
    setSaving(false);
    if (error) {
      void logProfileRejection({
        endpoint: "dashboard/profile:save",
        action: "update",
        targetId: profile.id,
        targetUsername: profile.username,
        error,
        payload: { display_name: draft.display_name, bio: draft.bio, location: draft.location },
      });
      toast.error(error.message);
      return;
    }
    toast.success("Cambios guardados");
    void queryClient.invalidateQueries({ queryKey: ["my-profile"] });
  }

  return { profile, draft, set, setTheme, setThemeMany, save, saving };
}

export function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-xl sm:p-8">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-6 space-y-8">{children}</div>
    </section>
  );
}

export function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

export function OptionGrid({
  options,
  value,
  onChange,
  columns = 4,
}: {
  options: { id: string; label: string; preview?: ReactNode }[];
  value: string;
  onChange: (id: string) => void;
  columns?: number;
}) {
  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${columns > 3 ? 150 : 200}px, 1fr))` }}
    >
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`grid place-items-center gap-3 rounded-xl border p-5 transition-colors ${
            value === o.id
              ? "border-primary/60 bg-primary/10"
              : "border-border/60 bg-surface-strong/40 hover:border-border"
          }`}
        >
          {o.preview}
          <span className="text-[11px] font-semibold uppercase tracking-wider">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export function Pills({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
            value === o.id
              ? "bg-primary text-primary-foreground"
              : "bg-surface-strong/60 text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-surface-strong/40 px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={title} />
    </div>
  );
}

/** Color picker with an optional 2-stop gradient for a single biolink element. */
export function PaintField({
  label,
  color,
  color2,
  gradient,
  onColor,
  onColor2,
  onGradient,
  sample = "Aa",
  angle = 90,
}: {
  label: string;
  color: string;
  color2: string;
  gradient: boolean;
  onColor: (v: string) => void;
  onColor2: (v: string) => void;
  onGradient: (v: boolean) => void;
  sample?: string;
  angle?: number;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-surface-strong/30 p-3">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</Label>
        <span
          aria-hidden
          className="text-sm font-semibold"
          style={
            gradient
              ? {
                  backgroundImage: `linear-gradient(${angle}deg, ${color}, ${color2})`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }
              : { color }
          }
        >
          {sample}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <ColorField label={gradient ? "Color 1" : "Color"} value={color} onChange={onColor} />
        {gradient && <ColorField label="Color 2" value={color2} onChange={onColor2} />}
      </div>
      <ToggleRow
        title="Usar degradado"
        description="Mezcla dos colores en este elemento."
        checked={gradient}
        onChange={onGradient}
      />
    </div>
  );
}

export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-surface-strong/40 px-3 py-2">
        <input
          type="color"
          aria-label={label}
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          className="size-5 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <input
          value={value}
          maxLength={9}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>
    </div>
  );
}

export function SaveBar({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  return (
    <div className="flex justify-end border-t border-border/50 pt-5">
      <Button onClick={onSave} disabled={saving} className="rounded-xl">
        <Save className="size-4" /> {saving ? "Guardando…" : "Guardar cambios"}
      </Button>
    </div>
  );
}

/** Grid para equipar items comprados (layouts, players, decoraciones) desde el editor. */
export function ShopEquipGrid({
  items,
  activeKey,
  onEquip,
  renderPreview,
}: {
  items: ShopItem[];
  activeKey?: string | undefined;
  onEquip: (key: string) => void;
  renderPreview: (item: ShopItem) => ReactNode;
}) {
  const { data: unlocks } = useUnlocks();
  const owned = new Set(unlocks ?? []);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const unlocked = isOwned(item, owned);
        const active = activeKey === item.key;
        return (
          <div
            key={item.key}
            className={`overflow-hidden rounded-2xl border transition-colors ${
              active ? "border-primary/60 bg-primary/10" : "border-border/60 bg-surface-strong/30"
            }`}
          >
            {renderPreview(item)}
            <div className="space-y-2 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold">{item.name}</p>
                <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {item.price === 0 ? "Gratis" : `${item.price} QSY`}
                </span>
              </div>
              <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
              {unlocked ? (
                <Button
                  size="sm"
                  variant={active ? "secondary" : "default"}
                  className="w-full rounded-lg"
                  onClick={() => onEquip(item.key)}
                >
                  {active ? (
                    <>
                      <Check className="size-3.5" /> Equipado
                    </>
                  ) : (
                    "Equipar"
                  )}
                </Button>
              ) : (
                <Button asChild size="sm" variant="secondary" className="w-full rounded-lg">
                  <Link to="/dashboard/premium">
                    <Lock className="size-3.5" /> Comprar en la tienda
                  </Link>
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
