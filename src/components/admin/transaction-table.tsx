'use client'

import React, { useState, useEffect } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Search, Download, Settings, X, Check, Edit2 } from 'lucide-react'

interface Transaction {
  id: string
  order_id: string
  amount: number
  payment_type: string
  transaction_status: string
  created_at: string
  registration_number: string
  full_name: string
  category_name: string
}

interface Category {
  id: string
  name: string
  quota: number
  reserved_count: number
}

export function TransactionTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [search, setSearch] = useState('')

  // State for Quota Management Modal
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingQuotaValue, setEditingQuotaValue] = useState<number>(0)
  const [quotaErrorMsg, setQuotaErrorMsg] = useState('')
  const [quotaSuccessMsg, setQuotaSuccessMsg] = useState('')
  const [isUpdatingQuota, setIsUpdatingQuota] = useState(false)

  useEffect(() => {
    fetchTransactions()
    fetchCategories()
  }, [])

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredTransactions(transactions)
    } else {
      const q = search.toLowerCase()
      const filtered = transactions.filter((tx) =>
        tx.order_id.toLowerCase().includes(q) ||
        tx.full_name.toLowerCase().includes(q) ||
        tx.registration_number.toLowerCase().includes(q) ||
        tx.payment_type.toLowerCase().includes(q) ||
        tx.category_name.toLowerCase().includes(q) ||
        tx.transaction_status.toLowerCase().includes(q)
      )
      setFilteredTransactions(filtered)
    }
  }, [search, transactions])

  const fetchTransactions = async () => {
    setIsLoading(true)
    setErrorMsg('')
    try {
      const response = await fetch('/api/v1/admin/transactions')
      const resJson = await response.json()
      if (!response.ok) {
        throw new Error(resJson.message || 'Gagal memuat transaksi.')
      }
      setTransactions(resJson.data)
      setFilteredTransactions(resJson.data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data.'
      setErrorMsg(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/v1/events')
      const resJson = await response.json()
      if (response.ok && resJson.status === 'success' && resJson.data?.length > 0) {
        setCategories(resJson.data[0].categories || [])
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }


  const handleExportCSV = () => {
    window.location.href = '/api/v1/admin/registrations/export'
  }

  const startEditQuota = (cat: Category) => {
    setEditingCategoryId(cat.id)
    setEditingQuotaValue(cat.quota)
    setQuotaErrorMsg('')
    setQuotaSuccessMsg('')
  }

  const cancelEditQuota = () => {
    setEditingCategoryId(null)
    setQuotaErrorMsg('')
  }

  const saveQuota = async (cat: Category) => {
    if (editingQuotaValue < cat.reserved_count) {
      setQuotaErrorMsg(`Kuota tidak boleh lebih kecil dari slot yang dipesan (${cat.reserved_count}).`)
      return
    }

    setIsUpdatingQuota(true)
    setQuotaErrorMsg('')
    setQuotaSuccessMsg('')

    try {
      const response = await fetch(`/api/v1/admin/categories/${cat.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quota: editingQuotaValue }),
      })

      const resJson = await response.json()

      if (!response.ok) {
        throw new Error(resJson.message || 'Kuota gagal diperbarui.')
      }

      setQuotaSuccessMsg('Kuota berhasil diperbarui.')
      setEditingCategoryId(null)
      // Refresh categories list
      fetchCategories()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui kuota.'
      setQuotaErrorMsg(msg)
    } finally {
      setIsUpdatingQuota(false)
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'settlement':
      case 'capture':
        return 'bg-[#065F46]/5 text-[#065F46] border border-[#047857]/20'
      case 'pending':
        return 'bg-[#92400E]/5 text-[#92400E] border border-[#B45309]/20'
      case 'expire':
        return 'bg-gray-50 text-gray-600 border border-gray-200'
      case 'deny':
      case 'cancel':
        return 'bg-[#991B1B]/5 text-[#991B1B] border border-[#B91C1C]/20'
      default:
        return 'bg-gray-50 text-gray-600'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'settlement':
      case 'capture':
        return 'Sukses'
      case 'pending':
        return 'Menunggu'
      case 'expire':
        return 'Kedaluwarsa'
      case 'deny':
      case 'cancel':
        return 'Batal'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-default">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari transaksi..."
            className="w-full pl-10 pr-4 h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/30 focus:border-[#FF4D00] text-text-primary placeholder-gray-400 text-sm transition-all"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsQuotaModalOpen(true)}
            className="flex items-center gap-2 px-5 h-11 border border-gray-300 hover:bg-gray-50 text-text-primary font-bold rounded-lg transition-all text-xs cursor-pointer bg-white"
          >
            <Settings className="w-4 h-4 text-text-secondary" />
            Kelola Kuota
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 h-11 bg-primary text-white hover:bg-[#E64500] font-bold rounded-lg transition-all text-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Ekspor CSV
          </button>
        </div>
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
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-16 text-text-secondary text-sm">
            Belum ada data transaksi.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-surface border-b border-gray-100 text-text-secondary font-semibold">
                  <th className="p-4 pl-6">Order ID</th>
                  <th className="p-4">No. Registrasi</th>
                  <th className="p-4">Nama Peserta</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Nominal</th>
                  <th className="p-4">Metode</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right pr-6">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="text-text-primary hover:bg-surface transition-all">
                    <td className="p-4 pl-6 font-mono font-bold text-xs text-secondary">{tx.order_id}</td>
                    <td className="p-4 font-bold text-sm text-text-secondary">{tx.registration_number}</td>
                    <td className="p-4 font-semibold">{tx.full_name}</td>
                    <td className="p-4 text-xs text-text-secondary font-medium">{tx.category_name}</td>
                    <td className="p-4 font-semibold text-secondary">{formatCurrency(tx.amount)}</td>
                    <td className="p-4 text-xs text-text-secondary font-medium uppercase">{tx.payment_type}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(tx.transaction_status)}`}>
                        {getStatusLabel(tx.transaction_status)}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6 text-xs text-text-secondary font-medium">{formatDate(tx.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quota Management Overlay Modal */}
      {isQuotaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/60 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-elevated border border-gray-100 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-base font-extrabold text-secondary tracking-tight">
                EDIT KUOTA KATEGORI
              </h3>
              <button
                onClick={() => {
                  setIsQuotaModalOpen(false)
                  setEditingCategoryId(null)
                  setQuotaErrorMsg('')
                  setQuotaSuccessMsg('')
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-grow text-sm">
              {quotaSuccessMsg && (
                <div className="p-3 bg-[#10B981]/10 border border-[#10B981] text-[#10B981] rounded-lg text-xs font-semibold">
                  {quotaSuccessMsg}
                </div>
              )}
              {quotaErrorMsg && (
                <div className="p-3 bg-danger/10 border border-danger text-danger rounded-lg text-xs font-semibold">
                  {quotaErrorMsg}
                </div>
              )}

              <div className="space-y-4">
                {categories.map((cat) => {
                  const isEditing = editingCategoryId === cat.id
                  const isFull = cat.reserved_count >= cat.quota
                  return (
                    <div key={cat.id} className="p-4 bg-surface border border-gray-100 rounded-xl flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="font-bold text-secondary text-sm">{cat.name}</span>
                        <div className="text-xs text-text-secondary">
                          Kuota dipesan: <span className={`font-semibold ${isFull ? 'text-danger' : 'text-secondary'}`}>{cat.reserved_count} slot</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={editingQuotaValue}
                              onChange={(e) => setEditingQuotaValue(Math.max(0, parseInt(e.target.value, 10) || 0))}
                              className="w-20 px-2 h-9 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/30 focus:border-[#FF4D00] text-center font-bold text-sm text-secondary"
                              min={cat.reserved_count}
                            />
                            <button
                              onClick={() => saveQuota(cat)}
                              disabled={isUpdatingQuota}
                              className="p-2 bg-[#10B981] text-white hover:bg-opacity-95 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                              title="Simpan Kuota"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEditQuota}
                              className="p-2 border border-gray-300 bg-white text-text-secondary hover:bg-gray-50 rounded-lg transition-all cursor-pointer"
                              title="Batal"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-extrabold text-secondary bg-white border border-gray-200 px-3 py-1 rounded-lg">
                              {cat.quota}
                            </span>
                            <button
                              onClick={() => startEditQuota(cat)}
                              className="p-2 border border-gray-200 bg-white text-text-secondary hover:text-primary hover:border-primary/30 rounded-lg transition-all cursor-pointer"
                              title="Edit Kuota"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => {
                  setIsQuotaModalOpen(false)
                  setEditingCategoryId(null)
                  setQuotaErrorMsg('')
                  setQuotaSuccessMsg('')
                }}
                className="px-6 h-10 bg-secondary text-white font-bold rounded-lg hover:bg-opacity-95 transition-all text-xs cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
