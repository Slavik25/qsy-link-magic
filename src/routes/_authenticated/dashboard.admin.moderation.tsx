import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminCard, Empty, Pill } from "@/components/qsy/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction, timeAgo, useAdminTable } from "@/lib/admin-data";

export const Route = createFileRoute("/_authenticated/dashboard/admin/moderation")({
  component: AdminModeration,
});

type Sanction = {
  id: string;
  kind: string;
  reason: string;
  active: boolean;
  created_at: string;
  expires_at: string | null;
  profile_id: string | null;
};
type Report = {
  id: string;
  category: string;
  message: string;
  status: string;
  created_at: string;
  target_profile_id: string | null;
};
type BannedName = { id: string; name: string; reason: string; created_at: string };

function AdminModeration() {
  const qc = useQueryClient();
  const { data: sanctions } = useAdminTable<Sanction>("sanctions");
  const { data: reports } = useAdminTable<Report>("reports");
  const { data: names } = useAdminTable<BannedName>("banned_usernames");
  const [newName, setNewName] = useState("");
  const [nameReason, setNameReason] = useState("");

  const bans = (sanctions ?? []).filter((s) => s.kind === "ban");
  const mutes = (sanctions ?? []).filter((s) => s.kind !== "ban");

  async function lift(s: Sanction) {
    const { error } = await supabase.from("sanctions").update({ active: false }).eq("id", s.id);
    if (error) {
      toast.error("No se pudo levantar", { description: error.message });
      return;
    }
    await logAdminAction("sanction:lift", s.id);
    toast.success("Sanción levantada");
    void qc.invalidateQueries({ queryKey: ["admin-table", "sanctions"] });
  }

  async function addName() {
    if (!newName.trim()) return;
    const { error } = await supabase
      .from("banned_usernames")
      .insert({ name: newName.trim().toLowerCase(), reason: nameReason || "Prohibido" });
    if (error) {
      toast.error("No se pudo vetar", { description: error.message });
      return;
    }
    await logAdminAction("username:ban", newName);
    toast.success(`"${newName}" vetado`);
    setNewName("");
    setNameReason("");
    void qc.invalidateQueries({ queryKey: ["admin-table", "banned_usernames"] });
  }

  async function removeName(id: string) {
    await supabase.from("banned_usernames").delete().eq("id", id);
    void qc.invalidateQueries({ queryKey: ["admin-table", "banned_usernames"] });
  }

  async function setReportStatus(r: Report, status: string) {
    const { error } = await supabase.from("reports").update({ status }).eq("id", r.id);
    if (error) {
      toast.error("Error", { description: error.message });
      return;
    }
    await logAdminAction(`report:${status}`, r.id);
    toast.success("Denuncia actualizada");
    void qc.invalidateQueries({ queryKey: ["admin-table", "reports"] });
  }

  const SanctionList = ({ rows, label }: { rows: Sanction[]; label: string }) =>
    rows.length ? (
      <ul className="space-y-2">
        {rows.map((s) => (
          <li
            key={s.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-surface px-4 py-3 text-xs"
          >
            <Pill tone={s.active ? "danger" : "default"}>{s.active ? "Activa" : "Levantada"}</Pill>
            <span className="min-w-0 flex-1 truncate">{s.reason}</span>
            <span className="text-[10px] text-muted-foreground">{timeAgo(s.created_at)}</span>
            {s.active && (
              <Button size="sm" variant="secondary" onClick={() => lift(s)}>
                Levantar
              </Button>
            )}
          </li>
        ))}
      </ul>
    ) : (
      <Empty text={`Sin ${label}.`} />
    );

  return (
    <div className="space-y-5">
      <AdminCard title="Baneos" desc={`${bans.filter((b) => b.active).length} activos`}>
        <SanctionList rows={bans} label="baneos" />
      </AdminCard>

      <AdminCard title="Silencios" desc="Usuarios silenciados en muros y chat">
        <SanctionList rows={mutes} label="silencios" />
      </AdminCard>

      <AdminCard title="Denuncias" desc="Reportes enviados por la comunidad">
        {reports?.length ? (
          <ul className="space-y-2">
            {reports.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-surface px-4 py-3 text-xs"
              >
                <Pill tone={r.status === "open" ? "open" : "ok"}>{r.status}</Pill>
                <span className="font-medium">{r.category}</span>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{r.message}</span>
                <span className="text-[10px] text-muted-foreground">{timeAgo(r.created_at)}</span>
                {r.status === "open" && (
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="secondary" onClick={() => setReportStatus(r, "resolved")}>
                      Resolver
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setReportStatus(r, "dismissed")}>
                      Descartar
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <Empty text="Sin denuncias." />
        )}
      </AdminCard>

      <AdminCard title="Nombres vetados" desc="Usernames que nadie puede registrar">
        <div className="flex flex-wrap gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="username"
            className="h-9 w-40 rounded-xl text-xs"
          />
          <Input
            value={nameReason}
            onChange={(e) => setNameReason(e.target.value)}
            placeholder="Motivo"
            className="h-9 w-56 rounded-xl text-xs"
          />
          <Button size="sm" onClick={addName}>
            Vetar
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {names?.length ? (
            names.map((n) => (
              <button
                key={n.id}
                onClick={() => removeName(n.id)}
                title={`${n.reason} · click para quitar`}
                className="rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 text-[11px] text-destructive hover:bg-destructive/20"
              >
                {n.name} ✕
              </button>
            ))
          ) : (
            <Empty text="Sin nombres vetados." />
          )}
        </div>
      </AdminCard>
    </div>
  );
}
