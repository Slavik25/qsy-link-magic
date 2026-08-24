import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { readTheme, type ThemeConfig } from "./qsy";

export type CommunityTemplate = {
  id: string;
  user_id: string;
  author_name: string;
  name: string;
  description: string;
  theme: ThemeConfig;
  source_profile_id: string | null;
  preview_username: string;
  status: "pending" | "approved" | "rejected";
  review_note: string;
  uses: number;
  created_at: string;
};

function shape(row: Record<string, unknown>): CommunityTemplate {
  return { ...(row as unknown as CommunityTemplate), theme: readTheme(row.theme) };
}

/** Plantillas publicadas: visibles para todo el mundo. */
export function useApprovedTemplates() {
  return useQuery({
    queryKey: ["community-templates", "approved"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_templates")
        .select("*")
        .eq("status", "approved")
        .order("uses", { ascending: false })
        .limit(60);
      if (error) throw error;
      return (data ?? []).map(shape);
    },
  });
}

/** Plantillas enviadas por el usuario autenticado. */
export function useMyTemplates() {
  return useQuery({
    queryKey: ["community-templates", "mine"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return [] as CommunityTemplate[];
      const { data, error } = await supabase
        .from("community_templates")
        .select("*")
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(shape);
    },
  });
}

/** Cola de revisión del panel de administración. */
export function useTemplateQueue(status: "pending" | "approved" | "rejected") {
  return useQuery({
    queryKey: ["community-templates", "admin", status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_templates")
        .select("*")
        .eq("status", status)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []).map(shape);
    },
  });
}

/** Aplica una plantilla al perfil indicado y suma un uso. */
export async function applyTemplate(templateId: string, profileId: string, theme: ThemeConfig) {
  const { error } = await supabase
    .from("profiles")
    .update({ theme: theme as never })
    .eq("id", profileId);
  if (error) throw error;
  await supabase.rpc("use_community_template", { _id: templateId });
}
