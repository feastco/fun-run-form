/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// In-memory rate limiting map: IP -> { count, lastAttempt }
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

export async function POST(req: NextRequest) {
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '127.0.0.1'
  const now = Date.now()

  // Clean up old entries periodically
  for (const [ip, data] of loginAttempts.entries()) {
    if (now - data.lastAttempt > 15 * 60 * 1000) {
      loginAttempts.delete(ip)
    }
  }

  // Check rate limit
  const rateLimitData = loginAttempts.get(clientIp)
  if (rateLimitData && now - rateLimitData.lastAttempt < 15 * 60 * 1000 && rateLimitData.count >= 5) {
    console.warn(`[Auth API] Rate limit hit for IP: ${clientIp}`)
    return NextResponse.json(
      { success: false, message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.' },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan password wajib diisi.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Sign in with password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      console.warn(`[Auth API] Failed login attempt for email: ${email} from IP: ${clientIp} - Reason: ${authError?.message}`)
      
      // Update rate limiter
      const currentCount = rateLimitData ? rateLimitData.count + 1 : 1
      loginAttempts.set(clientIp, { count: currentCount, lastAttempt: now })

      return NextResponse.json(
        { success: false, message: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Verify role in profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    const profile = profileData as any

    if (profileError || !profile || profile.role !== 'admin') {
      console.warn(`[Auth API] Non-admin access attempt for user: ${authData.user.id} from IP: ${clientIp}`)
      
      // Sign out since user is not admin
      await supabase.auth.signOut()

      // Update rate limiter
      const currentCount = rateLimitData ? rateLimitData.count + 1 : 1
      loginAttempts.set(clientIp, { count: currentCount, lastAttempt: now })

      return NextResponse.json(
        { success: false, message: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Login successful
    console.log(`[Auth API] Admin login successful for user: ${authData.user.email} from IP: ${clientIp}`)
    
    // Clear rate limiter on success
    loginAttempts.delete(clientIp)

    return NextResponse.json({
      success: true,
      message: 'Login berhasil.',
    })
  } catch (error) {
    console.error('[Auth API] Unexpected error during login:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan internal.' },
      { status: 500 }
    )
  }
}
