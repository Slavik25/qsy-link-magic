import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowRight, KeyRound, Lock, Mail, MailCheck } from "lucide-react";
import { signInWithLoginCode } from "@/lib/login-code.functions";

import { AuthShell } from "@/components/qsy/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — QSY" },
      { name: "description", content: "Accede a tu cuenta QSY y gestiona tu perfil biolink." },
      { property: "og:title", content: "Iniciar sesión — QSY" },
      { property: "og:description", content: "Accede a tu cuenta QSY." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"password" | "code">("password");
  const [code, setCode] = useState("");
  const codeSignIn = useServerFn(signInWithLoginCode);

  async function onCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!/^QSY-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(clean)) {
      toast.error("Formato inválido", { description: "Debe ser QSY-XXXX-XXXX-XXXX" });
      return;
    }
    setLoading(true);
    try {
      const res = await codeSignIn({ data: { code: clean } });
      if (!res.ok) {
        setLoading(false);
        toast.error(res.error);
        return;
      }
      const { error } = await supabase.auth.verifyOtp({
        type: "magiclink",
        token_hash: res.tokenHash,
      });
      setLoading(false);
      if (error) {
        toast.error("No se pudo iniciar sesión", { description: error.message });
        return;
      }
      await navigate({ to: "/dashboard" });
    } catch {
      setLoading(false);
      toast.error("No se pudo iniciar sesión con el código");
    }
  }


  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await navigate({ to: "/dashboard" });
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("No se pudo iniciar sesión con Google");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  }

  if (mode === "code") {
    return (
      <AuthShell
        eyebrow="Iniciar sesión en QSY"
        title="Entrar con código"
        subtitle="Usa tu código de acceso personal"
      >
        <form onSubmit={onCodeSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="code" className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Código de acceso
            </Label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="code"
                value={code}
                maxLength={18}
                autoComplete="off"
                placeholder="QSY-XXXX-XXXX-XXXX"
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="h-12 rounded-xl bg-background/60 pl-10 font-mono tracking-[0.14em]"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Encontrás tu código en Dashboard → Ajustes.
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="group h-12 w-full rounded-xl text-sm font-semibold uppercase tracking-[0.14em]"
          >
            {loading ? "Entrando…" : "Entrar con código"}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Button>

          <button
            type="button"
            onClick={() => setMode("password")}
            className="w-full text-center text-xs text-muted-foreground hover:text-primary"
          >
            Volver a email y contraseña
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Iniciar sesión en QSY"
      title="Bienvenido de vuelta"
      subtitle="Inicia sesión en tu cuenta"
    >
      <form onSubmit={onSubmit} className="space-y-5">

        <div className="space-y-2">
          <Label htmlFor="email" className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Email
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              maxLength={255}
              placeholder="tu@email.com"
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl bg-background/60 pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Contraseña
            </Label>
            <Link
              to="/forgot-password"
              className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
            >
              ¿Olvidaste?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              value={password}
              maxLength={72}
              placeholder="••••••••••"
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl bg-background/60 pl-10"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="group h-12 w-full rounded-xl text-sm font-semibold uppercase tracking-[0.14em]"
        >
          {loading ? "Entrando…" : "Iniciar sesión"}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Button>

        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            o continuar con
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={google}
          className="h-12 w-full gap-2 rounded-xl text-xs font-semibold uppercase tracking-[0.14em]"
        >
          <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continuar con Google
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => setMode("code")}
          className="h-12 w-full rounded-xl text-xs font-semibold uppercase tracking-[0.14em]"
        >
          <KeyRound className="size-4" />
          Entrar con código
        </Button>

        <Button
          type="button"
          variant="ghost"
          disabled={resending}
          onClick={resendConfirmation}
          className="h-11 w-full rounded-xl text-xs font-semibold uppercase tracking-[0.14em]"
        >
          <MailCheck className="size-4" />
          {resending ? "Reenviando…" : "Reenviar confirmación"}
        </Button>

        {resendError ? (
          <div className="flex flex-col gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3">
            <p className="text-xs text-destructive">{resendError}</p>
            <button
              type="button"
              onClick={resendConfirmation}
              className="self-start text-[11px] font-semibold uppercase tracking-[0.14em] text-primary hover:underline"
            >
              Reintentar envío
            </button>
          </div>
        ) : null}





        <p className="pt-2 text-center text-xs text-muted-foreground">
          ¿Sin cuenta?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Regístrate gratis
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
