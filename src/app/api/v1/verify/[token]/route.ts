/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdminAuth } from '@/lib/api-guards'

interface RouteParams {
  params: Promise<{ token: string }>
}

// GET: Public verification page details
export async function GET(req: NextRequest, props: RouteParams) {
  try {
    const { token } = await props.params

    if (!token) {
      return NextResponse.json({ success: false, message: 'Token QR wajib diisi.' }, { status: 400 })
    }

    const supabase = createAdminClient() as any

    const { data: reg, error } = await supabase
      .from('registrations')
      .select(`
        id,
        registration_number,
        full_name,
        gender,
        nationality,
        jersey_size,
        registration_status,
        events (
          name
        ),
        event_categories (
          name
        )
      `)
      .eq('qr_code_token', token)
      .maybeSingle()

    if (error || !reg) {
      console.warn(`[Verify API] Token invalid or not found: ${token}`)
      return NextResponse.json({ success: false, message: 'Tiket tidak ditemukan atau tidak valid.' }, { status: 404 })
    }

    // Check if the current scanner is logged in as admin
    let isAdmin = false
    try {
      const authGuard = await checkAdminAuth()
      isAdmin = authGuard.authorized
    } catch {
      // Ignored: not admin
    }

    return NextResponse.json({
      success: true,
      data: {
        registration_number: reg.registration_number,
        full_name: reg.full_name,
        gender: reg.gender === 'male' ? 'Laki-laki' : 'Perempuan',
        nationality: reg.nationality,
        jersey_size: reg.jersey_size,
        registration_status: reg.registration_status,
        event_name: reg.events?.name || '',
        category_name: reg.event_categories?.name || '',
        is_admin_scanner: isAdmin
      }
    })
  } catch (error) {
    console.error('[Verify API] GET error:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}

// POST: Admin marks racepack as claimed or unclaimed
export async function POST(req: NextRequest, props: RouteParams) {
  try {
    const { authorized, response, supabase: client } = await checkAdminAuth()
    if (!authorized) return response
    const supabase = client as any

    const { token } = await props.params
    const body = await req.json().catch(() => ({}))
    const targetStatus = body.status === 'paid' ? 'paid' : 'claimed' // Toggle between paid and claimed

    if (!token) {
      return NextResponse.json({ success: false, message: 'Token QR wajib diisi.' }, { status: 400 })
    }

    // Find registration first
    const { data: reg, error: fetchError } = await supabase
      .from('registrations')
      .select('id, registration_status')
      .eq('qr_code_token', token)
      .maybeSingle()

    if (fetchError || !reg) {
      return NextResponse.json({ success: false, message: 'Registrasi tidak ditemukan.' }, { status: 404 })
    }

    if (reg.registration_status !== 'paid' && reg.registration_status !== 'claimed') {
      return NextResponse.json({ success: false, message: 'Hanya pendaftaran LUNAS yang dapat diklaim racepack-nya.' }, { status: 400 })
    }

    // Update status
    const { error: updateError } = await supabase
      .from('registrations')
      .update({
        registration_status: targetStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', reg.id)

    if (updateError) {
      console.error('[Verify API] Update error:', updateError)
      return NextResponse.json({ success: false, message: 'Gagal memperbarui status racepack.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: targetStatus === 'claimed' ? 'Racepack berhasil diserahkan.' : 'Klaim racepack berhasil dibatalkan.',
      data: {
        registration_status: targetStatus
      }
    })
  } catch (error) {
    console.error('[Verify API] POST error:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
