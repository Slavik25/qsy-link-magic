import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BadgeCheck, Search } from "lucide-react";
import { SiteNav } from "@/components/qsy/site-nav";
import { SiteFooter } from "@/components/qsy/site-footer";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { readTheme, type Profile } from "@/lib/qsy";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore — Perfiles QSY" },
      {
        name: "description",
        content: "Descubre perfiles QSY destacados, populares y recién creados.",
      },
      { property: "og:title", content: "Explore — Perfiles QSY" },
      { property: "og:description", content: "Descubre perfiles QSY destacados y populares." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/explore" },
    ],
    links: [{ rel: "canonical", href: "/explore" }],
  }),
  component: ExplorePage,
});

function useProfiles() {
  return useQuery({
    queryKey: ["explore"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(60);
      if (error) throw error;
      return (data ?? []).map((r: any) => ({ ...r, theme: readTheme(r.theme) })) as Profile[];
    },
  });
}

function ProfileCard({ p }: { p: Profile }) {
  return (
    <Link
      to="/$username"
      params={{ username: p.username }}
      className="group block overflow-hidden rounded-2xl glass p-5 lift hover:bg-surface-strong"
    >
      <div
        className="mb-4 h-16 rounded-xl"
        style={{
          background: `linear-gradient(120deg, ${p.theme.accent}33, transparent 70%)`,
        }}
      />
      <div className="flex items-center gap-3">
        <img
          src={p.avatar_url || "https://i.pravatar.cc/120"}
          alt={p.display_name}
          loading="lazy"
          width={44}
          height={44}
          className="size-11 rounded-full object-cover"
        />
        <div className="min-w-0">
          <p className="flex items-center gap-1 truncate font-medium">
            {p.display_name}
            {p.verified && <BadgeCheck className="size-4 text-primary" />}
          </p>
          <p className="truncate text-xs text-muted-foreground">@{p.username}</p>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{p.bio || "—"}</p>
    </Link>
  );
}

function Section({ title, items }: { title: string; items: Profile[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="text-lg font-medium">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <ProfileCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}

function ExplorePage() {
  const [q, setQ] = useState("");
  const { data = [], isLoading } = useProfiles();
  const filtered = data.filter(
    (p) =>
      p.username.includes(q.toLowerCase()) ||
      p.display_name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Explore</h1>
        <p className="mt-2 text-muted-foreground">
          Perfiles reales de la comunidad QSY.
        </p>

        <div className="relative mt-6 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value.slice(0, 40))}
            placeholder="Buscar por nombre o @usuario"
            className="pl-9"
          />
        </div>

        {isLoading && <p className="mt-10 text-sm text-muted-foreground">Cargando perfiles…</p>}

        {q ? (
          <Section title={`Resultados (${filtered.length})`} items={filtered} />
        ) : (
          <>
            <Section title="Destacados" items={data.filter((p) => p.featured)} />
            <Section title="Populares" items={data.filter((p) => p.verified)} />
            <Section title="Nuevos" items={data.slice(0, 6)} />
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
