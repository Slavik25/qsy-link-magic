import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useLinks, useMyProfile } from "@/lib/qsy-data";
import {
  LINK_CATEGORIES,
  LINK_PLATFORMS,
  buildUrl,
  platformById,
  type LinkCategory,
  type LinkPlatform,
} from "@/lib/link-platforms";
import { DashBanner } from "@/components/qsy/dash-banner";
import type { ProfileLink } from "@/lib/qsy";

export const Route = createFileRoute("/_authenticated/dashboard/links")({
  component: LinksEditor,
  head: () => ({
    meta: [
      { title: "Links · Dashboard QSY" },
      {
        name: "description",
        content: "Conecta tus redes sociales y añade URLs personalizadas a tu biolink QSY.",
      },
    ],
  }),
});

const schema = z.object({
  title: z.string().trim().min(1, "Título requerido").max(60),
  url: z.string().trim().min(1, "Valor requerido").max(500),
});

function PlatformMark({ platform, size = 40 }: { platform: LinkPlatform; size?: number }) {
  const { Icon } = platform;
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-xl border"
      style={{
        width: size,
        height: size,
        color: platform.color,
        borderColor: `${platform.color}33`,
        background: `${platform.color}14`,
        boxShadow: `0 0 24px ${platform.color}1f`,
      }}
    >
      <Icon size={size * 0.5} />
    </span>
  );
}

function LinksEditor() {
  const { data: profile } = useMyProfile();
  const { data: links = [] } = useLinks(profile?.id);
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<LinkCategory | "all">("all");
  const [picked, setPicked] = useState<LinkPlatform | null>(null);
  const [value, setValue] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["links", profile?.id] });

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LINK_PLATFORMS.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        (!q || p.name.toLowerCase().includes(q) || p.id.includes(q)),
    );
  }, [query, category]);

  const added = useMemo(() => new Set(links.map((l) => l.icon)), [links]);

  function open(platform: LinkPlatform) {
    setPicked(platform);
    setValue("");
    setTitle(platform.id === "link" ? "" : platform.name);
  }

  async function add() {
    if (!picked || !profile) return;
    const parsed = schema.safeParse({
      title: title || picked.name,
      url: buildUrl(picked, value),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("links").insert({
      ...parsed.data,
      icon: picked.id,
      profile_id: profile.id,
      position: links.length,
      active: true,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPicked(null);
    toast.success(`${picked.name} añadido`);
    void refresh();
  }

  async function update(link: ProfileLink, patch: Partial<ProfileLink>) {
    const { error } = await supabase.from("links").update(patch).eq("id", link.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    void refresh();
  }

  async function remove(link: ProfileLink) {
    const { error } = await supabase.from("links").delete().eq("id", link.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    void refresh();
  }

  async function move(index: number, dir: -1 | 1) {
    const a = links[index];
    const b = links[index + dir];
    if (!a || !b) return;
    await Promise.all([
      supabase.from("links").update({ position: b.position }).eq("id", a.id),
      supabase.from("links").update({ position: a.position }).eq("id", b.id),
    ]);
    void refresh();
  }

  return (
    <div className="space-y-8">
      <DashBanner
        eyebrow="Overview"
        title="¡Configura tus conexiones!"
        description="Añade aquí tus redes sociales y enlaces: aparecerán en tu perfil público QSY."
        tone="violet"
        action={
          profile
            ? { label: "Ver perfil", href: `/${profile.username}` }
            : undefined
        }
      />

      <section className="rounded-2xl glass p-6">
        <div>
          <h2 className="text-sm font-medium">Conexiones</h2>
          <p className="text-xs text-muted-foreground">
            Haz clic en cualquiera de las plataformas para conectarla a tu perfil.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <div className="relative w-full max-w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              maxLength={40}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar conexión…"
              aria-label="Buscar conexión"
              className="rounded-full pl-9"
            />
          </div>
          {LINK_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                category === c.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-strong/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => open(p)}
              className="group relative flex flex-col items-start gap-4 rounded-2xl border border-border/50 bg-background/40 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:bg-surface-strong"
            >
              <span
                className={`absolute right-3 top-3 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                  added.has(p.id)
                    ? "bg-primary/20 text-primary"
                    : "bg-surface-strong/80 text-muted-foreground group-hover:text-foreground"
                }`}
              >
                {added.has(p.id) ? "Añadido" : "Add"}
              </span>
              <PlatformMark platform={p} size={40} />
              <span className="text-sm font-medium">{p.name}</span>
            </button>
          ))}
          {results.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground">Sin resultados.</p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Tus links ({links.length})</h2>
        <ul className="space-y-3">
          {links.map((l, i) => {
            const p = platformById(l.icon);
            return (
              <li key={l.id} className="flex flex-wrap items-center gap-3 rounded-2xl glass p-4">
                <div className="flex flex-col gap-1">
                  <button
                    aria-label="Subir"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                    className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    aria-label="Bajar"
                    disabled={i === links.length - 1}
                    onClick={() => move(i, 1)}
                    className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowDown className="size-4" />
                  </button>
                </div>
                <PlatformMark platform={p} />
                <Input
                  className="w-36"
                  maxLength={60}
                  aria-label="Título del link"
                  defaultValue={l.title}
                  onBlur={(e) =>
                    e.target.value !== l.title && update(l, { title: e.target.value.slice(0, 60) })
                  }
                />
                <Input
                  className="min-w-0 flex-1"
                  maxLength={500}
                  aria-label="URL del link"
                  defaultValue={l.url}
                  onBlur={(e) =>
                    e.target.value !== l.url && update(l, { url: e.target.value.slice(0, 500) })
                  }
                />
                <Switch
                  checked={l.active}
                  onCheckedChange={(v) => update(l, { active: v })}
                  aria-label="Mostrar en el perfil"
                />
                <button
                  aria-label="Eliminar"
                  onClick={() => remove(l)}
                  className="text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            );
          })}
          {links.length === 0 && (
            <li className="rounded-2xl glass p-6 text-sm text-muted-foreground">
              Aún no tienes links. Elige una plataforma arriba para empezar.
            </li>
          )}
        </ul>
      </section>

      <Dialog open={!!picked} onOpenChange={(o) => !o && setPicked(null)}>
        <DialogContent className="sm:max-w-md">
          {picked && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <PlatformMark platform={picked} />
                  <div>
                    <DialogTitle>Añadir {picked.name}</DialogTitle>
                    <DialogDescription>
                      {picked.base
                        ? `Se guardará como ${picked.base}…`
                        : "Pega la URL completa o el dato a mostrar."}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="value">{picked.kind === "text" ? "Valor" : "Enlace o usuario"}</Label>
                  <Input
                    id="value"
                    autoFocus
                    maxLength={400}
                    value={value}
                    placeholder={picked.placeholder}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && add()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Título visible</Label>
                  <Input
                    id="title"
                    maxLength={60}
                    value={title}
                    placeholder={picked.name}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="secondary" onClick={() => setPicked(null)}>
                  Cancelar
                </Button>
                <Button onClick={add} disabled={saving || !profile}>
                  <Plus className="size-4" /> {saving ? "Añadiendo…" : "Añadir link"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
