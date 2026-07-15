import { StatusLookupForm } from '@/components/forms/status-lookup-form'
import Link from 'next/link'
import Script from 'next/script'
import { env } from '@/lib/env'

export const revalidate = 0 // Disable cache for status lookups

interface PageProps {
  searchParams: Promise<{ reg?: string }>
}

export default async function StatusPage(props: PageProps) {
  const searchParams = await props.searchParams
  const initialReg = searchParams.reg

  const clientKey = env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
  const isSandbox = clientKey.startsWith('SB-')
  const snapScriptUrl = isSandbox
    ? 'https://app.sandbox.midtrans.com/snap/snap.js'
    : 'https://app.midtrans.com/snap/snap.js'

  // Navbar
  const Navbar = (
    <nav className="sticky top-0 z-50 h-16 bg-secondary text-white flex items-center justify-between px-6 md:px-12 shadow-default print:hidden">
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
    <footer className="bg-secondary text-[#9CA3AF] py-6 text-center text-[14px] print:hidden">
      <div className="max-w-1280px mx-auto px-6">
        <p>© 2026 Fun Run · Stadion Si Jalak Harupat · Soreang, Kab. Bandung</p>
      </div>
    </footer>
  )

  return (
    <div className="flex flex-col min-h-screen bg-surface print:bg-white print:min-h-0">
      <Script
        src={snapScriptUrl}
        data-client-key={clientKey}
        strategy="afterInteractive"
      />
      {Navbar}
      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full print:py-0 print:px-0">
        <div className="mb-8 print:hidden">
          <Link href="/" className="text-primary hover:underline text-[14px] font-semibold flex items-center gap-1 mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Beranda
          </Link>
          <h2 className="text-3xl font-extrabold text-text-primary tracking-tight mb-2 uppercase">
            Cek Status Pendaftaran
          </h2>
          <p className="text-text-secondary font-medium text-sm">
            Cari status pendaftaran Anda berdasarkan email, nomor registrasi, atau nomor HP.
          </p>
        </div>

        <StatusLookupForm initialReg={initialReg} />
      </main>
      {Footer}
    </div>
  )
}
