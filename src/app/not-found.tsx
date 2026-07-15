'use client'

import React from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col justify-center items-center p-6 font-sans text-center">
      <div className="space-y-4 max-w-md">
        <div className="flex justify-center">
          <Search className="w-16 h-16 text-gray-400" />
        </div>
        <h1 className="text-8xl font-black text-gray-700 tracking-tight select-none">
          404
        </h1>
        <h2 className="text-2xl font-extrabold text-white">
          Halaman tidak ditemukan
        </h2>
        <p className="text-sm text-text-secondary">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <div className="pt-6">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-[#E64500] transition-all text-sm cursor-pointer"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
