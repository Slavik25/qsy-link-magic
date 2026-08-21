import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { SiteNav } from "@/components/qsy/site-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Recuperar contraseña — QSY" },
      { name: "description", content: "Restablece el acceso a tu cuenta QSY." },
      { property: "og:title", content: "Recuperar contraseña — QSY" },
      { property: "og:description", content: "Restablece el acceso a tu cuenta QSY." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPage,
});

const schema = z.string().trim().email("Email inválido").max(255);

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("Te enviamos un enlace de recuperación.");
  }

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Recuperar contraseña</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Te enviaremos un enlace para restablecerla.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl glass p-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={sent}>
            {sent ? "Enlace enviado" : "Enviar enlace"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            <Link to="/login" className="hover:text-foreground">
              Volver a iniciar sesión
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
