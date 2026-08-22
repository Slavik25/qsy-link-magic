import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type ProfileMeta = {
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  rank: string;
  premium: boolean;
  /** Metadatos personalizados (solo se rellenan para Obsidian/Seraph) */
  meta_title: string | null;
  meta_description: string | null;
  meta_image: string | null;
  meta_favicon: string | null;
};

/**
 * Lectura pública (sin sesión) de los metadatos de un perfil, usada por el
 * `head()` de /$username para que Twitter/Discord vean el embed correcto.
 */
export const getProfileMeta = createServerFn({ method: "GET" })
  .inputValidator((data: { username: string }) => ({
    username: String(data?.username ?? "").toLowerCase(),
  }))
  .handler(async ({ data }): Promise<ProfileMeta | null> => {
    const supabase = createClient<Database>(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_PUBLISHABLE_KEY"]!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );

    const { data: row } = await supabase
      .from("profiles")
      .select("username,display_name,bio,avatar_url,rank,theme")
      .eq("username", data.username)
      .maybeSingle();

    if (!row) return null;

    const theme = (row.theme ?? {}) as Record<string, unknown>;
    const premium = row.rank === "obsidian" || row.rank === "seraph";
    const str = (v: unknown) => {
      const s = typeof v === "string" ? v.trim() : "";
      return s.length > 0 ? s : null;
    };

    return {
      username: row.username,
      display_name: row.display_name || row.username,
      bio: row.bio ?? "",
      avatar_url: row.avatar_url ?? null,
      rank: row.rank ?? "free",
      premium,
      meta_title: premium ? str(theme["meta_title"]) : null,
      meta_description: premium ? str(theme["meta_description"]) : null,
      meta_image: premium ? str(theme["meta_image"]) : null,
      meta_favicon: premium ? str(theme["meta_favicon"]) : null,
    };
  });
