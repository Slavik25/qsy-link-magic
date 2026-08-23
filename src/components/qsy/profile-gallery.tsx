import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Images, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Props = { userId: string | null | undefined; accent: string; username: string };

type PublicImage = {
  id: string;
  url: string;
  title: string;
  album: string;
  created_at: string;
};

/**
 * Botón "Gallery" del biolink: muestra las imágenes del Image Host del dueño
 * del perfil. Las políticas de acceso permiten leerlas solo si el dueño tiene
 * Obsidian, Seraph o compró el acceso al Image Host.
 */
export function ProfileGallery({ userId, accent, username }: Props) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState<PublicImage | null>(null);

  const { data: images = [] } = useQuery({
    queryKey: ["profile-gallery", userId],
    enabled: Boolean(userId),
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("id, url, title, album, created_at")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(120);
      if (error) return [] as PublicImage[];
      return (data ?? []) as PublicImage[];
    },
  });

  if (!userId || images.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed left-4 top-4 z-50 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-medium lift"
        style={{ borderColor: `color-mix(in oklab, ${accent} 35%, transparent)` }}
      >
        <Images className="size-3.5" style={{ color: accent }} />
        Gallery
        <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">{images.length}</span>
      </button>

      {open && (
        <aside
          className="fixed left-4 top-16 z-50 flex max-h-[75vh] w-[min(92vw,24rem)] flex-col overflow-hidden rounded-2xl border border-border bg-background/85 backdrop-blur-xl pop-in"
          style={{ boxShadow: `0 30px 80px -30px color-mix(in oklab, ${accent} 60%, transparent)` }}
        >
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">Galería de @{username}</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar galería">
              <X className="size-4 text-muted-foreground hover:text-foreground" />
            </button>
          </header>

          <div className="grid flex-1 grid-cols-3 gap-2 overflow-y-auto p-3">
            {images.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setZoom(img)}
                className="group relative aspect-square overflow-hidden rounded-xl border border-border/60"
              >
                <img
                  src={img.url}
                  alt={img.title || `Imagen de la galería de ${username}`}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        </aside>
      )}

      {zoom && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          onClick={() => setZoom(null)}
          role="presentation"
        >
          <figure className="max-h-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={zoom.url}
              alt={zoom.title || `Imagen de la galería de ${username}`}
              className="max-h-[75vh] w-auto rounded-2xl border border-border object-contain"
            />
            {(zoom.title || zoom.album) && (
              <figcaption className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span className="truncate">{zoom.title}</span>
                {zoom.album && <span className="rounded-full bg-white/10 px-2 py-0.5">{zoom.album}</span>}
              </figcaption>
            )}
          </figure>
          <button
            type="button"
            onClick={() => setZoom(null)}
            aria-label="Cerrar imagen"
            className="fixed right-6 top-6 rounded-full glass p-2"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </>
  );
}
