/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')?.trim()
    const phone = searchParams.get('phone')?.trim()
    const registrationNumber = searchParams.get('registration_number')?.trim() || searchParams.get('reg')?.trim()

    if (!email && !phone && !registrationNumber) {
      return NextResponse.json(
        { success: false, message: 'Harap masukkan email, nomor HP, atau nomor registrasi.' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient() as any
    let query = supabase
      .from('registrations')
      .select(`
        id,
        registration_number,
        full_name,
        registration_status,
        qr_code_token,
        created_at,
        events (
          name
        ),
        event_categories (
          name,
          price
        )
      `)

    if (registrationNumber) {
      // Allow case-insensitive search for registration number
      query = query.ilike('registration_number', registrationNumber)
    } else if (email) {
      query = query.ilike('email', email)
    } else if (phone) {
      query = query.eq('phone', phone)
    }

    const { data, error } = await query

    if (error) {
      console.error('[Status API] Database query error:', error)
      return NextResponse.json(
        { success: false, message: 'Gagal memuat status pendaftaran.' },
        { status: 500 }
      )
    }

    // Filter sensitive fields and return mapped data
    const registrations = (data || []).map((reg: any) => {
      const isPaid = reg.registration_status === 'paid'
      
      return {
        id: reg.id,
        registration_number: reg.registration_number,
        full_name: reg.full_name,
        registration_status: reg.registration_status,
        qr_code_token: isPaid ? reg.qr_code_token : null, // Security: only expose qr_code_token if paid
        created_at: reg.created_at,
        event_name: reg.events?.name || '',
        category_name: reg.event_categories?.name || '',
        price: reg.event_categories?.price || 0,
      }
    })

    // If registrations exist and some are pending_payment, fetch their active snap_token from transactions table
    for (const reg of registrations) {
      if (reg.registration_status === 'pending_payment') {
        const { data: txData } = await supabase
          .from('transactions')
          .select('snap_token, snap_redirect_url')
          .eq('registration_id', reg.id)
          .eq('transaction_status', 'pending')
          .maybeSingle()

        if (txData) {
          reg.snap_token = txData.snap_token
          reg.snap_redirect_url = txData.snap_redirect_url
        }
      }
    }

    return NextResponse.json({
      success: true,
      registrations,
    })
  } catch (error) {
    console.error('[Status API] Unexpected error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
