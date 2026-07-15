/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from './supabase/server'

import { NextResponse } from 'next/server'

interface AuthSuccess {
  authorized: true
  response: null
  supabase: any
  user: { id: string; email?: string }
}


interface AuthFailure {
  authorized: false
  response: NextResponse
  supabase: null
  user: null
}

type AuthResult = AuthSuccess | AuthFailure

export async function checkAdminAuth(): Promise<AuthResult> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.warn('[API Guard] Unauthorized access attempt: No active session.')
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, message: 'Unauthorized' },
          { status: 401 }
        ),
        supabase: null,
        user: null,
      }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || (profile as { role: string }).role !== 'admin') {
      console.warn(`[API Guard] Forbidden access attempt for user: ${user.id} - Role is not admin.`)
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, message: 'Forbidden' },
          { status: 403 }
        ),
        supabase: null,
        user: null,
      }
    }

    return {
      authorized: true,
      response: null,
      supabase,
      user: { id: user.id, email: user.email },
    }
  } catch (error) {
    console.error('[API Guard] Unexpected error during authentication verification:', error)
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, message: 'Terjadi kesalahan internal.' },
        { status: 500 }
      ),
      supabase: null,
      user: null,
    }
  }
}
