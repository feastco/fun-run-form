# B4 — TECH LIBRARIES

> Library dengan versi spesifik. Junior tidak perlu cari sendiri.

## API VERSIONING

**Keputusan:** `/api/v1/` untuk semua endpoint  
**Alasan:** Standar industri. Jika ada breaking change di masa depan, buat `/api/v2/` tanpa ganggu client existing.

---

## TABEL LIBRARY

### SHARED

| KATEGORI | LIBRARY | VERSI | KENAPA | DIPAKAI DI |
|----------|---------|-------|--------|------------|
| Language | typescript | ^5.7 | Type safety, autocomplete, catch error saat compile | Seluruh project |
| Validation | zod | ^3.24 | Schema validation client+server, type inference otomatis | Form validation, API request validation |

### WEB FRONTEND

| KATEGORI | LIBRARY | VERSI | KENAPA | DIPAKAI DI |
|----------|---------|-------|--------|------------|
| Framework | next | ^15.1 | App Router, RSC, API routes, ISR | Core framework |
| UI | react | ^19.0 | Component library, hooks | Semua komponen |
| UI | react-dom | ^19.0 | DOM rendering | Entry point |
| Styling | tailwindcss | ^4.0 | Utility-first CSS, rapid prototyping | Semua styling |
| PostCSS | @tailwindcss/postcss | ^4.0 | PostCSS plugin untuk Tailwind v4 | Build pipeline |
| Icons | lucide-react | ^0.469 | Icon library modern, tree-shakeable | Navbar, buttons, status badges |
| Form | react-hook-form | ^7.54 | Performant form handling, uncontrolled components | Registration form, login form |
| Form Bridge | @hookform/resolvers | ^3.9 | Integrasi Zod dengan React Hook Form | Form validation |
| QR Code | qrcode.react | ^4.2 | Generate QR code sebagai React component | E-ticket |
| Payment UI | Midtrans Snap.js | CDN script | Popup pembayaran Midtrans (loaded via script tag) | Halaman pembayaran |

### WEB BACKEND (Server-side)

| KATEGORI | LIBRARY | VERSI | KENAPA | DIPAKAI DI |
|----------|---------|-------|--------|------------|
| Database | @supabase/supabase-js | ^2.49 | Client Supabase (query, auth, realtime) | Semua API routes |
| SSR Auth | @supabase/ssr | ^0.6 | Cookie-based auth untuk server components | Admin auth middleware |
| Payment | midtrans-client | ^1.3 | Official Midtrans Node.js SDK — create transaction, verify signature | API-002 (snap token), API-004 (webhook) |

### DEV & TESTING

| KATEGORI | LIBRARY | VERSI | KENAPA | DIPAKAI DI |
|----------|---------|-------|--------|------------|
| Linting | eslint | ^9.0 | Code quality, catch common errors | Per commit |
| Lint Config | eslint-config-next | ^15.1 | ESLint rules spesifik Next.js | ESLint config |
| Formatting | prettier | ^3.4 | Consistent code formatting | Per commit |
| Monitoring | @sentry/nextjs | ^8.50 | Error tracking, performance monitoring | Production |
| Types | supabase | ^2.0 (CLI) | Generate TypeScript types dari DB schema | Dev time |

---

## DEPRECATION CHECK

| LIBRARY | STATUS | CATATAN |
|---------|--------|---------|
| next ^15.1 | ✅ Aktif | App Router stable, active development |
| react ^19.0 | ✅ Aktif | Current stable release |
| tailwindcss ^4.0 | ✅ Aktif | CSS-first config, @theme directive |
| @supabase/supabase-js ^2.49 | ✅ Aktif | v2 stable, v3 belum ada |
| @supabase/ssr ^0.6 | ✅ Aktif | Replacement untuk @supabase/auth-helpers |
| midtrans-client ^1.3 | ⚠️ Monitor | Official library, update jarang tapi masih di-maintain. Alternatif: REST API langsung. |
| react-hook-form ^7.54 | ✅ Aktif | Most popular React form library |
| qrcode.react ^4.2 | ✅ Aktif | Stable, React 19 compatible |
| lucide-react ^0.469 | ✅ Aktif | Active development, weekly releases |

---

## ENV VARS

| NAMA VAR | TIPE | WAJIB | CONTOH | VALIDASI STARTUP |
|----------|------|-------|--------|------------------|
| NEXT_PUBLIC_SUPABASE_URL | string | ya | `https://abcdefgh.supabase.co` | URL format, throw jika kosong |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | string | ya | `eyJhbGciOiJIUzI1NiIs...` | Non-empty string |
| SUPABASE_SERVICE_ROLE_KEY | string | ya | `eyJhbGciOiJIUzI1NiIs...` | Non-empty, server only |
| MIDTRANS_SERVER_KEY | string | ya | `SB-Mid-server-xxxx` | Non-empty, server only |
| NEXT_PUBLIC_MIDTRANS_CLIENT_KEY | string | ya | `SB-Mid-client-xxxx` | Non-empty |
| MIDTRANS_IS_PRODUCTION | string | ya | `false` | Must be "true" or "false" |
| NEXT_PUBLIC_BASE_URL | string | ya | `https://bedasrun.id` | URL format |
| SENTRY_DSN | string | ya | `https://xxx@o123.ingest.sentry.io/456` | URL format |
| SENTRY_AUTH_TOKEN | string | ya | `sntrys_xxxxxxxxxxxx` | Non-empty, build only |

**Aturan env vars:**
- Wajib = `throw new Error("Missing required env var: NAMA_VAR")` saat startup
- Validasi dijalankan di `src/lib/env.ts`, di-import di root layout
- Jangan hardcode nilai di kode
- `.env.example` berisi semua key tanpa value:
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  MIDTRANS_SERVER_KEY=
  NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
  MIDTRANS_IS_PRODUCTION=false
  NEXT_PUBLIC_BASE_URL=http://localhost:3000
  SENTRY_DSN=
  SENTRY_AUTH_TOKEN=
  ```

**SECURITY VALUES:** Sesuai SECURITY_DEFAULTS.md
- bcrypt: 12 rounds (Supabase Auth default)
- Login error: selalu generic
- CORS: eksplisit (Vercel auto-handles, tambahkan header di API routes jika perlu)
- JWT: 15 menit access / 7 hari refresh (Supabase Auth config)

---

## AI CODING TOOLS — Library Rawan Error

| LIBRARY | VERSI RAWAN | ERROR UMUM | CARA CEGAH |
|---------|-------------|------------|------------|
| Next.js 15 | App Router vs Pages Router | Import `useRouter` dari `next/navigation` bukan `next/router`. `cookies()` dan `headers()` adalah async di Next 15 — HARUS `await`. | Tulis "App Router" di setiap prompt. Selalu `await cookies()`. |
| Tailwind v4 | v3 config vs v4 CSS | v4 pakai `@theme` di CSS, bukan `tailwind.config.js`. `@apply` masih ada tapi deprecated. | Gunakan `@theme` block di `globals.css` untuk custom tokens. Cek v4 docs. |
| Supabase SSR | auth-helpers vs @supabase/ssr | `@supabase/auth-helpers-nextjs` sudah deprecated. Gunakan `@supabase/ssr`. `createServerClient` butuh `cookies()` handler. | Import dari `@supabase/ssr`, bukan auth-helpers. |
| midtrans-client | CommonJS | Library ini CommonJS. Di Next.js API route (server-side), ini OK. Jangan import di client component. | Hanya import di file `src/lib/midtrans/client.ts` dan API routes. |
| React 19 | ref as prop | `forwardRef` sudah tidak diperlukan di React 19. ref bisa langsung jadi prop. | Jangan gunakan `forwardRef` untuk komponen baru. |

---

## FREE TIER CHECKLIST

**Mode: TIDAK AKTIF** (Preset B, biaya ~Rp 75rb–225rb/bulan)

Free tier checklist di-skip karena Preset B bukan free tier.

---

┌────────────────────────────────┐
│ RINGKASAN B4                   │
│ Library  : 20                  │
│ Deprecated: 0 | Monitor: 1    │
│ Env vars : 9                   │
│ AI risk  : 5 (Next15, TW4,    │
│   Supabase SSR, midtrans CJS, │
│   React 19 ref)                │
│ Free tier: tidak aktif         │
└────────────────────────────────┘
