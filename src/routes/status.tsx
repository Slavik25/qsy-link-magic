import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, RefreshCw } from "lucide-react";
import { SiteNav } from "@/components/qsy/site-nav";
import { SiteFooter } from "@/components/qsy/site-footer";
import { Button } from "@/components/ui/button";
import { getServiceStatus } from "@/lib/status.functions";

export const Route = createFileRoute("/status")({
  head: () => ({
    meta: [
      { title: "Estado del servicio — QSY" },
      {
        name: "description",
        content:
          "Estado en tiempo real de los servicios de QSY: web, base de datos, autenticación, almacenamiento y API.",
      },
      { property: "og:title", content: "Estado del servicio — QSY" },
      {
        property: "og:description",
        content: "Monitoriza en vivo la disponibilidad y latencia de la plataforma QSY.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://qsy.rip/status" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Estado del servicio — QSY" },
      {
        name: "twitter:description",
        content: "Disponibilidad y latencia en vivo de todos los servicios de QSY.",
      },
    ],
    links: [{ rel: "canonical", href: "https://qsy.rip/status" }],
  }),
  component: StatusPage,
});

const LABEL: Record<string, string> = {
  operational: "Operativo",
  degraded: "Degradado",
  down: "Caído",
  maintenance: "Mantenimiento",
};

const DOT: Record<string, string> = {
  operational: "bg-emerald-400",
  degraded: "bg-amber-400",
  down: "bg-destructive",
  maintenance: "bg-sky-400",
};

function StatusPage() {
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["service-status"],
    queryFn: () => getServiceStatus(),
    refetchInterval: 60_000,
  });

  const overall = data?.overall ?? "operational";

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Activity className="size-3.5" /> Status
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Estado del servicio
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Comprobaciones reales contra nuestra infraestructura, actualizadas cada minuto.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>

        <div className="mt-8 flex items-center gap-3 rounded-3xl glass p-5">
          <span className={`size-3 rounded-full ${DOT[overall]} animate-pulse`} />
          <div>
            <p className="font-medium">
              {overall === "operational"
                ? "Todos los sistemas funcionan correctamente"
                : overall === "degraded"
                  ? "Rendimiento degradado en algún servicio"
                  : overall === "maintenance"
                    ? "Mantenimiento programado en curso"
                    : "Incidencia activa"}
            </p>
            <p className="text-xs text-muted-foreground">
              {data ? `Última comprobación: ${new Date(data.checked_at).toLocaleTimeString()}` : "Comprobando…"}
            </p>
          </div>
        </div>

        <ul className="mt-6 space-y-2">
          {(data?.services ?? []).map((s) => (
            <li
              key={s.key}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-card/40 px-4 py-3 backdrop-blur-xl"
            >
              <span className={`size-2.5 rounded-full ${DOT[s.status]}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{s.name}</p>
                <p className="truncate text-xs text-muted-foreground">{s.note}</p>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">
                {s.latency_ms ? `${s.latency_ms} ms` : "—"}
              </span>
              <span className="text-xs text-muted-foreground">{LABEL[s.status]}</span>
            </li>
          ))}
        </ul>

        {data?.announcements?.length ? (
          <section className="mt-10">
            <h2 className="text-sm font-semibold tracking-tight">Componentes y avisos del equipo</h2>
            <ul className="mt-3 space-y-2">
              {data.announcements.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-surface px-4 py-3 text-xs"
                >
                  <span className={`size-2.5 rounded-full ${DOT[a.status] ?? "bg-muted"}`} />
                  <span className="font-medium">{a.name}</span>
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">{a.note || "—"}</span>
                  <span className="text-muted-foreground">
                    {new Date(a.updated_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
