import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Copy, Crown, Download, ExternalLink, Globe, ImageIcon, Lock, QrCode } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel, useProfileDraft } from "@/components/qsy/profile-editor-ui";
import { supabase } from "@/integrations/supabase/client";
import { useMyProfile } from "@/lib/qsy-data";
import { RankBadge } from "@/components/qsy/rank-badge";
import { DEFAULT_DOMAIN, DOMAINS_MAINTENANCE, QSY_DOMAINS, isDomain, profileUrl, type QsyDomain } from "@/lib/domains";

export const Route = createFileRoute("/_authenticated/dashboard/profile/share")({
  component: ShareSection,
  head: () => ({
    meta: [
      { title: "Compartir · Editor de perfil QSY" },
      { name: "description", content: "Elige tu dominio QSY, copia tu URL o descarga un código QR." },
    ],
  }),
});

function ShareSection() {
  const { data: profile } = useMyProfile();
  const { draft } = useProfileDraft();
  const qc = useQueryClient();
  const [saving, setSaving] = useState<string | null>(null);
  const username = profile?.username ?? "qsy";
  const rank = (profile as { rank?: string } | undefined)?.rank ?? "free";
  const isSeraph = rank === "seraph";
  const domain: QsyDomain = !DOMAINS_MAINTENANCE && isSeraph && isDomain((profile as { domain?: string } | undefined)?.domain)
    ? ((profile as { domain?: string }).domain as QsyDomain)
    : DEFAULT_DOMAIN;
  const url = profileUrl(username, domain);
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=520x520&margin=12&data=${encodeURIComponent(url)}`;

  async function copy(text: string, msg: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(msg);
    } catch {
      toast.error("No se pudo copiar");
    }
  }

  async function chooseDomain(next: QsyDomain) {
    if (!profile || next === domain) return;
    if (DOMAINS_MAINTENANCE) {
      toast.info("Dominios en mantenimiento", {
        description: "Estamos migrando la infraestructura. Por ahora todos los perfiles viven en qsy.rip.",
      });
      return;
    }
    if (!isSeraph) {
      toast.error("Dominios exclusivos de Seraph", { description: "Sube de rango para elegir tu dominio." });
      return;
    }
    setSaving(next);
    const { error } = await supabase.from("profiles").update({ domain: next }).eq("id", profile.id);
    setSaving(null);
    if (error) {
      toast.error("No se pudo cambiar el dominio", { description: error.message });
      return;
    }
    await qc.invalidateQueries({ queryKey: ["my-profile"] });
    toast.success(`Ahora usas ${next}`);
  }

  return (
    <Panel title="Compartir" description="Elige tu dominio, comparte tu perfil o genera un QR personalizado.">
      <section className="space-y-4 rounded-2xl border border-border/50 bg-surface-strong/30 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]">
            <Globe className="size-3.5" /> Dominio del perfil
          </p>
          <RankBadge rank={rank} size="sm" />
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {QSY_DOMAINS.map((d) => {
            const active = d.key === domain;
            const locked = !isSeraph && d.key !== DEFAULT_DOMAIN;
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => chooseDomain(d.key as QsyDomain)}
                disabled={locked || saving !== null}
                className={`group relative rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 ${
                  active
                    ? "border-primary/60 bg-primary/10 shadow-[0_0_30px_-14px_hsl(var(--primary))]"
                    : "border-border/60 bg-card/40"
                }`}
              >
                <span className="flex items-center justify-between">
                  <span className="font-semibold">{d.label}</span>
                  {active ? (
                    <Check className="size-4 text-primary" />
                  ) : locked ? (
                    <Lock className="size-3.5 text-muted-foreground" />
                  ) : null}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">{d.description}</span>
                <span className="mt-2 block truncate text-[11px] text-muted-foreground/80">
                  {d.key}/{username}
                </span>
              </button>
            );
          })}
        </div>

        {!isSeraph && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300/30 bg-amber-300/5 p-3">
            <p className="text-xs text-muted-foreground">
              Elegir entre qsy.rip, qsy.es y qsy.bio es exclusivo del rango Seraph.
            </p>
            <Button asChild size="sm" className="rounded-xl">
              <Link to="/dashboard/rank">
                <Crown className="size-4" /> Subir a Seraph
              </Link>
            </Button>
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-2xl border border-border/50 bg-surface-strong/30 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Tu URL de perfil</p>
        <div className="flex gap-2">
          <Input readOnly value={url} />
          <Button asChild variant="secondary" size="icon" className="shrink-0 rounded-xl">
            <a href={`/${username}`} target="_blank" rel="noreferrer" aria-label="Abrir perfil">
              <ExternalLink className="size-4" />
            </a>
          </Button>
        </div>
        <Button className="w-full rounded-xl" onClick={() => copy(url, "URL copiada")}>
          <Copy className="size-4" /> Copiar URL del perfil
        </Button>
      </section>


      <section className="space-y-4 rounded-2xl border border-border/50 bg-surface-strong/30 p-5">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]">
          <QrCode className="size-3.5" /> Vista previa del QR
        </p>
        <div
          className="relative mx-auto w-fit rounded-2xl bg-background p-4"
          style={{ boxShadow: `0 0 40px -12px ${draft.theme.accent}` }}
        >
          <img src={qr} alt={`Código QR de ${url}`} className="size-64 rounded-lg" loading="lazy" />
          {draft.avatar_url && (
            <img
              src={draft.avatar_url}
              alt=""
              className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-xl border-4 border-background object-cover"
            />
          )}
        </div>
        <p className="text-center text-xs text-muted-foreground">{url}</p>

        <div className="grid gap-2 sm:grid-cols-3">
          <Button variant="secondary" className="rounded-xl" onClick={() => copy(url, "URL copiada")}>
            <Copy className="size-4" /> Copiar URL
          </Button>
          <Button variant="secondary" className="rounded-xl" onClick={() => copy(qr, "Enlace del QR copiado")}>
            <ImageIcon className="size-4" /> Copiar QR
          </Button>
          <Button asChild className="rounded-xl">
            <a href={qr} download={`qsy-${username}.png`} target="_blank" rel="noreferrer">
              <Download className="size-4" /> Descargar
            </a>
          </Button>
        </div>
      </section>
    </Panel>
  );
}
