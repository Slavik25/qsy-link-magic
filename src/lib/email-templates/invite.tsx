import * as React from 'react'

import { Button, Head, Html, Link, Preview, Text } from '@react-email/components'
import { EmailShell, button, link, text } from './brand'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ siteName, siteUrl, confirmationUrl }: InviteEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Te invitaron a crear tu biolink en {siteName}</Preview>
    <EmailShell
      siteName={siteName}
      title="Te invitaron a unirte"
      note="Si no esperabas esta invitación, podés ignorar este correo."
    >
      <Text style={text}>
        Te invitaron a formar parte de{' '}
        <Link href={siteUrl} style={link}>
          <strong>{siteName}</strong>
        </Link>
        . Aceptá la invitación para crear tu cuenta y tu biolink.
      </Text>
      <Button style={button} href={confirmationUrl}>
        Aceptar invitación
      </Button>
    </EmailShell>
  </Html>
)

export default InviteEmail
