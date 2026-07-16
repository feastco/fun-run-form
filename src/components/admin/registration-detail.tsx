'use client'

import React, { useState, useEffect } from 'react'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
import { X, User, Heart, ShieldAlert, CreditCard } from 'lucide-react'

interface RegistrationDetailProps {
  registrationId: string
  onClose: () => void
}

export function RegistrationDetail({ registrationId, onClose }: RegistrationDetailProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [detail, setDetail] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetchDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registrationId])

  const fetchDetail = async () => {
    setIsLoading(true)
    setErrorMsg('')
    try {
      const response = await fetch(`/api/v1/admin/registrations/${registrationId}`)
      const resJson = await response.json()
      if (!response.ok) {
        throw new Error(resJson.message || 'Gagal memuat detail pendaftaran.')
      }
      setDetail(resJson.data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat detail.'
      setErrorMsg(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const [actionLoading, setActionLoading] = useState(false)

  const handleToggleRacepack = async () => {
    if (!detail?.qr_code_token) return
    setActionLoading(true)
    try {
      const isCurrentlyClaimed = detail.registration_status === 'claimed'
      const response = await fetch(`/api/v1/verify/${detail.qr_code_token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: isCurrentlyClaimed ? 'paid' : 'claimed' })
      })
      const resJson = await response.json()
      if (!response.ok) {
        throw new Error(resJson.message || 'Gagal memperbarui status racepack.')
      }
      await fetchDetail()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.'
      alert(msg)
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-[#065F46]/5 text-[#065F46] border border-[#047857]/20'
      case 'claimed':
        return 'bg-indigo-50/70 text-[#3730A3] border border-indigo-100'
      case 'pending_payment':
        return 'bg-[#92400E]/5 text-[#92400E] border border-[#B45309]/20'
      case 'expired':
        return 'bg-gray-50 text-gray-600 border border-gray-200'
      case 'cancelled':
        return 'bg-[#991B1B]/5 text-[#991B1B] border border-[#B91C1C]/20'
      default:
        return 'bg-gray-50 text-gray-600'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Lunas'
      case 'claimed':
        return 'Lunas (Racepack Diambil)'
      case 'pending_payment':
        return 'Menunggu Pembayaran'
      case 'expired':
        return 'Kedaluwarsa'
      case 'cancelled':
        return 'Dibatalkan'
      default:
        return status
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-elevated border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-secondary flex items-center gap-2">
              Detail Pendaftaran
            </h3>
            {detail && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary mt-0.5">
                <span>Reg No: <span className="font-bold text-secondary">{detail.registration_number}</span></span>
                <span className="text-gray-300">•</span>
                <span>Waktu Daftar: <span className="font-semibold text-text-primary">{formatDateTime(detail.created_at)}</span></span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-8 flex-grow">
          {isLoading ? (
            <div className="space-y-6 animate-pulse py-8">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="h-24 bg-gray-100 rounded"></div>
            </div>
          ) : errorMsg ? (
            <div className="p-6 bg-danger/10 border border-danger text-danger rounded-lg text-sm text-center">
              {errorMsg}
            </div>
          ) : (
            <>
              {/* Section 1: Event & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-surface rounded-xl border border-gray-100">
                <div>
                  <span className="text-[10px] text-text-secondary uppercase font-semibold">Event / Kategori</span>
                  <h4 className="text-sm font-bold text-secondary mt-0.5">
                    {detail.events?.name} — <span className="text-primary">{detail.event_categories?.name}</span>
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary font-semibold">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(detail.registration_status)}`}>
                    {getStatusLabel(detail.registration_status)}
                  </span>
                </div>
              </div>

              {/* Section 1.5: Status Pengambilan Racepack */}
              {(detail.registration_status === 'paid' || detail.registration_status === 'claimed') && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </span>
                    <div>
                      <span className="text-[10px] text-indigo-500 uppercase font-bold tracking-wider">Status Pengambilan Racepack</span>
                      <h5 className="text-sm font-extrabold text-secondary mt-0.5">
                        {detail.registration_status === 'claimed' ? (
                          <span className="text-indigo-600">Sudah Diambil</span>
                        ) : (
                          <span className="text-amber-600">Belum Diambil</span>
                        )}
                      </h5>
                    </div>
                  </div>
                  <button
                    onClick={handleToggleRacepack}
                    disabled={actionLoading}
                    className={`px-4 h-9 font-bold text-xs rounded-lg transition-all cursor-pointer disabled:opacity-50 ${
                      detail.registration_status === 'claimed'
                        ? 'bg-white border border-gray-300 text-text-secondary hover:bg-gray-50'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {actionLoading ? 'Memproses...' : detail.registration_status === 'claimed' ? 'Tandai Belum Diambil' : 'Tandai Sudah Diambil'}
                  </button>
                </div>
              )}

              {/* Section 2: Data Diri */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-secondary flex items-center gap-2 border-b border-gray-100 pb-2">
                  <User className="w-4 h-4 text-primary" />
                  Data Diri Peserta
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <div>
                    <span className="text-xs text-text-secondary">Nama Lengkap</span>
                    <p className="font-semibold text-text-primary mt-0.5">{detail.full_name}</p>
                  </div>
                  <div>
                    <span className="text-xs text-text-secondary">Nomor NIK (KTP)</span>
                    <p className="font-semibold text-text-primary mt-0.5">{detail.nik}</p>
                  </div>
                  <div>
                    <span className="text-xs text-text-secondary">Email</span>
                    <p className="font-semibold text-text-primary mt-0.5">{detail.email}</p>
                  </div>
                  <div>
                    <span className="text-xs text-text-secondary">Nomor HP</span>
                    <p className="font-semibold text-text-primary mt-0.5">{detail.phone}</p>
                  </div>
                  <div>
                    <span className="text-xs text-text-secondary">Tempat, Tanggal Lahir</span>
                    <p className="font-semibold text-text-primary mt-0.5">{detail.birth_place}, {formatDate(detail.birth_date)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-text-secondary">Jenis Kelamin</span>
                    <p className="font-semibold text-text-primary mt-0.5">{detail.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-text-secondary">Kewarganegaraan</span>
                    <p className="font-semibold text-text-primary mt-0.5">{detail.nationality}</p>
                  </div>
                  <div>
                    <span className="text-xs text-text-secondary">Ukuran Jersey</span>
                    <p className="font-semibold text-text-primary mt-0.5">{detail.jersey_size}</p>
                  </div>
                  {detail.nationality === 'WNI' && (
                    <>
                      <div>
                        <span className="text-xs text-text-secondary">Provinsi</span>
                        <p className="font-semibold text-text-primary mt-0.5">{detail.province || '-'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-text-secondary">Kota / Kabupaten</span>
                        <p className="font-semibold text-text-primary mt-0.5">{detail.city || '-'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-text-secondary">Kecamatan</span>
                        <p className="font-semibold text-text-primary mt-0.5">{detail.district || '-'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-text-secondary">Desa / Kelurahan</span>
                        <p className="font-semibold text-text-primary mt-0.5">{detail.village || '-'}</p>
                      </div>
                    </>
                  )}
                  <div className="md:col-span-2">
                    <span className="text-xs text-text-secondary">Alamat Lengkap</span>
                    <p className="font-semibold text-text-primary mt-0.5">{detail.address}</p>
                  </div>
                </div>
              </div>

              {/* Section 3: Riwayat Kesehatan */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-secondary flex items-center gap-2 border-b border-gray-100 pb-2">
                  <Heart className="w-4 h-4 text-primary" />
                  Informasi Kesehatan
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <span className="text-xs text-text-secondary">Golongan Darah</span>
                    <p className="font-semibold text-text-primary mt-0.5">{detail.blood_type || '-'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-text-secondary">Riwayat Penyakit</span>
                    <p className={`font-semibold mt-0.5 ${detail.medical_history ? 'text-danger' : 'text-text-primary'}`}>
                      {detail.medical_history || 'Tidak ada riwayat penyakit'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 4: Kontak Darurat */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-secondary flex items-center gap-2 border-b border-gray-100 pb-2">
                  <ShieldAlert className="w-4 h-4 text-primary" />
                  Kontak Darurat
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <span className="text-xs text-text-secondary">Nama Kontak</span>
                    <p className="font-semibold text-text-primary mt-0.5">{detail.emergency_contact_name}</p>
                  </div>
                  <div>
                    <span className="text-xs text-text-secondary">Nomor HP Hubungan</span>
                    <p className="font-semibold text-text-primary mt-0.5">{detail.emergency_contact_phone}</p>
                  </div>
                </div>
              </div>

              {/* Section 5: Transaksi Pembayaran */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-secondary flex items-center gap-2 border-b border-gray-100 pb-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Log Transaksi Pembayaran
                </h4>

                {detail.transactions && detail.transactions.length > 0 ? (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  detail.transactions.map((tx: any, idx: number) => (
                    <div key={idx} className="p-4 bg-surface rounded-xl border border-gray-100 space-y-3 text-xs">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                        <div>
                          <span className="text-text-secondary">Order ID: </span>
                          <span className="font-mono font-bold text-secondary">{tx.order_id}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.transaction_status === 'settlement'
                            ? 'bg-[#10B981]/10 text-[#10B981]'
                            : tx.transaction_status === 'pending'
                            ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {tx.transaction_status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div>
                          <span className="text-text-secondary block">Nominal</span>
                          <span className="font-semibold text-secondary">{formatCurrency(tx.amount)}</span>
                        </div>
                        <div>
                          <span className="text-text-secondary block">Metode</span>
                          <span className="font-semibold text-secondary uppercase">{tx.payment_type || '-'}</span>
                        </div>
                        <div>
                          <span className="text-text-secondary block">Midtrans ID</span>
                          <span className="font-semibold text-secondary font-mono">{tx.midtrans_transaction_id || '-'}</span>
                        </div>
                        <div>
                          <span className="text-text-secondary block">Dibuat Pada</span>
                          <span className="font-semibold text-secondary">{formatDate(tx.created_at)}</span>
                        </div>
                        {tx.paid_at && (
                          <div>
                            <span className="text-text-secondary block">Dibayar Pada</span>
                            <span className="font-semibold text-[#10B981]">{formatDate(tx.paid_at)}</span>
                          </div>
                        )}
                        {tx.expired_at && (
                          <div>
                            <span className="text-text-secondary block">Kedaluwarsa Pada</span>
                            <span className="font-semibold text-gray-500">{formatDate(tx.expired_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-xs text-text-secondary">
                    Belum ada riwayat transaksi.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 h-10 bg-secondary text-white font-bold rounded-lg hover:bg-opacity-95 transition-all text-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
