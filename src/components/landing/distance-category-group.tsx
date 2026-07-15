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
      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 512 512">
        <path d="M272 96c26.5 0 48-21.5 48-48S298.5 0 272 0s-48 21.5-48 48 21.5 48 48 48zm113.7 121.9l-47.8-63.7c-8.3-11.1-21-18.2-34.9-18.2H203c-23.4 0-42.5 19.1-42.5 42.5v119.8c0 14 11.4 25.5 25.5 25.5s25.5-11.4 25.5-25.5v-83.3l21-8.4v132.3l-55.6 111.2c-5.7 11.3-1.1 25.1 10.2 30.8 11.3 5.7 25.1 1.1 30.8-10.2l56-112c3.4-6.8 4-14.7 1.7-22L256 256v-65.4l24 32v113.2c0 10 5.8 19 14.8 23.2l128 60c13 6.1 28.3.3 34.4-12.7s.3-28.3-12.7-34.4L320 312v-84.8l47.8 63.7c12 16 35.1 19.2 51.1 7.2s19.2-35.1 7.2-51.1z" />
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
    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 512 512">
      <path d="M272 96c26.5 0 48-21.5 48-48S298.5 0 272 0s-48 21.5-48 48 21.5 48 48 48zm113.7 121.9l-47.8-63.7c-8.3-11.1-21-18.2-34.9-18.2H203c-23.4 0-42.5 19.1-42.5 42.5v119.8c0 14 11.4 25.5 25.5 25.5s25.5-11.4 25.5-25.5v-83.3l21-8.4v132.3l-55.6 111.2c-5.7 11.3-1.1 25.1 10.2 30.8 11.3 5.7 25.1 1.1 30.8-10.2l56-112c3.4-6.8 4-14.7 1.7-22L256 256v-65.4l24 32v113.2c0 10 5.8 19 14.8 23.2l128 60c13 6.1 28.3.3 34.4-12.7s.3-28.3-12.7-34.4L320 312v-84.8l47.8 63.7c12 16 35.1 19.2 51.1 7.2s19.2-35.1 7.2-51.1z" />
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
