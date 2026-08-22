import * as React from 'react'

import { Button, Head, Html, Preview, Text } from '@react-email/components'
import { EmailShell, button, text } from './brand'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ siteName, confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Tu enlace de acceso a {siteName}</Preview>
    <EmailShell
      siteName={siteName}
      title="Tu enlace de acceso"
      note="Si no pediste este enlace, podés ignorar este correo."
    >
      <Text style={text}>
        Entrá a {siteName} con el botón de abajo. Por seguridad, el enlace caduca en unos
        minutos.
      </Text>
      <Button style={button} href={confirmationUrl}>
        Iniciar sesión
      </Button>
    </EmailShell>
  </Html>
)

export default MagicLinkEmail
