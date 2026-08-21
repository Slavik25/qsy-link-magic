import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Coins, Gem, LayoutTemplate, Lock, Music4, Sparkles, Type, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useMyProfile } from "@/lib/qsy-data";
import type { ThemeConfig } from "@/lib/qsy";
import {
  SHOP_BG_EFFECTS,
  SHOP_DECORATIONS,
  SHOP_LAYOUTS,
  SHOP_NAME_STYLES,
  SHOP_PLAYERS,
} from "@/lib/shop";
import { purchaseItem, useUnlocks, useWallet } from "@/lib/economy";
import { LayoutPreview, PlayerPreview } from "@/components/qsy/shop-previews";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard/premium")({
  component: ShopPage,
  head: () => ({
    meta: [
      { title: "Tienda · QSY" },
      {
        name: "description",
        content:
          "Compra reproductores de música, layouts personalizados y decoraciones de avatar para tu biolink QSY.",
      },
      { property: "og:title", content: "Tienda · QSY" },
      { property: "og:description", content: "Reproductores, layouts y decoraciones para tu biolink." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type Tab = "players" | "layouts" | "names" | "effects" | "decorations";

const TABS: { key: Tab; label: string; icon: typeof Music4 }[] = [
  { key: "players", label: "Reproductores", icon: Music4 },
  { key: "layouts", label: "Layouts", icon: LayoutTemplate },
  { key: "names", label: "Nombres", icon: Type },
  { key: "effects", label: "Fondos", icon: Wand2 },
  { key: "decorations", label: "Decoraciones", icon: Sparkles },
];

function Price({ price, premium }: { price: number; premium?: boolean | undefined }) {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
        premium ? "border-primary/50 bg-primary/10 text-primary" : "border-border/60 text-muted-foreground"
      }`}
    >
      {price === 0 ? "Gratis" : `${price} créditos`}
    </span>
  );
}

function ShopPage() {
  const [tab, setTab] = useState<Tab>("players");
  const { data: profile } = useMyProfile();
  const { data: coins } = useWallet();
  const { data: unlocks } = useUnlocks();
  const qc = useQueryClient();
  const theme = profile?.theme;
  const owned = new Set(unlocks ?? []);

  async function buy(key: string, price: number, name: string) {
    try {
      const balance = await purchaseItem(key);
      toast.success(`${name} comprado`, { description: `Saldo restante: ${balance} QSY Coins` });
      await qc.invalidateQueries({ queryKey: ["wallet"] });
      await qc.invalidateQueries({ queryKey: ["unlocks"] });
    } catch (e) {
      const msg = (e as Error).message;
      toast.error(
        msg.includes("not enough") ? "No tienes suficientes QSY Coins" : "No se pudo comprar",
        { description: msg.includes("not enough") ? `Necesitas ${price} coins. Completa misiones para ganarlos.` : msg },
      );
    }
  }

  async function apply(patch: Partial<ThemeConfig>, label: string) {
    if (!profile) {
      toast.error("Selecciona un perfil primero");
      return;
    }
    const next = { ...profile.theme, ...patch };
    const { error } = await supabase
      .from("profiles")
      .update({ theme: next as never })
      .eq("id", profile.id);
    if (error) {
      toast.error("No se pudo equipar", { description: error.message });
      return;
    }
    toast.success(`${label} equipado en @${profile.username}`);
    void qc.invalidateQueries({ queryKey: ["my-profile"] });
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Gem className="size-5 text-primary" /> Tienda
        </h1>
        <p className="text-sm text-muted-foreground">
          Reproductores de música, layouts personalizados y decoraciones de avatar estilo Discord.
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/40 bg-primary/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <Coins className="size-5 text-primary" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Tus QSY Coins</p>
            <p className="text-xl font-bold text-primary">{(coins ?? 0).toLocaleString("es-ES")}</p>
          </div>
        </div>
        <Button asChild variant="secondary" size="sm" className="rounded-xl">
          <Link to="/dashboard/missions">Conseguir más en Misiones</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-medium transition-colors ${
              tab === t.key
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            <t.icon className="size-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "players" && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SHOP_PLAYERS.map((p) => {
            const active = (theme?.player_key ?? "player-default") === p.key;
            return (
              <article
                key={p.key}
                className="qsy-pop rounded-3xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl transition-colors hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-sm font-semibold">{p.name}</h2>
                  <Price price={p.price} premium={p.premium} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
                <div className="mt-4">
                  <PlayerPreview player={p} />
                </div>
                {p.price > 0 && !owned.has(p.key) ? (
                  <Button
                    className="mt-4 w-full rounded-xl"
                    variant="secondary"
                    onClick={() => buy(p.key, p.price, p.name)}
                  >
                    <Lock className="size-4" /> Comprar · {p.price} QSY
                  </Button>
                ) : (
                  <Button
                    className="mt-4 w-full rounded-xl"
                    variant={active ? "secondary" : "default"}
                    onClick={() =>
                      apply(
                        {
                          player_key: p.key,
                          player_type: p.player_type,
                          player_bg: p.player_bg,
                          ...(p.player_position ? { player_position: p.player_position } : {}),
                        },
                        p.name,
                      )
                    }
                  >
                    {active ? (
                      <>
                        <Check className="size-4" /> Equipado
                      </>
                    ) : (
                      "Equipar"
                    )}
                  </Button>
                )}
              </article>
            );
          })}
        </section>
      )}

      {tab === "layouts" && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SHOP_LAYOUTS.map((l) => {
            const active = (theme?.layout_key ?? "layout-glass") === l.key;
            return (
              <article
                key={l.key}
                className="qsy-pop overflow-hidden rounded-3xl border border-border/60 bg-card/40 backdrop-blur-xl transition-colors hover:border-primary/40"
              >
                <LayoutPreview layout={l} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-sm font-semibold">{l.name}</h2>
                    <Price price={l.price} premium={l.premium} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{l.description}</p>
                  {l.price > 0 && !owned.has(l.key) ? (
                    <Button
                      className="mt-4 w-full rounded-xl"
                      variant="secondary"
                      onClick={() => buy(l.key, l.price, l.name)}
                    >
                      <Lock className="size-4" /> Comprar · {l.price} QSY
                    </Button>
                  ) : (
                    <Button
                      className="mt-4 w-full rounded-xl"
                      variant={active ? "secondary" : "default"}
                      onClick={() =>
                        apply(
                          {
                            layout_key: l.key,
                            template: l.template,
                            profile_width: l.profile_width,
                            avatar_shape: l.avatar_shape,
                            ...(l.card_bg_type ? { card_bg_type: l.card_bg_type } : {}),
                            ...(l.show_card !== undefined ? { show_card: l.show_card } : {}),
                          },
                          l.name,
                        )
                      }
                    >
                      {active ? (
                        <>
                          <Check className="size-4" /> Equipado
                        </>
                      ) : (
                        "Equipar"
                      )}
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}

      {tab === "names" && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SHOP_NAME_STYLES.map((n) => {
            const active = (theme?.username_effect ?? "none") === n.effect;
            return (
              <article
                key={n.key}
                className="qsy-pop overflow-hidden rounded-3xl border border-border/60 bg-card/40 backdrop-blur-xl transition-colors hover:border-primary/40"
              >
                <div
                  className="grid h-28 w-full place-items-center bg-black/50"
                  style={{ ["--p-accent" as string]: theme?.accent ?? "#a78bfa" }}
                >
                  <span
                    className={`text-2xl font-bold ${n.effect === "none" ? "" : `qsy-name-${n.effect}`}`}
                  >
                    {profile?.display_name || profile?.username || "qsy"}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-sm font-semibold">{n.name}</h2>
                    <Price price={n.price} premium={n.premium} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{n.description}</p>
                  {n.price > 0 && !owned.has(n.key) ? (
                    <Button
                      className="mt-4 w-full rounded-xl"
                      variant="secondary"
                      onClick={() => buy(n.key, n.price, n.name)}
                    >
                      <Lock className="size-4" /> Comprar · {n.price} QSY
                    </Button>
                  ) : (
                    <Button
                      className="mt-4 w-full rounded-xl"
                      variant={active ? "secondary" : "default"}
                      onClick={() => apply({ username_effect: n.effect }, n.name)}
                    >
                      {active ? (
                        <>
                          <Check className="size-4" /> Equipado
                        </>
                      ) : (
                        "Equipar"
                      )}
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}

      {tab === "effects" && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SHOP_BG_EFFECTS.map((b) => {
            const active = (theme?.bg_effect ?? "none") === b.effect;
            return (
              <article
                key={b.key}
                className="qsy-pop overflow-hidden rounded-3xl border border-border/60 bg-card/40 backdrop-blur-xl transition-colors hover:border-primary/40"
              >
                <div className="relative h-28 w-full overflow-hidden" style={{ background: b.preview }}>
                  {b.effect !== "none" && (
                    <span aria-hidden className={`absolute inset-0 qsy-bg-${b.effect}`} />
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-sm font-semibold">{b.name}</h2>
                    <Price price={b.price} premium={b.premium} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{b.description}</p>
                  {b.price > 0 && !owned.has(b.key) ? (
                    <Button
                      className="mt-4 w-full rounded-xl"
                      variant="secondary"
                      onClick={() => buy(b.key, b.price, b.name)}
                    >
                      <Lock className="size-4" /> Comprar · {b.price} QSY
                    </Button>
                  ) : (
                    <Button
                      className="mt-4 w-full rounded-xl"
                      variant={active ? "secondary" : "default"}
                      onClick={() => apply({ bg_effect: b.effect }, b.name)}
                    >
                      {active ? (
                        <>
                          <Check className="size-4" /> Equipado
                        </>
                      ) : (
                        "Equipar"
                      )}
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}

      {tab === "decorations" && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SHOP_DECORATIONS.map((d) => {
            const active = (theme?.avatar_decoration ?? "none") === d.key;
            return (
              <article
                key={d.key}
                className="qsy-pop rounded-3xl border border-border/60 bg-card/40 p-5 text-center backdrop-blur-xl transition-colors hover:border-primary/40"
              >
                <div className="relative mx-auto grid size-28 place-items-center">
                  <span className="grid size-[74px] place-items-center overflow-hidden rounded-full bg-surface-strong font-mono text-sm text-primary">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={`Avatar de @${profile.username}`}
                        className="size-full object-cover"
                      />
                    ) : (
                      "QSY"
                    )}
                  </span>
                  {d.image && (
                    <img
                      alt={d.name}
                      src={d.image}
                      loading="lazy"
                      className="pointer-events-none absolute left-1/2 top-1/2 w-28 max-w-none -translate-x-1/2 -translate-y-1/2 select-none"
                    />
                  )}
                </div>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <h2 className="text-sm font-semibold">{d.name}</h2>
                  <Price price={d.price} premium={d.premium} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{d.description}</p>
                {d.price > 0 && !owned.has(d.key) ? (
                  <Button
                    className="mt-4 w-full rounded-xl"
                    variant="secondary"
                    onClick={() => buy(d.key, d.price, d.name)}
                  >
                    <Lock className="size-4" /> Comprar · {d.price} QSY
                  </Button>
                ) : (
                  <Button
                    className="mt-4 w-full rounded-xl"
                    variant={active ? "secondary" : "default"}
                    onClick={() => apply({ avatar_decoration: d.key }, d.name)}
                  >
                    {active ? (
                      <>
                        <Check className="size-4" /> Equipado
                      </>
                    ) : (
                      "Equipar"
                    )}
                  </Button>
                )}
              </article>
            );
          })}
        </section>
      )}

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-primary/30 bg-primary/10 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Rangos QSY</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Desbloquea todo el catálogo, perfiles ilimitados y dominios exclusivos con Obsidian o Seraph.
          </p>
        </div>
        <Button asChild className="rounded-xl px-6">
          <Link to="/dashboard/rank">Subir de rango</Link>
        </Button>
      </section>
    </div>
  );
}
