import * as React from 'react'

import { Button, Head, Html, Link, Preview, Text } from '@react-email/components'
import { EmailShell, button, link, text } from './brand'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Confirma tu email para activar tu biolink en {siteName}</Preview>
    <EmailShell
      siteName={siteName}
      title="Confirma tu email"
      note="Si no creaste esta cuenta, podés ignorar este correo."
    >
      <Text style={text}>
        Gracias por unirte a{' '}
        <Link href={siteUrl} style={link}>
          <strong>{siteName}</strong>
        </Link>
        . Solo falta un paso para activar tu biolink.
      </Text>
      <Text style={text}>
        Confirmá tu dirección (
        <Link href={`mailto:${recipient}`} style={link}>
          {recipient}
        </Link>
        ) con el botón de abajo:
      </Text>
      <Button style={button} href={confirmationUrl}>
        Verificar email
      </Button>
    </EmailShell>
  </Html>
)

export default SignupEmail
