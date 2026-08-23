import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Copy, Crown, HardDrive, Images, Loader2, Lock, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IMAGE_HOST_KEY,
  IMAGE_HOST_PRICE,
  deleteGalleryImage,
  renameGalleryImage,
  uploadGalleryImage,
  useGallery,
  useImageHostAccess,
  type GalleryImage,
} from "@/lib/gallery";
import { purchaseItem, useWallet } from "@/lib/economy";

export const Route = createFileRoute("/_authenticated/dashboard/gallery")({
  component: GalleryPage,
  head: () => ({
    meta: [
      { title: "Image Host · QSY" },
      {
        name: "description",
        content:
          "Sube y aloja tus imágenes en QSY Image Host: enlaces directos para tu biolink, disponible con Obsidian, Seraph o comprando el acceso.",
      },
      { property: "og:title", content: "Image Host · QSY" },
      { property: "og:description", content: "Galería privada de imágenes con enlaces directos para tu biolink." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function Locked() {
  const qc = useQueryClient();
  const { data: coins } = useWallet();
  const [busy, setBusy] = useState(false);

  async function buy() {
    setBusy(true);
    try {
      const balance = await purchaseItem(IMAGE_HOST_KEY);
      toast.success("Image Host desbloqueado", { description: `Saldo restante: ${balance} QSY Coins` });
      await qc.invalidateQueries({ queryKey: ["wallet"] });
      await qc.invalidateQueries({ queryKey: ["unlocks"] });
    } catch (e) {
      const msg = (e as Error).message;
      toast.error(msg.includes("not enough") ? "No tienes suficientes QSY Coins" : "No se pudo comprar", {
        description: msg.includes("not enough") ? `Necesitas ${IMAGE_HOST_PRICE} coins.` : msg,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl border border-primary/40 bg-primary/5 p-8 text-center">
      <Lock className="mx-auto size-8 text-primary" />
      <h2 className="mt-4 text-lg font-semibold">Image Host bloqueado</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Aloja tus imágenes en QSY y obtén enlaces directos para usarlos en tu biolink. Incluido con
        Obsidian y Seraph, o cómpralo por {IMAGE_HOST_PRICE.toLocaleString("es-ES")} QSY Coins.
        Al desbloquearlo recibes la insignia <strong>Image Host</strong>.
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        Tus QSY Coins: <strong className="text-primary">{(coins ?? 0).toLocaleString("es-ES")}</strong>
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={() => void buy()} disabled={busy} className="rounded-xl">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Images className="size-4" />}
          Comprar acceso · {IMAGE_HOST_PRICE} QSY
        </Button>
        <Button asChild variant="secondary" className="rounded-xl">
          <Link to="/dashboard/rank">
            <Crown className="size-4" /> Subir de rango
          </Link>
        </Button>
      </div>
    </div>
  );
}

function GalleryCard({ img, onDeleted }: { img: GalleryImage; onDeleted: () => void }) {
  const [title, setTitle] = useState(img.title);
  const [busy, setBusy] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(img.url);
      toast.success("Enlace copiado");
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await deleteGalleryImage(img);
      toast.success("Imagen eliminada");
      onDeleted();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="qsy-pop overflow-hidden rounded-3xl border border-border/60 bg-card/40 backdrop-blur-xl transition-colors hover:border-primary/40">
      <img src={img.url} alt={img.title || "Imagen alojada en QSY Image Host"} className="h-40 w-full object-cover" />
      <div className="space-y-3 p-4">
        <Input
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            if (title !== img.title) void renameGalleryImage(img.id, title);
          }}
          className="h-8 text-xs"
          aria-label="Nombre de la imagen"
        />
        <p className="text-[11px] text-muted-foreground">
          {formatSize(img.size_bytes)} · {new Date(img.created_at).toLocaleDateString("es-ES")}
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" className="flex-1 rounded-xl" onClick={() => void copy()}>
            <Copy className="size-4" /> Copiar link
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-xl text-muted-foreground hover:text-destructive"
            disabled={busy}
            onClick={() => void remove()}
            aria-label="Eliminar imagen"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
          </Button>
        </div>
      </div>
    </article>
  );
}

function GalleryPage() {
  const { hasAccess, quota, premium } = useImageHostAccess();
  const { data: images } = useGallery();
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const list = images ?? [];
  const usedMb = list.reduce((a, i) => a + i.size_bytes, 0) / 1024 / 1024;

  async function onFiles(files: FileList) {
    if (list.length + files.length > quota.max) {
      toast.error(`Tu plan permite hasta ${quota.max} imágenes`);
      return;
    }
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        await uploadGalleryImage(file, quota.maxMb);
      }
      toast.success("Imágenes subidas");
      await qc.invalidateQueries({ queryKey: ["gallery"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Images className="size-5 text-primary" /> Image Host
        </h1>
        <p className="text-sm text-muted-foreground">
          Sube tus imágenes a QSY y usa los enlaces directos en tu biolink, muro o redes.
        </p>
      </header>

      {!hasAccess ? (
        <Locked />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/40 px-5 py-4">
            <div className="flex items-center gap-3">
              <HardDrive className="size-5 text-primary" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {premium ? "Acceso incluido en tu rango" : "Acceso comprado"}
                </p>
                <p className="text-sm font-semibold">
                  {list.length} / {quota.max} imágenes · {usedMb.toFixed(1)} MB usados · máx {quota.maxMb}MB por
                  archivo
                </p>
              </div>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
              multiple
              className="hidden"
              onChange={(e) => {
                const f = e.target.files;
                if (f && f.length) void onFiles(f);
              }}
            />
            <Button className="rounded-xl" disabled={busy} onClick={() => inputRef.current?.click()}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
              Subir imágenes
            </Button>
          </div>

          {list.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/60 p-12 text-center text-sm text-muted-foreground">
              Todavía no subiste ninguna imagen.
            </div>
          ) : (
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((img) => (
                <GalleryCard
                  key={img.id}
                  img={img}
                  onDeleted={() => void qc.invalidateQueries({ queryKey: ["gallery"] })}
                />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
