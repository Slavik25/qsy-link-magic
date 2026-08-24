import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowRight, AtSign, Copy, KeyRound, Lock, Mail } from "lucide-react";
import { registerWithLoginCode } from "@/lib/login-code.functions";
import { checkSignupAllowed, recordSignupSuccess } from "@/lib/signup-guard.functions";
import { AuthShell } from "@/components/qsy/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Crear cuenta — QSY" },
      { name: "description", content: "Crea tu perfil QSY gratis y comparte todo desde un solo link." },
      { property: "og:title", content: "Crear cuenta — QSY" },
      { property: "og:description", content: "Crea tu perfil biolink QSY en segundos." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RegisterPage,
});

const schema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Mínimo 3 caracteres")
    .max(24, "Máximo 24 caracteres")
    .regex(/^[a-z0-9_]+$/, "Solo minúsculas, números y guion bajo"),
  email: z
    .string()
    .trim()
    .email("Email inválido")
    .max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
});

function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "sent">("form");
  const [mode, setMode] = useState<"email" | "code">("email");
  const [issuedCode, setIssuedCode] = useState<string | null>(null);
  const codeRegister = useServerFn(registerWithLoginCode);
  const guardSignup = useServerFn(checkSignupAllowed);
  const markSignup = useServerFn(recordSignupSuccess);

  async function onCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.shape.username.safeParse(username);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }
    setLoading(true);
    try {
      const guard = await guardSignup({ data: { kind: "code" } });
      if (!guard.ok) {
        setLoading(false);
        toast.error("Registro bloqueado", { description: guard.error });
        return;
      }
      const res = await codeRegister({ data: { username: parsed.data } });
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
        toast.error("Cuenta creada, pero no pudimos entrar", { description: error.message });
      }
      void markSignup({ data: { kind: "code" } });
      setIssuedCode(res.code);
    } catch {
      setLoading(false);
      toast.error("No se pudo crear la cuenta con código");
    }
  }




  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ username, email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }
    setLoading(true);
    const guard = await guardSignup({ data: { kind: "email" } });
    if (!guard.ok) {
      setLoading(false);
      toast.error("Registro bloqueado", { description: guard.error });
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { username: parsed.data.username, display_name: parsed.data.username },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      // Sin verificación por email: entramos directo con las credenciales recién creadas.
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (signInErr) {
        toast.error("Cuenta creada, pero no pudimos entrar automáticamente", {
          description: "Iniciá sesión con tu email y contraseña.",
        });
        await navigate({ to: "/login" });
        return;
      }
    }
    void markSignup({ data: { kind: "email" } });
    toast.success("Cuenta creada. Bienvenido a QSY.");
    await navigate({ to: "/dashboard" });
  }

  async function resend() {
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Enlace reenviado");
  }

  if (issuedCode) {
    return (
      <AuthShell
        side="left"
        eyebrow="Cuenta creada"
        title="Guarda tu código"
        subtitle="Es la única forma de entrar a esta cuenta"
      >
        <div className="space-y-5">
          <div className="rounded-2xl border border-primary/40 bg-primary/10 px-4 py-5 text-center">
            <p className="font-mono text-lg font-semibold tracking-[0.18em] text-primary">
              {issuedCode}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Copialo y guardalo en un lugar seguro. Sin este código no vas a poder volver a
            entrar, porque tu cuenta no tiene email ni contraseña. Podés cambiarlo o agregar
            email más tarde desde Configuración.
          </p>

          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void navigator.clipboard.writeText(issuedCode);
              toast.success("Código copiado");
            }}
            className="h-12 w-full gap-2 rounded-xl text-xs font-semibold uppercase tracking-[0.14em]"
          >
            <Copy className="size-4" /> Copiar código
          </Button>

          <Button
            type="button"
            onClick={() => navigate({ to: "/dashboard" })}
            className="group h-12 w-full rounded-xl text-sm font-semibold uppercase tracking-[0.14em]"
          >
            Ya lo guardé, entrar
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </AuthShell>
    );
  }

  if (mode === "code") {
    return (
      <AuthShell
        side="left"
        eyebrow="Registro con código"
        title="Crea tu cuenta anónima"
        subtitle="Sin email ni contraseña · solo tu código QSY"
      >
        <form onSubmit={onCodeSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="code-username"
              className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
            >
              Tu link
            </Label>
            <div className="relative">
              <AtSign className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <span className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 font-mono text-xs text-primary">
                qsy.rip/
              </span>
              <Input
                id="code-username"
                value={username}
                maxLength={24}
                placeholder="tu_usuario"
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="h-12 rounded-xl bg-background/60 pl-[5.6rem] font-mono"
              />
            </div>
          </div>

          <p className="rounded-xl border border-border/60 bg-surface px-4 py-3 text-xs text-muted-foreground">
            Vamos a generar un código único tipo <span className="font-mono">QSY-XXXX-XXXX-XXXX</span>.
            Ese código es tu llave: guardalo, no se puede recuperar por correo.
          </p>

          <Button
            type="submit"
            disabled={loading}
            className="group h-12 w-full rounded-xl text-sm font-semibold uppercase tracking-[0.14em]"
          >
            {loading ? "Generando…" : "Generar mi código"}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Button>

          <button
            type="button"
            onClick={() => setMode("email")}
            className="w-full text-center text-xs text-muted-foreground hover:underline"
          >
            Prefiero registrarme con email
          </button>
        </form>
      </AuthShell>
    );
  }

  if (step === "sent") {

    return (
      <AuthShell
        side="left"
        eyebrow="Verifica tu correo"
        title="Revisa tu bandeja"
        subtitle={`Enviamos un enlace de verificación a ${email}`}
      >
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Abrí el correo y tocá <strong>Verificar email</strong>. Al confirmarlo entrarás
            automáticamente a tu dashboard. Si no lo ves, revisá spam o promociones.
          </p>

          <Button
            type="button"
            onClick={resend}
            disabled={loading}
            className="group h-12 w-full rounded-xl text-sm font-semibold uppercase tracking-[0.14em]"
          >
            {loading ? "Enviando…" : "Reenviar enlace"}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Button>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <button type="button" onClick={() => setStep("form")} className="hover:underline">
              Cambiar correo
            </button>
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Ya verifiqué, iniciar sesión
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }


  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("No se pudo continuar con Google");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  }

  return (
    <AuthShell
      side="left"
      eyebrow="Crear una cuenta QSY"
      title="Crea tu cuenta"
      subtitle="Gratis para siempre · sin tarjeta"
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Tu link
          </Label>
          <div className="relative">
            <AtSign className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <span className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 font-mono text-xs text-primary">
              qsy.rip/
            </span>
            <Input
              id="username"
              value={username}
              maxLength={24}
              placeholder="tu_usuario"
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className="h-12 rounded-xl bg-background/60 pl-[5.6rem] font-mono"
            />
          </div>
        </div>

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
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl bg-background/60 pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Contraseña
          </Label>
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
          {loading ? "Creando…" : "Crear mi QSY"}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Button>

        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            o regístrate con
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
          Registrarme con Google
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => setMode("code")}
          className="h-12 w-full gap-2 rounded-xl text-xs font-semibold uppercase tracking-[0.14em]"
        >
          <KeyRound className="size-4" />
          Registrarme con código aleatorio
        </Button>


        <p className="pt-2 text-center text-xs text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
