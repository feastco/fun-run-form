/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/api-guards'


interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, props: RouteParams) {
  try {
    const { authorized, response, supabase: client } = await checkAdminAuth()
    if (!authorized) return response
    const supabase = client as any

    const { id } = await props.params

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID pendaftaran wajib diisi.' }, { status: 400 })
    }


    const { data, error } = await supabase
      .from('registrations')
      .select(`
        *,
        events (
          name,
          event_date,
          location
        ),
        event_categories (
          name,
          price
        ),
        transactions (
          order_id,
          amount,
          payment_type,
          transaction_status,
          midtrans_transaction_id,
          snap_token,
          snap_redirect_url,
          paid_at,
          expired_at,
          created_at
        )
      `)
      .eq('id', id)
      .single()

    if (error || !data) {
      console.error('[Admin Registration Detail API] Error:', error)
      return NextResponse.json({ success: false, message: 'Pendaftaran tidak ditemukan.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('[Admin Registration Detail API] Unexpected error:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
