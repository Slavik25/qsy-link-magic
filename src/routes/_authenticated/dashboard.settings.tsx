import { profileHost } from "@/lib/domains";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useMyProfile } from "@/lib/qsy-data";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { data: profile } = useMyProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  async function changePassword() {
    if (password.length < 6) {
      toast.error("Mínimo 6 caracteres");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
      return;
    }
    setPassword("");
    toast.success("Contraseña actualizada");
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <section className="space-y-4 rounded-2xl glass p-6">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={email} readOnly />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pw">Nueva contraseña</Label>
          <Input
            id="pw"
            type="password"
            maxLength={72}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button onClick={changePassword}>Actualizar contraseña</Button>
      </section>

      <section className="space-y-3 rounded-2xl glass p-6">
        <div className="flex items-center gap-2">
          <KeyRound className="size-4 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em]">Código de acceso</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Podés iniciar sesión con este código en vez de tu contraseña. No lo compartas con nadie.
        </p>
        <div className="flex items-center gap-2">
          <Input
            readOnly
            value={showCode ? (loginCode ?? "…") : "QSY-••••-••••-••••"}
            className="font-mono tracking-[0.14em]"
          />
          <Button type="button" variant="secondary" size="icon" onClick={() => setShowCode((v) => !v)}>
            {showCode ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={() => {
              if (!loginCode) return;
              void navigator.clipboard.writeText(loginCode);
              toast.success("Código copiado");
            }}
          >
            <Copy className="size-4" />
          </Button>
        </div>
        <Button variant="outline" onClick={rotateCode} disabled={rotating}>
          <RefreshCw className={`size-4 ${rotating ? "animate-spin" : ""}`} />
          {rotating ? "Generando…" : "Generar código nuevo"}
        </Button>
      </section>


      <section className="space-y-3 rounded-2xl glass p-6">
        <p className="text-sm text-muted-foreground">
          Tu link público: <span className="font-mono text-foreground">{profileHost(profile)}/{profile?.username ?? "…"}</span>
        </p>
        <Button variant="secondary" onClick={signOut}>
          Cerrar sesión
        </Button>
      </section>
    </div>
  );
}
