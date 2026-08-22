import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const codeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^QSY-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/, "Código inválido");

export const signInWithLoginCode = createServerFn({ method: "POST" })
  .inputValidator((data: { code: string }) => ({ code: codeSchema.parse(data.code) }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row } = await supabaseAdmin
      .from("login_codes")
      .select("user_id")
      .eq("code", data.code)
      .maybeSingle();

    if (!row) return { ok: false as const, error: "Código inválido o expirado" };

    const { data: userRes, error: userErr } = await supabaseAdmin.auth.admin.getUserById(
      row.user_id,
    );
    const email = userRes?.user?.email;
    if (userErr || !email) return { ok: false as const, error: "Cuenta no disponible" };

    const { data: link, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    const tokenHash = link?.properties?.hashed_token;
    if (linkErr || !tokenHash) {
      return { ok: false as const, error: "No se pudo iniciar sesión con el código" };
    }

    return { ok: true as const, tokenHash };
  });

const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Mínimo 3 caracteres")
  .max(24, "Máximo 24 caracteres")
  .regex(/^[a-z0-9_]+$/, "Solo minúsculas, números y guion bajo");

/**
 * Crea una cuenta sin email ni contraseña: la identidad queda ligada al código
 * personal QSY-XXXX-XXXX-XXXX que devolvemos una única vez.
 */
export const registerWithLoginCode = createServerFn({ method: "POST" })
  .inputValidator((data: { username: string }) => ({
    username: usernameSchema.parse(data.username),
  }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const username = data.username;

    const { data: banned } = await supabaseAdmin
      .from("banned_usernames")
      .select("name")
      .eq("name", username)
      .maybeSingle();
    if (banned) return { ok: false as const, error: "Ese nombre no está disponible" };

    const { data: taken } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();
    if (taken) return { ok: false as const, error: "Ese nombre ya está en uso" };

    // Email interno no entregable: la cuenta solo se abre con el código.
    const email = `${username}.${crypto.randomUUID().slice(0, 8)}@code.qsy.rip`;
    const password = crypto.randomUUID() + crypto.randomUUID();

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username, display_name: username, code_only: true },
    });
    if (createErr || !created.user) {
      return { ok: false as const, error: createErr?.message ?? "No se pudo crear la cuenta" };
    }

    const { data: codeRow } = await supabaseAdmin
      .from("login_codes")
      .select("code")
      .eq("user_id", created.user.id)
      .maybeSingle();

    if (!codeRow) {
      return { ok: false as const, error: "No se pudo generar el código de acceso" };
    }

    const { data: link } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    const tokenHash = link?.properties?.hashed_token;
    if (!tokenHash) {
      return { ok: false as const, error: "No se pudo iniciar sesión con el código" };
    }

    return { ok: true as const, code: codeRow.code, username, tokenHash };
  });

