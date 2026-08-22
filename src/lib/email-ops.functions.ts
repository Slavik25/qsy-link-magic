import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'
import type { EmailLogRow } from './email-ops.server'

export type { EmailLogRow }

export const listEmailDeliveryLogs = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        recipient: z.string().trim().max(255).optional(),
        eventType: z.string().trim().max(40).optional(),
        limit: z.number().int().min(1).max(100).optional(),
      })
      .parse(data ?? {})
  )
  .handler(async ({ context, data }): Promise<
    { ok: true; rows: EmailLogRow[]; historyStartsAt: string | null } | { ok: false; error: string }
  > => {
    const { data: isAdmin } = await context.supabase.rpc('has_role', {
      _user_id: context.userId,
      _role: 'admin',
    })
    if (!isAdmin) return { ok: false, error: 'Acceso restringido' }

    const { fetchEmailLogs, describeEmailError } = await import('./email-ops.server')
    try {
      const res = await fetchEmailLogs({
        ...(data.recipient ? { recipient: data.recipient } : {}),
        ...(data.eventType ? { eventType: data.eventType } : {}),
        ...(data.limit ? { limit: data.limit } : {}),
      })
      return { ok: true, rows: res.rows, historyStartsAt: res.historyStartsAt }
    } catch (err) {
      return { ok: false, error: describeEmailError(err).message }
    }
  })

export const sendConfirmationTestEmail = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ email: z.string().trim().email('Email inválido').max(255) }).parse(data)
  )
  .handler(async ({ context, data }): Promise<
    { ok: true; messageId: string | null } | { ok: false; error: string; code: string | null; retryable: boolean }
  > => {
    const { data: isAdmin } = await context.supabase.rpc('has_role', {
      _user_id: context.userId,
      _role: 'admin',
    })
    if (!isAdmin) return { ok: false, error: 'Acceso restringido', code: 'forbidden', retryable: false }

    const { sendConfirmationTest, describeEmailError } = await import('./email-ops.server')
    try {
      const res = await sendConfirmationTest(data.email)
      return { ok: true, messageId: res.messageId }
    } catch (err) {
      const info = describeEmailError(err)
      return { ok: false, error: info.message, code: info.code, retryable: info.retryable }
    }
  })
