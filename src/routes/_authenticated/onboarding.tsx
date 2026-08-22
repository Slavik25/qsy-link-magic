import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AtSign, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { AuthShell } from "@/components/qsy/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useMyProfile } from "@/lib/qsy-data";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: OnboardingPage,
  head: () => ({
    meta: [
      { title: "Elige tu usuario — QSY" },
      { name: "description", content: "Elige el nombre de usuario de tu biolink QSY." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const usernameSchema = z
  .string()
  .trim()
  .min(3, "Mínimo 3 caracteres")
  .max(24, "Máximo 24 caracteres")
  .regex(/^[a-z0-9_]+$/, "Solo minúsculas, números y guion bajo");

function OnboardingPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: profile, isLoading } = useMyProfile();
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);

  const needs = (profile as { username_set?: boolean } | undefined)?.username_set === false;

  useEffect(() => {
    if (!isLoading && profile && !needs) void navigate({ to: "/dashboard", replace: true });
  }, [isLoading, profile, needs, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    const parsed = usernameSchema.safeParse(username);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }
    setSaving(true);
    const { data: taken } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", parsed.data)
      .maybeSingle();
    if (taken && taken.id !== profile.id) {
      setSaving(false);
      toast.error("Ese usuario ya está en uso");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({
        username: parsed.data,
        display_name: profile.display_name || parsed.data,
        username_set: true,
      } as never)
      .eq("id", profile.id);
    setSaving(false);
    if (error) {
      toast.error("No se pudo guardar", { description: error.message });
      return;
    }
    await qc.invalidateQueries({ queryKey: ["my-profiles"] });
    await qc.invalidateQueries({ queryKey: ["my-profile"] });
    toast.success(`Tu link es qsy.rip/${parsed.data}`);
    await navigate({ to: "/dashboard", replace: true });
  }

  return (
    <AuthShell
      side="left"
      eyebrow="Último paso"
      title="Elige tu usuario"
      subtitle="Este será tu link público en QSY."
    >
      <form onSubmit={submit} className="space-y-5">
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

        <Button
          type="submit"
          disabled={saving || isLoading}
          className="group h-12 w-full rounded-xl text-sm font-semibold uppercase tracking-[0.14em]"
        >
          {saving ? "Guardando…" : "Continuar"}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </form>
    </AuthShell>
  );
}
