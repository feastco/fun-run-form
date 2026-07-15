'use client'

import React from 'react'
import { Wrench } from 'lucide-react'

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col justify-center items-center p-6 font-sans text-center">
      <div className="space-y-4 max-w-md">
        <div className="flex justify-center">
          <Wrench className="w-16 h-16 text-[#F59E0B]" />
        </div>
        <h1 className="text-2xl font-extrabold text-white pt-4">
          Sedang dalam perbaikan
        </h1>
        <p className="text-sm text-text-secondary">
          Silakan kembali dalam beberapa menit.
        </p>
      </div>
    </div>
  )
}
