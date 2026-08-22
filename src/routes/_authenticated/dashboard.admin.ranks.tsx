import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Crown, Gift, Wrench } from "lucide-react";
import { toast } from "sonner";
import { AdminCard, Empty, Pill } from "@/components/qsy/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { listRankCandidates, openRankReview, type RankCandidate } from "@/lib/rank-review.functions";
import { RANK_LABEL, type QsyRank } from "@/lib/domains";

export const Route = createFileRoute("/_authenticated/dashboard/admin/ranks")({
  component: AdminRanks,
});

const STATUS_LABEL: Record<string, string> = {
  pending: "En revisión",
  legit_gift: "Regalo legítimo",
  manual_adjust: "Ajuste manual",
};

function AdminRanks() {
  const qc = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["admin-rank-candidates"],
    queryFn: async () => (await listRankCandidates()).rows,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-rank-candidates"] });

  const open = useMutation({
    mutationFn: async (row: RankCandidate) => {
      const res = await openRankReview({ data: { profileId: row.profileId } });
      if (!res.ok) throw new Error(res.error ?? "No se pudo abrir el caso");
      return res;
    },
    onSuccess: () => {
      toast.success("Caso abierto para revisión");
      void refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resolve = useMutation({
    mutationFn: async (args: { row: RankCandidate; decision: "legit_gift" | "manual_adjust" }) => {
      const { error } = await supabase.rpc("resolve_rank_review", {
        _review_id: args.row.reviewId!,
        _decision: args.decision,
        _note: notes[args.row.profileId] ?? "",
      });
      if (error) throw new Error(error.message);
      return args;
    },
    onSuccess: ({ row, decision }) => {
      toast.success(
        decision === "legit_gift"
          ? `@${row.username} conserva ${RANK_LABEL[row.rank as QsyRank] ?? row.rank}`
          : `@${row.username} volvió a Free`,
      );
      void refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = data ?? [];
  const unbacked = rows.filter((r) => r.gifts === 0 && r.paidOrders === 0 && r.status !== "legit_gift");

  return (
    <div className="space-y-6">
      <AdminCard
        title="Revisión de rangos premium"
        desc="Rangos sin pago ni regalo registrado. Marcá cada caso como regalo legítimo (mantiene el rango) o ajuste manual (vuelve a Free). Toda decisión queda auditada."
      >
        <div className="mb-4 flex flex-wrap gap-2 text-xs">
          <Pill>{rows.length} cuentas premium</Pill>
          <Pill tone={unbacked.length ? "danger" : "ok"}>{unbacked.length} sin respaldo</Pill>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : rows.length === 0 ? (
          <Empty text="No hay cuentas con rango premium." />
        ) : (
          <div className="space-y-3">
            {rows.map((row) => {
              const backed = row.gifts > 0 || row.paidOrders > 0;
              return (
                <div
                  key={row.profileId}
                  className="rounded-2xl border border-border/50 bg-surface-strong/30 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Crown className="size-4 text-primary" />
                    <span className="font-semibold">@{row.username}</span>
                    <Pill>{RANK_LABEL[row.rank as QsyRank] ?? row.rank}</Pill>
                    <Pill tone={backed ? "ok" : "danger"}>
                      {backed ? `${row.paidOrders} pagos · ${row.gifts} regalos` : "sin pago ni regalo"}
                    </Pill>
                    {row.status ? (
                      <Pill tone={row.status === "manual_adjust" ? "danger" : "ok"}>
                        {STATUS_LABEL[row.status]}
                      </Pill>
                    ) : null}
                  </div>

                  {row.status === "pending" ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Input
                        value={notes[row.profileId] ?? ""}
                        onChange={(e) => setNotes((n) => ({ ...n, [row.profileId]: e.target.value }))}
                        placeholder="Nota para la auditoría (opcional)"
                        className="h-9 max-w-xs"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={resolve.isPending}
                        onClick={() => resolve.mutate({ row, decision: "legit_gift" })}
                      >
                        <Gift className="size-4" /> Regalo legítimo
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={resolve.isPending}
                        onClick={() => {
                          if (!window.confirm(`¿Quitar el rango a @${row.username}?`)) return;
                          resolve.mutate({ row, decision: "manual_adjust" });
                        }}
                      >
                        <Wrench className="size-4" /> Ajuste manual
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {row.note ? (
                        <span className="text-xs text-muted-foreground">Nota: {row.note}</span>
                      ) : null}
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={open.isPending}
                        onClick={() => open.mutate(row)}
                      >
                        Abrir revisión
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
