'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

interface Category {
  id: string
  name: string
  distanceKm: number
  price: number
  quota: number
  availableSlots: number
  isRegistrationOpen: boolean
}

interface DistanceCategoryGroupProps {
  distanceKm: number
  categories: Category[]
}

export function DistanceCategoryGroup({ distanceKm, categories }: DistanceCategoryGroupProps) {
  const [selectedId, setSelectedId] = useState(categories[0]?.id ?? '')
  const router = useRouter()

  const selected = categories.find(c => c.id === selectedId) ?? categories[0]
  const isSoldOut = selected ? selected.availableSlots <= 0 : false
  const isOpen = selected?.isRegistrationOpen ?? false

  const handleDaftar = () => {
    if (selected && !isSoldOut && isOpen) {
      router.push(`/daftar?category_id=${selected.id}`)
    }
  }

  const distanceIcons: Record<number, string> = {
    5: '🏃',
    10: '🏅',
    21: '🥇',
    42: '🏆',
  }

  const distanceColors: Record<number, string> = {
    5: 'from-orange-500 to-primary',
    10: 'from-secondary to-blue-600',
    21: 'from-purple-600 to-indigo-600',
    42: 'from-yellow-500 to-orange-600',
  }

  const gradientClass = distanceColors[distanceKm] ?? 'from-primary to-secondary'
  const icon = distanceIcons[distanceKm] ?? '🏃'

  const totalQuota = categories.reduce((sum, c) => sum + c.quota, 0)
  const totalAvailable = categories.reduce((sum, c) => sum + c.availableSlots, 0)

  return (
    <div className="bg-white border border-[#F3F4F6] rounded-card shadow-default hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">
      {/* Distance Header */}
      <div className={`bg-gradient-to-r ${gradientClass} px-6 pt-6 pb-5 text-white`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-4xl">{icon}</span>
          <span className="text-5xl font-black opacity-20">{distanceKm}K</span>
        </div>
        <h3 className="text-2xl font-black tracking-tight">{distanceKm}K Fun Run</h3>
        <p className="text-white/70 text-xs mt-0.5">
          Kuota tersisa: <span className="font-bold text-white">{totalAvailable}</span> / {totalQuota} slot
        </p>
      </div>

      {/* Category Selector */}
      <div className="px-5 pt-5 flex-1">
        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
          Pilih Kategori {distanceKm}K
        </label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full px-3 h-11 rounded-lg border border-gray-200 text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer font-semibold"
        >
          <option value="" disabled>-- Pilih Kategori {distanceKm}K --</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name} – {formatCurrency(cat.price)}
            </option>
          ))}
        </select>

        {selected && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-surface rounded-lg p-3 text-center">
              <p className="text-xs text-text-secondary mb-0.5">Biaya</p>
              <p className="text-base font-extrabold text-primary">{formatCurrency(selected.price)}</p>
            </div>
            <div className="bg-surface rounded-lg p-3 text-center">
              <p className="text-xs text-text-secondary mb-0.5">Sisa Slot</p>
              <p className={`text-base font-extrabold ${isSoldOut ? 'text-danger' : 'text-success'}`}>
                {isSoldOut ? 'Habis' : `${selected.availableSlots} Slot`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="px-5 pb-5 pt-4">
        {isSoldOut ? (
          <button disabled className="w-full h-11 bg-gray-100 text-gray-400 font-bold rounded-lg text-sm cursor-not-allowed">
            Kuota Habis
          </button>
        ) : !isOpen ? (
          <button disabled className="w-full h-11 bg-gray-100 text-gray-400 font-bold rounded-lg text-sm cursor-not-allowed">
            Pendaftaran Ditutup
          </button>
        ) : (
          <button
            onClick={handleDaftar}
            className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg text-sm transition-all cursor-pointer active:scale-95"
          >
            Daftar Sekarang →
          </button>
        )}
      </div>
    </div>
  )
}
