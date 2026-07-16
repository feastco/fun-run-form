'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { CheckCircle2, AlertTriangle, ShieldCheck, User, Sparkles } from 'lucide-react'

interface VerifyPageProps {
  params: Promise<{ token: string }>
}

interface VerificationData {
  registration_number: string
  full_name: string
  gender: string
  nationality: string
  jersey_size: string
  registration_status: string
  event_name: string
  category_name: string
  is_admin_scanner: boolean
}

export default function VerifyPage({ params }: VerifyPageProps) {
  const { token } = use(params)
  const [data, setData] = useState<VerificationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    fetchVerification()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const fetchVerification = async () => {
    setIsLoading(true)
    setErrorMsg('')
    try {
      const res = await fetch(`/api/v1/verify/${token}`)
      const resJson = await res.json()
      if (!res.ok) {
        throw new Error(resJson.message || 'Gagal memverifikasi tiket.')
      }
      setData(resJson.data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat memverifikasi.'
      setErrorMsg(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleClaim = async (claim: boolean) => {
    setActionLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const res = await fetch(`/api/v1/verify/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: claim ? 'claimed' : 'paid' })
      })
      const resJson = await res.json()
      if (!res.ok) {
        throw new Error(resJson.message || 'Gagal mengubah status racepack.')
      }
      setSuccessMsg(resJson.message)
      // Refresh verification data
      await fetchVerification()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.'
      setErrorMsg(msg)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col justify-between font-sans">
      {/* Header */}
      <header className="h-16 border-b border-gray-800 bg-[#1E293B] flex items-center justify-center px-4">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          FUN<span className="text-primary">RUN</span> <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded font-mono ml-1">E-TICKET</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="grow flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-md bg-[#1E293B] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
          {isLoading ? (
            <div className="space-y-4 animate-pulse py-8 text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto"></div>
              <div className="h-6 bg-gray-700 rounded w-2/3 mx-auto"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto mt-2"></div>
              <div className="h-24 bg-gray-800 rounded mt-6"></div>
            </div>
          ) : errorMsg && !data ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-red-900/30 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-red-500">Verifikasi Gagal</h3>
              <p className="text-sm text-gray-400">{errorMsg}</p>
              <div className="pt-4">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-6 h-10 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded-lg transition-all"
                >
                  Kembali ke Beranda
                </Link>
              </div>
            </div>
          ) : data ? (
            <>
              {/* Status Badge */}
              <div className="text-center space-y-3">
                {data.registration_status === 'claimed' ? (
                  <div className="inline-flex flex-col items-center gap-1.5 p-4 bg-indigo-900/20 border border-indigo-500/20 rounded-2xl w-full">
                    <CheckCircle2 className="w-8 h-8 text-indigo-400" />
                    <span className="text-sm font-extrabold text-indigo-400 uppercase tracking-wide">Racepack Sudah Diambil</span>
                  </div>
                ) : data.registration_status === 'paid' ? (
                  <div className="inline-flex flex-col items-center gap-1.5 p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-2xl w-full">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    <span className="text-sm font-extrabold text-emerald-400 uppercase tracking-wide">Tiket Valid & Siap Ambil</span>
                  </div>
                ) : (
                  <div className="inline-flex flex-col items-center gap-1.5 p-4 bg-amber-900/20 border border-amber-500/20 rounded-2xl w-full">
                    <AlertTriangle className="w-8 h-8 text-amber-500" />
                    <span className="text-sm font-extrabold text-amber-500 uppercase tracking-wide">Pendaftaran Belum Lunas</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg font-medium text-center">
                    {successMsg}
                  </div>
                )}
                {errorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg font-medium text-center">
                    {errorMsg}
                  </div>
                )}
              </div>

              {/* Ticket Details */}
              <div className="bg-[#0F172A] border border-gray-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Detail Peserta</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="col-span-2">
                    <span className="text-gray-500 block font-medium">Nama Lengkap</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">{data.full_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block font-medium">Nomor Registrasi</span>
                    <span className="text-sm font-bold text-primary mt-0.5 block">{data.registration_number}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block font-medium">Kategori Lari</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">{data.category_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block font-medium">Kewarganegaraan</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">{data.nationality}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block font-medium">Ukuran Jersey</span>
                    <span className="text-sm font-black text-white mt-0.5 block bg-primary/20 border border-primary/30 px-2 py-0.5 rounded w-max">
                      {data.jersey_size}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                {data.is_admin_scanner ? (
                  data.registration_status === 'paid' ? (
                    <button
                      onClick={() => handleToggleClaim(true)}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 h-12 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl transition-all cursor-pointer text-sm shadow-lg disabled:opacity-50"
                    >
                      <ShieldCheck className="w-5 h-5" />
                      {actionLoading ? 'Memproses...' : 'Serahkan Racepack'}
                    </button>
                  ) : data.registration_status === 'claimed' ? (
                    <button
                      onClick={() => handleToggleClaim(false)}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 h-12 bg-gray-800 hover:bg-gray-700 text-red-400 font-bold rounded-xl border border-red-500/20 transition-all cursor-pointer text-sm disabled:opacity-50"
                    >
                      <AlertTriangle className="w-5 h-5" />
                      {actionLoading ? 'Memproses...' : 'Batalkan Klaim Racepack'}
                    </button>
                  ) : null
                ) : (
                  <div className="p-4 bg-gray-800/40 border border-gray-800 rounded-xl text-center space-y-3">
                    <p className="text-[11px] text-gray-400">
                      Anda sedang memindai sebagai pengunjung publik. Jika Anda adalah panitia, silakan login admin untuk mengaktifkan aksi serah terima.
                    </p>
                    <Link
                      href="/admin/login"
                      className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Login Admin Panitia
                    </Link>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-gray-800 bg-[#1E293B] text-center text-xs text-gray-500">
        © 2026 Fun Run Official. All Rights Reserved.
      </footer>
    </div>
  )
}
