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
