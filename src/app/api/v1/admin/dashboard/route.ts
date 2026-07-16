/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/api-guards'


export async function GET() {
  try {
    const { authorized, response, supabase } = await checkAdminAuth()
    if (!authorized) return response


    // Execute all queries concurrently to reduce response latency significantly
    const [
      totalResult,
      paidResult,
      pendingResult,
      revenueResult,
      categoriesResult,
      recentResult
    ] = await Promise.all([
      supabase.from('registrations').select('*', { count: 'exact', head: true }),
      supabase.from('registrations').select('*', { count: 'exact', head: true }).in('registration_status', ['paid', 'claimed']),
      supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('registration_status', 'pending_payment'),
      supabase.from('transactions').select('amount').eq('transaction_status', 'settlement'),
      supabase.from('event_categories').select('id, name, quota, reserved_count').eq('is_active', true),
      supabase.from('registrations')
        .select(`
          id,
          registration_number,
          full_name,
          created_at,
          registration_status,
          event_categories (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5)
    ])

    const { count: totalRegistrations, error: errTotal } = totalResult
    const { count: paidRegistrations, error: errPaid } = paidResult
    const { count: pendingRegistrations, error: errPending } = pendingResult
    const { data: revenueData, error: errRevenue } = revenueResult
    const { data: categories, error: errCategories } = categoriesResult
    const { data: recentData, error: errRecent } = recentResult

    if (errTotal || errPaid || errPending) {
      console.error('[Dashboard API] Error fetching registration counts:', { errTotal, errPaid, errPending })
      return NextResponse.json({ success: false, message: 'Gagal memuat statistik pendaftaran.' }, { status: 500 })
    }

    if (errRevenue) {
      console.error('[Dashboard API] Error fetching revenue:', errRevenue)
      return NextResponse.json({ success: false, message: 'Gagal memuat data pendapatan.' }, { status: 500 })
    }

    const totalRevenue = (revenueData || []).reduce((acc: number, item: any) => acc + (item.amount || 0), 0)

    if (errCategories) {
      console.error('[Dashboard API] Error fetching categories:', errCategories)
      return NextResponse.json({ success: false, message: 'Gagal memuat data kuota kategori.' }, { status: 500 })
    }

    if (errRecent) {
      console.error('[Dashboard API] Error fetching recent registrations:', errRecent)
      return NextResponse.json({ success: false, message: 'Gagal memuat pendaftaran terbaru.' }, { status: 500 })
    }

    const recentRegistrations = (recentData || []).map((reg: any) => ({
      id: reg.id,
      registration_number: reg.registration_number,
      full_name: reg.full_name,
      created_at: reg.created_at,
      registration_status: reg.registration_status,
      category_name: reg.event_categories?.name || '',
    }))

    return NextResponse.json({
      success: true,
      data: {
        totalRegistrations: totalRegistrations || 0,
        paidRegistrations: paidRegistrations || 0,
        pendingRegistrations: pendingRegistrations || 0,
        totalRevenue,
        categories: categories || [],
        recentRegistrations,
      },
    })
  } catch (error) {
    console.error('[Dashboard API] Unexpected error:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
