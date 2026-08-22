import * as React from 'react'

import { Button, Head, Html, Preview, Text } from '@react-email/components'
import { EmailShell, button, text } from './brand'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ siteName, confirmationUrl }: RecoveryEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Restablecé tu contraseña de {siteName}</Preview>
    <EmailShell
      siteName={siteName}
      title="Restablecé tu contraseña"
      note="Si no pediste este cambio, ignorá este correo: tu contraseña seguirá igual."
    >
      <Text style={text}>
        Recibimos una solicitud para restablecer la contraseña de tu cuenta en {siteName}.
        Elegí una nueva con el botón de abajo.
      </Text>
      <Button style={button} href={confirmationUrl}>
        Cambiar contraseña
      </Button>
    </EmailShell>
  </Html>
)

export default RecoveryEmail
