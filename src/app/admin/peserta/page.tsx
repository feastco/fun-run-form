'use client'

import React from 'react'
import { RegistrationTable } from '@/components/admin/registration-table'

export default function AdminPesertaPage() {
  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-2xl font-extrabold text-secondary tracking-tight">
          PENGELOLAAN PESERTA
        </h2>
        <p className="text-text-secondary text-sm">
          Cari, filter, dan lihat detail data diri serta riwayat pembayaran peserta terdaftar.
        </p>
      </div>

      <RegistrationTable />
    </div>
  )
}
