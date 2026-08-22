import * as React from 'react'
import { Body, Container, Heading, Hr, Section, Text } from '@react-email/components'

export const brand = {
  violet: '#7C3AED',
  violetDark: '#5B21B6',
  ink: '#0C0A14',
  body: '#4B4A57',
  muted: '#9C9AA8',
  line: '#EAE7F3',
  panel: '#FBFAFF',
}

export const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    "'Space Grotesk', 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
  padding: '32px 0',
}

export const container = {
  maxWidth: '520px',
  margin: '0 auto',
  padding: '32px 32px 28px',
  border: `1px solid ${brand.line}`,
  borderRadius: '18px',
  backgroundColor: brand.panel,
}

export const brandMark = {
  fontSize: '15px',
  fontWeight: 700 as const,
  letterSpacing: '0.32em',
  textTransform: 'uppercase' as const,
  color: brand.violet,
  margin: '0 0 22px',
}

export const h1 = {
  fontSize: '23px',
  lineHeight: '1.25',
  fontWeight: 700 as const,
  color: brand.ink,
  margin: '0 0 16px',
}

export const text = {
  fontSize: '15px',
  color: brand.body,
  lineHeight: '1.65',
  margin: '0 0 22px',
}

export const link = { color: brand.violetDark, textDecoration: 'underline' }

export const button = {
  display: 'inline-block',
  backgroundColor: brand.violet,
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 600 as const,
  borderRadius: '12px',
  padding: '14px 26px',
  textDecoration: 'none',
}

export const code = {
  display: 'inline-block',
  fontFamily: "'JetBrains Mono', Courier, monospace",
  fontSize: '28px',
  letterSpacing: '0.28em',
  fontWeight: 700 as const,
  color: brand.ink,
  backgroundColor: '#F1EDFF',
  border: `1px solid ${brand.line}`,
  borderRadius: '12px',
  padding: '14px 22px',
  margin: '0 0 26px',
}

export const hr = { borderColor: brand.line, margin: '28px 0 16px' }

export const footer = { fontSize: '12px', color: brand.muted, lineHeight: '1.6', margin: '0' }

export const EmailShell = ({
  siteName,
  title,
  children,
  note,
}: {
  siteName: string
  title: string
  children: React.ReactNode
  note: React.ReactNode
}) => (
  <Body style={main}>
    <Container style={container}>
      <Text style={brandMark}>{siteName}</Text>
      <Heading style={h1}>{title}</Heading>
      <Section>{children}</Section>
      <Hr style={hr} />
      <Text style={footer}>{note}</Text>
    </Container>
  </Body>
)
