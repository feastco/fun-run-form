import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('[Auth API] Sign out error:', error)
      return NextResponse.json(
        { success: false, message: 'Gagal melakukan logout.' },
        { status: 500 }
      )
    }

    console.log('[Auth API] Admin logged out successfully')
    return NextResponse.json({
      success: true,
      message: 'Logout berhasil.',
    })
  } catch (error) {
    console.error('[Auth API] Unexpected error during logout:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan internal.' },
      { status: 500 }
    )
  }
}
