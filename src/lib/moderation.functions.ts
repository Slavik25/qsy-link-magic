import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type ViewInput = {
  profileId: string;
  device?: string | null;
  browser?: string | null;
  referrer?: string | null;
  fingerprint?: string | null;
};

type ChatInput = { message: string; fingerprint?: string | null };

type ReportInput = { messageId: string; reason: string; note?: string };

async function requestContext() {
  const { getRequestHeader } = await import("@tanstack/react-start/server");
  // cf-connecting-ip / x-real-ip los pone el edge y no se pueden falsificar
  // desde el cliente; x-forwarded-for solo como último recurso.
  const forwarded = getRequestHeader("x-forwarded-for") ?? "";
  const ip =
    getRequestHeader("cf-connecting-ip") ||
    getRequestHeader("x-real-ip") ||
    forwarded.split(",").pop()?.trim() ||
    null;
  const userAgent = getRequestHeader("user-agent") ?? null;
  const origin = getRequestHeader("origin") ?? "";
  const referer = getRequestHeader("referer") ?? "";
  const host = getRequestHeader("host") ?? "";
  const secFetchSite = getRequestHeader("sec-fetch-site") ?? "";
  const secFetchMode = getRequestHeader("sec-fetch-mode") ?? "";
  return { ip, userAgent, origin, referer, host, secFetchSite, secFetchMode };
}

const BOT_UA =
  /(powershell|curl|wget|python|httpie|postman|insomnia|axios|node-fetch|go-http|java|libwww|okhttp|scrapy|httpclient|restsharp|winhttp|bot|spider|headless)/i;

/** Verifica que la petición venga de un navegador real en el mismo sitio. */
function isBrowserRequest(ctx: Awaited<ReturnType<typeof requestContext>>) {
  const ua = ctx.userAgent ?? "";
  if (!ua || ua.length < 20 || BOT_UA.test(ua)) return false;
  if (!/mozilla\//i.test(ua)) return false;
  // Los navegadores mandan sec-fetch-* en peticiones fetch/XHR.
  if (!ctx.secFetchSite || !ctx.secFetchMode) return false;
  if (ctx.secFetchSite !== "same-origin") return false;
  const sameHost = (value: string) => {
    if (!value) return false;
    try {
      return new URL(value).host === ctx.host;
    } catch {
      return false;
    }
  };
  if (!sameHost(ctx.origin) && !sameHost(ctx.referer)) return false;
  return true;
}


/** Registra una visita de perfil con IP real y deja rastro en la auditoría. */
export const trackProfileView = createServerFn({ method: "POST" })
  .inputValidator((input: ViewInput) => input)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { ip, userAgent } = await requestContext();

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, username")
      .eq("id", data.profileId)
      .maybeSingle();
    if (!profile) return { ok: false as const, reason: "not_found" };

    const { error } = await supabaseAdmin.from("profile_views").insert({
      profile_id: profile.id,
      device: data.device ?? null,
      browser: data.browser ?? null,
      referrer: data.referrer ?? "direct",
      country: null,
      ip,
      fingerprint: data.fingerprint ?? null,
    });

    if (error) {
      return { ok: false as const, reason: "rate_limited" };
    }

    await supabaseAdmin.from("audit_events").insert({
      kind: "view",
      action: "profile_view",
      profile_id: profile.id,
      actor_name: profile.username,
      source: "web",
      ip,
      user_agent: userAgent,
      detail: {
        device: data.device ?? null,
        browser: data.browser ?? null,
        referrer: data.referrer ?? "direct",
        fingerprint: data.fingerprint ?? null,
      },
    });

    return { ok: true as const };
  });

/** Envía un mensaje al chat global aplicando límites por usuario y por IP. */
export const sendChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: ChatInput) => input)
  .handler(async ({ data, context }) => {
    const message = data.message.trim();
    if (!message) throw new Error("El mensaje está vacío");
    if (message.length > 500) throw new Error("Máximo 500 caracteres");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { ip, userAgent } = await requestContext();

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, username, avatar_url")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    const { data: banned } = await supabaseAdmin.rpc("is_banned", {
      _user_id: context.userId,
      _fingerprint: data.fingerprint ?? "",
    });
    if (banned) throw new Error("Tu cuenta está suspendida");

    const { data: row, error } = await supabaseAdmin
      .from("global_chat_messages")
      .insert({
        user_id: context.userId,
        profile_id: profile?.id ?? null,
        author_name: profile?.username ?? "anon",
        author_avatar: profile?.avatar_url ?? null,
        message,
        ip,
        fingerprint: data.fingerprint ?? null,
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    await supabaseAdmin.from("audit_events").insert({
      kind: "chat",
      action: "chat_message",
      actor_user_id: context.userId,
      actor_name: profile?.username ?? "anon",
      profile_id: profile?.id ?? null,
      target_id: row.id,
      source: "web",
      ip,
      user_agent: userAgent,
      detail: { length: message.length, preview: message.slice(0, 140) },
    });

    return { ok: true as const, id: row.id };
  });

/** Reporta un mensaje del chat para la cola de moderación. */
export const reportChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: ReportInput) => input)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { ip, userAgent } = await requestContext();

    const { data: msg } = await supabaseAdmin
      .from("global_chat_messages")
      .select("id, message, user_id, author_name")
      .eq("id", data.messageId)
      .maybeSingle();
    if (!msg) throw new Error("El mensaje ya no existe");

    const { data: reporter } = await supabaseAdmin
      .from("profiles")
      .select("username")
      .eq("user_id", context.userId)
      .limit(1)
      .maybeSingle();

    const { error } = await supabaseAdmin.from("chat_reports").insert({
      message_id: msg.id,
      message_text: msg.message,
      message_author_id: msg.user_id,
      message_author_name: msg.author_name,
      reporter_id: context.userId,
      reporter_name: reporter?.username ?? "anon",
      reason: data.reason.slice(0, 60),
      note: (data.note ?? "").slice(0, 300),
    });
    if (error) {
      if (error.code === "23505") throw new Error("Ya reportaste este mensaje");
      throw new Error(error.message);
    }

    await supabaseAdmin.from("audit_events").insert({
      kind: "chat",
      action: "chat_report",
      actor_user_id: context.userId,
      actor_name: reporter?.username ?? "anon",
      target_id: msg.id,
      source: "web",
      ip,
      user_agent: userAgent,
      detail: { reason: data.reason, author: msg.author_name },
    });

    return { ok: true as const };
  });
