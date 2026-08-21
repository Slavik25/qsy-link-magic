import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminCard, Empty } from "@/components/qsy/admin-ui";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction, timeAgo, useAdminTable } from "@/lib/admin-data";

export const Route = createFileRoute("/_authenticated/dashboard/admin/chat")({
  component: AdminChat,
});

type WallPost = {
  id: string;
  author_name: string;
  author_avatar: string | null;
  message: string;
  created_at: string;
};

function AdminChat() {
  const qc = useQueryClient();
  const { data: posts } = useAdminTable<WallPost>("wall_posts");
  const [q, setQ] = useState("");

  const filtered = (posts ?? []).filter(
    (p) =>
      !q.trim() ||
      p.message.toLowerCase().includes(q.toLowerCase()) ||
      p.author_name.toLowerCase().includes(q.toLowerCase()),
  );

  async function remove(id: string) {
    const { error } = await supabase.from("wall_posts").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo borrar", { description: error.message });
      return;
    }
    await logAdminAction("wall:delete", id);
    toast.success("Mensaje eliminado");
    void qc.invalidateQueries({ queryKey: ["admin-table", "wall_posts"] });
  }

  return (
    <AdminCard
      title="Vigilancia en chat"
      desc={`${filtered.length} mensajes en los muros de la red`}
      action={
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar mensaje o autor…"
          className="h-9 w-60 rounded-xl text-xs"
        />
      }
    >
      {filtered.length ? (
        <ul className="space-y-2">
          {filtered.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface px-4 py-3 text-xs"
            >
              {p.author_avatar ? (
                <img src={p.author_avatar} alt="" className="size-7 rounded-full object-cover" />
              ) : (
                <span className="grid size-7 place-items-center rounded-full bg-surface-strong text-[9px] text-primary">
                  {p.author_name.slice(0, 2).toUpperCase()}
                </span>
              )}
              <span className="font-medium">{p.author_name}</span>
              <span className="min-w-0 flex-1 truncate text-muted-foreground">{p.message}</span>
              <span className="text-[10px] text-muted-foreground">{timeAgo(p.created_at)}</span>
              <button
                onClick={() => remove(p.id)}
                className="rounded-lg border border-border/60 p-1.5 text-muted-foreground hover:border-destructive/60 hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <Empty text="Sin mensajes para revisar." />
      )}
    </AdminCard>
  );
}
