import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowRight, AtSign, Lock, Mail } from "lucide-react";
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
    .max(255)
    .refine((v) => !isDisposableEmail(v), DISPOSABLE_EMAIL_MESSAGE),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
});

function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "sent">("form");


  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ username, email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }
    setLoading(true);
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
      setStep("sent");
      toast.success("Te enviamos un enlace de verificación", {
        description: "Abrí el correo y tocá el botón para activar tu cuenta.",
      });
      return;
    }
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
          className="h-12 w-full rounded-xl text-xs font-semibold uppercase tracking-[0.14em]"
        >
          Google
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
