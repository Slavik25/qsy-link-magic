import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, KeyRound, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/dashboard/admin/integrations")({
  component: AdminIntegrationsPage,
});

type Setting = {
  id: string;
  key: string;
  label: string;
  category: string;
  value_hint: string | null;
  updated_at: string;
};

const CATEGORIES = [
  { key: "cloud", label: "Cloud / Backend" },
  { key: "storage", label: "Almacenamiento / CDN" },
  { key: "payments", label: "Pagos" },
  { key: "ai", label: "IA" },
  { key: "social", label: "OAuth / Social" },
  { key: "other", label: "Otros" },
];

const SUGGESTIONS: { key: string; label: string; category: string }[] = [
  { key: "CLOUDFLARE_API_TOKEN", label: "Cloudflare API Token", category: "cloud" },
  { key: "CLOUDFLARE_ACCOUNT_ID", label: "Cloudflare Account ID", category: "cloud" },
  { key: "R2_ACCESS_KEY_ID", label: "Cloudflare R2 Access Key", category: "storage" },
  { key: "R2_SECRET_ACCESS_KEY", label: "Cloudflare R2 Secret", category: "storage" },
  { key: "S3_BUCKET_URL", label: "S3 / CDN Bucket URL", category: "storage" },
  { key: "STRIPE_SECRET_KEY", label: "Stripe Secret Key", category: "payments" },
  { key: "DISCORD_CLIENT_ID", label: "Discord Client ID", category: "social" },
  { key: "DISCORD_CLIENT_SECRET", label: "Discord Client Secret", category: "social" },
  { key: "DISCORD_BOT_TOKEN", label: "Discord Bot Token", category: "social" },
  { key: "OPENAI_API_KEY", label: "OpenAI API Key", category: "ai" },
];

function hintOf(value: string) {
  const v = value.trim();
  if (v.length <= 6) return "••••";
  return `${v.slice(0, 3)}••••${v.slice(-4)}`;
}

function AdminIntegrationsPage() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState({ key: "", label: "", category: "cloud", value: "" });
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [reveal, setReveal] = useState<Record<string, boolean>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-integrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integration_settings")
        .select("id, key, label, category, value_hint, updated_at")
        .order("category")
        .order("key");
      if (error) throw error;
      return (data ?? []) as Setting[];
    },
  });

  const save = useMutation({
    mutationFn: async (p: { key: string; label: string; category: string; value: string }) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("integration_settings").upsert(
        {
          key: p.key.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_"),
          label: p.label.trim() || p.key,
          category: p.category,
          value: p.value,
          value_hint: hintOf(p.value),
          updated_by: auth.user?.id ?? null,
        } as never,
        { onConflict: "key" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Token guardado");
      setDraft({ key: "", label: "", category: "cloud", value: "" });
      setEdits({});
      void qc.invalidateQueries({ queryKey: ["admin-integrations"] });
    },
    onError: (e: Error) => toast.error("No se pudo guardar", { description: e.message }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("integration_settings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Token eliminado");
      void qc.invalidateQueries({ queryKey: ["admin-integrations"] });
    },
    onError: (e: Error) => toast.error("No se pudo eliminar", { description: e.message }),
  });

  const grouped = CATEGORIES.map((c) => ({
    ...c,
    items: (settings ?? []).filter((s) => s.category === c.key),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-primary/30 bg-primary/5 p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <KeyRound className="size-4 text-primary" /> Tokens e integraciones
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Guarda aquí las claves de servicios externos (Cloudflare, R2/S3, Discord, pagos, IA). Solo los
          administradores pueden leerlas o modificarlas. Por seguridad, los valores nunca se muestran otra vez:
          únicamente verás una pista enmascarada y podrás reemplazarlos.
        </p>
      </section>

      <section className="rounded-3xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Plus className="size-4 text-primary" /> Añadir o reemplazar token
        </h3>

        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setDraft({ key: s.key, label: s.label, category: s.category, value: "" })}
              className="rounded-lg border border-border/60 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            placeholder="CLAVE_DEL_TOKEN"
            value={draft.key}
            onChange={(e) => setDraft({ ...draft, key: e.target.value })}
          />
          <Input
            placeholder="Nombre visible"
            value={draft.label}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          />
          <select
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            className="h-10 rounded-xl border border-border/60 bg-background px-3 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
          <div className="relative">
            <Input
              type={reveal["new"] ? "text" : "password"}
              placeholder="Valor del token"
              autoComplete="off"
              value={draft.value}
              onChange={(e) => setDraft({ ...draft, value: e.target.value })}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setReveal((r) => ({ ...r, new: !r["new"] }))}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Mostrar u ocultar el valor"
            >
              {reveal["new"] ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <Button
          className="mt-4 rounded-xl"
          disabled={!draft.key.trim() || !draft.value.trim() || save.isPending}
          onClick={() => save.mutate(draft)}
        >
          <Save className="size-4" /> Guardar token
        </Button>
      </section>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando integraciones…</p>}

      {!isLoading && grouped.length === 0 && (
        <p className="rounded-2xl border border-border/60 bg-card/40 p-6 text-center text-sm text-muted-foreground">
          Todavía no hay tokens guardados.
        </p>
      )}

      {grouped.map((g) => (
        <section key={g.key} className="rounded-3xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{g.label}</h3>
          <ul className="mt-4 space-y-3">
            {g.items.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/50 bg-background/40 p-3"
              >
                <div className="min-w-[180px] flex-1">
                  <p className="text-sm font-medium">{s.label}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{s.key}</p>
                </div>
                <span className="rounded-lg border border-border/60 px-2 py-1 font-mono text-[11px] text-muted-foreground">
                  {s.value_hint ?? "••••"}
                </span>
                <Input
                  type="password"
                  autoComplete="off"
                  placeholder="Nuevo valor…"
                  value={edits[s.id] ?? ""}
                  onChange={(e) => setEdits((p) => ({ ...p, [s.id]: e.target.value }))}
                  className="h-9 w-full max-w-[220px]"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-lg"
                  disabled={!(edits[s.id] ?? "").trim() || save.isPending}
                  onClick={() =>
                    save.mutate({
                      key: s.key,
                      label: s.label,
                      category: s.category,
                      value: edits[s.id] ?? "",
                    })
                  }
                >
                  <RefreshCw className="size-3.5" /> Rotar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-lg text-destructive hover:bg-destructive/10"
                  onClick={() => remove.mutate(s.id)}
                  aria-label={`Eliminar ${s.label}`}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
