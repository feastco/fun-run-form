import { getActiveEvents } from '@/services/event.service'
import { HeroSection } from '@/components/landing/hero-section'
import { DistanceCategoryGroup } from '@/components/landing/distance-category-group'
import Link from 'next/link'

export const revalidate = 0 // Disable cache for real-time quota count

export default async function LandingPage() {
  interface SimpleCategory {
    id: string
    name: string
    distance_km: number
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
    events = await getActiveEvents() as unknown as SimpleEvent[]
  } catch (error) {
    console.error('Failed to fetch events:', error)
    errorMsg = 'Gagal memuat event lari. Silakan refresh halaman.'
  }

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

  if (errorMsg) {
    return (
      <div className="flex flex-col min-h-screen">
        {Navbar}
        <main className="flex-grow max-w-1280px mx-auto px-6 py-12 w-full flex items-center justify-center">
          <div className="text-center">
            <svg className="w-16 h-16 text-danger mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold text-text-primary mb-2">{errorMsg}</h2>
            <p className="text-text-secondary">Mohon pastikan koneksi internet Anda atau coba lagi nanti.</p>
          </div>
        </main>
        {Footer}
      </div>
    )
  }

  const activeEvent = events[0]

  // Group categories by distance_km
  const categoryGroups: Record<number, {
    id: string; name: string; distanceKm: number; price: number;
    quota: number; availableSlots: number; isRegistrationOpen: boolean
  }[]> = {}

  if (activeEvent?.event_categories) {
    const now = new Date()
    const openAt = new Date(activeEvent.registration_open_at)
    const closeAt = new Date(activeEvent.registration_close_at)
    const isRegistrationOpen = now >= openAt && now <= closeAt && activeEvent.is_active

    for (const cat of activeEvent.event_categories) {
      const km = Number(cat.distance_km)
      if (!categoryGroups[km]) categoryGroups[km] = []
      categoryGroups[km].push({
        id: cat.id,
        name: cat.name,
        distanceKm: km,
        price: cat.price,
        quota: cat.quota,
        availableSlots: Math.max(0, cat.quota - cat.reserved_count),
        isRegistrationOpen,
      })
    }
  }

  const sortedDistances = Object.keys(categoryGroups)
    .map(Number)
    .sort((a, b) => a - b)

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {Navbar}
      <main className="flex-grow max-w-1280px mx-auto px-6 py-12 w-full">
        {activeEvent ? (
          <>
            <HeroSection
              eventName={activeEvent.name}
              description={activeEvent.description}
              eventDate={activeEvent.event_date}
              location={activeEvent.location}
            />

            {/* Status CTA Banner */}
            <div className="mb-10 bg-secondary/5 border border-secondary/10 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-text-primary text-[15px]">Sudah Mendaftar?</p>
                  <p className="text-xs text-text-secondary">Cek status pendaftaran, download e-ticket, atau lanjutkan pembayaran Anda.</p>
                </div>
              </div>
              <Link
                href="/status"
                className="flex-shrink-0 inline-flex items-center gap-2 px-6 h-11 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-all text-sm active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Cek Status Pendaftaran
              </Link>
            </div>

            {/* Category Groups */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-text-primary tracking-tight mb-1">
                  Pilih Kategori Lari
                </h2>
                <p className="text-text-secondary text-sm">
                  Pilih jarak dan kategori yang sesuai kemampuan Anda. Atau{' '}
                  <Link href="/daftar" className="text-primary font-semibold hover:underline">
                    daftar langsung
                  </Link>{' '}
                  dan pilih kategori di formulir.
                </p>
              </div>
              <Link
                href="/daftar"
                className="flex-shrink-0 inline-flex items-center gap-2 px-5 h-10 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-all text-sm"
              >
                Lihat Semua Kategori →
              </Link>
            </div>

            {sortedDistances.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedDistances.map(km => (
                  <DistanceCategoryGroup
                    key={km}
                    distanceKm={km}
                    categories={categoryGroups[km]}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center bg-white rounded-card p-12 shadow-default border border-[#F3F4F6]">
                <p className="text-text-secondary">Tidak ada kategori lari untuk event ini.</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center bg-white rounded-card p-12 shadow-default border border-[#F3F4F6] max-w-xl mx-auto my-12">
            <svg className="w-16 h-16 text-text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Belum ada event yang aktif saat ini.</h2>
            <p className="text-text-secondary">Silakan kembali dalam beberapa waktu mendatang.</p>
          </div>
        )}
      </main>
      {Footer}
    </div>
  )
}
