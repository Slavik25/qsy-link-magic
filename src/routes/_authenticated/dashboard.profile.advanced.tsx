import { profileHost } from "@/lib/domains";
import { createFileRoute } from "@tanstack/react-router";
import { Crown, Eye, Shield, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AssetUploader } from "@/components/qsy/asset-uploader";
import { useUploadLimits } from "@/lib/upload-limits";
import { Panel, SaveBar, ToggleRow, useProfileDraft } from "@/components/qsy/profile-editor-ui";
import type { ThemeConfig } from "@/lib/qsy";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard/profile/advanced")({
  component: AdvancedSection,
  head: () => ({
    meta: [
      { title: "Advanced · Editor de perfil QSY" },
      { name: "description", content: "Privacidad, efectos de fondo globales y CSS personalizado." },
    ],
  }),
});

const BG_EFFECTS = [
  { id: "none", label: "Ninguno" },
  { id: "stars", label: "Estrellas" },
  { id: "aurora", label: "Aurora" },
  { id: "matrix", label: "Matrix" },
  { id: "confetti", label: "Confetti" },
  { id: "snow", label: "Nieve" },
  { id: "rain", label: "Lluvia" },
  { id: "night", label: "Noche" },
  { id: "fireflies", label: "Luciérnagas" },
  { id: "bubbles", label: "Burbujas" },
  { id: "oldtv", label: "Old TV" },
  { id: "grid", label: "Retro Grid" },
  { id: "sakura", label: "Sakura" },
  { id: "hearts", label: "Corazones" },
  { id: "embers", label: "Brasas" },
  { id: "clouds", label: "Nubes" },
  { id: "vortex", label: "Vórtice" },
  { id: "cyberrain", label: "Cyber Rain" },
  { id: "spotlight", label: "Spotlight" },
  { id: "smoke", label: "Humo" },
  { id: "plasma", label: "Plasma", pro: true },
  { id: "dither", label: "Dither", pro: true },
  { id: "nebula", label: "Nebulosa", pro: true },
  { id: "lava", label: "Lava", pro: true },
  { id: "fireworks", label: "Fuegos artificiales", pro: true },
];

/** Aviso de bloqueo para funciones exclusivas de Obsidian y Seraph. */
function PremiumLock({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Crown className="size-4 text-primary" /> {title} — Obsidian o Seraph
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Esta función es exclusiva de los planes Obsidian y Seraph. Mejora tu plan para
        personalizar tu embed de Twitter/Discord y usar CSS propio.
      </p>
      <Link
        to="/dashboard/rank"
        className="mt-4 inline-flex h-9 items-center rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground"
      >
        Ver planes
      </Link>
    </div>
  );
}

function AdvancedSection() {
  const { profile, draft, setTheme, save, saving } = useProfileDraft();
  const { limit } = useUploadLimits();
  const t = draft.theme;
  const premium = profile?.rank === "obsidian" || profile?.rank === "seraph";

  return (
    <Panel
      title="Advanced"
      description="Privacidad, efectos de fondo globales y CSS personalizado para tu perfil."
    >
      <section className="space-y-3 rounded-2xl border border-border/50 bg-surface-strong/30 p-5">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]">
          <Shield className="size-3.5 text-primary" /> Privacidad
        </p>
        <div className="space-y-2">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Modo de perfil
          </Label>
          <select
            value={t.profile_mode ?? "public"}
            onChange={(e) => setTheme("profile_mode", e.target.value as ThemeConfig["profile_mode"])}
            className="h-10 w-full rounded-xl border border-border/60 bg-surface-strong/40 px-3 text-sm outline-none"
          >
            <option value="public">Público — Visible para todos</option>
            <option value="unlisted">No listado — Solo con el link</option>
            <option value="private">Privado — Solo tú</option>
          </select>
        </div>
        <ToggleRow
          title="Mostrar Bio"
          description="Muestra tu descripción en el perfil público."
          checked={t.show_bio !== false}
          onChange={(v) => setTheme("show_bio", v)}
        />
        <ToggleRow
          title="Mostrar Redes Sociales"
          description="Muestra tus links sociales en el perfil público."
          checked={t.show_socials !== false}
          onChange={(v) => setTheme("show_socials", v)}
        />
      </section>

      <section className="space-y-3 rounded-2xl border border-border/50 bg-surface-strong/30 p-5">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]">
          <Sparkles className="size-3.5 text-primary" /> Efecto de fondo global
        </p>
        <p className="text-xs text-muted-foreground">
          Efectos animados que se renderizan sobre el fondo de tu perfil.
        </p>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {BG_EFFECTS.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setTheme("bg_effect", e.id)}
              className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                (t.bg_effect ?? "none") === e.id
                  ? "border-primary/60 bg-primary/10"
                  : "border-border/50 bg-card/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {e.label}
              {e.pro && (
                <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-400">
                  Pro
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {!premium && <PremiumLock title="Embed personalizado y CSS" />}

      {premium && (
      <section className="space-y-4 rounded-2xl border border-border/50 bg-surface-strong/30 p-5">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]">
          <Eye className="size-3.5 text-primary" /> Metadatos del perfil (embed)
        </p>
        <p className="text-xs text-muted-foreground">
          Si lo dejas vacío se usa el embed por defecto de QSY con tu avatar, tu nombre, tu
          @usuario y tu bio.
        </p>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Título del sitio web</Label>
              <Input
                maxLength={70}
                placeholder={`@${profile?.username ?? "qsy"} | qsy.rip`}
                value={t.meta_title ?? ""}
                onChange={(e) => setTheme("meta_title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Descripción del sitio web</Label>
              <Textarea
                rows={3}
                maxLength={160}
                placeholder="Tu descripción personalizada…"
                value={t.meta_description ?? ""}
                onChange={(e) => setTheme("meta_description", e.target.value)}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <AssetUploader
                label="Imagen del sitio web"
                hint={`OG image · máx. ${limit(5)}MB`}
                accept="image/*"
                maxMb={limit(5)}
                value={t.meta_image ?? ""}
                onChange={(url) => setTheme("meta_image", url)}
              />
              <AssetUploader
                label="Favicon del sitio web"
                hint={`PNG o ICO · máx. ${limit(1)}MB`}
                accept="image/*"
                maxMb={limit(1)}
                value={t.meta_favicon ?? ""}
                onChange={(url) => setTheme("meta_favicon", url)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Vista previa de metadatos. Puede tardar hasta una hora en actualizarse en todos los sitios.
            </p>
            <div className="rounded-xl border-l-2 border-primary bg-card/60 p-4">
              <p className="text-sm font-semibold text-sky-400">
                {t.meta_title || `@${profile?.username ?? "qsy"} | qsy.rip`}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t.meta_description || draft.bio || "Bienvenido a mi página personal QSY."}
              </p>
              <img
                src={t.meta_image || draft.avatar_url || "/og-default.png"}
                alt="Vista previa del embed"
                className="mt-3 aspect-[1200/630] w-full rounded-lg border border-border/50 object-cover"
              />

              <p className="mt-2 text-[11px] text-muted-foreground">
                {profileHost(profile)}/{profile?.username ?? "qsy"}
              </p>

            </div>
          </div>
        </div>
      </section>
      )}

      {premium && (
      <section className="space-y-3 rounded-2xl border border-border/50 bg-surface-strong/30 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">CSS personalizado</p>
        <p className="text-xs text-muted-foreground">
          Inyecta CSS personalizado en tu perfil público. Solo para usuarios avanzados.
        </p>
        <Textarea
          rows={10}
          maxLength={8000}
          spellCheck={false}
          placeholder={"/* Tu CSS personalizado aquí */\n.qsy-card { border-radius: 28px !important; }\n.qsy-name { letter-spacing: .1em !important; }"}
          value={t.custom_css ?? ""}
          onChange={(e) => setTheme("custom_css", e.target.value)}
          className="font-mono text-xs"
        />
        <div className="rounded-xl border border-border/50 bg-background/40 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Selectores disponibles</p>
          <div className="mt-2 grid gap-1 text-[11px] text-muted-foreground sm:grid-cols-2">
            {[
              [".qsy-card", "Tarjeta principal"],
              [".qsy-banner", "Banner superior"],
              [".qsy-avatar", "Foto de perfil"],
              [".qsy-avatar-ring", "Marco del avatar"],
              [".qsy-name", "Nombre"],
              [".qsy-username", "@usuario"],
              [".qsy-bio", "Biografía"],
              [".qsy-location", "Ubicación"],
              [".qsy-badges / .qsy-badge", "Insignias"],
              [".qsy-links / .qsy-link", "Botones de redes"],
              [".qsy-link-icon", "Iconos de redes"],
              [".qsy-stats", "Visitas y likes"],
            ].map(([sel, desc]) => (
              <p key={sel}>
                <code className="font-mono text-foreground">{sel}</code> — {desc}
              </p>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Usa <code className="font-mono text-foreground">!important</code> para sobrescribir colores
            definidos en Personalización. No se permiten <code className="font-mono">@import</code> ni scripts.
          </p>
        </div>
      </section>
      )}


      <SaveBar onSave={save} saving={saving} />
    </Panel>
  );
}
