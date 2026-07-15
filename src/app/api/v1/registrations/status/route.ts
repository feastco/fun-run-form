/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { snap } from '@/lib/midtrans/client'
import crypto from 'crypto'

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
        event_category_id,
        events (
          name
        ),
        event_categories (
          id,
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
        event_category_id: reg.event_category_id,
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
          .select('id, order_id, snap_token, snap_redirect_url, transaction_status')
          .eq('registration_id', reg.id)
          .eq('transaction_status', 'pending')
          .maybeSingle()

        if (txData && txData.order_id) {
          // Proactively verify transaction status with Midtrans API
          try {
            const midtransStatus = await (snap as any).transaction.status(txData.order_id)
            console.log(`[Status API] Proactive status check for ${txData.order_id}:`, midtransStatus.transaction_status)

            let targetTxStatus = 'pending'
            let targetRegStatus = 'pending_payment'

            if (midtransStatus.transaction_status === 'capture') {
              if (midtransStatus.fraud_status === 'challenge') {
                targetTxStatus = 'pending'
                targetRegStatus = 'pending_payment'
              } else if (midtransStatus.fraud_status === 'accept' || !midtransStatus.fraud_status) {
                targetTxStatus = 'settlement'
                targetRegStatus = 'paid'
              }
            } else if (midtransStatus.transaction_status === 'settlement') {
              targetTxStatus = 'settlement'
              targetRegStatus = 'paid'
            } else if (midtransStatus.transaction_status === 'expire') {
              targetTxStatus = 'expire'
              targetRegStatus = 'expired'
            } else if (['cancel', 'deny'].includes(midtransStatus.transaction_status)) {
              targetTxStatus = midtransStatus.transaction_status
              targetRegStatus = 'cancelled'
            }

            if (targetRegStatus !== 'pending_payment') {
              // Update transaction
              const txUpdates: any = {
                transaction_status: targetTxStatus,
                payment_type: midtransStatus.payment_type || null,
                midtrans_transaction_id: midtransStatus.transaction_id || null,
                updated_at: new Date().toISOString(),
              }
              if (targetTxStatus === 'settlement') {
                txUpdates.paid_at = new Date().toISOString()
              } else if (targetTxStatus === 'expire') {
                txUpdates.expired_at = new Date().toISOString()
              }

              await supabase
                .from('transactions')
                .update(txUpdates)
                .eq('id', txData.id)

              // Update registration
              const regUpdates: any = {
                registration_status: targetRegStatus,
                updated_at: new Date().toISOString(),
              }
              if (targetRegStatus === 'paid') {
                regUpdates.qr_code_token = crypto.randomUUID()
              }

              await supabase
                .from('registrations')
                .update(regUpdates)
                .eq('id', reg.id)

              // Release slot if expired or cancelled
              if (['expired', 'cancelled'].includes(targetRegStatus) && reg.event_category_id) {
                console.log(`[Status API] Releasing slot for category: ${reg.event_category_id}`)
                await supabase.rpc('fn_release_slot', {
                  p_category_id: reg.event_category_id,
                })
              }

              // Update in-memory state returned to user
              reg.registration_status = targetRegStatus
              if (targetRegStatus === 'paid') {
                reg.qr_code_token = regUpdates.qr_code_token
              }
            }
          } catch (midtransError: any) {
            console.error('[Status API] Proactive status check error:', midtransError.message || midtransError)
          }
        }

        if (reg.registration_status === 'pending_payment' && txData) {
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
