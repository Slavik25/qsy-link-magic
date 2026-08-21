import { profileHost } from "@/lib/domains";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Crown, ExternalLink, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashBanner } from "@/components/qsy/dash-banner";
import { supabase } from "@/integrations/supabase/client";
import { setActiveProfileId, useActiveProfileId, useMyProfiles } from "@/lib/qsy-data";
import type { Profile } from "@/lib/qsy";
import { RankBadge, RankName, RANK_PROFILE_LIMIT, normalizeRank } from "@/components/qsy/rank-badge";
import profilesArt from "@/assets/card-32.png.asset.json";

export const Route = createFileRoute("/_authenticated/dashboard/profiles")({
  component: ProfilesPage,
  head: () => ({
    meta: [
      { title: "Perfiles · Dashboard QSY" },
      {
        name: "description",
        content: "Gestiona varios biolinks QSY totalmente independientes desde una sola cuenta.",
      },
    ],
  }),
});

function ProfilesPage() {
  const { data: profiles = [] } = useMyProfiles();
  const activeId = useActiveProfileId();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [username, setUsername] = useState("");

  const active = profiles.find((p) => p.id === activeId) ?? profiles[0] ?? null;
  const rank = normalizeRank(
    profiles.find((p) => p.rank === "seraph")?.rank ??
      profiles.find((p) => p.rank === "obsidian")?.rank ??
      active?.rank,
  );
  const FREE_LIMIT = RANK_PROFILE_LIMIT[rank];
  const used = profiles.length;
  const full = used >= FREE_LIMIT;

  const create = useMutation({
    mutationFn: async () => {
      const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
      if (clean.length < 3) throw new Error("El usuario necesita al menos 3 caracteres (a-z, 0-9, _).");
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sesión no disponible");
      const { data, error } = await supabase
        .from("profiles")
        .insert({ user_id: auth.user.id, username: clean, display_name: clean })
        .select("id")
        .single();
      if (error) {
        throw new Error(
          error.code === "23505" ? "Ese usuario ya está en uso." : error.message,
        );
      }
      return data.id as string;
    },
    onSuccess: (id) => {
      setCreating(false);
      setUsername("");
      setActiveProfileId(id);
      toast.success("Perfil creado", {
        description: "Es un biolink independiente: sus enlaces y diseño son propios.",
      });
      void queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      if (activeId === id) setActiveProfileId(null);
      toast.success("Perfil eliminado");
      void queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function edit(p: Profile) {
    setActiveProfileId(p.id);
    void queryClient.invalidateQueries();
    void navigate({ to: "/dashboard/profile" });
  }

  function activate(p: Profile) {
    setActiveProfileId(p.id);
    void queryClient.invalidateQueries();
    toast.success(`Gestionando @${p.username}`);
  }

  return (
    <div className="space-y-6">
      <DashBanner
        eyebrow={`Profiles · Plan ${rank === "seraph" ? "Seraph" : rank === "obsidian" ? "Obsidian" : "Free"}`}
        tone={rank === "seraph" ? "gold" : "violet"}
        title="Crea y gestiona tus perfiles"
        description="Cada perfil es un biolink independiente, con su propia URL, enlaces, insignias y diseño. Nada se comparte entre ellos."
        image={profilesArt.url}
      />

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <RankBadge rank={rank} prefix="Plan" size="sm" />
          <div className="flex shrink-0 gap-1">
            {Array.from({ length: FREE_LIMIT }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-7 rounded-full ${
                  i < used
                    ? rank === "seraph"
                      ? "bg-amber-300"
                      : rank === "obsidian"
                        ? "bg-violet-400"
                        : "bg-primary"
                    : "bg-surface-strong"
                }`}
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
          {rank === "free" && (
            <Button asChild size="sm" variant="secondary" className="rounded-xl text-xs">
              <Link to="/dashboard/rank">
                <Crown className="size-3.5" /> Obsidian · 3 perfiles
              </Link>
            </Button>
          )}
          {rank !== "seraph" && (
            <Button asChild size="sm" variant="secondary" className="rounded-xl text-xs">
              <Link to="/dashboard/rank">
                <Crown className="size-3.5" /> Seraph · 5 perfiles
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {profiles.map((p) => {
          const isActive = active?.id === p.id;
          return (
            <article
              key={p.id}
              className={`qsy-pop relative rounded-2xl border p-6 text-center backdrop-blur-xl transition-colors ${
                isActive ? "border-primary/60 bg-primary/5" : "border-border/60 bg-card/40"
              }`}
            >
              {isActive ? (
                <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  <Check className="size-3" /> Gestionando
                </span>
              ) : null}
              {profiles.length > 1 && (
                <button
                  onClick={() => remove.mutate(p.id)}
                  aria-label={`Eliminar @${p.username}`}
                  className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              )}

              {p.avatar_url ? (
                <img
                  src={p.avatar_url}
                  alt={`Avatar de ${p.username}`}
                  className="mx-auto mt-4 size-16 rounded-full object-cover ring-2 ring-primary/30"
                />
              ) : (
                <span className="mx-auto mt-4 grid size-16 place-items-center rounded-full bg-surface-strong font-mono text-lg font-bold text-primary ring-2 ring-primary/30">
                  {p.username.slice(0, 2).toUpperCase()}
                </span>
              )}

              <p className="mt-3 truncate text-sm font-semibold">{p.display_name || p.username}</p>
              <p className="truncate text-xs text-muted-foreground">{profileHost(p)}/{p.username}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {p.view_count?.toLocaleString("es-ES") ?? 0} visitas
              </p>

              <div className="mt-5 space-y-2">
                <Button onClick={() => edit(p)} className="w-full rounded-xl">
                  <Pencil className="size-4" /> Editar perfil
                </Button>
                <div className="flex gap-2">
                  {!isActive && (
                    <Button
                      onClick={() => activate(p)}
                      variant="secondary"
                      className="flex-1 rounded-xl text-xs"
                    >
                      Gestionar
                    </Button>
                  )}
                  <Button asChild variant="secondary" className="flex-1 rounded-xl text-xs">
                    <Link to="/$username" params={{ username: p.username }}>
                      <ExternalLink className="size-3.5" /> Ver
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          );
        })}

        {full ? (
          <Link
            to="/dashboard/premium"
            className="grid min-h-[280px] place-items-center rounded-2xl border border-dashed border-border/60 bg-card/20 p-6 text-center transition-colors hover:border-primary/50"
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
        ) : creating ? (
          <div className="grid min-h-[280px] place-items-center rounded-2xl border border-primary/50 bg-card/40 p-6 text-center backdrop-blur-xl">
            <div className="w-full">
              <p className="text-sm font-semibold">Nuevo perfil independiente</p>
              <p className="mt-1 text-xs text-muted-foreground">Elige su URL propia</p>
              <div className="mt-4 flex items-center gap-1 rounded-xl border border-border/60 bg-surface px-3 py-2">
                <span className="text-xs text-muted-foreground">qsy.rip/</span>
                <input
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && create.mutate()}
                  placeholder="usuario"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  onClick={() => create.mutate()}
                  disabled={create.isPending}
                  className="flex-1 rounded-xl"
                >
                  Crear
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setCreating(false)}
                  className="rounded-xl"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="grid min-h-[280px] place-items-center rounded-2xl border border-dashed border-border/60 bg-card/20 p-6 text-center transition-colors hover:border-primary/50"
          >
            <div>
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-surface-strong text-foreground">
                <Plus className="size-5" />
              </span>
              <p className="mt-3 text-sm font-medium">Nuevo perfil</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Empieza desde cero, sin copiar nada
              </p>
            </div>
          </button>
        )}
      </div>

      <section className="flex gap-3 rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">¿Cómo funcionan los perfiles?</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Cada perfil es <strong className="text-foreground">totalmente independiente</strong>: su
            propia URL, avatar, banner, enlaces, insignias, muro y diseño. Pulsa{" "}
            <strong className="text-foreground">Gestionar</strong> para elegir cuál editas en el
            dashboard. Plan <RankName rank={rank} /> · {FREE_LIMIT} perfiles · Free 2 · Obsidian 3 ·
            Seraph 5.
          </p>
        </div>
      </section>
    </div>
  );
}
