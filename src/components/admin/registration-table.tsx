'use client'

import React, { useState, useEffect } from 'react'
import { RegistrationDetail } from '@/components/admin/registration-detail'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

interface CategoryOption {
  id: string
  name: string
}

interface Registration {
  id: string
  registration_number: string
  full_name: string
  email: string
  phone: string
  registration_status: 'pending_payment' | 'paid' | 'expired' | 'cancelled'
  created_at: string
  category_name: string
}

export function RegistrationTable() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  // State for detail modal
  const [selectedRegId, setSelectedRegId] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchRegistrations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedCategory, selectedStatus])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/v1/events')
      const resJson = await response.json()
      if (response.ok && resJson.status === 'success' && resJson.data?.length > 0) {
        setCategories(resJson.data[0].categories || [])
      }
    } catch (error) {
      console.error('Failed to load categories options:', error)
    }
  }


  const fetchRegistrations = async () => {
    setIsLoading(true)
    setErrorMsg('')
    try {
      const queryParams = new URLSearchParams({
        page: String(currentPage),
        limit: '10',
        search: search.trim(),
        category_id: selectedCategory,
        status: selectedStatus,
      })

      const response = await fetch(`/api/v1/admin/registrations?${queryParams.toString()}`)
      const resJson = await response.json()

      if (!response.ok) {
        throw new Error(resJson.message || 'Gagal memuat peserta.')
      }

      setRegistrations(resJson.data.registrations)
      setTotalCount(resJson.data.pagination.totalCount)
      setTotalPages(resJson.data.pagination.totalPages)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data.'
      setErrorMsg(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchRegistrations()
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
        return 'Menunggu'
      case 'expired':
        return 'Kedaluwarsa'
      case 'cancelled':
        return 'Batal'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-default">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, hp, atau no registrasi..."
              className="w-full pl-10 pr-4 h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/30 focus:border-[#FF4D00] text-text-primary placeholder-gray-400 text-sm transition-all"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/30 focus:border-[#FF4D00] text-text-primary text-sm transition-all cursor-pointer bg-white"
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/30 focus:border-[#FF4D00] text-text-primary text-sm transition-all cursor-pointer bg-white"
            >
              <option value="">Semua Status</option>
              <option value="paid">Lunas (Paid)</option>
              <option value="pending_payment">Menunggu Pembayaran</option>
              <option value="expired">Kedaluwarsa (Expired)</option>
              <option value="cancelled">Dibatalkan (Cancelled)</option>
            </select>
          </div>

          <div className="md:col-span-4 flex justify-end gap-2 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 h-10 bg-primary text-white font-bold rounded-lg hover:bg-[#E64500] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all text-xs cursor-pointer"
            >
              Cari
            </button>
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setSelectedCategory('')
                setSelectedStatus('')
                setCurrentPage(1)
                // Fetch directly after resetting
                setTimeout(() => fetchRegistrations(), 0)
              }}
              className="px-6 h-10 border border-gray-300 text-text-primary font-bold rounded-lg hover:bg-gray-50 transition-all text-xs cursor-pointer bg-white"
            >
              Reset Filter
            </button>
          </div>
        </form>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-default overflow-hidden">
        {isLoading ? (
          <div className="space-y-4 p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-full"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded w-full"></div>
            ))}
          </div>
        ) : errorMsg ? (
          <div className="p-8 bg-danger/10 border border-danger text-danger text-center text-sm font-semibold">
            {errorMsg}
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-16 text-text-secondary text-sm">
            Belum ada data peserta yang cocok dengan kriteria filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-surface border-b border-gray-100 text-text-secondary font-semibold">
                  <th className="p-4 pl-6">No. Registrasi</th>
                  <th className="p-4">Nama Lengkap</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Nomor HP</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="text-text-primary hover:bg-surface transition-all">
                    <td className="p-4 pl-6 font-bold text-sm text-secondary">{reg.registration_number}</td>
                    <td className="p-4 font-semibold">{reg.full_name}</td>
                    <td className="p-4 text-xs text-text-secondary font-medium">{reg.email}</td>
                    <td className="p-4 text-xs text-text-secondary font-medium">{reg.phone}</td>
                    <td className="p-4 text-xs text-text-secondary font-medium">{reg.category_name}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(reg.registration_status)}`}>
                        {getStatusLabel(reg.registration_status)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedRegId(reg.id)}
                        className="px-3 h-8 border border-primary text-primary hover:bg-primary/5 font-bold rounded-lg transition-all text-xs cursor-pointer whitespace-nowrap bg-white"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Panel */}
        {!isLoading && registrations.length > 0 && (
          <div className="p-4 bg-surface border-t border-gray-50 flex items-center justify-between gap-4 text-xs text-text-secondary font-medium">
            <div>
              Menampilkan {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, totalCount)} dari {totalCount} Peserta
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer bg-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer bg-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal Overlay */}
      {selectedRegId && (
        <RegistrationDetail
          registrationId={selectedRegId}
          onClose={() => setSelectedRegId(null)}
        />
      )}
    </div>
  )
}
