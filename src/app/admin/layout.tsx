'use client'

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/admin/sidebar'
import { Menu } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex bg-surface min-h-screen font-sans">
      {/* Sidebar navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main dashboard content area */}
      <div className="flex-grow flex flex-col min-h-screen overflow-x-hidden">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 md:px-8 justify-between print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 md:hidden cursor-pointer"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-[14px] font-extrabold text-secondary uppercase tracking-wider">
              Admin Panel
            </h1>
          </div>
          <div className="text-xs text-text-secondary font-medium">
            Role: <span className="font-bold text-primary">Administrator</span>
          </div>
        </header>

        <main className="flex-grow p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
