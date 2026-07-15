import { getActiveEvents } from '@/services/event.service'
import { RegistrationForm } from '@/components/forms/registration-form'
import Link from 'next/link'
import Script from 'next/script'
import { env } from '@/lib/env'

export const revalidate = 0 // Disable cache for real-time slots check

interface PageProps {
  searchParams: Promise<{ category_id?: string }>
}

export default async function RegisterPage(props: PageProps) {
  const searchParams = await props.searchParams
  const defaultCategoryId = searchParams.category_id

  interface SimpleCategory {
    id: string
    name: string
    price: number
    quota: number
    reserved_count: number
    is_active: boolean
  }

  interface SimpleEvent {
    id: string
    name: string
    description: string | null
    event_date: string
    location: string
    registration_open_at: string
    registration_close_at: string
    is_active: boolean
    event_categories?: SimpleCategory[]
  }

  let events: SimpleEvent[] = []
  let errorMsg = ''

  try {
    events = await getActiveEvents() as SimpleEvent[]
  } catch (error) {
    console.error('Failed to load active events:', error)
    errorMsg = 'Gagal memuat kategori event. Silakan refresh halaman.'
  }

  const activeEvent = events[0]
  const categories = activeEvent
    ? (activeEvent.event_categories || []).map((cat: SimpleCategory) => ({
        id: cat.id,
        name: cat.name,
        price: cat.price,
        availableSlots: Math.max(0, cat.quota - cat.reserved_count),
      }))
    : []

  const clientKey = env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
  const isSandbox = clientKey.startsWith('SB-')
  const snapScriptUrl = isSandbox
    ? 'https://app.sandbox.midtrans.com/snap/snap.js'
    : 'https://app.midtrans.com/snap/snap.js'

  // Navbar
  const Navbar = (
    <nav className="sticky top-0 z-50 h-16 bg-secondary text-white flex items-center justify-between px-6 md:px-12 shadow-default">
      <Link href="/" className="text-xl font-extrabold tracking-tight hover:text-primary transition-colors">
        FUN<span className="text-primary">RUN</span>
      </Link>
      <Link href="/status" className="text-[14px] text-gray-300 hover:text-white font-medium transition-colors">
        Cek Status
      </Link>
    </nav>
  )

  // Footer
  const Footer = (
    <footer className="bg-secondary text-[#9CA3AF] py-6 text-center text-[14px]">
      <div className="max-w-1280px mx-auto px-6">
        <p>© 2026 Fun Run · Stadion Si Jalak Harupat · Soreang, Kab. Bandung</p>
      </div>
    </footer>
  )

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Script
        src={snapScriptUrl}
        data-client-key={clientKey}
        strategy="afterInteractive"
      />
      {Navbar}
      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline text-[14px] font-semibold flex items-center gap-1 mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Beranda
          </Link>
          <h2 className="text-3xl font-extrabold text-text-primary tracking-tight mb-2">
            FORM PENDAFTARAN PESERTA
          </h2>
          <p className="text-text-secondary">
            Lengkapi data diri Anda dengan benar untuk mendaftar Fun Run 2026.
          </p>
        </div>

        {errorMsg ? (
          <div className="bg-white rounded-card p-12 shadow-default border border-[#F3F4F6] text-center">
            <svg className="w-16 h-16 text-danger mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-xl font-bold text-text-primary mb-2">{errorMsg}</h3>
          </div>
        ) : !activeEvent ? (
          <div className="bg-white rounded-card p-12 shadow-default border border-[#F3F4F6] text-center">
            <svg className="w-16 h-16 text-text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-text-primary mb-2">Tidak ada event aktif yang tersedia.</h3>
          </div>
        ) : (
          <div className="bg-white rounded-card p-8 shadow-default border border-[#F3F4F6]">
            <RegistrationForm categories={categories} defaultCategoryId={defaultCategoryId} />
          </div>
        )}
      </main>
      {Footer}
    </div>
  )
}
