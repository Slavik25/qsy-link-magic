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
        <p className="text-sm text-muted-foreground">
          Tu link público: <span className="font-mono text-foreground">qsy.rip/{profile?.username ?? "…"}</span>
        </p>
        <Button variant="secondary" onClick={signOut}>
          Cerrar sesión
        </Button>
      </section>
    </div>
  );
}
