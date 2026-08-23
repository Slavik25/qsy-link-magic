import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMyProfile } from "@/lib/qsy-data";
import { useUnlocks } from "@/lib/economy";

/** Clave de la tienda que desbloquea el Image Host. */
export const IMAGE_HOST_KEY = "image-host";
export const IMAGE_HOST_PRICE = 2500;

const TEN_YEARS = 60 * 60 * 24 * 3650;

export type GalleryImage = {
  id: string;
  path: string;
  url: string;
  title: string;
  size_bytes: number;
  content_type: string;
  created_at: string;
  album: string;
  tags: string[];
};

/** Normaliza un texto de álbum/etiqueta. */
export function normalizeTag(v: string) {
  return v.trim().toLowerCase().slice(0, 32);
}

/** Parsea una lista de etiquetas separadas por coma. */
export function parseTags(v: string) {
  return Array.from(new Set(v.split(",").map(normalizeTag).filter(Boolean))).slice(0, 12);
}

/** Cuota de imágenes según rango / acceso comprado. */
export function galleryQuota(rank?: string | null, bought?: boolean) {
  const r = (rank ?? "").toLowerCase();
  if (r === "seraph") return { max: 500, maxMb: 25 };
  if (r === "obsidian") return { max: 200, maxMb: 15 };
  if (bought) return { max: 100, maxMb: 10 };
  return { max: 0, maxMb: 0 };
}

/** Acceso al Image Host: Obsidian, Seraph o compra en la tienda. */
export function useImageHostAccess() {
  const { data: profile } = useMyProfile();
  const { data: unlocks } = useUnlocks();
  const rank = (profile as { rank?: string | null } | null | undefined)?.rank ?? null;
  const bought = (unlocks ?? []).includes(IMAGE_HOST_KEY);
  const premium = rank === "obsidian" || rank === "seraph";
  return {
    rank,
    bought,
    premium,
    hasAccess: premium || bought,
    quota: galleryQuota(rank, bought),
  };
}

export function useGallery() {
  return useQuery({
    queryKey: ["gallery"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return [] as GalleryImage[];
      const { data, error } = await supabase
        .from("gallery_images")
        .select("id, path, url, title, size_bytes, content_type, created_at, album, tags")
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as GalleryImage[];
    },
  });
}

export async function uploadGalleryImage(file: File, maxMb: number, album = "") {
  if (file.size > maxMb * 1024 * 1024) {
    throw new Error(`La imagen supera los ${maxMb}MB`);
  }
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error("Sesión no encontrada");

  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
  const path = `${uid}/gallery/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("user-assets")
    .upload(path, file, { cacheControl: "31536000", upsert: false });
  if (error) throw error;

  const { data: signed, error: signErr } = await supabase.storage
    .from("user-assets")
    .createSignedUrl(path, TEN_YEARS);
  if (signErr || !signed) throw signErr ?? new Error("No se pudo generar el enlace");

  const { error: insErr } = await supabase.from("gallery_images").insert({
    user_id: uid,
    path,
    url: signed.signedUrl,
    title: file.name.slice(0, 120),
    size_bytes: file.size,
    content_type: file.type || "image/*",
    album: normalizeTag(album),
    tags: [],
  });
  if (insErr) throw insErr;

  return signed.signedUrl;
}

export async function deleteGalleryImage(img: GalleryImage) {
  await supabase.storage.from("user-assets").remove([img.path]);
  const { error } = await supabase.from("gallery_images").delete().eq("id", img.id);
  if (error) throw error;
}

export async function updateGalleryMeta(id: string, patch: { album?: string; tags?: string[] }) {
  const payload: Record<string, unknown> = {};
  if (patch.album !== undefined) payload.album = normalizeTag(patch.album);
  if (patch.tags !== undefined) payload.tags = patch.tags.map(normalizeTag).filter(Boolean).slice(0, 12);
  const { error } = await supabase.from("gallery_images").update(payload).eq("id", id);
  if (error) throw error;
}

export async function renameGalleryImage(id: string, title: string) {
  const { error } = await supabase
    .from("gallery_images")
    .update({ title: title.slice(0, 120) })
    .eq("id", id);
  if (error) throw error;
}
