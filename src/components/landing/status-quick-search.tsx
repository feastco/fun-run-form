'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export function StatusQuickSearch() {
  const [value, setValue] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    router.push(`/status?reg=${encodeURIComponent(trimmed)}`)
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-default p-6 md:p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-text-primary text-[15px]">Cek Status Pendaftaran</h3>
          <p className="text-xs text-text-secondary">Sudah mendaftar? Masukkan nomor registrasi Anda di sini.</p>
        </div>
      </div>
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Contoh: FR2026-0001"
          className="flex-1 px-4 h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm text-text-primary placeholder-gray-400 transition-all"
        />
        <button
          type="submit"
          className="h-11 px-6 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all text-sm cursor-pointer whitespace-nowrap"
        >
          Cek Sekarang
        </button>
      </form>
    </div>
  )
}
