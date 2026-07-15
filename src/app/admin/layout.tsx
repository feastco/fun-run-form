'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/admin/sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex bg-surface min-h-screen font-sans">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main dashboard content area */}
      <div className="flex-grow flex flex-col min-h-screen overflow-x-hidden">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 md:px-8 justify-between print:hidden">
          <h1 className="text-[14px] font-extrabold text-secondary uppercase tracking-wider">
            Admin Panel
          </h1>
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
