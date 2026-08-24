import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { SiteNav } from "@/components/qsy/site-nav";
import { SiteFooter } from "@/components/qsy/site-footer";
import { Button } from "@/components/ui/button";
import { TemplatePreview } from "@/components/qsy/template-preview";
import { TEMPLATES } from "@/lib/qsy";
import { useApprovedTemplates } from "@/lib/community-templates";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Templates — QSY" },
      {
        name: "description",
        content:
          "Plantillas oficiales y de la comunidad para tu biolink QSY, con vista previa automática antes de aplicarlas.",
      },
      { property: "og:title", content: "Templates — QSY" },
      {
        property: "og:description",
        content: "Explora plantillas creadas por la comunidad y aplícalas a tu perfil en un clic.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://qsy.rip/templates" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Templates — QSY" },
      {
        name: "twitter:description",
        content: "Plantillas oficiales y de la comunidad con preview en vivo.",
      },
    ],
    links: [{ rel: "canonical", href: "https://qsy.rip/templates" }],
  }),
  component: TemplatesPage,
});

function TemplatesPage() {
  const { data: community, isLoading } = useApprovedTemplates();

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Templates</h1>
        <p className="mt-2 max-w-lg text-muted-foreground">
          Un punto de partida. Todo sigue siendo editable desde Appearance.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <article key={t.id} className="overflow-hidden rounded-2xl glass p-5 lift">
              <div
                className="h-36 rounded-xl border border-border"
                style={{
                  background: `radial-gradient(90% 70% at 50% 0%, ${t.accent}44, transparent 70%), #0a0a0a`,
                }}
              >
                <div className="flex h-full flex-col items-center justify-center gap-2">
                  <span
                    className="size-10 rounded-full"
                    style={{ background: `linear-gradient(140deg, ${t.accent}, transparent)` }}
                  />
                  <span className="h-2 w-20 rounded-full bg-foreground/20" />
                  <span className="h-6 w-32 rounded-md" style={{ background: `${t.accent}22` }} />
                </div>
              </div>
              <h2 className="mt-4 font-medium">{t.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
              <Button asChild variant="secondary" className="mt-4 w-full">
                <Link to="/dashboard/profiles">Usar template</Link>
              </Button>
            </article>
          ))}
        </div>

        <section className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                <Sparkles className="size-5 text-primary" /> Plantillas de la comunidad
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Creadas por usuarios de QSY y revisadas por el equipo antes de publicarse.
              </p>
            </div>
            <Button asChild size="sm">
              <Link to="/dashboard/templates">Subir la mía</Link>
            </Button>
          </div>

          {isLoading ? (
            <p className="mt-6 text-sm text-muted-foreground">Cargando plantillas…</p>
          ) : community?.length ? (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {community.map((t) => (
                <article key={t.id} className="overflow-hidden rounded-2xl glass p-4 lift">
                  <TemplatePreview
                    theme={t.theme}
                    {...(t.preview_username ? { username: t.preview_username } : {})}
                  />
                  <h3 className="mt-4 font-medium">{t.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {t.description || "Sin descripción."}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    por @{t.author_name || "anónimo"} · {t.uses} usos
                  </p>
                  <Button asChild variant="secondary" className="mt-4 w-full">
                    <Link to="/dashboard/templates">Aplicar plantilla</Link>
                  </Button>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-2xl border border-border/60 bg-card/40 p-6 text-sm text-muted-foreground">
              Todavía no hay plantillas publicadas. Sé el primero en enviar la tuya.
            </p>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
