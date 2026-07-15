/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'


async function handleExpiredPayments(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization')
    const expectedSecret = process.env.CRON_SECRET

    if (!expectedSecret) {
      console.error('[Cron Expired Payments] CRON_SECRET env variable is not set.')
      return NextResponse.json({ success: false, message: 'Cron secret is not configured on server.' }, { status: 500 })
    }

    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
    const isAuthorized = token === expectedSecret

    if (!isAuthorized) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient() as any


    // Cutoff time: 24 hours ago
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    // 1. Fetch pending registrations that have exceeded the 24h window
    const { data: expiredRegs, error: errFetch } = await supabase
      .from('registrations')
      .select('id, event_category_id, registration_number')
      .eq('registration_status', 'pending_payment')
      .lt('created_at', cutoff)

    if (errFetch) {
      console.error('[Cron Expired Payments] Error fetching expired registrations:', errFetch)
      return NextResponse.json({ success: false, message: 'Database error fetching registrations.' }, { status: 500 })
    }

    if (!expiredRegs || expiredRegs.length === 0) {
      return NextResponse.json({ success: true, message: 'Tidak ada pendaftaran pending yang kedaluwarsa.', processedCount: 0 })
    }

    const processed = []

    for (const reg of expiredRegs) {
      // Update registration status to expired
      const { error: errUpdateReg } = await supabase
        .from('registrations')
        .update({ registration_status: 'expired' })
        .eq('id', reg.id)

      if (errUpdateReg) {
        console.error(`[Cron Expired Payments] Error updating registration ${reg.registration_number}:`, errUpdateReg)
        continue
      }

      // Decrement category reserved_count atomically via fn_release_slot RPC
      const { error: releaseError } = await supabase.rpc('fn_release_slot', {
        p_category_id: reg.event_category_id,
      })

      if (releaseError) {
        console.error(`[Cron Expired Payments] Error releasing slot for registration ${reg.registration_number}:`, releaseError)
      }

      processed.push(reg.registration_number)
    }

    return NextResponse.json({
      success: true,
      message: `${processed.length} pendaftaran kedaluwarsa berhasil diproses.`,
      processedCount: processed.length,
      registrations: processed,
    })
  } catch (error) {
    console.error('[Cron Expired Payments] Unexpected error:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return handleExpiredPayments(req)
}

