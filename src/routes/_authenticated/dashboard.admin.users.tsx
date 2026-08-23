import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BadgeCheck, Ban, Check, Eye, Heart, Plus, Search, ShieldPlus, ShieldMinus, Star, X } from "lucide-react";
import { toast } from "sonner";
import { AdminCard, Empty, Pill } from "@/components/qsy/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction, useAdminUsers, type AdminProfile } from "@/lib/admin-data";
import { BADGES } from "@/lib/badges";
import { RANKS, RANK_LABEL, type QsyRank } from "@/lib/domains";
import { logProfileRejection } from "@/lib/profile-audit";


export const Route = createFileRoute("/_authenticated/dashboard/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AdminProfile | null>(null);
  const { data: users } = useAdminUsers(search);
  const qc = useQueryClient();
  const { data: adminRows } = useQuery({
    queryKey: ["admin-role-ids"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
      return (data ?? []).map((r) => r.user_id as string);
    },
  });
  const adminIds = new Set(adminRows ?? []);


  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["admin-users"] });
    await qc.invalidateQueries({ queryKey: ["admin-overview"] });
  }

  async function setRank(p: AdminProfile, rank: QsyRank) {
    const patch: { rank: QsyRank; domain?: string } = { rank };
    if (rank !== "seraph") patch.domain = "qsy.rip";
    const { error } = await supabase.from("profiles").update(patch).eq("id", p.id);
    if (error) {
      void logProfileRejection({
        endpoint: "admin/users:setRank",
        action: "update",
        targetId: p.id,
        targetUsername: p.username,
        error,
        payload: patch as Record<string, unknown>,
      });
      toast.error("No se pudo cambiar el rango", { description: error.message });
      return;
    }
    await logAdminAction(`rank:${rank}`, p.username);
    toast.success(`@${p.username} ahora es ${RANK_LABEL[rank]}`);
    void refresh();
  }

  async function toggleFlag(p: AdminProfile, field: "verified" | "featured") {

    const value = !p[field];
    const patch = field === "verified" ? { verified: value } : { featured: value };
    const { error } = await supabase.from("profiles").update(patch).eq("id", p.id);
    if (error) {
      void logProfileRejection({
        endpoint: "admin/users:toggleFlag",
        action: "update",
        targetId: p.id,
        targetUsername: p.username,
        error,
        payload: patch as Record<string, unknown>,
      });
      toast.error("No se pudo actualizar", { description: error.message });
      return;
    }
    await logAdminAction(`${field}:${value ? "on" : "off"}`, p.username);
    toast.success(`@${p.username} actualizado`);
    void refresh();
  }

  async function grantAdmin(p: AdminProfile) {
    if (!p.user_id) {
      toast.error("Perfil sin cuenta vinculada");
      return;
    }
    const { error } = await supabase.from("user_roles").insert({ user_id: p.user_id, role: "admin" });
    if (error) {
      toast.error("No se pudo otorgar", { description: error.message });
      return;
    }
    await logAdminAction("role:admin", p.username);
    toast.success(`@${p.username} ahora es admin`);
    void qc.invalidateQueries({ queryKey: ["admin-role-ids"] });
  }

  async function revokeAdmin(p: AdminProfile) {
    if (!p.user_id) {
      toast.error("Perfil sin cuenta vinculada");
      return;
    }
    if (!window.confirm(`¿Quitar el rol de admin a @${p.username}?`)) return;
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", p.user_id)
      .eq("role", "admin");
    if (error) {
      toast.error("No se pudo quitar", { description: error.message });
      return;
    }
    await logAdminAction("role:admin:revoke", p.username);
    toast.success(`@${p.username} ya no es admin`);
    void qc.invalidateQueries({ queryKey: ["admin-role-ids"] });
  }

  async function ban(p: AdminProfile) {
    const reason = window.prompt(`Motivo del baneo de @${p.username}`) ?? "";
    if (!reason) return;
    const { error } = await supabase
      .from("sanctions")
      .insert({ profile_id: p.id, user_id: p.user_id, kind: "ban", reason });
    if (error) {
      toast.error("No se pudo banear", { description: error.message });
      return;
    }
    await logAdminAction("ban", p.username, { reason });
    toast.success(`@${p.username} baneado`);
    void qc.invalidateQueries({ queryKey: ["admin-table", "sanctions"] });
  }

  async function giveBadge(p: AdminProfile, key: string) {
    const { error } = await supabase.from("profile_badges").insert({ profile_id: p.id, badge_key: key });
    if (error) {
      toast.error("No se pudo asignar", { description: error.message });
      return;
    }
    await logAdminAction("badge:grant", p.username, { badge: key });
    toast.success(`Insignia ${key} otorgada a @${p.username}`);
  }

  return (
    <div className="space-y-5">
      <AdminCard
        title="Usuarios"
        desc={`${users?.length ?? 0} perfiles listados`}
        action={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar username…"
              className="h-9 w-56 rounded-xl pl-8 text-xs"
            />
          </div>
        }
      >
        {users?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                <tr className="border-b border-border/60">
                  <th className="py-2 pr-3">UID</th>
                  <th className="py-2 pr-3">Usuario</th>
                  <th className="py-2 pr-3">Visitas</th>
                  <th className="py-2 pr-3">Likes</th>
                  <th className="py-2 pr-3">Estado</th>
                  <th className="py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((p) => (
                  <tr key={p.id} className="border-b border-border/40 hover:bg-surface-strong/40">
                    <td className="py-2.5 pr-3 font-mono text-muted-foreground">#{p.uid}</td>
                    <td className="py-2.5 pr-3">
                      <button
                        onClick={() => setSelected(p)}
                        className="flex items-center gap-2 text-left hover:text-primary"
                      >
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt="" className="size-7 rounded-full object-cover" />
                        ) : (
                          <span className="grid size-7 place-items-center rounded-full bg-surface-strong font-mono text-[9px] text-primary">
                            {p.username.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                        <span className="font-medium">@{p.username}</span>
                      </button>
                    </td>
                    <td className="py-2.5 pr-3">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Eye className="size-3" /> {p.view_count.toLocaleString("es-ES")}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Heart className="size-3" /> {(p.like_count ?? 0).toLocaleString("es-ES")}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <select
                          value={(p as { rank?: string }).rank ?? "free"}
                          onChange={(e) => setRank(p, e.target.value as QsyRank)}
                          className="rounded-lg border border-border/60 bg-card/50 px-2 py-1 text-[11px] outline-none focus:border-primary/60"
                          title="Rango"
                        >
                          {RANKS.map((r) => (
                            <option key={r} value={r}>
                              {RANK_LABEL[r]}
                            </option>
                          ))}
                        </select>
                        {p.verified && <Pill tone="ok">Verificado</Pill>}
                        {p.featured && <Pill>Destacado</Pill>}
                      </div>
                    </td>

                    <td className="py-2.5">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => toggleFlag(p, "verified")}
                          title="Verificar"
                          className="rounded-lg border border-border/60 p-1.5 text-muted-foreground hover:border-primary/50 hover:text-primary"
                        >
                          <BadgeCheck className="size-3.5" />
                        </button>
                        <button
                          onClick={() => toggleFlag(p, "featured")}
                          title="Destacar"
                          className="rounded-lg border border-border/60 p-1.5 text-muted-foreground hover:border-primary/50 hover:text-primary"
                        >
                          <Star className="size-3.5" />
                        </button>
                        {p.user_id && adminIds.has(p.user_id) ? (
                          <button
                            onClick={() => revokeAdmin(p)}
                            title="Quitar admin"
                            className="rounded-lg border border-destructive/50 p-1.5 text-destructive hover:bg-destructive/10"
                          >
                            <ShieldMinus className="size-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => grantAdmin(p)}
                            title="Otorgar admin"
                            className="rounded-lg border border-border/60 p-1.5 text-muted-foreground hover:border-primary/50 hover:text-primary"
                          >
                            <ShieldPlus className="size-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => ban(p)}
                          title="Banear"
                          className="rounded-lg border border-border/60 p-1.5 text-muted-foreground hover:border-destructive/60 hover:text-destructive"
                        >
                          <Ban className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty text="No hay usuarios que coincidan." />
        )}
      </AdminCard>

      {selected && <BadgeManager profile={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function BadgeManager({ profile, onClose }: { profile: AdminProfile; onClose: () => void }) {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [pick, setPick] = useState<string>(BADGES[0]?.key ?? "");

  const { data: owned } = useQuery({
    queryKey: ["admin-profile-badges", profile.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile_badges")
        .select("id, badge_key, position")
        .eq("profile_id", profile.id)
        .order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []) as { id: string; badge_key: string; position: number }[];
    },
  });

  const ownedKeys = new Set((owned ?? []).map((b) => b.badge_key));
  const list = BADGES.filter(
    (b) =>
      !query.trim() ||
      b.name.toLowerCase().includes(query.trim().toLowerCase()) ||
      b.key.includes(query.trim().toLowerCase()),
  );

  async function grant(key: string) {
    if (ownedKeys.has(key)) {
      toast.info("El usuario ya tiene esa insignia");
      return;
    }
    const { error } = await supabase
      .from("profile_badges")
      .insert({ profile_id: profile.id, badge_key: key, position: owned?.length ?? 0 });
    if (error) {
      toast.error("No se pudo asignar", { description: error.message });
      return;
    }
    await logAdminAction("badge:grant", profile.username, { badge: key });
    toast.success(`Insignia otorgada a @${profile.username}`);
    void qc.invalidateQueries({ queryKey: ["admin-profile-badges", profile.id] });
  }

  async function revoke(id: string, key: string) {
    const { error } = await supabase.from("profile_badges").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo quitar", { description: error.message });
      return;
    }
    await logAdminAction("badge:revoke", profile.username, { badge: key });
    toast.success("Insignia retirada");
    void qc.invalidateQueries({ queryKey: ["admin-profile-badges", profile.id] });
  }

  return (
    <AdminCard
      title={`Insignias de @${profile.username}`}
      desc="Selecciona la insignia que quieres otorgar o retira las actuales"
      action={
        <Button variant="secondary" size="sm" onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={pick}
            onChange={(e) => setPick(e.target.value)}
            className="h-9 rounded-xl border border-border/60 bg-surface px-3 text-xs outline-none focus:border-primary/50"
          >
            {BADGES.map((b) => (
              <option key={b.key} value={b.key}>
                {b.name}
                {ownedKeys.has(b.key) ? " · ya asignada" : ""}
              </option>
            ))}
          </select>
          <Button size="sm" className="rounded-xl" onClick={() => grant(pick)}>
            Otorgar insignia
          </Button>
          <div className="relative ml-auto">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtrar insignias…"
              className="h-9 w-52 rounded-xl pl-8 text-xs"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Asignadas ({owned?.length ?? 0})
          </p>
          {owned?.length ? (
            <div className="flex flex-wrap gap-2">
              {owned.map((b) => {
                const def = BADGES.find((x) => x.key === b.badge_key);
                return (
                  <span
                    key={b.id}
                    className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-xs"
                  >
                    {def?.img ? (
                      <img src={def.img} alt="" className="size-4" />
                    ) : def?.icon ? (
                      <def.icon className="size-4" style={{ color: def.color ?? undefined }} />
                    ) : null}
                    {def?.name ?? b.badge_key}
                    <button
                      onClick={() => revoke(b.id, b.badge_key)}
                      title="Quitar"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-3.5" />
                    </button>
                  </span>
                );
              })}
            </div>
          ) : (
            <Empty text="Este usuario no tiene insignias todavía." />
          )}
        </div>

        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Catálogo</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((b) => (
              <button
                key={b.key}
                onClick={() => grant(b.key)}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-xs transition-colors ${
                  ownedKeys.has(b.key)
                    ? "border-primary/40 bg-primary/10"
                    : "border-border/60 bg-surface hover:border-primary/50 hover:text-primary"
                }`}
              >
                {b.img ? (
                  <img src={b.img} alt="" className="size-5" />
                ) : b.icon ? (
                  <b.icon className="size-5" style={{ color: b.color ?? undefined }} />
                ) : null}
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{b.name}</span>
                  <span className="block truncate text-[10px] text-muted-foreground">{b.description}</span>
                </span>
                {ownedKeys.has(b.key) ? (
                  <Check className="size-4 shrink-0 text-primary" />
                ) : (
                  <Plus className="size-4 shrink-0 opacity-60" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AdminCard>
  );
}
