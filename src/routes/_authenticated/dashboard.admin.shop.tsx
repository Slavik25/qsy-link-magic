import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Check, Coins, Eye, Gift, Heart, Rocket, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminCard, Empty, Pill } from "@/components/qsy/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction, useAdminUsers, type AdminProfile } from "@/lib/admin-data";
import {
  SHOP_BG_EFFECTS,
  SHOP_DECORATIONS,
  SHOP_LAYOUTS,
  SHOP_NAME_STYLES,
  SHOP_PLAYERS,
} from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/dashboard/admin/shop")({
  component: AdminShop,
});

const GROUPS = [
  { id: "players", label: "Reproductores", items: SHOP_PLAYERS },
  { id: "layouts", label: "Layouts", items: SHOP_LAYOUTS },
  { id: "names", label: "Nombres", items: SHOP_NAME_STYLES },
  { id: "backgrounds", label: "Fondos", items: SHOP_BG_EFFECTS },
  { id: "decorations", label: "Decoraciones", items: SHOP_DECORATIONS },
] as const;

function useUnlocks(userId?: string | null) {
  return useQuery({
    queryKey: ["admin-unlocks", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_unlocks")
        .select("item_key")
        .eq("user_id", userId!);
      if (error) throw error;
      return (data ?? []).map((r) => r.item_key as string);
    },
  });
}

function useWallet(userId?: string | null) {
  return useQuery({
    queryKey: ["admin-wallet", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_wallets")
        .select("coins")
        .eq("user_id", userId!)
        .maybeSingle();
      return data?.coins ?? 0;
    },
  });
}

function AdminShop() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AdminProfile | null>(null);
  const [group, setGroup] = useState<string>("players");
  const [coins, setCoins] = useState(500);
  const [amount, setAmount] = useState(100);

  const { data: users } = useAdminUsers(search);
  const userId = selected?.user_id ?? null;
  const { data: unlocks } = useUnlocks(userId);
  const { data: wallet } = useWallet(userId);

  const items = useMemo(() => GROUPS.find((g) => g.id === group)?.items ?? [], [group]);
  const owned = new Set(unlocks ?? []);

  async function grant(key: string) {
    if (!userId) return;
    const { error } = await supabase.from("user_unlocks").insert({ user_id: userId, item_key: key });
    if (error) return toast.error("No se pudo otorgar", { description: error.message });
    await logAdminAction("shop:grant", selected?.username, { item: key });
    toast.success(`Otorgado: ${key}`);
    void qc.invalidateQueries({ queryKey: ["admin-unlocks", userId] });
  }

  async function revoke(key: string) {
    if (!userId) return;
    const { error } = await supabase
      .from("user_unlocks")
      .delete()
      .eq("user_id", userId)
      .eq("item_key", key);
    if (error) return toast.error("No se pudo quitar", { description: error.message });
    await logAdminAction("shop:revoke", selected?.username, { item: key });
    toast.success(`Quitado: ${key}`);
    void qc.invalidateQueries({ queryKey: ["admin-unlocks", userId] });
  }

  async function giveCoins() {
    if (!userId) return;
    const { error } = await supabase.rpc("admin_grant_coins", { _user_id: userId, _amount: coins });
    if (error) return toast.error("No se pudo dar coins", { description: error.message });
    await logAdminAction("coins:grant", selected?.username, { coins });
    toast.success(`${coins > 0 ? "+" : ""}${coins} QSY Coins`);
    void qc.invalidateQueries({ queryKey: ["admin-wallet", userId] });
  }

  async function boost(kind: "views" | "likes") {
    if (!selected) return;
    const { error } = await supabase
      .from("boosts")
      .insert({ profile_id: selected.id, kind, amount });
    if (error) return toast.error("No se pudo aplicar", { description: error.message });
    await logAdminAction(`boost:${kind}`, selected.id, { amount });
    toast.success(`+${amount} ${kind === "views" ? "visitas" : "likes"} para @${selected.username}`);
    void qc.invalidateQueries({ queryKey: ["admin-users"] });
    void qc.invalidateQueries({ queryKey: ["admin-table", "boosts"] });
  }

  return (
    <div className="space-y-5">
      <AdminCard
        title="Seleccionar usuario"
        desc="Busca el perfil al que quieres otorgar artículos, coins, visitas o likes"
        action={
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar perfil…"
            className="h-9 w-48 rounded-xl text-xs"
          />
        }
      >
        {users?.length ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {users.slice(0, 20).map((u) => (
              <li key={u.id}>
                <button
                  onClick={() => setSelected(u)}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-xs transition-colors ${
                    selected?.id === u.id
                      ? "border-primary/60 bg-primary/10"
                      : "border-border/60 bg-surface hover:border-primary/40"
                  }`}
                >
                  <span className="font-mono text-[10px] text-muted-foreground">#{u.uid}</span>
                  <span className="font-medium">@{u.username}</span>
                  <span className="ml-auto inline-flex items-center gap-2 text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="size-3" /> {u.view_count.toLocaleString("es-ES")}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Heart className="size-3" /> {(u.like_count ?? 0).toLocaleString("es-ES")}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <Empty text="Sin perfiles." />
        )}
      </AdminCard>

      {selected && (
        <>
          <AdminCard
            title={`Coins, visitas y likes · @${selected.username}`}
            desc={`Saldo actual: ${(wallet ?? 0).toLocaleString("es-ES")} QSY Coins`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="number"
                value={coins}
                onChange={(e) => setCoins(Number(e.target.value) || 0)}
                className="h-9 w-28 rounded-xl text-xs"
              />
              <Button size="sm" onClick={giveCoins}>
                <Coins className="mr-1 size-3" /> Dar coins
              </Button>
              <span className="mx-2 h-6 w-px bg-border/60" />
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 1))}
                className="h-9 w-24 rounded-xl text-xs"
              />
              <Button size="sm" variant="secondary" onClick={() => boost("views")}>
                <Rocket className="mr-1 size-3" /> Visitas
              </Button>
              <Button size="sm" variant="secondary" onClick={() => boost("likes")}>
                <Heart className="mr-1 size-3" /> Likes
              </Button>
            </div>
            {!selected.user_id && (
              <p className="mt-3 text-[11px] text-destructive">
                Este perfil no tiene cuenta asociada: no se le pueden dar coins ni artículos.
              </p>
            )}
          </AdminCard>

          <AdminCard
            title="Artículos de la tienda"
            desc="Otorga o retira cualquier item sin coste para el usuario"
            action={
              <div className="flex flex-wrap gap-1.5">
                {GROUPS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGroup(g.id)}
                    className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                      group === g.id
                        ? "border-primary/60 bg-primary/10 text-primary"
                        : "border-border/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            }
          >
            <ul className="grid gap-2 sm:grid-cols-2">
              {items.map((it) => {
                const has = owned.has(it.key);
                return (
                  <li
                    key={it.key}
                    className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface px-4 py-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{it.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{it.description}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      {has && <Pill tone="ok">Desbloqueado</Pill>}
                      {has ? (
                        <Button size="sm" variant="secondary" onClick={() => revoke(it.key)}>
                          <Trash2 className="size-3" />
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => grant(it.key)} disabled={!selected.user_id}>
                          <Gift className="mr-1 size-3" /> Dar
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            {items.length === 0 && <Empty text="Sin artículos en esta categoría." />}
            <p className="mt-3 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Check className="size-3" /> Los cambios se aplican al instante en el editor del usuario.
            </p>
          </AdminCard>
        </>
      )}
    </div>
  );
}
