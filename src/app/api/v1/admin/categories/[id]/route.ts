/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/api-guards'


interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, props: RouteParams) {
  try {
    const { authorized, response, supabase: client } = await checkAdminAuth()
    if (!authorized) return response
    const supabase = client as any

    const { id } = await props.params
    const body = await req.json()
    const quota = parseInt(body.quota, 10)

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID kategori wajib diisi.' }, { status: 400 })
    }

    if (isNaN(quota) || quota <= 0) {
      return NextResponse.json({ success: false, message: 'Kuota harus berupa angka positif.' }, { status: 400 })
    }


    // 1. Fetch category to verify reserved_count
    const { data: category, error: errFetch } = await supabase
      .from('event_categories')
      .select('quota, reserved_count, name')
      .eq('id', id)
      .single()

    if (errFetch || !category) {
      console.error('[Admin Category Quota API] Fetch error:', errFetch)
      return NextResponse.json({ success: false, message: 'Kategori tidak ditemukan.' }, { status: 404 })
    }

    // 2. Validate new quota against reserved_count
    if (quota < category.reserved_count) {
      return NextResponse.json({
        success: false,
        message: `Kuota tidak boleh lebih kecil dari jumlah slot yang sudah dipesan (${category.reserved_count}).`,
      }, { status: 400 })
    }

    // 3. Perform patch update
    const { error: errUpdate } = await supabase
      .from('event_categories')
      .update({ quota })
      .eq('id', id)

    if (errUpdate) {
      console.error('[Admin Category Quota API] Update error:', errUpdate)
      return NextResponse.json({ success: false, message: 'Gagal memperbarui kuota kategori.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Kuota berhasil diperbarui.',
      data: {
        id,
        name: category.name,
        quota,
        reserved_count: category.reserved_count,
      },
    })
  } catch (error) {
    console.error('[Admin Category Quota API] Unexpected error:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
