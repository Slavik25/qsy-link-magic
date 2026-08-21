import { createFileRoute } from "@tanstack/react-router";
import { Copy, Download, ExternalLink, ImageIcon, QrCode } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel, useProfileDraft } from "@/components/qsy/profile-editor-ui";
import { useMyProfile } from "@/lib/qsy-data";

export const Route = createFileRoute("/_authenticated/dashboard/profile/share")({
  component: ShareSection,
  head: () => ({
    meta: [
      { title: "Compartir · Editor de perfil QSY" },
      { name: "description", content: "Copia tu URL QSY o descarga un código QR de tu perfil." },
    ],
  }),
});

function ShareSection() {
  const { data: profile } = useMyProfile();
  const { draft } = useProfileDraft();
  const username = profile?.username ?? "qsy";
  const url = `https://qsy.rip/${username}`;
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=520x520&margin=12&data=${encodeURIComponent(url)}`;

  async function copy(text: string, msg: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(msg);
    } catch {
      toast.error("No se pudo copiar");
    }
  }

  return (
    <Panel title="Compartir" description="Comparte tu perfil o genera un QR totalmente personalizado.">
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
