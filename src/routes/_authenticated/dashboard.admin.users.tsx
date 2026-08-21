import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BadgeCheck, Ban, Eye, Heart, Search, ShieldPlus, Star } from "lucide-react";
import { toast } from "sonner";
import { AdminCard, Empty, Pill } from "@/components/qsy/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction, useAdminUsers, type AdminProfile } from "@/lib/admin-data";
import { BADGES } from "@/lib/badges";

export const Route = createFileRoute("/_authenticated/dashboard/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AdminProfile | null>(null);
  const { data: users } = useAdminUsers(search);
  const qc = useQueryClient();

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["admin-users"] });
    await qc.invalidateQueries({ queryKey: ["admin-overview"] });
  }

  async function toggleFlag(p: AdminProfile, field: "verified" | "featured") {
    const value = !p[field];
    const patch = field === "verified" ? { verified: value } : { featured: value };
    const { error } = await supabase.from("profiles").update(patch).eq("id", p.id);
    if (error) {
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
                      <div className="flex gap-1.5">
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
                        <button
                          onClick={() => grantAdmin(p)}
                          title="Otorgar admin"
                          className="rounded-lg border border-border/60 p-1.5 text-muted-foreground hover:border-primary/50 hover:text-primary"
                        >
                          <ShieldPlus className="size-3.5" />
                        </button>
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

      {selected && (
        <AdminCard
          title={`@${selected.username}`}
          desc="Otorgar insignias a este usuario"
          action={
            <Button variant="secondary" size="sm" onClick={() => setSelected(null)}>
              Cerrar
            </Button>
          }
        >
          <div className="flex flex-wrap gap-2">
            {BADGES.map((b) => (
              <button
                key={b.key}
                onClick={() => giveBadge(selected, b.key)}
                className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-surface px-3 py-2 text-xs transition-colors hover:border-primary/50 hover:text-primary"
              >
                {b.img && <img src={b.img} alt="" className="size-4" />}
                {b.name}
              </button>
            ))}
          </div>
        </AdminCard>
      )}
    </div>
  );
}
