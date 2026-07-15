/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/api-guards'


export async function GET() {
  try {
    const { authorized, response, supabase } = await checkAdminAuth()
    if (!authorized) return response


    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        order_id,
        amount,
        payment_type,
        transaction_status,
        created_at,
        registrations (
          registration_number,
          full_name,
          event_categories (
            name
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Admin Transactions API] Database error:', error)
      return NextResponse.json({ success: false, message: 'Gagal memuat transaksi.' }, { status: 500 })
    }

    const transactions = (data || []).map((tx: any) => ({
      id: tx.id,
      order_id: tx.order_id,
      amount: tx.amount,
      payment_type: tx.payment_type || '-',
      transaction_status: tx.transaction_status,
      created_at: tx.created_at,
      registration_number: tx.registrations?.registration_number || '',
      full_name: tx.registrations?.full_name || '',
      category_name: tx.registrations?.event_categories?.name || '',
    }))

    return NextResponse.json({
      success: true,
      data: transactions,
    })
  } catch (error) {
    console.error('[Admin Transactions API] Unexpected error:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
