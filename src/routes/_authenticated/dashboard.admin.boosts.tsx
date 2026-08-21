import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Eye, Heart, Rocket } from "lucide-react";
import { toast } from "sonner";
import { AdminCard, Empty, Stat } from "@/components/qsy/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction, timeAgo, useAdminTable, useAdminUsers } from "@/lib/admin-data";

export const Route = createFileRoute("/_authenticated/dashboard/admin/boosts")({
  component: AdminBoosts,
});

type Boost = {
  id: string;
  profile_id: string;
  kind: string;
  amount: number;
  created_at: string;
};

function AdminBoosts() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [amount, setAmount] = useState(100);
  const { data: users } = useAdminUsers(search);
  const { data: boosts } = useAdminTable<Boost>("boosts");

  const nameOf = (id: string) => users?.find((u) => u.id === id)?.username ?? id.slice(0, 8);

  async function boost(profileId: string, kind: "views" | "likes") {
    const { error } = await supabase.from("boosts").insert({ profile_id: profileId, kind, amount });
    if (error) {
      toast.error("No se pudo aplicar", { description: error.message });
      return;
    }
    await logAdminAction(`boost:${kind}`, profileId, { amount });
    toast.success(`+${amount} ${kind === "views" ? "visitas" : "likes"} aplicados`);
    void qc.invalidateQueries({ queryKey: ["admin-table", "boosts"] });
    void qc.invalidateQueries({ queryKey: ["admin-users"] });
  }

  const totalViews = (boosts ?? []).filter((b) => b.kind === "views").reduce((s, b) => s + b.amount, 0);
  const totalLikes = (boosts ?? []).filter((b) => b.kind === "likes").reduce((s, b) => s + b.amount, 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Boosts aplicados" value={boosts?.length ?? 0} />
        <Stat label="Visitas otorgadas" value={totalViews} />
        <Stat label="Likes otorgados" value={totalLikes} />
      </div>

      <AdminCard
        title="Sistema de boost"
        desc="Suma visitas o likes a cualquier perfil de la red"
        action={
          <div className="flex gap-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar perfil…"
              className="h-9 w-44 rounded-xl text-xs"
            />
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 1))}
              className="h-9 w-24 rounded-xl text-xs"
            />
          </div>
        }
      >
        {users?.length ? (
          <ul className="space-y-2">
            {users.slice(0, 40).map((u) => (
              <li
                key={u.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-surface px-4 py-3 text-xs"
              >
                <span className="font-mono text-[10px] text-muted-foreground">#{u.uid}</span>
                <span className="font-medium">@{u.username}</span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Eye className="size-3" /> {u.view_count.toLocaleString("es-ES")}
                </span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Heart className="size-3" /> {(u.like_count ?? 0).toLocaleString("es-ES")}
                </span>
                <div className="ml-auto flex gap-1.5">
                  <Button size="sm" variant="secondary" onClick={() => boost(u.id, "views")}>
                    <Rocket className="mr-1 size-3" /> Visitas
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => boost(u.id, "likes")}>
                    <Heart className="mr-1 size-3" /> Likes
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <Empty text="Sin perfiles." />
        )}
      </AdminCard>

      <AdminCard title="Historial de boosts" desc="Últimos impulsos aplicados">
        {boosts?.length ? (
          <ul className="divide-y divide-border/50">
            {boosts.map((b) => (
              <li key={b.id} className="flex items-center gap-3 py-2.5 text-xs">
                <span className="font-mono text-[10px] text-primary">+{b.amount}</span>
                <span>{b.kind === "views" ? "visitas" : "likes"}</span>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">@{nameOf(b.profile_id)}</span>
                <span className="text-[10px] text-muted-foreground">{timeAgo(b.created_at)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty text="Todavía no aplicaste boosts." />
        )}
      </AdminCard>
    </div>
  );
}
