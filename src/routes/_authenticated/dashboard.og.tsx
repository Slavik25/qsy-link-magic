import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Check, Copy, Loader2, Search, Sparkles, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_DOMAIN } from "@/lib/domains";

export const Route = createFileRoute("/_authenticated/dashboard/og")({
  component: OgNamesPage,
  head: () => ({
    meta: [
      { title: "Nombres OG · QSY" },
      {
        name: "description",
        content: "Explora los nombres OG de 3 y 4 caracteres ya creados en QSY y descubre cuáles están en venta.",
      },
      { property: "og:title", content: "Nombres OG · QSY" },
      { property: "og:description", content: "Mercado de nombres cortos ya registrados en QSY." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const LENGTHS = [3, 4] as const;
type Len = (typeof LENGTHS)[number];
const CURRENCIES = ["USD", "EUR", "COINS"] as const;
type Currency = (typeof CURRENCIES)[number];

type Listing = {
  id: string;
  username: string;
  price: number;
  currency: string;
  contact: string | null;
  note: string | null;
  status: string;
  profile_id: string;
};

type OgName = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  uid: number;
};

function money(price: number, currency: string) {
  if (currency === "COINS") return `${price.toLocaleString("es")} coins`;
  return `${currency === "EUR" ? "€" : "$"}${price.toLocaleString("es")}`;
}

function useOgData() {
  return useQuery({
    queryKey: ["og-names"],
    staleTime: 30_000,
    queryFn: async () => {
      const names: OgName[] = [];
      for (const pattern of ["___", "____"]) {
        const { data, error } = await supabase
          .from("profiles")
          .select("id,username,display_name,avatar_url,uid")
          .like("username", pattern)
          .order("uid", { ascending: true })
          .limit(5000);
        if (error) throw error;
        for (const row of data ?? []) names.push(row as OgName);
      }
      const { data: listingRows } = await supabase
        .from("og_listings")
        .select("id,username,price,currency,contact,note,status,profile_id")
        .neq("status", "sold")
        .limit(2000);
      const listings = new Map<string, Listing>();
      for (const l of (listingRows ?? []) as Listing[]) listings.set(l.profile_id, l);
      return { names, listings };
    },
  });
}

function useMyOgProfiles() {
  return useQuery({
    queryKey: ["og-my-profiles"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return [];
      const { data } = await supabase
        .from("profiles")
        .select("id,username,user_id")
        .eq("user_id", auth.user.id)
        .limit(50);
      return (data ?? []).filter((p) => p.username.length === 3 || p.username.length === 4);
    },
  });
}

function OgNamesPage() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useOgData();
  const { data: myProfiles } = useMyOgProfiles();
  const [len, setLen] = useState<Len | "all">("all");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "sale">("all");

  const [profileId, setProfileId] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");

  const listings = data?.listings;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data?.names ?? [])
      .filter((n) => (len === "all" ? true : n.username.length === len))
      .filter((n) => (q ? n.username.toLowerCase().includes(q) : true))
      .map((n) => ({ ...n, listing: listings?.get(n.id) }))
      .filter((n) => (filter === "sale" ? Boolean(n.listing) : true))
      .sort((a, b) => {
        if (Boolean(a.listing) !== Boolean(b.listing)) return a.listing ? -1 : 1;
        return a.username.localeCompare(b.username);
      });
  }, [data, listings, len, query, filter]);

  const saleCount = useMemo(
    () => (data?.names ?? []).filter((n) => listings?.has(n.id)).length,
    [data, listings],
  );

  const myListings = useMemo(() => {
    const ids = new Set((myProfiles ?? []).map((p) => p.id));
    return [...(listings?.values() ?? [])].filter((l) => ids.has(l.profile_id));
  }, [listings, myProfiles]);

  const save = useMutation({
    mutationFn: async () => {
      const profile = (myProfiles ?? []).find((p) => p.id === profileId);
      if (!profile || !profile.user_id) throw new Error("Elige uno de tus nombres OG (3 o 4 caracteres).");
      const value = Number(price);
      if (!Number.isFinite(value) || value < 0) throw new Error("Precio inválido.");
      const { error } = await supabase.from("og_listings").upsert(
        {
          profile_id: profile.id,
          user_id: profile.user_id,
          username: profile.username.toLowerCase(),
          price: value,
          currency,
          contact: contact.trim() || null,
          note: note.trim() || null,
          status: "active",
        },
        { onConflict: "profile_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Nombre publicado en venta");
      setPrice("");
      setContact("");
      setNote("");
      void qc.invalidateQueries({ queryKey: ["og-names"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeListing = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("og_listings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Publicación eliminada");
      void qc.invalidateQueries({ queryKey: ["og-names"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function copy(name: string) {
    try {
      await navigator.clipboard.writeText(`${DEFAULT_DOMAIN}/${name}`);
      toast.success(`Enlace de "${name}" copiado`);
    } catch {
      toast.error("No se pudo copiar");
    }
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-border/50 bg-surface-strong/30 p-5">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
          <Sparkles className="size-3.5" /> Nombres OG
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Mercado de nombres OG creados</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Aquí solo aparecen los nombres de 3 y 4 caracteres que ya existen en QSY. Mira quién los tiene y
          cuáles están en venta con el valor que le puso su dueño. La insignia OG es independiente: se
          entrega únicamente a los primeros 50 miembros de QSY.
        </p>
      </header>

      <section className="space-y-4 rounded-2xl border border-border/50 bg-surface-strong/30 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setLen("all")}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
              len === "all"
                ? "border-primary/60 bg-primary/10 text-primary"
                : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            Todos
          </button>
          {LENGTHS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLen(l)}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
                len === l
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {l} caracteres
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
              placeholder="Busca un nombre, ej. qs"
              maxLength={4}
              className="pl-9"
            />
          </div>
          {(
            [
              ["all", "Todos"],
              ["sale", "En venta"],
            ] as const
          ).map(([key, label]) => (
            <Button
              key={key}
              type="button"
              variant={filter === key ? "default" : "secondary"}
              className="rounded-xl"
              onClick={() => setFilter(key)}
            >
              {label}
            </Button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-3.5 animate-spin" /> Cargando nombres registrados…
            </span>
          ) : isError ? (
            "No se pudo cargar la lista de nombres."
          ) : (
            <>
              <span className="font-semibold text-foreground">{(data?.names ?? []).length}</span> nombres OG
              creados · <span className="font-semibold text-foreground">{saleCount}</span> en venta ·
              mostrando {results.length}
            </>
          )}
        </p>
      </section>

      <section className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((r) => (
          <div
            key={r.id}
            className={`rounded-xl border px-3 py-2.5 transition-all ${
              r.listing ? "border-amber-400/40 bg-amber-400/5" : "border-border/60 bg-card/40"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                {r.avatar_url ? (
                  <img
                    src={r.avatar_url}
                    alt={`Avatar de ${r.username}`}
                    className="size-8 shrink-0 rounded-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/15 font-mono text-xs text-primary">
                    {r.username.slice(0, 2)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className={`truncate font-mono text-sm ${r.listing ? "text-amber-200" : ""}`}>{r.username}</p>
                  <p className="truncate text-[11px] text-muted-foreground">#{r.uid} · {r.display_name || r.username}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copy(r.username)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={`Copiar enlace de ${r.username}`}
              >
                <Copy className="size-3.5" />
              </button>
            </div>
            {r.listing && (
              <div className="mt-2 space-y-1 border-t border-amber-400/20 pt-2">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-300">
                  <Tag className="size-3.5" /> {money(Number(r.listing.price), r.listing.currency)}
                </p>
                {r.listing.note && <p className="text-[11px] text-muted-foreground">{r.listing.note}</p>}
                {r.listing.contact && (
                  <p className="truncate text-[11px] text-muted-foreground">Contacto: {r.listing.contact}</p>
                )}
              </div>
            )}
          </div>
        ))}
        {!isLoading && results.length === 0 && (
          <p className="col-span-full rounded-xl border border-border/50 bg-card/30 p-6 text-center text-sm text-muted-foreground">
            <Check className="mx-auto mb-2 size-4" />
            No hay nombres que coincidan con ese filtro.
          </p>
        )}
      </section>

      <section className="space-y-4 rounded-2xl border border-border/50 bg-surface-strong/30 p-5">
        <div>
          <h2 className="text-lg font-semibold">Vende tu nombre OG</h2>
          <p className="text-sm text-muted-foreground">
            Ponle precio a tu nombre de 3 o 4 caracteres y aparecerá en el mercado con tu contacto.
          </p>
        </div>

        {(myProfiles ?? []).length === 0 ? (
          <p className="rounded-xl border border-border/50 bg-card/30 p-4 text-sm text-muted-foreground">
            No tienes ningún perfil con nombre de 3 o 4 caracteres, así que todavía no puedes vender nombres OG.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              Nombre a vender
              <select
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
                className="h-10 w-full rounded-xl border border-border/60 bg-card/40 px-3 text-sm text-foreground"
              >
                <option value="">Selecciona…</option>
                {(myProfiles ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.username}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              Precio
              <div className="flex gap-2">
                <Input
                  value={price}
                  onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                  placeholder="150"
                  inputMode="decimal"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="h-10 rounded-xl border border-border/60 bg-card/40 px-3 text-sm text-foreground"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              Contacto
              <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="@discord / telegram" maxLength={80} />
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              Nota (opcional)
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Acepto intercambios" maxLength={120} />
            </label>
            <div className="sm:col-span-2">
              <Button type="button" className="rounded-xl" disabled={save.isPending} onClick={() => save.mutate()}>
                {save.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Tag className="mr-2 size-4" />}
                Publicar en venta
              </Button>
            </div>
          </div>
        )}

        {myListings.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Tus publicaciones</p>
            {myListings.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-card/40 px-3 py-2 text-sm"
              >
                <span className="font-mono">{l.username}</span>
                <span className="text-amber-300">{money(Number(l.price), l.currency)}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => removeListing.mutate(l.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
