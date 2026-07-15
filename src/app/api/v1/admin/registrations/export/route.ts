/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/api-guards'


function escapeCSV(val: any) {
  if (val === null || val === undefined) return ''
  let str = String(val).trim()
  
  // Protect against CSV injection by escaping leading formula triggers
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`
  }

  // Replace double quotes with double double-quotes
  str = str.replace(/"/g, '""')
  // Wrap in quotes if it contains separator, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str}"`
  }
  return str
}

export async function GET() {
  try {
    const { authorized, response, supabase: client } = await checkAdminAuth()
    if (!authorized) return response
    const supabase = client as any


    const { data, error } = await supabase
      .from('registrations')
      .select(`
        registration_number,
        full_name,
        email,
        phone,
        nik,
        gender,
        birth_place,
        birth_date,
        nationality,
        address,
        blood_type,
        medical_history,
        jersey_size,
        emergency_contact_name,
        emergency_contact_phone,
        registration_status,
        created_at,
        event_categories (
          name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Export CSV API] Database error:', error)
      return NextResponse.json({ success: false, message: 'Gagal mengekspor data peserta.' }, { status: 500 })
    }

    const headers = [
      'No. Registrasi',
      'Nama Lengkap',
      'Email',
      'No. HP',
      'NIK',
      'Gender',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Kewarganegaraan',
      'Alamat',
      'Golongan Darah',
      'Riwayat Penyakit',
      'Ukuran Jersey',
      'Kategori Lari',
      'Nama Kontak Darurat',
      'HP Kontak Darurat',
      'Status Pendaftaran',
      'Tanggal Daftar',
    ]

    const csvRows = [headers.join(',')]

    for (const reg of (data || [])) {
      const row = [
        escapeCSV(reg.registration_number),
        escapeCSV(reg.full_name),
        escapeCSV(reg.email),
        escapeCSV(reg.phone),
        escapeCSV(reg.nik),
        escapeCSV(reg.gender === 'male' ? 'Laki-laki' : 'Perempuan'),
        escapeCSV(reg.birth_place),
        escapeCSV(reg.birth_date),
        escapeCSV(reg.nationality),
        escapeCSV(reg.address),
        escapeCSV(reg.blood_type),
        escapeCSV(reg.medical_history),
        escapeCSV(reg.jersey_size),
        escapeCSV(reg.event_categories?.name || ''),
        escapeCSV(reg.emergency_contact_name),
        escapeCSV(reg.emergency_contact_phone),
        escapeCSV(reg.registration_status),
        escapeCSV(reg.created_at),
      ]
      csvRows.push(row.join(','))
    }

    const csvString = csvRows.join('\r\n')

    return new Response(csvString, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="peserta_fun_run.csv"',
      },
    })
  } catch (error) {
    console.error('[Export CSV API] Unexpected error:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
