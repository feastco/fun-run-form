/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/api-guards'


export async function GET(req: NextRequest) {
  try {
    const { authorized, response, supabase } = await checkAdminAuth()
    if (!authorized) return response

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const rawLimit = parseInt(searchParams.get('limit') || '10', 10)
    const limit = Math.min(Math.max(rawLimit, 1), 100)
    const search = searchParams.get('search')?.trim() || ''
    const categoryId = searchParams.get('category_id') || ''
    const status = searchParams.get('status') || ''

    // Calculate range for database pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Build base query
    let query = supabase
      .from('registrations')
      .select(`
        id,
        registration_number,
        full_name,
        email,
        phone,
        registration_status,
        created_at,
        event_categories (
          name
        )
      `, { count: 'exact' })

    // Apply filters
    if (categoryId) {
      query = query.eq('event_category_id', categoryId)
    }

    if (status) {
      query = query.eq('registration_status', status)
    }

    if (search) {
      const searchPattern = `%${search}%`
      query = query.or(`full_name.ilike.${searchPattern},email.ilike.${searchPattern},phone.ilike.${searchPattern},registration_number.ilike.${searchPattern}`)
    }

    // Sort by created_at descending
    query = query.order('created_at', { ascending: false })

    // Range pagination
    query = query.range(from, to)

    const { data, count, error } = await query

    if (error) {
      console.error('[Admin Registrations API] Database error:', error)
      return NextResponse.json({ success: false, message: 'Gagal memuat daftar peserta.' }, { status: 500 })
    }

    const registrations = (data || []).map((reg: any) => ({
      id: reg.id,
      registration_number: reg.registration_number,
      full_name: reg.full_name,
      email: reg.email,
      phone: reg.phone,
      registration_status: reg.registration_status,
      created_at: reg.created_at,
      category_name: reg.event_categories?.name || '',
    }))

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      data: {
        registrations,
        pagination: {
          page,
          limit,
          totalPages,
          totalCount,
        },
      },
    })
  } catch (error) {
    console.error('[Admin Registrations API] Unexpected error:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
