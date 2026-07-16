'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, CreditCard, LogOut, X } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const response = await fetch('/api/v1/auth/logout', {
        method: 'POST',
      })
      if (response.ok) {
        router.push('/admin/login')
        router.refresh()
      } else {
        alert('Gagal melakukan logout.')
      }
    } catch (error) {
      console.error('Logout error:', error)
      alert('Terjadi kesalahan saat logout.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Peserta', path: '/admin/peserta', icon: Users },
    { name: 'Transaksi', path: '/admin/transaksi', icon: CreditCard },
  ]

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar container */}
      <div
        className={`fixed inset-y-0 left-0 md:sticky md:top-0 z-50 w-60 bg-secondary text-white flex flex-col h-screen border-r border-gray-800 print:hidden shrink-0 transition-transform duration-300 md:transform-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="h-16 flex items-center px-6 border-b border-gray-800 justify-between">
          <Link href="/" onClick={onClose} className="text-lg font-extrabold tracking-tight">
            FUN<span className="text-primary">RUN</span> <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded font-mono ml-1">ADMIN</span>
          </Link>
          
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white md:hidden cursor-pointer"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Menu */}
        <nav className="grow py-6 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 border-l-[3px] border-primary text-white pl-[21px]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-[3px] border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-400 hover:bg-danger/10 hover:text-danger rounded-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <LogOut className="w-5 h-5" />
            {isLoggingOut ? 'Keluar...' : 'Keluar'}
          </button>
        </div>
      </div>
    </>
  )
}
