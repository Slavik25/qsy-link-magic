import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Crown, Pencil, Plus, Sparkles, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashBanner } from "@/components/qsy/dash-banner";
import { supabase } from "@/integrations/supabase/client";
import { useMyProfile } from "@/lib/qsy-data";
import profilesArt from "@/assets/card-32.png.asset.json";

export const Route = createFileRoute("/_authenticated/dashboard/profiles")({
  component: ProfilesPage,
  head: () => ({
    meta: [
      { title: "Perfiles · Dashboard QSY" },
      {
        name: "description",
        content: "Guarda distintas versiones de tu perfil QSY y cámbialas con un clic.",
      },
    ],
  }),
});

const FREE_LIMIT = 2;

type Preset = {
  id: string;
  name: string;
  display_name: string;
  bio: string;
  location: string;
  avatar_url: string | null;
  banner_url: string | null;
  theme: Record<string, unknown>;
};

function usePresets() {
  return useQuery({
    queryKey: ["profile-presets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile_presets")
        .select("*")
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as Preset[];
    },
  });
}

function ProfilesPage() {
  const { data: profile } = useMyProfile();
  const { data: presets = [] } = usePresets();
  const queryClient = useQueryClient();
  const [renaming, setRenaming] = useState<string | null>(null);
  const [name, setName] = useState("");

  // The live profile counts as one of the slots.
  const used = 1 + presets.length;
  const full = used >= FREE_LIMIT;

  const create = useMutation({
    mutationFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user || !profile) throw new Error("Sesión no disponible");
      const { error } = await supabase.from("profile_presets").insert({
        user_id: auth.user.id,
        name: `Perfil ${used + 1}`,
        display_name: profile.display_name ?? "",
        bio: profile.bio ?? "",
        location: profile.location ?? "",
        avatar_url: profile.avatar_url,
        banner_url: profile.banner_url,
        theme: profile.theme as unknown as Record<string, unknown>,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Perfil guardado", { description: "Se creó a partir de tu configuración actual." });
      queryClient.invalidateQueries({ queryKey: ["profile-presets"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const load = useMutation({
    mutationFn: async (preset: Preset) => {
      if (!profile) throw new Error("Sesión no disponible");
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: preset.display_name,
          bio: preset.bio,
          location: preset.location,
          avatar_url: preset.avatar_url,
          banner_url: preset.banner_url,
          theme: preset.theme as never,
        })
        .eq("id", profile.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Perfil activado");
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("profile_presets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Perfil eliminado");
      queryClient.invalidateQueries({ queryKey: ["profile-presets"] });
    },
  });

  const rename = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("profile_presets")
        .update({ name: name.trim() || "Perfil" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      setRenaming(null);
      queryClient.invalidateQueries({ queryKey: ["profile-presets"] });
    },
  });

  return (
    <div className="space-y-6">
      <DashBanner
        eyebrow="Profiles · Plan Free"
        title="Crea y gestiona tus perfiles"
        description="Guarda distintas versiones de tu perfil y cámbialas con un clic. Tu nombre, bio, avatar y tema se aplican al instante."
        image={profilesArt.url}
      />

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex shrink-0 gap-1">
            {Array.from({ length: FREE_LIMIT }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-7 rounded-full ${i < used ? "bg-primary" : "bg-surface-strong"}`}
              />
            ))}
          </div>
          <p className="min-w-0 truncate text-sm">
            <span className="font-semibold">
              {used} de {FREE_LIMIT}
            </span>{" "}
            <span className="text-muted-foreground">perfiles</span>
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button asChild size="sm" variant="secondary" className="rounded-xl text-xs">
            <Link to="/dashboard/premium">
              <Crown className="size-3.5" /> Obtener V.I.P · 3 perfiles
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary" className="rounded-xl text-xs">
            <Link to="/dashboard/premium">
              <Crown className="size-3.5" /> Obtener Premium · 5 perfiles
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {/* Live profile */}
        <article className="relative rounded-2xl border border-border/60 bg-card/40 p-6 text-center backdrop-blur-xl">
          <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400" /> Activo
          </span>
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={`Avatar de ${profile.username}`}
              className="mx-auto size-16 rounded-full object-cover ring-2 ring-primary/30"
            />
          ) : (
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-surface-strong font-mono text-lg font-bold text-primary ring-2 ring-primary/30">
              {(profile?.username ?? "qs").slice(0, 2).toUpperCase()}
            </span>
          )}
          <p className="mt-3 truncate text-sm font-semibold">
            {profile?.display_name || profile?.username}
          </p>
          <p className="truncate text-xs text-muted-foreground">@{profile?.username}</p>
          <Button asChild className="mt-5 w-full rounded-xl">
            <Link to="/dashboard/profile">
              <Pencil className="size-4" /> Editar perfil
            </Link>
          </Button>
        </article>

        {/* Saved presets */}
        {presets.map((p) => (
          <article
            key={p.id}
            className="relative rounded-2xl border border-border/60 bg-card/40 p-6 text-center backdrop-blur-xl"
          >
            <button
              onClick={() => remove.mutate(p.id)}
              aria-label={`Eliminar ${p.name}`}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
            {p.avatar_url ? (
              <img src={p.avatar_url} alt="" className="mx-auto size-16 rounded-full object-cover" />
            ) : (
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-surface-strong font-mono text-lg font-bold text-muted-foreground">
                {p.name.slice(0, 2).toUpperCase()}
              </span>
            )}

            {renaming === p.id ? (
              <Input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => rename.mutate(p.id)}
                onKeyDown={(e) => e.key === "Enter" && rename.mutate(p.id)}
                className="mt-3 h-8 text-center text-sm"
              />
            ) : (
              <button
                onClick={() => {
                  setRenaming(p.id);
                  setName(p.name);
                }}
                className="mt-3 block w-full truncate text-sm font-semibold hover:text-primary"
              >
                {p.name}
              </button>
            )}
            <p className="truncate text-xs text-muted-foreground">
              {p.display_name || "Sin nombre visible"}
            </p>

            <Button
              onClick={() => load.mutate(p)}
              disabled={load.isPending}
              variant="secondary"
              className="mt-5 w-full rounded-xl"
            >
              <Upload className="size-4" /> Cargar perfil
            </Button>
          </article>
        ))}

        {/* New slot */}
        {full ? (
          <Link
            to="/dashboard/premium"
            className="grid min-h-[236px] place-items-center rounded-2xl border border-dashed border-border/60 bg-card/20 p-6 text-center transition-colors hover:border-primary/50"
          >
            <div>
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-surface-strong text-primary">
                <Crown className="size-5" />
              </span>
              <p className="mt-3 text-sm font-medium">Límite alcanzado</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Mejora tu plan para desbloquear más perfiles.
              </p>
            </div>
          </Link>
        ) : (
          <button
            onClick={() => create.mutate()}
            disabled={create.isPending || !profile}
            className="grid min-h-[236px] place-items-center rounded-2xl border border-dashed border-border/60 bg-card/20 p-6 text-center transition-colors hover:border-primary/50 disabled:opacity-60"
          >
            <div>
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-surface-strong text-foreground">
                <Plus className="size-5" />
              </span>
              <p className="mt-3 text-sm font-medium">Nuevo perfil</p>
              <p className="mt-1 text-xs text-muted-foreground">Guarda tu configuración actual</p>
            </div>
          </button>
        )}
      </div>

      <section className="flex gap-3 rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">¿Cómo funcionan los perfiles?</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Pulsa <strong className="text-foreground">Nuevo perfil</strong> para guardar tu configuración
            actual (nombre, bio, avatar y tema) como un perfil reutilizable. Luego usa{" "}
            <strong className="text-foreground">Cargar perfil</strong> en cualquier tarjeta para activarlo
            al instante. Plan <span className="text-primary">Free</span> · {FREE_LIMIT} perfiles · V.I.P 3 ·
            Premium 5.
          </p>
        </div>
      </section>
    </div>
  );
}
