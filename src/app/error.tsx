'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Root Error Boundary]:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-secondary flex flex-col justify-center items-center p-6 font-sans text-center">
      <div className="space-y-4 max-w-md">
        <div className="flex justify-center">
          <AlertTriangle className="w-16 h-16 text-[#E63946]" />
        </div>
        <h1 className="text-8xl font-black text-gray-700 tracking-tight select-none">
          500
        </h1>
        <h2 className="text-2xl font-extrabold text-white">
          Terjadi kesalahan
        </h2>
        <p className="text-sm text-text-secondary">
          Maaf, terjadi kesalahan pada server.
        </p>
        <div className="pt-6 flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 border border-gray-500 text-white font-bold rounded-lg hover:bg-white/5 transition-all text-sm cursor-pointer bg-transparent"
          >
            Coba Lagi
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-[#E64500] transition-all text-sm cursor-pointer"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
