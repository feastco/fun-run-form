import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

interface HeroSectionProps {
  eventName?: string
  description?: string | null
  eventDate?: string
  location?: string
}

export function HeroSection({
  eventName = 'Fun Run 2026',
  description = 'Lari Bersama untuk Indonesia Sehat!',
  eventDate,
  location = 'Stadion Si Jalak Harupat, Soreang, Kab. Bandung',
}: HeroSectionProps) {
  return (
    <div className="bg-secondary text-white rounded-card overflow-hidden shadow-elevated mb-12">
      <div className="px-6 py-16 md:px-12 md:py-20 max-w-4xl mx-auto text-center flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-[800] tracking-tight mb-4">
          <span className="text-primary">{eventName}</span>
        </h1>
        <p className="text-[18px] text-gray-300 max-w-2xl mb-8 leading-relaxed">
          {description || 'Lari Bersama untuk Indonesia Sehat!'}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-[14px] text-gray-400 mb-10">
          {eventDate && (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(eventDate)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{location}</span>
          </div>
        </div>

        <Link href="/daftar" passHref>
          <Button variant="primary" className="px-8 h-[48px] text-[16px] uppercase tracking-wider">
            Daftar Sekarang
          </Button>
        </Link>
      </div>
    </div>
  )
}
