'use client'

import React, { useState, useEffect } from 'react'
import { StatsCard } from '@/components/admin/stats-card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Users, CreditCard, Clock, Landmark } from 'lucide-react'
import Link from 'next/link'

interface DashboardData {
  totalRegistrations: number
  paidRegistrations: number
  pendingRegistrations: number
  totalRevenue: number
  categories: {
    id: string
    name: string
    quota: number
    reserved_count: number
  }[]
  recentRegistrations: {
    id: string
    registration_number: string
    full_name: string
    created_at: string
    registration_status: 'pending_payment' | 'paid' | 'claimed' | 'expired' | 'cancelled'
    category_name: string
  }[]
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    setErrorMsg('')
    try {
      const response = await fetch('/api/v1/admin/dashboard')
      const resJson = await response.json()
      if (!response.ok) {
        throw new Error(resJson.message || 'Gagal memuat data dashboard.')
      }
      setData(resJson.data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data.'
      setErrorMsg(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
      case 'claimed':
        return 'bg-indigo-50 text-indigo-600 border border-indigo-100'
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
      case 'claimed':
        return 'Lunas (Racepack)'
      case 'pending_payment':
        return 'Menunggu'
      case 'expired':
        return 'Kedaluwarsa'
      case 'cancelled':
        return 'Batal'
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white border border-gray-100 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-white border border-gray-100 rounded-xl"></div>
          <div className="h-96 bg-white border border-gray-100 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (errorMsg) {
    return (
      <div className="bg-danger/10 border border-danger text-danger p-6 rounded-xl text-center max-w-xl mx-auto mt-12">
        <svg className="w-16 h-16 text-danger mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-xl font-bold mb-2">Terjadi Kesalahan</h3>
        <p className="text-sm mb-4">{errorMsg}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-opacity-95 font-bold transition-all text-xs cursor-pointer"
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  const stats = data!

  return (
    <div className="space-y-8 font-sans">
      {/* Overview Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-secondary tracking-tight">
          DASHBOARD OVERVIEW
        </h2>
        <p className="text-text-secondary text-sm">
          Pantau statistik real-time pendaftaran, kuota, dan transaksi pembayaran event.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Pendaftaran"
          value={stats.totalRegistrations}
          icon={<Users className="w-6 h-6" />}
          description="Semua data formulir masuk"
        />
        <StatsCard
          title="Pembayaran Lunas"
          value={stats.paidRegistrations}
          icon={<CreditCard className="w-6 h-6 text-[#10B981]" />}
          badge={{ text: 'Lunas', variant: 'success' }}
          description="Peserta terdaftar aktif"
        />
        <StatsCard
          title="Menunggu Pembayaran"
          value={stats.pendingRegistrations}
          icon={<Clock className="w-6 h-6 text-[#F59E0B]" />}
          badge={{ text: 'Pending', variant: 'warning' }}
          description="Batas pembayaran 24 jam"
        />
        <StatsCard
          title="Total Pendapatan"
          value={formatCurrency(stats.totalRevenue)}
          icon={<Landmark className="w-6 h-6 text-primary" />}
          description="Akumulasi dari transaksi sukses"
        />
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Registrations Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-default flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-secondary">
              Pendaftaran Terbaru
            </h3>
            <Link href="/admin/peserta" className="text-xs text-primary font-bold hover:underline">
              Lihat Semua
            </Link>
          </div>

          <div className="flex-grow overflow-x-auto">
            {stats.recentRegistrations.length === 0 ? (
              <div className="text-center py-12 text-text-secondary text-sm">
                Belum ada pendaftaran masuk.
              </div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-text-secondary font-semibold">
                    <th className="pb-3">No. Registrasi</th>
                    <th className="pb-3">Nama</th>
                    <th className="pb-3">Kategori</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.recentRegistrations.map((reg) => (
                    <tr key={reg.id} className="text-text-primary hover:bg-surface transition-all">
                      <td className="py-3 font-bold text-sm text-secondary">{reg.registration_number}</td>
                      <td className="py-3 font-semibold">{reg.full_name}</td>
                      <td className="py-3 text-xs text-text-secondary font-medium">{reg.category_name}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(reg.registration_status)}`}>
                          {getStatusLabel(reg.registration_status)}
                        </span>
                      </td>
                      <td className="py-3 text-right text-xs text-text-secondary font-medium">{formatDate(reg.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quota Progress Panel */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-default">
          <h3 className="text-lg font-bold text-secondary mb-6">
            Kuota Kategori
          </h3>

          <div className="space-y-6">
            {stats.categories.length === 0 ? (
              <div className="text-center py-12 text-text-secondary text-sm">
                Belum ada kategori event aktif.
              </div>
            ) : (
              stats.categories.map((cat) => {
                const percent = Math.min(100, Math.round((cat.reserved_count / cat.quota) * 100))
                const isFull = cat.reserved_count >= cat.quota
                return (
                  <div key={cat.id} className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-secondary">{cat.name}</span>
                      <span className={isFull ? 'text-danger font-bold' : 'text-text-secondary'}>
                        {cat.reserved_count} / {cat.quota} Slot ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFull ? 'bg-danger' : percent >= 80 ? 'bg-warning' : 'bg-[#10B981]'
                        }`}
                      ></div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
