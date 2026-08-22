import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Check, Copy, Loader2, Search, Sparkles, X } from "lucide-react";
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
        content: "Busca y reclama nombres OG de 2, 3 y 4 letras disponibles en QSY antes que nadie.",
      },
      { property: "og:title", content: "Nombres OG · QSY" },
      { property: "og:description", content: "Descubre qué nombres cortos siguen libres en QSY." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const LETTERS = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const LENGTHS = [2, 3, 4] as const;
type Len = (typeof LENGTHS)[number];
type Charset = "letters" | "alnum";
const MAX_RESULTS = 240;

function useTakenNames() {
  return useQuery({
    queryKey: ["og-taken"],
    staleTime: 60_000,
    queryFn: async () => {
      const taken = new Set<string>();
      for (const pattern of ["__", "___", "____"]) {
        const { data, error } = await supabase
          .from("profiles")
          .select("username")
          .like("username", pattern)
          .limit(5000);
        if (error) throw error;
        for (const row of data ?? []) taken.add(row.username.toLowerCase());
      }
      const { data: banned } = await supabase.from("banned_usernames").select("name").limit(5000);
      for (const row of banned ?? []) {
        const n = row.name.toLowerCase();
        if (n.length >= 2 && n.length <= 4) taken.add(n);
      }
      return taken;
    },
  });
}

function* combos(chars: string, len: number): Generator<string> {
  const idx = new Array(len).fill(0);
  const total = Math.pow(chars.length, len);
  for (let i = 0; i < total; i++) {
    let out = "";
    for (let p = 0; p < len; p++) out += chars[idx[p]];
    yield out;
    for (let p = len - 1; p >= 0; p--) {
      idx[p]++;
      if (idx[p] < chars.length) break;
      idx[p] = 0;
    }
  }
}

function OgNamesPage() {
  const { data: taken, isLoading, isError } = useTakenNames();
  const [len, setLen] = useState<Len>(2);
  const [charset, setCharset] = useState<Charset>("letters");
  const [query, setQuery] = useState("");
  const [onlyFree, setOnlyFree] = useState(true);

  const chars = charset === "letters" ? LETTERS : LETTERS + DIGITS;

  const results = useMemo(() => {
    if (!taken) return [] as { name: string; free: boolean }[];
    const q = query.trim().toLowerCase();
    const out: { name: string; free: boolean }[] = [];
    for (const name of combos(chars, len)) {
      if (q && !name.includes(q)) continue;
      const free = !taken.has(name);
      if (onlyFree && !free) continue;
      out.push({ name, free });
      if (out.length >= MAX_RESULTS) break;
    }
    return out;
  }, [taken, chars, len, query, onlyFree]);

  const freeCount = useMemo(() => {
    if (!taken) return 0;
    let n = 0;
    for (const name of combos(chars, len)) if (!taken.has(name)) n++;
    return n;
  }, [taken, chars, len]);

  const totalCount = Math.pow(chars.length, len);

  async function copy(name: string) {
    try {
      await navigator.clipboard.writeText(name);
      toast.success(`"${name}" copiado`, { description: `Úsalo como ${DEFAULT_DOMAIN}/${name}` });
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
        <h1 className="mt-2 text-2xl font-semibold">Buscador de nombres cortos</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Encuentra nombres de 2, 3 o 4 caracteres que siguen libres en QSY. Cambia tu nombre de usuario
          desde Configuración para reclamarlo.
        </p>
      </header>

      <section className="space-y-4 rounded-2xl border border-border/50 bg-surface-strong/30 p-5">
        <div className="flex flex-wrap items-center gap-2">
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
          <span className="mx-1 h-6 w-px bg-border/60" />
          {(["letters", "alnum"] as Charset[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCharset(c)}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                charset === c
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {c === "letters" ? "Solo letras" : "Letras + números"}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
              placeholder="Filtra por letras, ej. qs"
              maxLength={4}
              className="pl-9"
            />
          </div>
          <Button
            type="button"
            variant={onlyFree ? "default" : "secondary"}
            className="rounded-xl"
            onClick={() => setOnlyFree((v) => !v)}
          >
            {onlyFree ? "Solo disponibles" : "Mostrar todos"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-3.5 animate-spin" /> Analizando nombres registrados…
            </span>
          ) : isError ? (
            "No se pudo cargar la lista de nombres."
          ) : (
            <>
              <span className="font-semibold text-foreground">{freeCount.toLocaleString("es")}</span> libres de{" "}
              {totalCount.toLocaleString("es")} combinaciones · mostrando {results.length}
              {results.length >= MAX_RESULTS ? " (usa el filtro para ver más)" : ""}
            </>
          )}
        </p>
      </section>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {results.map((r) => (
          <button
            key={r.name}
            type="button"
            onClick={() => r.free && copy(r.name)}
            disabled={!r.free}
            className={`group flex items-center justify-between rounded-xl border px-3 py-2.5 text-left font-mono text-sm transition-all ${
              r.free
                ? "border-border/60 bg-card/40 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/10"
                : "cursor-not-allowed border-border/40 bg-card/20 text-muted-foreground/60 line-through"
            }`}
          >
            <span>{r.name}</span>
            {r.free ? (
              <span className="text-muted-foreground group-hover:text-primary">
                <Copy className="size-3.5" />
              </span>
            ) : (
              <X className="size-3.5" />
            )}
          </button>
        ))}
        {!isLoading && results.length === 0 && (
          <p className="col-span-full rounded-xl border border-border/50 bg-card/30 p-6 text-center text-sm text-muted-foreground">
            <Check className="mx-auto mb-2 size-4" />
            No hay nombres que coincidan con ese filtro.
          </p>
        )}
      </section>
    </div>
  );
}
