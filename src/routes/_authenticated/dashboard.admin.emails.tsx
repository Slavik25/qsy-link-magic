import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Clock, Loader2, Mail, RefreshCw, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getEmailSetupStatus,
  listEmailDeliveryLogs,
  sendConfirmationTestEmail,
  type EmailLogRow,
} from "@/lib/email-ops.functions";


export const Route = createFileRoute("/_authenticated/dashboard/admin/emails")({
  component: AdminEmailsPage,
});

const EVENT_LABEL: Record<string, { label: string; tone: string }> = {
  sent: { label: "Enviado", tone: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" },
  rejected: { label: "Rechazado", tone: "text-destructive border-destructive/40 bg-destructive/10" },
  bounced: { label: "Rebotado", tone: "text-destructive border-destructive/40 bg-destructive/10" },
  complained: { label: "Spam", tone: "text-destructive border-destructive/40 bg-destructive/10" },
  suppressed: { label: "Bloqueado", tone: "text-amber-400 border-amber-500/40 bg-amber-500/10" },
  rate_limited: { label: "Límite", tone: "text-amber-400 border-amber-500/40 bg-amber-500/10" },
  unsubscribed: { label: "Baja", tone: "text-muted-foreground border-border/60 bg-surface-strong" },
};

function fmt(ts: string) {
  try {
    return new Date(ts).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "medium" });
  } catch {
    return ts;
  }
}

function AdminEmailsPage() {
  const listLogs = useServerFn(listEmailDeliveryLogs);
  const sendTest = useServerFn(sendConfirmationTestEmail);
  const fetchStatus = useServerFn(getEmailSetupStatus);
  const [recipient, setRecipient] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [testKind, setTestKind] = useState<"signup" | "magiclink">("signup");
  const [lastError, setLastError] = useState<string | null>(null);

  const status = useQuery({
    queryKey: ["admin-email-status"],
    queryFn: () => fetchStatus(),
    refetchOnWindowFocus: false,
  });

  const logs = useQuery({
    queryKey: ["admin-email-logs", recipient],
    queryFn: () => listLogs({ data: { ...(recipient ? { recipient } : {}), limit: 100 } }),
    refetchOnWindowFocus: false,
  });

  const test = useMutation({
    mutationFn: (email: string) => sendTest({ data: { email, kind: testKind } }),

    onSuccess: (res) => {
      if (res.ok) {
        setLastError(null);
        toast.success("Correo de prueba enviado", {
          description: "Revisá la bandeja de entrada (y spam) de la dirección de prueba.",
        });
        logs.refetch();
        return;
      }
      setLastError(res.error);
      toast.error("No se pudo enviar el correo", {
        description: res.error,
        action: res.retryable
          ? { label: "Reintentar", onClick: () => test.mutate(testEmail.trim()) }
          : undefined,
      });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Error inesperado al enviar el correo.";
      setLastError(msg);
      toast.error("No se pudo enviar el correo", {
        description: msg,
        action: { label: "Reintentar", onClick: () => test.mutate(testEmail.trim()) },
      });
    },
  });

  const rows: EmailLogRow[] = logs.data && logs.data.ok ? logs.data.rows : [];
  const logsError = logs.data && !logs.data.ok ? logs.data.error : logs.error ? "No se pudieron cargar los logs." : null;
  const st = status.data && status.data.ok ? status.data.status : null;
  const statusError = status.data && !status.data.ok ? status.data.error : null;
  const active = !!st && st.apiKeyConfigured && st.serviceReachable;


  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-border/60 bg-card/50 p-6 backdrop-blur-xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          <Mail className="size-3" /> Emails
        </span>
        <h2 className="mt-3 text-xl font-extrabold tracking-tight">Entregabilidad y logs</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Estado, fecha y motivo de cada intento de envío, más una prueba real del correo de confirmación.
        </p>
      </header>

      {lastError ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-semibold text-destructive">El último envío falló</p>
              <p className="text-xs text-muted-foreground">{lastError}</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={test.isPending || !testEmail.trim()}
            onClick={() => test.mutate(testEmail.trim())}
            className="rounded-xl"
          >
            <RefreshCw className="size-4" /> Reintentar
          </Button>
        </div>
      ) : null}

      <section className="rounded-3xl border border-border/60 bg-card/50 p-6 backdrop-blur-xl">
      <section className="rounded-3xl border border-border/60 bg-card/50 p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Estado del dominio y plantillas
          </h3>
          <Button
            variant="outline"
            className="h-10 rounded-xl"
            disabled={status.isFetching}
            onClick={() => status.refetch()}
          >
            {status.isFetching ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            Revisar
          </Button>
        </div>

        {status.isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Consultando estado…</p>
        ) : statusError ? (
          <p className="mt-4 text-sm text-destructive">{statusError}</p>
        ) : st ? (
          <div className="mt-4 space-y-4">
            <div
              className={`flex items-start gap-3 rounded-2xl border p-4 ${
                active
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-amber-500/40 bg-amber-500/10"
              }`}
            >
              {active ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
              ) : (
                <Clock className="mt-0.5 size-4 shrink-0 text-amber-400" />
              )}
              <div>
                <p className={`text-sm font-semibold ${active ? "text-emerald-400" : "text-amber-400"}`}>
                  {active ? "Envío activo" : "Configuración en curso"}
                </p>
                <p className="text-xs text-muted-foreground">{st.detail}</p>
                {!active ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    La activación termina sola en cuanto propaga el dominio (suele tardar minutos, hasta 72 h como
                    máximo). No hace falta tocar nada.
                  </p>
                ) : null}
              </div>
            </div>

            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                <dt className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Dominio de envío</dt>
                <dd className="mt-1 break-all text-sm font-semibold">{st.senderDomain}</dd>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                <dt className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Remitente</dt>
                <dd className="mt-1 break-all text-sm font-semibold">{st.fromAddress}</dd>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                <dt className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Eventos visibles</dt>
                <dd className="mt-1 text-sm font-semibold">
                  {st.eventCount}
                  {st.historyStartsAt ? (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      desde {fmt(st.historyStartsAt)}
                    </span>
                  ) : null}
                </dd>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                <dt className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Plantillas</dt>
                <dd className="mt-1 text-sm font-semibold">{st.templates.length} activas</dd>
                <dd className="mt-1 text-xs text-muted-foreground">{st.templates.join(", ")}</dd>
              </div>
            </dl>
          </div>
        ) : null}
      </section>

      <section className="rounded-3xl border border-border/60 bg-card/50 p-6 backdrop-blur-xl">
        <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Enviar email de prueba
        </h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {([
            { key: "signup", label: "Confirmación" },
            { key: "magiclink", label: "Magic link" },
          ] as const).map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setTestKind(opt.key)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                testKind === opt.key
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="test-email" className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Dirección de prueba
            </Label>

            <Input
              id="test-email"
              type="email"
              value={testEmail}
              maxLength={255}
              placeholder="prueba@tudominio.com"
              onChange={(e) => setTestEmail(e.target.value)}
              className="h-11 rounded-xl bg-background/60"
            />
          </div>
          <Button
            disabled={test.isPending || !testEmail.trim()}
            onClick={() => test.mutate(testEmail.trim())}
            className="h-11 rounded-xl"
          >
            {test.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Enviar prueba
          </Button>
        </div>
      </section>

      <section className="rounded-3xl border border-border/60 bg-card/50 p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Logs de emails
          </h3>
          <div className="flex gap-2">
            <Input
              value={recipient}
              maxLength={255}
              placeholder="Filtrar por destinatario"
              onChange={(e) => setRecipient(e.target.value)}
              className="h-10 w-56 rounded-xl bg-background/60 text-sm"
            />
            <Button
              variant="outline"
              className="h-10 rounded-xl"
              disabled={logs.isFetching}
              onClick={() => logs.refetch()}
            >
              {logs.isFetching ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              Actualizar
            </Button>
          </div>
        </div>

        {logsError ? (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{logsError}</p>
            <Button size="sm" variant="outline" className="rounded-xl" onClick={() => logs.refetch()}>
              <RefreshCw className="size-4" /> Reintentar
            </Button>
          </div>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                <th className="pb-3 font-semibold">Fecha</th>
                <th className="pb-3 font-semibold">Destinatario</th>
                <th className="pb-3 font-semibold">Estado</th>
                <th className="pb-3 font-semibold">Motivo / detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {logs.isLoading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    Cargando logs…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    Todavía no hay eventos de envío registrados.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => {
                  const meta = EVENT_LABEL[r.eventType] ?? {
                    label: r.eventType,
                    tone: "text-muted-foreground border-border/60 bg-surface-strong",
                  };
                  return (
                    <tr key={`${r.messageId ?? "e"}-${i}`} className="align-top">
                      <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">{fmt(r.timestamp)}</td>
                      <td className="py-3 pr-4 break-all">{r.recipient}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${meta.tone}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {r.status || (r.eventType === "sent" ? "Aceptado por el proveedor" : "—")}
                        {r.tags.length ? (
                          <span className="ml-2 text-[11px] opacity-70">[{r.tags.join(", ")}]</span>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[11px] text-muted-foreground">
          Los estados de apertura o entrega final no están disponibles: se registran envíos, rechazos, rebotes,
          quejas de spam, bajas y bloqueos.
        </p>
      </section>
    </div>
  );
}
