import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Elimina por completo una cuenta (perfiles, contenido asociado y usuario de auth).
 * Solo admins; el sitio no permite borrar al propietario.
 */
export const deleteUserAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { profileId: string }) => ({
    profileId: z.string().uuid().parse(data.profileId),
  }))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) return { ok: false as const, error: "No autorizado" };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, username, user_id")
      .eq("id", data.profileId)
      .maybeSingle();
    if (!profile) return { ok: false as const, error: "Perfil no encontrado" };

    if (profile.user_id) {
      const { data: isOwner } = await supabaseAdmin.rpc("is_site_owner", {
        _user_id: profile.user_id,
      });
      if (isOwner) return { ok: false as const, error: "No se puede eliminar al propietario" };
      if (profile.user_id === context.userId) {
        return { ok: false as const, error: "No podés eliminar tu propia cuenta desde aquí" };
      }
    }

    const targetUserId = profile.user_id;

    if (targetUserId) {
      await supabaseAdmin.from("profiles").delete().eq("user_id", targetUserId);
      await supabaseAdmin.from("user_roles").delete().eq("user_id", targetUserId);
      await supabaseAdmin.from("gallery_images").delete().eq("user_id", targetUserId);
      await supabaseAdmin.from("global_chat_messages").delete().eq("user_id", targetUserId);
      const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
      if (authErr) return { ok: false as const, error: authErr.message };
    } else {
      await supabaseAdmin.from("profiles").delete().eq("id", profile.id);
    }

    const actorName =
      (
        await supabaseAdmin
          .from("profiles")
          .select("username")
          .eq("user_id", context.userId)
          .maybeSingle()
      ).data?.username ?? "admin";

    await supabaseAdmin.from("admin_audit_log").insert({
      actor_id: context.userId,
      actor_name: actorName,
      action: "account:delete",
      target: profile.username,
      meta: { profile_id: profile.id, user_id: targetUserId },
    });

    return { ok: true as const, username: profile.username };
  });
