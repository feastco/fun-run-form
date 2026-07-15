'use client'

import React from 'react'
import { TransactionTable } from '@/components/admin/transaction-table'

export default function AdminTransaksiPage() {
  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-2xl font-extrabold text-secondary tracking-tight">
          TRANSAKSI & KUOTA
        </h2>
        <p className="text-text-secondary text-sm">
          Pantau status transaksi pembayaran Midtrans, ekspor data pendaftaran ke CSV, dan kelola kuota slot kategori event.
        </p>
      </div>

      <TransactionTable />
    </div>
  )
}
