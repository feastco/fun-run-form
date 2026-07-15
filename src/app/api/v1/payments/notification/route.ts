/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { env } from '@/lib/env'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Redact signature_key from stdout log to prevent credential leakage
    const safeBody = { ...body }
    delete safeBody.signature_key
    console.log('[Webhook] Received notification body:', JSON.stringify(safeBody))

    const {
      order_id,
      status_code,


      gross_amount,
      signature_key,
      transaction_status,
      payment_type,
      transaction_id,
      fraud_status,
    } = body

    if (!order_id || !status_code || !gross_amount || !signature_key) {
      console.warn('[Webhook] Missing required verification fields in payload')
      return NextResponse.json(
        { success: false, message: 'Missing required payload fields' },
        { status: 400 }
      )
    }

    // 1. Signature Verify: SHA512(order_id + status_code + gross_amount + server_key)
    const serverKey = String((env as unknown as Record<string, unknown>).MIDTRANS_SERVER_KEY)
    const payloadString = `${order_id}${status_code}${gross_amount}${serverKey}`
    const computedSignature = createHash('sha512')
      .update(payloadString)
      .digest('hex')

    if (computedSignature.toLowerCase() !== signature_key.toLowerCase()) {
      console.warn('[Webhook] Signature verification failed. Computed:', computedSignature, 'Received:', signature_key)
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Initialize Supabase Admin Client
    const supabase = createAdminClient() as any

    // 2. Fetch the existing transaction and its registration category details
    const { data: txData, error: txError } = await supabase
      .from('transactions')
      .select('id, transaction_status, registration_id, registrations(event_category_id, registration_status)')
      .eq('order_id', order_id)
      .single()

    if (txError || !txData) {
      console.error('[Webhook] Transaction not found for order_id:', order_id, txError)
      return NextResponse.json(
        { success: false, message: 'Transaction not found' },
        { status: 404 }
      )
    }

    const transaction = txData
    const registration = transaction.registrations as unknown as {
      event_category_id: string
      registration_status: string
    }

    // 3. Idempotent: check current status before update
    const currentTxStatus = transaction.transaction_status
    if (['settlement', 'expire', 'cancel', 'deny'].includes(currentTxStatus)) {
      console.log(`[Webhook] Transaction ${order_id} is already in terminal state: ${currentTxStatus}. Skipping.`)
      return NextResponse.json({ success: true, message: 'Already processed' })
    }

    // 4. Map Midtrans transaction_status to database values
    let targetTxStatus: 'pending' | 'settlement' | 'expire' | 'cancel' | 'deny' = 'pending'
    let targetRegStatus: 'pending_payment' | 'paid' | 'expired' | 'cancelled' = 'pending_payment'

    if (transaction_status === 'capture') {
      if (fraud_status === 'challenge') {
        targetTxStatus = 'pending'
        targetRegStatus = 'pending_payment'
      } else if (fraud_status === 'accept' || !fraud_status) {
        targetTxStatus = 'settlement'
        targetRegStatus = 'paid'
      }
    } else if (transaction_status === 'settlement') {
      targetTxStatus = 'settlement'
      targetRegStatus = 'paid'
    } else if (transaction_status === 'pending') {
      targetTxStatus = 'pending'
      targetRegStatus = 'pending_payment'
    } else if (transaction_status === 'expire') {
      targetTxStatus = 'expire'
      targetRegStatus = 'expired'
    } else if (['cancel', 'deny'].includes(transaction_status)) {
      targetTxStatus = transaction_status as 'cancel' | 'deny'
      targetRegStatus = 'cancelled'
    }

    console.log(`[Webhook] Transitioning transaction to ${targetTxStatus} and registration to ${targetRegStatus}`)

    // 5. Build transaction updates
    const txUpdates: Record<string, unknown> = {
      transaction_status: targetTxStatus,
      payment_type: payment_type || null,
      midtrans_transaction_id: transaction_id || null,
      raw_notification: body,
      updated_at: new Date().toISOString(),
    }

    if (targetTxStatus === 'settlement') {
      txUpdates.paid_at = new Date().toISOString()
    } else if (targetTxStatus === 'expire') {
      txUpdates.expired_at = new Date().toISOString()
    }

    // Perform transaction update
    const { error: txUpdateError } = await supabase
      .from('transactions')
      .update(txUpdates)
      .eq('id', transaction.id)

    if (txUpdateError) {
      console.error('[Webhook] Failed to update transaction:', txUpdateError)
      return NextResponse.json(
        { success: false, message: 'Failed to update transaction status' },
        { status: 500 }
      )
    }

    // 6. Build registration updates
    const regUpdates: Record<string, unknown> = {
      registration_status: targetRegStatus,
      updated_at: new Date().toISOString(),
    }

    if (targetRegStatus === 'paid') {
      regUpdates.qr_code_token = crypto.randomUUID()
    }

    // Perform registration update
    const { error: regUpdateError } = await supabase
      .from('registrations')
      .update(regUpdates)
      .eq('id', transaction.registration_id)

    if (regUpdateError) {
      console.error('[Webhook] Failed to update registration status:', regUpdateError)
      return NextResponse.json(
        { success: false, message: 'Failed to update registration status' },
        { status: 500 }
      )
    }

    // 7. If target status is expire, cancel, or deny, release slot
    if (['expired', 'cancelled'].includes(targetRegStatus) && registration?.event_category_id) {
      console.log(`[Webhook] Releasing slot for category: ${registration.event_category_id}`)
      const { error: releaseError } = await supabase.rpc('fn_release_slot', {
        p_category_id: registration.event_category_id,
      })

      if (releaseError) {
        console.error('[Webhook] Failed to release slot via fn_release_slot:', releaseError)
        // Note: we log the error but still return 200/500 depending on requirements.
        // Usually, failing slot release shouldn't completely fail the webhook if DB already recorded payment,
        // but since we're strict, let's keep track of errors.
      }
    }

    return NextResponse.json({ success: true, message: 'Notification processed successfully' })
  } catch (error) {
    console.error('[Webhook] Error handling webhook notification:', error)
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
