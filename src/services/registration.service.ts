/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAdminClient } from '@/lib/supabase/admin'
import { snap } from '@/lib/midtrans/client'
import { RegistrationFormInput } from '@/lib/validations/registration'

export async function registerParticipant(input: RegistrationFormInput) {
  const supabase = createAdminClient() as any

  // 1. Get category info and event_id
  const { data, error: catError } = await supabase
    .from('event_categories')
    .select(`
      id,
      name,
      price,
      is_active,
      event_id,
      events (
        is_active,
        registration_open_at,
        registration_close_at
      )
    `)
    .eq('id', input.event_category_id)
    .single()

  const category = data as any

  if (catError || !category) {
    throw { code: 422, message: 'Kategori tidak ditemukan.' }
  }

  if (!category.is_active) {
    throw { code: 422, message: 'Kategori tidak aktif.' }
  }

  const event = category.events as any
  if (!event || !event.is_active) {
    throw { code: 422, message: 'Event tidak aktif.' }
  }

  const now = new Date()
  const openAt = new Date(event.registration_open_at)
  const closeAt = new Date(event.registration_close_at)
  if (now < openAt || now > closeAt) {
    throw { code: 422, message: 'Pendaftaran event sedang ditutup.' }
  }

  // 2. Check duplicate email for active/pending registrations
  const { data: existingReg, error: checkError } = await supabase
    .from('registrations')
    .select('id')
    .eq('email', input.email)
    .eq('event_id', category.event_id)
    .in('registration_status', ['pending_payment', 'paid'])
    .maybeSingle()

  if (checkError) {
    throw { code: 500, message: 'Gagal memvalidasi data pendaftaran.' }
  }

  if (existingReg) {
    throw { code: 409, message: 'Email sudah terdaftar untuk event ini.' }
  }

  // 3. Try to reserve slot via fn_reserve_slot
  const { data: reserved, error: reserveError } = await supabase
    .rpc('fn_reserve_slot', { p_category_id: input.event_category_id })

  if (reserveError) {
    console.error('Reserve slot error:', reserveError)
    throw { code: 500, message: 'Gagal memesan slot pendaftaran.' }
  }

  if (!reserved) {
    throw { code: 409, message: 'Kuota kategori penuh.' }
  }

  // 4. Generate Registration Number
  const { data: regNumber, error: regNumError } = await supabase
    .rpc('fn_generate_registration_number', { p_event_id: category.event_id })

  if (regNumError || !regNumber) {
    console.error('Gen reg number error:', regNumError)
    // Rollback reserved slot
    await supabase.rpc('fn_release_slot', { p_category_id: input.event_category_id })
    throw { code: 500, message: 'Gagal membuat nomor pendaftaran.' }
  }

  // 5. Insert registration record
  const { data: regData, error: insertRegError } = await supabase
    .from('registrations')
    .insert({
      registration_number: regNumber,
      event_id: category.event_id,
      event_category_id: input.event_category_id,
      full_name: input.full_name,
      email: input.email,
      phone: input.phone,
      nik: input.nik,
      gender: input.gender,
      birth_place: input.birth_place,
      birth_date: input.birth_date,
      nationality: input.nationality,
      address: input.address,
      blood_type: input.blood_type || null,
      medical_history: input.medical_history || null,
      jersey_size: input.jersey_size,
      emergency_contact_name: input.emergency_contact_name,
      emergency_contact_phone: input.emergency_contact_phone,
      registration_status: 'pending_payment',
    })
    .select('id, registration_number')
    .single()

  const registration = regData as any

  if (insertRegError || !registration) {
    console.error('Insert registration error:', insertRegError)
    // Rollback reserved slot
    await supabase.rpc('fn_release_slot', { p_category_id: input.event_category_id })
    throw { code: 500, message: 'Gagal menyimpan data pendaftaran.' }
  }

  // 6. Create Midtrans Transaction
  const timestamp = Math.floor(Date.now() / 1000)
  const orderId = `EVT-${registration.registration_number}-${timestamp}`

  try {
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: category.price,
      },
      customer_details: {
        first_name: input.full_name,
        email: input.email,
        phone: input.phone,
      },
      item_details: [
        {
          id: category.id,
          price: category.price,
          quantity: 1,
          name: category.name,
        },
      ],
      expiry: {
        unit: 'hours',
        duration: 24, // 24 hours expiry
      },
    }

    const midtransTx = await snap.createTransaction(parameter)

    // Insert transaction record
    const { error: insertTxError } = await supabase
      .from('transactions')
      .insert({
        registration_id: registration.id,
        order_id: orderId,
        amount: category.price,
        transaction_status: 'pending',
        snap_token: midtransTx.token,
        snap_redirect_url: midtransTx.redirect_url,
      })

    if (insertTxError) {
      console.error('Insert transaction error:', insertTxError)
      throw new Error('Gagal menyimpan transaksi pembayaran.')
    }

    return {
      registration_id: registration.id,
      registration_number: registration.registration_number,
      snap_token: midtransTx.token,
      snap_redirect_url: midtransTx.redirect_url,
    }
  } catch (midtransError: unknown) {
    console.error('Midtrans Snap error:', midtransError)
    
    // ROLLBACK FLOW:
    // Update registration status to cancelled
    await supabase
      .from('registrations')
      .update({ registration_status: 'cancelled' })
      .eq('id', registration.id)

    // Release slot
    await supabase.rpc('fn_release_slot', { p_category_id: input.event_category_id })

    throw { code: 500, message: 'Gagal membuat transaksi Midtrans. Silakan coba lagi.' }
  }
}
