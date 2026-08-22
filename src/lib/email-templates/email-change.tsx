import * as React from 'react'

import { Button, Head, Html, Link, Preview, Text } from '@react-email/components'
import { EmailShell, button, link, text } from './brand'

interface EmailChangeEmailProps {
  siteName: string
  // oldEmail is the user's current address (HookData.OldEmail). For the
  // NEW-recipient half of a secure email_change fanout, `email` equals the
  // recipient (NEW), so the "from" line must render oldEmail to read
  // "from OLD to NEW" instead of "from NEW to NEW".
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Confirmá el cambio de email de tu cuenta en {siteName}</Preview>
    <EmailShell
      siteName={siteName}
      title="Confirmá tu nuevo email"
      note="Si no pediste este cambio, asegurá tu cuenta cambiando la contraseña cuanto antes."
    >
      <Text style={text}>
        Pediste cambiar el email de tu cuenta en {siteName} de{' '}
        <Link href={`mailto:${oldEmail}`} style={link}>
          {oldEmail}
        </Link>{' '}
        a{' '}
        <Link href={`mailto:${newEmail}`} style={link}>
          {newEmail}
        </Link>
        .
      </Text>
      <Button style={button} href={confirmationUrl}>
        Confirmar cambio
      </Button>
    </EmailShell>
  </Html>
)

export default EmailChangeEmail
