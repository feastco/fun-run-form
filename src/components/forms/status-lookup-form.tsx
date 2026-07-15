'use client'

import React, { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'
import { ETicket } from '@/components/ticket/e-ticket'

interface RegistrationResult {
  id: string
  registration_number: string
  full_name: string
  registration_status: 'pending_payment' | 'paid' | 'expired' | 'cancelled'
  qr_code_token: string | null
  created_at: string
  event_name: string
  category_name: string
  price: number
  snap_token?: string
  snap_redirect_url?: string
}

interface StatusLookupFormProps {
  initialReg?: string
}

export function StatusLookupForm({ initialReg }: StatusLookupFormProps) {
  const [activeTab, setActiveTab] = useState<'email' | 'reg' | 'phone'>('email')
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [results, setResults] = useState<RegistrationResult[]>([])
  const [errorMsg, setErrorMsg] = useState('')
  const [paymentError, setPaymentError] = useState('')

  // Automatically search if initialReg query param is provided
  useEffect(() => {
    if (initialReg) {
      setActiveTab('reg')
      setInputValue(initialReg)
      handleSearch(initialReg, 'reg')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialReg])

  const handleSearch = async (val?: string, tabOverride?: 'email' | 'reg' | 'phone') => {
    const searchVal = val !== undefined ? val : inputValue
    const searchTab = tabOverride || activeTab

    if (!searchVal.trim()) {
      setErrorMsg('Masukkan kata kunci pencarian terlebih dahulu.')
      return
    }

    setIsLoading(true)
    setErrorMsg('')
    setPaymentError('')
    setHasSearched(true)
    setResults([])

    try {
      let queryParam = ''
      if (searchTab === 'email') {
        queryParam = `email=${encodeURIComponent(searchVal)}`
      } else if (searchTab === 'reg') {
        queryParam = `registration_number=${encodeURIComponent(searchVal)}`
      } else if (searchTab === 'phone') {
        queryParam = `phone=${encodeURIComponent(searchVal)}`
      }

      const response = await fetch(`/api/v1/registrations/status?${queryParam}`)
      const resJson = await response.json()

      if (!response.ok) {
        throw new Error(resJson.message || 'Gagal memuat status pendaftaran.')
      }

      setResults(resJson.registrations || [])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data.'
      setErrorMsg(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const triggerPayment = (reg: RegistrationResult) => {
    setPaymentError('')
    if (!reg.snap_token) {
      if (reg.snap_redirect_url) {
        window.location.href = reg.snap_redirect_url
        return
      }
      setPaymentError('Token pembayaran tidak ditemukan. Harap hubungi panitia.')
      return
    }

    const win = window as unknown as { snap?: { pay: (token: string, options: Record<string, unknown>) => void } }
    if (win.snap) {
      win.snap.pay(reg.snap_token, {
        onSuccess: () => {
          handleSearch()
        },
        onPending: () => {
          handleSearch()
        },
        onError: () => {
          setPaymentError('Pembayaran gagal dilakukan. Silakan coba lagi.')
        },
        onClose: () => {
          handleSearch()
        }
      })
    } else if (reg.snap_redirect_url) {
      window.location.href = reg.snap_redirect_url
    } else {
      setPaymentError('Gagal memuat sistem pembayaran. Silakan refresh halaman.')
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
      case 'pending_payment':
        return 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20'
      case 'expired':
        return 'bg-gray-100 text-gray-500 border border-gray-200'
      case 'cancelled':
        return 'bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20'
      default:
        return 'bg-gray-100 text-gray-500'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Lunas'
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
    <div className="space-y-8 print:space-y-0">
      {/* Tabs & Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-default print:hidden">
        <div className="flex border-b border-gray-100 mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('email')
              setInputValue('')
              setHasSearched(false)
              setResults([])
              setErrorMsg('')
            }}
            className={`flex-1 pb-3 text-[14px] font-bold border-b-2 text-center transition-all cursor-pointer ${
              activeTab === 'email'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('reg')
              setInputValue('')
              setHasSearched(false)
              setResults([])
              setErrorMsg('')
            }}
            className={`flex-1 pb-3 text-[14px] font-bold border-b-2 text-center transition-all cursor-pointer ${
              activeTab === 'reg'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Nomor Registrasi
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('phone')
              setInputValue('')
              setHasSearched(false)
              setResults([])
              setErrorMsg('')
            }}
            className={`flex-1 pb-3 text-[14px] font-bold border-b-2 text-center transition-all cursor-pointer ${
              activeTab === 'phone'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Nomor HP
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSearch()
          }}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="flex-grow">
            <input
              type={activeTab === 'email' ? 'email' : 'text'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                activeTab === 'email'
                  ? 'contoh@domain.com'
                  : activeTab === 'reg'
                  ? 'Masukkan nomor registrasi (contoh: BR2026-0001)'
                  : 'Masukkan nomor HP (contoh: 08123456789)'
              }
              className="w-full px-4 h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/30 focus:border-[#FF4D00] text-text-primary placeholder-gray-400 text-sm transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="h-11 px-6 bg-primary text-white font-bold rounded-lg hover:bg-[#E64500] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all text-sm cursor-pointer whitespace-nowrap"
          >
            {isLoading ? 'Mencari...' : 'Cari Pendaftaran'}
          </button>
        </form>

        {errorMsg && (
          <div className="mt-4 bg-danger/10 border border-danger text-danger p-4 rounded-lg text-sm">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Loading Skeleton state */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-default animate-pulse space-y-4 print:hidden">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      )}

      {/* Payment Error banner */}
      {paymentError && (
        <div className="bg-danger/10 border border-danger text-danger p-4 rounded-lg text-sm print:hidden">
          {paymentError}
        </div>
      )}

      {/* Search results */}
      {hasSearched && !isLoading && (
        <div className="space-y-8 print:space-y-0">
          {results.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 shadow-default text-center print:hidden">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-bold text-text-primary mb-2">Pendaftaran tidak ditemukan</h3>
              <p className="text-text-secondary text-sm">
                Pastikan data yang dimasukkan benar atau silakan hubungi kontak panitia.
              </p>
            </div>
          ) : (
            results.map((reg) => (
              <div key={reg.id} className="space-y-6 print:space-y-0">
                {/* Result Info Card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-default print:hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <p className="text-xs text-text-secondary uppercase font-semibold">Nomor Registrasi</p>
                      <h3 className="text-lg font-bold text-text-primary">{reg.registration_number}</h3>
                    </div>
                    <span className={`self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(reg.registration_status)}`}>
                      {getStatusLabel(reg.registration_status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6 text-sm">
                    <div>
                      <span className="text-xs text-text-secondary">Nama Lengkap</span>
                      <p className="font-bold text-text-primary mt-0.5">{reg.full_name}</p>
                    </div>
                    <div>
                      <span className="text-xs text-text-secondary">Nama Event</span>
                      <p className="font-bold text-text-primary mt-0.5">{reg.event_name}</p>
                    </div>
                    <div>
                      <span className="text-xs text-text-secondary">Kategori</span>
                      <p className="font-bold text-text-primary mt-0.5">{reg.category_name}</p>
                    </div>
                    <div>
                      <span className="text-xs text-text-secondary">Total Biaya</span>
                      <p className="font-bold text-text-primary mt-0.5">{formatCurrency(reg.price)}</p>
                    </div>
                  </div>

                  {/* Actions for Pending */}
                  {reg.registration_status === 'pending_payment' && (
                    <div className="mt-4 p-4 bg-[#F59E0B]/10 rounded-lg border border-[#F59E0B]/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="text-sm text-text-primary">
                        <p className="font-bold text-[#F59E0B]">Menunggu Pembayaran</p>
                        <p className="text-xs text-text-secondary mt-0.5">Batas waktu pembayaran adalah 24 jam setelah pendaftaran dibuat.</p>
                      </div>
                      <button
                        onClick={() => triggerPayment(reg)}
                        className="px-6 h-10 bg-[#F59E0B] text-white font-bold rounded-lg hover:bg-[#D97706] transition-all text-xs cursor-pointer whitespace-nowrap"
                      >
                        Bayar Sekarang
                      </button>
                    </div>
                  )}

                  {/* Message for Expired / Cancelled */}
                  {reg.registration_status === 'expired' && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 text-xs text-text-secondary">
                      Batas waktu pembayaran 24 jam telah habis. Kuota slot kategori ini telah dilepas kembali ke publik.
                    </div>
                  )}

                  {reg.registration_status === 'cancelled' && (
                    <div className="mt-4 p-4 bg-[#E63946]/5 rounded-lg border border-[#E63946]/10 text-xs text-text-secondary">
                      Pendaftaran telah dibatalkan oleh admin atau sistem karena transaksi ditolak/gagal.
                    </div>
                  )}
                </div>

                {/* Render E-Ticket for Paid */}
                {reg.registration_status === 'paid' && reg.qr_code_token && (
                  <div className="print:m-0">
                    <ETicket
                      fullName={reg.full_name}
                      registrationNumber={reg.registration_number}
                      eventName={reg.event_name}
                      categoryName={reg.category_name}
                      qrCodeToken={reg.qr_code_token}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
