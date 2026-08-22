import * as React from 'react'

import { Head, Html, Preview, Text } from '@react-email/components'
import { EmailShell, code, text } from './brand'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Tu código de verificación</Preview>
    <EmailShell
      siteName="QSY"
      title="Confirmá tu identidad"
      note="El código caduca en unos minutos. Si no fuiste vos, ignorá este correo."
    >
      <Text style={text}>Usá este código para confirmar la acción en tu cuenta:</Text>
      <Text style={code}>{token}</Text>
    </EmailShell>
  </Html>
)

export default ReauthenticationEmail
