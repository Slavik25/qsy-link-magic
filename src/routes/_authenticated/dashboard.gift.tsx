import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Check, CreditCard, Crown, Gem, Gift, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { RankBadge } from "@/components/qsy/rank-badge";

export const Route = createFileRoute("/_authenticated/dashboard/gift")({
  component: GiftPremium,
  head: () => ({
    meta: [
      { title: "Regalar Premium · QSY" },
      {
        name: "description",
        content: "Regala el rango Obsidian o Seraph a cualquier usuario de QSY con un pago único.",
      },
      { property: "og:title", content: "Regalar Premium · QSY" },
      { property: "og:description", content: "Regala Obsidian o Seraph a otro usuario de QSY." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type Plan = "obsidian" | "seraph";

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(value);
}

const PLANS: {
  key: Plan;
  name: string;
  price: number;
  icon: typeof Gem;
  perks: string[];
  className: string;
}[] = [
  {
    key: "obsidian",
    name: "Obsidian",
    price: 5.99,
    icon: Gem,
    perks: ["3 biolinks independientes", "Layouts y efectos premium", "Insignia V.I.P en el perfil"],
    className:
      "border-violet-400/40 bg-gradient-to-br from-violet-500/15 via-fuchsia-500/5 to-transparent",
  },
  {
    key: "seraph",
    name: "Seraph",
    price: 14.99,
    icon: Crown,
    perks: [
      "5 biolinks independientes",
      "Dominios qsy.rip · qsy.es · qsy.bio",
      "Todo lo de Obsidian + prioridad",
    ],
    className:
      "border-amber-300/50 bg-gradient-to-br from-amber-300/15 via-amber-200/5 to-transparent",
  },
];

type Target = { id: string; username: string; display_name: string; avatar_url: string | null; rank: string | null };

function useSearchProfiles(term: string) {
  return useQuery({
    queryKey: ["gift-search", term],
    enabled: term.trim().length >= 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, rank")
        .ilike("username", `%${term.trim()}%`)
        .limit(8);
      if (error) throw error;
      return (data ?? []) as Target[];
    },
  });
}

function GiftPremium() {
  const [term, setTerm] = useState("");
  const [target, setTarget] = useState<Target | null>(null);
  const [plan, setPlan] = useState<Plan>("obsidian");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { data: results, isFetching } = useSearchProfiles(term);

  const selectedPlan = PLANS.find((p) => p.key === plan)!;

  async function send() {
    if (!target) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 400));
    setSending(false);
    toast.info("Pasarela de pago en configuración", {
      description: `Tu regalo de ${selectedPlan.name} para @${target.username} (${formatPrice(
        selectedPlan.price,
      )}) quedará listo en cuanto conectemos el sistema de pago.`,
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/60 bg-surface p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Gift className="size-5" />
          </span>
          <div>
            <h1 className="text-lg font-semibold">Regalar Premium</h1>
            <p className="text-xs text-muted-foreground">
              Elige un usuario y regálale Obsidian o Seraph con un pago único.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-2 text-xs font-semibold">
          <CreditCard className="size-4 text-primary" /> Pago seguro con tarjeta
        </span>
      </header>

      <section className="rounded-3xl border border-border/60 bg-surface p-6">
        <h2 className="mb-3 text-sm font-semibold">1 · Elige al destinatario</h2>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={target ? target.username : term}
            onChange={(e) => {
              setTarget(null);
              setTerm(e.target.value);
            }}
            placeholder="Buscar por nombre de usuario…"
            className="h-11 rounded-2xl pl-9 text-sm"
          />
          {isFetching && (
            <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>

        {!target && (results?.length ?? 0) > 0 && (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {results!.map((u) => (
              <li key={u.id}>
                <button
                  onClick={() => setTarget(u)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-background/50 px-3 py-2.5 text-left text-xs transition-colors hover:border-primary/50"
                >
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="" className="size-8 rounded-full object-cover" />
                  ) : (
                    <span className="grid size-8 place-items-center rounded-full bg-surface-strong font-mono text-[10px] text-primary">
                      {u.username.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate font-medium">@{u.username}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {u.display_name}
                    </span>
                  </span>
                  <RankBadge rank={u.rank} size="sm" className="ml-auto" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {target && (
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-primary/50 bg-primary/10 px-4 py-3 text-xs">
            <Check className="size-4 text-primary" />
            Regalarás a <strong>@{target.username}</strong>
            <RankBadge rank={target.rank} size="sm" className="ml-auto" />
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-border/60 bg-surface p-6">
        <h2 className="mb-3 text-sm font-semibold">2 · Elige el plan</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {PLANS.map((p) => {
            const Icon = p.icon;
            const active = plan === p.key;
            return (
              <button
                key={p.key}
                onClick={() => setPlan(p.key)}
                className={`rounded-3xl border p-5 text-left transition-all ${p.className} ${
                  active ? "ring-2 ring-primary/60" : "hover:brightness-125"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="size-5" />
                  <span className="text-base font-semibold">{p.name}</span>
                  <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold">
                    <CreditCard className="size-3.5 text-primary" /> {formatPrice(p.price)}
                  </span>
                </div>
                <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3 shrink-0 text-primary" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-border/60 bg-surface p-6">
        <h2 className="mb-3 text-sm font-semibold">3 · Mensaje y confirmación</h2>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 200))}
          placeholder="Mensaje opcional para el destinatario…"
          className="min-h-20 rounded-2xl text-sm"
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            onClick={send}
            disabled={!target || sending}
            className="rounded-2xl"
          >
            {sending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Gift className="size-4" />
            )}
            Pagar y regalar {selectedPlan.name} · {formatPrice(selectedPlan.price)}
          </Button>
          <span className="text-xs text-muted-foreground">
            La pasarela de pago se conectará en breve.
          </span>
          {!target && <span className="text-xs text-muted-foreground">Selecciona un usuario.</span>}
        </div>
      </section>

      <GiftHistory />
    </div>
  );
}

function GiftHistory() {
  const { data } = useQuery({
    queryKey: ["gift-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rank_gifts")
        .select("id, recipient_username, rank, price, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
  });
  if (!data?.length) return null;
  return (
    <section className="rounded-3xl border border-border/60 bg-surface p-6">
      <h2 className="mb-3 text-sm font-semibold">Historial de regalos</h2>
      <ul className="space-y-2">
        {data.map((g) => (
          <li
            key={g.id}
            className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/50 px-4 py-2.5 text-xs"
          >
            <Gift className="size-3.5 text-primary" />
            <span className="font-medium">@{g.recipient_username}</span>
            <RankBadge rank={g.rank} size="sm" />
            <span className="ml-auto text-muted-foreground">
              {new Date(g.created_at).toLocaleDateString("es-ES")} ·{" "}
              {formatPrice(g.price)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
