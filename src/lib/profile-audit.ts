import { supabase } from "@/integrations/supabase/client";
import { reportProfileWriteRejection } from "@/lib/profile-audit.functions";

type RejectionArgs = {
  endpoint: string;
  action: "update" | "delete" | "insert";
  targetId?: string | null;
  targetUsername?: string | null;
  error?: { message?: string; code?: string } | null;
  payload?: Record<string, unknown> | null;
};

/**
 * Deja constancia en la auditoría de un intento de escritura sobre perfiles que
 * el servidor rechazó (permisos insuficientes o datos inválidos).
 */
export async function logProfileRejection(args: RejectionArgs) {
  try {
    const { data: auth } = await supabase.auth.getUser();
    let actorName = "anon";
    if (auth.user) {
      const { data: me } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", auth.user.id)
        .limit(1)
        .maybeSingle();
      actorName = me?.username ?? auth.user.email ?? "user";
    }
    await reportProfileWriteRejection({
      data: {
        endpoint: args.endpoint,
        action: args.action,
        targetId: args.targetId ?? null,
        targetUsername: args.targetUsername ?? null,
        reason: args.error?.message ?? "",
        code: args.error?.code ?? null,
        payload: args.payload ?? null,
        userId: auth.user?.id ?? null,
        actorName,
      },
    });
  } catch {
    /* la auditoría nunca debe romper la interfaz */
  }
}
