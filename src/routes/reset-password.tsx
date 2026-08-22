import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Lock } from "lucide-react";
import { AuthShell } from "@/components/qsy/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nueva contraseña — QSY" },
      { name: "description", content: "Elegí una nueva contraseña para tu cuenta QSY." },
      { property: "og:title", content: "Nueva contraseña — QSY" },
      { property: "og:description", content: "Elegí una nueva contraseña para tu cuenta QSY." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

const schema = z.string().min(6, "Mínimo 6 caracteres").max(72);

type Status = "checking" | "ready" | "invalid" | "done";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));

      const errorDescription = url.searchParams.get("error_description") ?? hash.get("error_description");
      if (errorDescription) {
        if (active) setStatus("invalid");
        return;
      }

      const code = url.searchParams.get("code");
      const tokenHash = url.searchParams.get("token_hash") ?? url.searchParams.get("token");
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      } else if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error && active) {
          setStatus("invalid");
          return;
        }
      } else if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
        if (error && active) {
          setStatus("invalid");
          return;
        }
      }

      // Clean the sensitive params from the URL bar.
      window.history.replaceState({}, "", window.location.pathname);

      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setStatus(data.session ? "ready" : "invalid");
    }

    void bootstrap();
    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(password);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }
    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setStatus("done");
    toast.success("Contraseña actualizada");
    setTimeout(() => void navigate({ to: "/dashboard" }), 900);
  }

  return (
    <AuthShell
      eyebrow="Restablecer contraseña en QSY"
      title="Nueva contraseña"
      subtitle="Elegí una contraseña segura"
    >
      {status === "checking" && (
        <p className="text-sm text-muted-foreground">Validando tu enlace…</p>
      )}

      {status === "invalid" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            El enlace de recuperación es inválido o ya expiró. Pedí uno nuevo para continuar.
          </p>
          <Button asChild className="h-12 w-full rounded-xl text-sm font-semibold uppercase tracking-[0.14em]">
            <Link to="/forgot-password">Pedir nuevo enlace</Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            <Link to="/login" className="hover:text-foreground">
              Volver a iniciar sesión
            </Link>
          </p>
        </div>
      )}

      {status === "done" && (
        <p className="text-sm text-muted-foreground">
          Listo, tu contraseña fue actualizada. Te llevamos a tu dashboard…
        </p>
      )}

      {status === "ready" && (
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Nueva contraseña
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

          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Repetir contraseña
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirm"
                type="password"
                value={confirm}
                maxLength={72}
                placeholder="••••••••••"
                onChange={(e) => setConfirm(e.target.value)}
                className="h-12 rounded-xl bg-background/60 pl-10"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl text-sm font-semibold uppercase tracking-[0.14em]"
          >
            {loading ? "Guardando…" : "Guardar contraseña"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
