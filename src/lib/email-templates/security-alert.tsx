import * as React from 'react'

import { Head, Html, Preview, Text } from '@react-email/components'
import { EmailShell, text } from './brand'
import type { TemplateEntry } from './registry'

export interface SecurityAlertProps {
  count: number
  items: { action: string; actor: string; at: string }[]
}

export const SecurityAlertEmail = ({ count, items }: SecurityAlertProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>{count} alerta(s) de seguridad en QSY</Preview>
    <EmailShell
      siteName="QSY"
      title="Alertas de seguridad"
      note="Este aviso se envía automáticamente cuando el sistema detecta manipulación de precios, monedas o permisos."
    >
      <Text style={text}>
        Se detectaron <strong>{count}</strong> evento(s) de manipulación o validación fallida en la
        tienda.
      </Text>
      {items.map((it, i) => (
        <Text key={i} style={text}>
          • {new Date(it.at).toLocaleString('es-ES')} — @{it.actor} — {it.action}
        </Text>
      ))}
    </EmailShell>
  </Html>
)

export const template: TemplateEntry = {
  component: SecurityAlertEmail,
  subject: (data) => `QSY · ${data['count'] ?? 0} alerta(s) de seguridad`,
  displayName: 'Alertas de seguridad',
  previewData: { count: 1, items: [{ action: 'price_tamper_corrected', actor: 'qsy', at: new Date().toISOString() }] },
}

export default SecurityAlertEmail
