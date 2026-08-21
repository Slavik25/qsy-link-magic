import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminCard, Empty, Pill } from "@/components/qsy/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction, useAdminTable } from "@/lib/admin-data";

export const Route = createFileRoute("/_authenticated/dashboard/admin/status")({
  component: AdminStatus,
});

type Service = {
  id: string;
  name: string;
  status: string;
  note: string;
  latency_ms: number;
  updated_at: string;
};

const STATUSES = ["operational", "degraded", "down", "maintenance"] as const;
const TONE: Record<string, string> = {
  operational: "ok",
  degraded: "open",
  down: "danger",
  maintenance: "default",
};

function AdminStatus() {
  const qc = useQueryClient();
  const { data: services } = useAdminTable<Service>("service_status", "name");
  const [name, setName] = useState("");

  async function addService() {
    if (!name.trim()) return;
    const { error } = await supabase.from("service_status").insert({ name: name.trim() });
    if (error) {
      toast.error("No se pudo crear", { description: error.message });
      return;
    }
    await logAdminAction("service:create", name);
    setName("");
    void qc.invalidateQueries({ queryKey: ["admin-table", "service_status"] });
  }

  async function update(s: Service, patch: Partial<Service>) {
    const { error } = await supabase
      .from("service_status")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", s.id);
    if (error) {
      toast.error("Error", { description: error.message });
      return;
    }
    await logAdminAction("service:update", s.name, patch as Record<string, unknown>);
    toast.success(`${s.name} actualizado`);
    void qc.invalidateQueries({ queryKey: ["admin-table", "service_status"] });
  }

  async function remove(id: string) {
    await supabase.from("service_status").delete().eq("id", id);
    void qc.invalidateQueries({ queryKey: ["admin-table", "service_status"] });
  }

  return (
    <AdminCard
      title="Host y estado de servicios"
      desc="Controla el estado público de la infraestructura de QSY"
      action={
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nuevo servicio"
            className="h-9 w-48 rounded-xl text-xs"
          />
          <Button size="sm" onClick={addService}>
            Añadir
          </Button>
        </div>
      }
    >
      {services?.length ? (
        <ul className="space-y-2">
          {services.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-surface px-4 py-3 text-xs"
            >
              <Pill tone={TONE[s.status] ?? "default"}>{s.status}</Pill>
              <span className="font-medium">{s.name}</span>
              <span className="min-w-0 flex-1 truncate text-muted-foreground">{s.note || "—"}</span>
              <span className="font-mono text-[10px] text-muted-foreground">{s.latency_ms} ms</span>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map((st) => (
                  <button
                    key={st}
                    onClick={() => update(s, { status: st })}
                    className={`rounded-lg border px-2 py-1 text-[10px] transition-colors ${
                      s.status === st
                        ? "border-primary/60 bg-primary/15 text-primary"
                        : "border-border/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st}
                  </button>
                ))}
                <button
                  onClick={() => remove(s.id)}
                  className="rounded-lg border border-border/60 px-2 py-1 text-[10px] text-muted-foreground hover:border-destructive/60 hover:text-destructive"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Empty text="Sin servicios configurados." />
      )}
    </AdminCard>
  );
}
