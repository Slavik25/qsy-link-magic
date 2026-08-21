import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/qsy/site-nav";
import { SiteFooter } from "@/components/qsy/site-footer";
import { Button } from "@/components/ui/button";
import { TEMPLATES } from "@/lib/qsy";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Templates — QSY" },
      {
        name: "description",
        content: "Minimal, Dark, Glass, Neon, Gaming, Creator y Developer: elige el estilo de tu QSY.",
      },
      { property: "og:title", content: "Templates — QSY" },
      { property: "og:description", content: "Siete estilos listos para tu perfil biolink QSY." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/templates" },
    ],
    links: [{ rel: "canonical", href: "/templates" }],
  }),
  component: TemplatesPage,
});

function TemplatesPage() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Templates</h1>
        <p className="mt-2 max-w-lg text-muted-foreground">
          Un punto de partida. Todo sigue siendo editable desde Appearance.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                <Link to="/dashboard/profiles">
                  Usar template
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
