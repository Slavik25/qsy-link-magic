import { createServerFn } from "@tanstack/react-start";

type RejectionInput = {
  endpoint: string;
  action: string;
  targetId?: string | null;
  targetUsername?: string | null;
  reason?: string | null;
  code?: string | null;
  payload?: Record<string, unknown> | null;
  userId?: string | null;
  actorName?: string | null;
};

const MAX_KEYS = 12;

/** Recorta el payload a claves + tipos/valores cortos: nunca guardamos contenido largo. */
function minimalPayload(payload: Record<string, unknown> | null | undefined) {
  if (!payload || typeof payload !== "object") return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload).slice(0, MAX_KEYS)) {
    if (value === null || value === undefined) out[key] = null;
    else if (typeof value === "boolean" || typeof value === "number") out[key] = value;
    else if (typeof value === "string") out[key] = value.slice(0, 80);
    else out[key] = Array.isArray(value) ? `array(${value.length})` : typeof value;
  }
  return out;
}

/**
 * Registra en la auditoría cualquier intento fallido de modificar o borrar un
 * perfil (datos inválidos o permisos insuficientes). Solo escribe logs.
 */
export const reportProfileWriteRejection = createServerFn({ method: "POST" })
  .inputValidator((input: RejectionInput) => ({
    endpoint: String(input?.endpoint ?? "unknown").slice(0, 120),
    action: String(input?.action ?? "profile_write").slice(0, 60),
    targetId: input?.targetId ? String(input.targetId).slice(0, 64) : null,
    targetUsername: input?.targetUsername ? String(input.targetUsername).slice(0, 64) : null,
    reason: String(input?.reason ?? "").slice(0, 300),
    code: input?.code ? String(input.code).slice(0, 40) : null,
    payload: minimalPayload(input?.payload),
    userId: input?.userId ? String(input.userId).slice(0, 64) : null,
    actorName: String(input?.actorName ?? "").slice(0, 64),
  }))
  .handler(async ({ data }) => {
    const { requestIp, requestUserAgent } = await import("./tripwire-request.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    await supabaseAdmin.from("audit_events").insert({
      kind: "profile",
      action: `profile_${data.action}_rejected`,
      actor_user_id: data.userId,
      actor_name: data.actorName || "anon",
      target_id: data.targetId,
      source: "client",
      ip: requestIp(),
      user_agent: requestUserAgent(),
      detail: {
        endpoint: data.endpoint,
        target_username: data.targetUsername,
        reason: data.reason,
        code: data.code,
        payload: data.payload,
      } as never,
    });

    return { logged: true };
  });
