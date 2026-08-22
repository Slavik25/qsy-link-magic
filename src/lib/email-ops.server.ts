import * as React from 'react'
import { render } from '@react-email/render'
import { EmailAPIError, listEmailLogs, sendLovableEmail } from '@lovable.dev/email-js'
import { SignupEmail } from './email-templates/signup'
import { MagicLinkEmail } from './email-templates/magic-link'

const SITE_NAME = 'QSY'
const SENDER_DOMAIN = 'notify.qsy.bio'
const FROM_DOMAIN = 'qsy.bio'
const SITE_URL = 'https://qsy.rip'

export type EmailLogRow = {
  timestamp: string
  recipient: string
  eventType: string
  status: string | null
  messageId: string | null
  tags: string[]
}

function apiKey() {
  const key = process.env['LOVABLE_API_KEY']
  if (!key) throw new Error('LOVABLE_API_KEY no está configurada en el servidor')
  return key
}

/** Motivos legibles para el usuario a partir de un error de la API de emails. */
export function describeEmailError(err: unknown): { message: string; code: string | null; retryable: boolean } {
  if (err instanceof EmailAPIError) {
    const map: Record<string, string> = {
      domain_not_verified: 'El dominio de envío todavía no está verificado. Los correos saldrán al terminar la verificación de DNS.',
      emails_disabled: 'El envío de emails está desactivado para este proyecto.',
      recipient_suppressed: 'La dirección está bloqueada por un rebote, queja de spam o baja voluntaria.',
    }
    const base = (err.code && map[err.code]) || err.message || 'Error al enviar el email.'
    if (err.status === 429) {
      const wait = err.retryAfterSeconds ?? 60
      return { message: `Límite de envío alcanzado. Reintentá en ${wait} segundos.`, code: 'rate_limited', retryable: true }
    }
    return { message: base, code: err.code ?? String(err.status), retryable: err.retryable }
  }
  return {
    message: err instanceof Error ? err.message : 'Error desconocido al enviar el email.',
    code: null,
    retryable: true,
  }
}

export async function fetchEmailLogs(filters: {
  recipient?: string
  eventType?: string
  limit?: number
}): Promise<{ rows: EmailLogRow[]; historyStartsAt: string | null }> {
  const res = await listEmailLogs(
    {
      ...(filters.recipient ? { recipient: filters.recipient } : {}),
      ...(filters.eventType ? { event_type: filters.eventType } : {}),
      limit: Math.min(Math.max(filters.limit ?? 50, 1), 100),
    },
    { apiKey: apiKey() }
  )
  return {
    rows: (res.data ?? []).map((e) => ({
      timestamp: e.timestamp,
      recipient: e.recipient,
      eventType: e.event_type,
      status: e.status ?? null,
      messageId: e.message_id ?? null,
      tags: e.tags ?? [],
    })),
    historyStartsAt: res.history_starts_at ?? null,
  }
}

export type TestEmailKind = 'signup' | 'magiclink'

export type EmailSetupStatus = {
  senderDomain: string
  fromAddress: string
  apiKeyConfigured: boolean
  serviceReachable: boolean
  historyStartsAt: string | null
  eventCount: number
  detail: string
  templates: string[]
}

/** Estado en vivo del envío: dominio, clave y si la API de emails ya responde. */
export async function fetchEmailSetupStatus(): Promise<EmailSetupStatus> {
  const templates = ['signup', 'magic-link', 'recovery', 'invite', 'email-change', 'reauthentication']
  const base = {
    senderDomain: SENDER_DOMAIN,
    fromAddress: `noreply@${FROM_DOMAIN}`,
    templates,
  }
  let apiKeyConfigured = true
  try {
    apiKey()
  } catch {
    apiKeyConfigured = false
  }
  if (!apiKeyConfigured) {
    return {
      ...base,
      apiKeyConfigured: false,
      serviceReachable: false,
      historyStartsAt: null,
      eventCount: 0,
      detail: 'Falta la clave de la API de emails en el servidor. Publicá la app para inyectarla.',
    }
  }
  try {
    const res = await fetchEmailLogs({ limit: 100 })
    return {
      ...base,
      apiKeyConfigured: true,
      serviceReachable: true,
      historyStartsAt: res.historyStartsAt,
      eventCount: res.rows.length,
      detail:
        res.rows.length > 0
          ? 'Activo: el dominio envía y los eventos se están registrando.'
          : 'Configuración terminada, pero todavía no hay envíos registrados en la ventana visible. Enviá una prueba para confirmarlo.',
    }
  } catch (err) {
    const info = describeEmailError(err)
    return {
      ...base,
      apiKeyConfigured: true,
      serviceReachable: false,
      historyStartsAt: null,
      eventCount: 0,
      detail: info.message,
    }
  }
}

/** Envía una copia real de un email de autenticación a una dirección de prueba. */
export async function sendConfirmationTest(to: string, kind: TestEmailKind = 'signup') {
  const element =
    kind === 'magiclink'
      ? React.createElement(MagicLinkEmail, {
          siteName: SITE_NAME,
          confirmationUrl: `${SITE_URL}/login?test=1`,
        })
      : React.createElement(SignupEmail, {
          siteName: SITE_NAME,
          siteUrl: SITE_URL,
          recipient: to,
          confirmationUrl: `${SITE_URL}/login?test=1`,
        })
  const html = await render(element)
  const text = await render(element, { plainText: true })

  const res = await sendLovableEmail(
    {
      to,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject:
        kind === 'magiclink'
          ? `[Prueba] Tu enlace de acceso a ${SITE_NAME}`
          : `[Prueba] Confirmá tu email en ${SITE_NAME}`,
      html,
      text,
      purpose: 'transactional',
      label: kind === 'magiclink' ? 'magiclink-test' : 'confirmation-test',
      idempotency_key: crypto.randomUUID(),
    },
    { apiKey: apiKey() }
  )
  return { messageId: res.message_id ?? null, status: res.status ?? null }
}
