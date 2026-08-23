import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Copy,
  Crown,
  FolderOpen,
  HardDrive,
  Images,
  Loader2,
  Lock,
  Search,
  Tag,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IMAGE_HOST_KEY,
  IMAGE_HOST_PRICE,
  deleteGalleryImage,
  parseTags,
  renameGalleryImage,
  updateGalleryMeta,
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
  return (
    <div className="rounded-3xl border border-primary/40 bg-primary/5 p-8 text-center">
      <Lock className="mx-auto size-8 text-primary" />
      <h2 className="mt-4 text-lg font-semibold">Image Host bloqueado</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        El Image Host es exclusivo de los rangos <strong>Obsidian</strong> y <strong>Seraph</strong>. Tu
        rango actual no tiene acceso: mejora tu rango para alojar imágenes en QSY, obtener enlaces
        directos y la insignia <strong>Image Host</strong>.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild className="rounded-xl">
          <Link to="/dashboard/premium">
            <Crown className="size-4" /> Obtener Obsidian o Seraph
          </Link>
        </Button>
        <Button asChild variant="secondary" className="rounded-xl">
          <Link to="/dashboard/rank">
            <Images className="size-4" /> Ver rangos
          </Link>
        </Button>
      </div>
    </div>
  );
}

function GalleryCard({
  img,
  onDeleted,
  onMetaChange,
}: {
  img: GalleryImage;
  onDeleted: () => void;
  onMetaChange: () => void;
}) {
  const [title, setTitle] = useState(img.title);
  const [album, setAlbum] = useState(img.album ?? "");
  const [tags, setTags] = useState((img.tags ?? []).join(", "));
  const [busy, setBusy] = useState(false);

  async function saveMeta(patch: { album?: string; tags?: string[] }) {
    try {
      await updateGalleryMeta(img.id, patch);
      onMetaChange();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

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
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="relative">
            <FolderOpen className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={album}
              maxLength={32}
              placeholder="Álbum"
              onChange={(e) => setAlbum(e.target.value)}
              onBlur={() => {
                if (album !== (img.album ?? "")) void saveMeta({ album });
              }}
              className="h-8 pl-7 text-xs"
              aria-label="Álbum de la imagen"
            />
          </div>
          <div className="relative">
            <Tag className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={tags}
              placeholder="etiquetas, separadas, por coma"
              onChange={(e) => setTags(e.target.value)}
              onBlur={() => {
                const next = parseTags(tags);
                if (next.join(",") !== (img.tags ?? []).join(",")) void saveMeta({ tags: next });
              }}
              className="h-8 pl-7 text-xs"
              aria-label="Etiquetas de la imagen"
            />
          </div>
        </div>
        {(img.tags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1">
            {img.tags.map((t) => (
              <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                #{t}
              </span>
            ))}
          </div>
        )}
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
  const [uploadAlbum, setUploadAlbum] = useState("");
  const [query, setQuery] = useState("");
  const [album, setAlbum] = useState("all");
  const [tag, setTag] = useState<string | null>(null);

  const list = images ?? [];
  const usedMb = list.reduce((a, i) => a + i.size_bytes, 0) / 1024 / 1024;

  const albums = Array.from(new Set(list.map((i) => i.album).filter(Boolean))).sort();
  const allTags = Array.from(new Set(list.flatMap((i) => i.tags ?? []))).sort();

  const q = query.trim().toLowerCase();
  const filtered = list.filter((i) => {
    if (album !== "all" && (i.album || "") !== (album === "none" ? "" : album)) return false;
    if (tag && !(i.tags ?? []).includes(tag)) return false;
    if (q && !`${i.title} ${i.album} ${(i.tags ?? []).join(" ")}`.toLowerCase().includes(q)) return false;
    return true;
  });

  async function onFiles(files: FileList) {
    if (list.length + files.length > quota.max) {
      toast.error(`Tu plan permite hasta ${quota.max} imágenes`);
      return;
    }
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        await uploadGalleryImage(file, quota.maxMb, uploadAlbum);
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
            <div className="flex items-center gap-2">
              <Input
                value={uploadAlbum}
                maxLength={32}
                placeholder="Álbum destino (opcional)"
                onChange={(e) => setUploadAlbum(e.target.value)}
                className="h-9 w-48 text-xs"
                aria-label="Álbum destino para las subidas"
              />
            <Button className="rounded-xl" disabled={busy} onClick={() => inputRef.current?.click()}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
              Subir imágenes
            </Button>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-border/60 bg-card/40 px-5 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nombre, álbum o etiqueta"
                  className="h-9 pl-9 text-sm"
                  aria-label="Buscar imágenes"
                />
              </div>
              <select
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                aria-label="Filtrar por álbum"
                className="h-9 rounded-md border border-border/60 bg-background px-3 text-sm"
              >
                <option value="all">Todos los álbumes</option>
                <option value="none">Sin álbum</option>
                {albums.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTag(tag === t ? null : t)}
                    className={`rounded-full px-2.5 py-1 text-[11px] transition-colors ${
                      tag === t
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    #{t}
                  </button>
                ))}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground">
              {filtered.length} de {list.length} imágenes
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/60 p-12 text-center text-sm text-muted-foreground">
              {list.length === 0 ? "Todavía no subiste ninguna imagen." : "Ninguna imagen coincide con el filtro."}
            </div>
          ) : (
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((img) => (
                <GalleryCard
                  key={img.id}
                  img={img}
                  onDeleted={() => void qc.invalidateQueries({ queryKey: ["gallery"] })}
                  onMetaChange={() => void qc.invalidateQueries({ queryKey: ["gallery"] })}
                />
              ))}
            </section>
          )}

          <UsageGuide sample={list[0]?.url ?? "https://qsy.rip/tu-imagen.png"} premium={premium} />
        </>
      )}
    </div>
  );
}

function Snippet({ label, code, hint }: { label: string; code: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold">{label}</p>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 rounded-lg text-[11px]"
          onClick={() => {
            void navigator.clipboard.writeText(code).then(
              () => toast.success("Ejemplo copiado"),
              () => toast.error("No se pudo copiar"),
            );
          }}
        >
          <Copy className="size-3.5" /> Copiar
        </Button>
      </div>
      <pre className="mt-2 overflow-x-auto rounded-xl bg-muted/30 p-3 text-[11px] leading-relaxed text-muted-foreground">
        <code>{code}</code>
      </pre>
      {hint && <p className="mt-2 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function UsageGuide({ sample, premium }: { sample: string; premium: boolean }) {
  return (
    <section className="space-y-4 rounded-3xl border border-border/60 bg-card/40 p-6 backdrop-blur-xl">
      <header>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <BookOpen className="size-5 text-primary" /> Cómo insertar tus imágenes
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Copiá el enlace directo de cualquier imagen y usalo en tu biolink. Estos ejemplos usan tu primer
          enlace disponible.
        </p>
      </header>

      <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
        <li>Subí la imagen y asignale un álbum (por ejemplo <strong>fondos</strong>) y etiquetas.</li>
        <li>Filtrá por álbum o etiqueta para encontrarla rápido.</li>
        <li>Tocá <strong>Copiar link</strong> y pegalo donde quieras usarla.</li>
      </ol>

      <div className="grid gap-3 md:grid-cols-2">
        <Snippet
          label="Avatar / banner del perfil"
          code={sample}
          hint="Pegá el enlace en Perfil → Avatar o Banner en lugar de subir el archivo de nuevo."
        />
        <Snippet
          label="Imagen en el muro o descripción (Markdown)"
          code={`![mi imagen](${sample})`}
        />
        <Snippet
          label="HTML"
          code={`<img src="${sample}" alt="Mi imagen" width="320" />`}
        />
        <Snippet
          label="Fondo con CSS"
          code={`background-image: url("${sample}");\nbackground-size: cover;`}
        />
      </div>

      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
        <p className="flex items-center gap-2 text-xs font-semibold text-primary">
          <Crown className="size-4" /> Exclusivo Obsidian y Seraph
        </p>
        <p className="mt-1 text-[12px] text-muted-foreground">
          {premium
            ? "Tu rango incluye CSS personalizado y metadatos OG, así que podés usar tus enlaces directamente ahí."
            : "Con Obsidian o Seraph podés usar estos enlaces también en CSS personalizado y en la imagen de vista previa (OG)."}
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Snippet
            label="CSS personalizado (fondo del perfil)"
            code={`.qsy-profile {\n  background-image: url("${sample}");\n  background-size: cover;\n  background-position: center;\n}`}
            hint="Pegalo en Perfil → Avanzado → CSS personalizado."
          />
          <Snippet
            label="Imagen de vista previa (OG)"
            code={sample}
            hint="Pegalo en Perfil → Avanzado → Metadatos OG para definir la miniatura al compartir tu biolink."
          />
        </div>
      </div>
    </section>
  );
}
