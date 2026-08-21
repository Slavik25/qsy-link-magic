import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowRight, Lock, Mail } from "lucide-react";
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
          className="h-12 w-full rounded-xl text-xs font-semibold uppercase tracking-[0.14em]"
        >
          Google
        </Button>

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
