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

  const distanceIcons: Record<number, React.ReactNode> = {
    5: (
      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="14" cy="3.5" r="2" />
        <path d="M18.6 9.8c-.3-.2-.7-.1-.9.2l-2.2 3.1-3-3.7c-.3-.4-.8-.6-1.3-.6H7.5C6.7 8.8 6 9.5 6 10.3s.7 1.5 1.5 1.5h2.9l1.8 2.2-3.6 4.3c-.3.3-.3.8 0 1.1.2.2.4.3.6.3.2 0 .4-.1.5-.2l4.2-5 3.3 4.1c.2.2.4.3.7.3.2 0 .4-.1.5-.2.4-.3.4-.9.1-1.3l-3.2-3.9 1.9-2.7 1.9 1c.1 0 .2.1.3.1.3 0 .6-.1.8-.4.3-.4.2-1-.2-1.3z" />
      </svg>
    ),
    10: (
      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
  }

  const distanceColors: Record<number, string> = {
    5: 'from-secondary to-primary',
    10: 'from-secondary to-blue-600',
    21: 'from-purple-600 to-indigo-600',
    42: 'from-yellow-500 to-orange-600',
  }

  const gradientClass = distanceColors[distanceKm] ?? 'from-primary to-secondary'
  const icon = distanceIcons[distanceKm] ?? (
    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="14" cy="3.5" r="2" />
      <path d="M18.6 9.8c-.3-.2-.7-.1-.9.2l-2.2 3.1-3-3.7c-.3-.4-.8-.6-1.3-.6H7.5C6.7 8.8 6 9.5 6 10.3s.7 1.5 1.5 1.5h2.9l1.8 2.2-3.6 4.3c-.3.3-.3.8 0 1.1.2.2.4.3.6.3.2 0 .4-.1.5-.2l4.2-5 3.3 4.1c.2.2.4.3.7.3.2 0 .4-.1.5-.2.4-.3.4-.9.1-1.3l-3.2-3.9 1.9-2.7 1.9 1c.1 0 .2.1.3.1.3 0 .6-.1.8-.4.3-.4.2-1-.2-1.3z" />
    </svg>
  )

  const totalQuota = categories.reduce((sum, c) => sum + c.quota, 0)
  const totalAvailable = categories.reduce((sum, c) => sum + c.availableSlots, 0)

  return (
    <div className="bg-white border border-[#F3F4F6] rounded-card shadow-default hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">
      {/* Distance Header */}
      <div className={`bg-gradient-to-r ${gradientClass} px-6 pt-6 pb-5 text-white`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-4xl flex items-center justify-center">{icon}</span>
          <span className="text-5xl font-black opacity-20">{distanceKm}K</span>
        </div>
        <h3 className="text-2xl font-black tracking-tight">
          {distanceKm}K {distanceKm === 10 ? 'Competitive Run' : 'Fun Run'}
        </h3>
        <p className="text-lg font-bold mt-1 text-white">{formatCurrency(categories[0]?.price ?? 0)}</p>
        <p className="text-white/80 text-xs mt-1">
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
