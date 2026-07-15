# DESIGN.md — Sistem Pendaftaran & Pembayaran Event Lari

> Phase 2 Blueprint → Phase 3 Handoff  
> Design Style: Bold Modern | Vibe: "Bold, energetic, and confident"

---

## DESIGN SYSTEM

### Colors

| Token | Hex | Fungsi |
|-------|-----|--------|
| Primary | #FF4D00 | CTA, buttons, active states |
| Secondary | #1A1A2E | Navbar, footer, sidebar, dark surfaces |
| Danger | #E63946 | Errors, destructive actions |
| Success | #10B981 | Payment confirmed, "paid" badge |
| Warning | #F59E0B | Pending states |
| Info | #3B82F6 | Info toast |
| Background | #FFFFFF | Content areas |
| Surface | #F9FAFB | Cards, panels |
| Text Primary | #111827 | Body text |
| Text Secondary | #6B7280 | Captions, placeholders |

Neutral: 50 `#F9FAFB` · 100 `#F3F4F6` · 200 `#E5E7EB` · 300 `#D1D5DB` · 400 `#9CA3AF` · 500 `#6B7280` · 600 `#4B5563` · 700 `#374151` · 800 `#1F2937` · 900 `#111827`

### Typography

Font: **Inter** (fallback: system-ui, -apple-system, sans-serif)  
Base: 16px | H1: 800/36-48px | H2: 700/28-36px | H3: 600/20-24px | Body: 400/16px | Caption: 400/14px

### Spacing & Shape

Radius: 8px (default), 12px (cards), 9999px (badges)  
Shadow: `0 1px 3px rgba(0,0,0,0.1)` | Elevated: `0 4px 6px rgba(0,0,0,0.1)`  
Spacing: kelipatan 4px | Border: `1px solid #E5E7EB`

### Navbar
64px height · bg `#1A1A2E` · white text · sticky · Left: logo · Right: admin menu (admin pages only)

### Sidebar (Admin only)
240px · bg `#1A1A2E` · active: `bg-white/10` + left border `3px #FF4D00`  
Items: Dashboard, Peserta, Transaksi

### Footer
bg `#1A1A2E` · text `#9CA3AF` · "© 2026 Fun Run" · padding 24px

### Buttons
| Variant | Style |
|---------|-------|
| Primary | bg #FF4D00, text white, h-44px, rounded-8px, hover #E64500 |
| Secondary | border #FF4D00, text #FF4D00, hover bg #FF4D00/10 |
| Danger | bg #E63946, text white, hover #D32F3E |
| Disabled | bg #E5E7EB, text #9CA3AF, cursor-not-allowed |

### Inputs
Border `1px #D1D5DB` · radius 8px · h-44px · focus `ring-2 #FF4D00/30 border-#FF4D00`  
Error: `border-#E63946 ring-#E63946/30` · Label: above, 14px medium #374151

### Cards
bg white · shadow default · radius 12px · padding 24px · border `1px #F3F4F6` · hover shadow-elevated

### Toast
Position: bottom-right · 5000ms · z-9999  
Success #10B981 · Error #E63946 · Warning #F59E0B · Info #3B82F6

### Status Badges
| Status | Style |
|--------|-------|
| paid | bg #10B981/10, text #10B981, rounded-full |
| pending_payment | bg #F59E0B/10, text #F59E0B |
| expired | bg #6B7280/10, text #6B7280 |
| cancelled | bg #E63946/10, text #E63946 |

### Loading
Type: **skeleton** (pulse animation, neutral-200 bg, neutral-300 shimmer)

---

## SITEMAP

```
/
├── /                          → Landing (public)
├── /daftar                    → Form pendaftaran (public)
├── /status                    → Status & e-ticket (public)
├── /admin/login               → Login admin (public)
├── /admin                     → Dashboard (admin)
├── /admin/peserta             → List peserta (admin)
├── /admin/transaksi           → Transaksi (admin)
├── not-found.tsx              → 404
├── error.tsx                  → 500
└── /maintenance               → Maintenance
```

---

## PAGE SPECS

### Index (B5c-Lite)

| No | Nama | Route | Role | API-ID |
|----|------|-------|------|--------|
| 1 | Landing | / | public | API-001 |
| 2 | Form Pendaftaran | /daftar | public | API-001, API-002 |
| 3 | Status & E-Ticket | /status | public | API-003 |
| 4 | Admin Login | /admin/login | public | API-005 |
| 5 | Admin Dashboard | /admin | admin | API-012 |
| 6 | Admin Peserta | /admin/peserta | admin | API-007, API-008, API-009 |
| 7 | Admin Transaksi | /admin/transaksi | admin | API-010, API-011 |
| 8 | 404 | not-found.tsx | public | — |
| 9 | 500 | error.tsx | public | — |
| 10 | Maintenance | /maintenance | public | — |

**Form summary:**

| No | Halaman | Fields | Validasi kritis |
|----|---------|--------|-----------------|
| 2 | Form Pendaftaran | nama, email, HP, NIK, gender, TTL, warga negara, alamat, gol darah, riwayat penyakit, jersey, emergency contact | NIK 16 digit, email format, HP 10-15 digit |
| 3 | Status | email / reg_number / phone | Min 1 field |
| 4 | Admin Login | email, password | Rate limit 5x/15min |

**State summary:**

| No | Loading | Empty heading | Success |
|----|---------|--------------|---------|
| 1 | skeleton | — | — |
| 2 | button loading | — | redirect /status?reg={number} |
| 3 | skeleton | "Pendaftaran tidak ditemukan" | inline display |
| 4 | — | — | redirect /admin |
| 5 | skeleton | "Belum ada pendaftaran" | — |
| 6 | skeleton | "Belum ada peserta" | — |
| 7 | skeleton | "Belum ada transaksi" | toast 3000ms |

### Detail per Halaman

`generate B5c-detail Landing Page`

═══════════════════════════════════════════════
PAGE: Landing Page
Route: / | Role: public
Generated on-demand dari B5c-LITE No. 1
═══════════════════════════════════════════════

BAGIAN 1: STITCH PROMPT
Style: Bold, energetic, and confident (Bold Modern).
Navbar: Dark Midnight Navy (#1A1A2E) sticky navbar, white text, height 64px. Left: Logo "Fun Run" (bold, 20px, white). Right: Admin login menu link.
Hero Section:
- Container: bg Midnight Navy (#1A1A2E), text white, padding 64px 24px, rounded-12px.
- Title: "Fun Run 2026" in 800 weight, 48px, primary color (#FF4D00).
- Subtitle: "Lari Bersama untuk Indonesia Sehat! Stadion Si Jalak Harupat, Soreang, Kab. Bandung." in 16px text-secondary.
- CTA: Primary button "Daftar Sekarang" linking to /daftar.
Grid Kategori:
- Container: max-w-1280px mx-auto px-24px py-48px.
- Grid: Responsive 1 col on mobile, 2 col on desktop, gap 24px.
- Category Cards:
  - bg white, border 1px #F3F4F6, radius 12px, shadow, hover transition.
  - Header: Name ("5K Fun Run" / "10K Competitive") and distance badge.
  - Body: Price formatted (Rp 150.000 / Rp 250.000) and remaining quota badge.
  - Footer: "Daftar" button (Primary variant if quota available, Disabled if quota = 0).
Footer: Midnight Navy (#1A1A2E) footer, text #9CA3AF "© 2026 Fun Run · Kontak panitia · Powered by Bedas".

BAGIAN 2: TECHNICAL SPEC
1. Components:
   - `src/app/page.tsx` (RSC: fetches active events and category quotas)
   - `src/components/landing/hero-section.tsx` (Hero layout with background and CTA)
   - `src/components/landing/category-card.tsx` (Category details, pricing, quota, register button)
2. APIs Called:
   - API-001 (GET /api/v1/events) to retrieve events with active categories.
3. States:
   - Loading: Skeleton cards (pulse animation, neutral-200 bg) for categories.
   - Empty: If no events found, display "Belum ada event yang aktif saat ini."
   - Success: Display active events list and categories with correct quota.
   - Error: Display "Gagal memuat event lari. Silakan refresh halaman."
4. UI Specs & Tokens:
   - Primary: #FF4D00, Secondary: #1A1A2E, Background: #FFFFFF, Surface: #F9FAFB.
   - Radius card: 12px, Default radius: 8px.
   - Font: Inter.

VALIDASI B5c-DETAIL:
[x] Mandiri (tidak perlu buka file lain)
[x] 4 states ada dengan teks eksak
[x] Semua API-ID ada di MASTER REFERENCES (API-001)
[x] Navbar + footer dari B5a di-paste penuh
[x] Success state SATU pilihan saja
[x] Data mock realistis

═══════════════════════════════════════════════
END PAGE: Landing Page
═══════════════════════════════════════════════

`generate B5c-detail Form Pendaftaran`

═══════════════════════════════════════════════
PAGE: Form Pendaftaran
Route: /daftar | Role: public
Generated on-demand dari B5c-LITE No. 2
═══════════════════════════════════════════════

BAGIAN 1: STITCH PROMPT
Style: Bold, energetic, and confident (Bold Modern).
Navbar: Dark Midnight Navy (#1A1A2E) sticky navbar, white text, height 64px. Left: Logo "Fun Run" (bold, 20px, white). Right: Admin login menu link.
Footer: Midnight Navy (#1A1A2E) footer, text #9CA3AF "© 2026 Fun Run · Stadion Si Jalak Harupat · Soreang, Kab. Bandung".
Form Layout:
- Container: max-w-1280px mx-auto px-24px py-48px.
- Heading: "FORM PENDAFTARAN PESERTA" in 800 weight, 36px, text-primary (#FF4D00).
- Subtitle: "Lengkapi data diri Anda dengan benar untuk mendaftar Fun Run 2026." in 14px text-secondary.
- Card: bg white, border 1px #F3F4F6, radius 12px, shadow, padding 32px.
- Grid: Responsive 1 col on mobile, 2 col on desktop for shorter fields (Email, HP, NIK, Gender, TTL, Blood Type, Jersey Size, Emergency Contact Phone). 1 col for long fields (Full Name, Address, Medical History, Emergency Contact Name).
- CTA: Primary button "Kirim Pendaftaran & Bayar" (width full, height 44px, hover #E64500). Show loading spinner when submitting.

BAGIAN 2: TECHNICAL SPEC
1. Components:
   - `src/app/daftar/page.tsx` (fetches active events/categories, pre-fills category_id query param)
   - `src/components/forms/registration-form.tsx` (React Hook Form, 15 fields, Zod schema validation)
   - `src/components/ui/input.tsx` (text input primitive)
   - `src/components/ui/select.tsx` (dropdown select primitive)
2. APIs Called:
   - API-001 (GET /api/v1/events) to retrieve active event categories.
   - API-002 (POST /api/v1/registrations) to submit registration.
3. States:
   - Loading: Button showing spinner "Memproses..." upon submission.
   - Success: Redirect to `/status?reg={registration_number}` and launch Midtrans Snap.
   - Error: Display red validation text below inputs, toast error "Pendaftaran gagal dikirim. Silakan cek data Anda." if submit fails.
4. Validations:
   - NIK: Exactly 16 digits, digits only.
   - Email: Valid email format.
   - Phone: 10-15 digits.
   - Birth Date: Must be at least 10 years ago (computed from current date).
   - Address: Min 10 characters.
   - Emergency Contact Phone: 10-15 digits.

VALIDASI B5c-DETAIL:
[x] Mandiri (tidak perlu buka file lain)
[x] 4 states ada dengan teks eksak
[x] Semua API-ID ada di MASTER REFERENCES (API-001, API-002)
[x] Navbar + footer dari B5a di-paste penuh
[x] Success state SATU pilihan saja
[x] Data mock realistis

═══════════════════════════════════════════════
END PAGE: Form Pendaftaran
═══════════════════════════════════════════════

═══════════════════════════════════════════════
PAGE: Status & E-Ticket
Route: /status | Role: public
Generated on-demand dari B5c-LITE No. 3
═══════════════════════════════════════════════

BAGIAN 1: STITCH PROMPT
Style: Bold, energetic, and confident (Bold Modern).
Navbar: Dark Midnight Navy (#1A1A2E) sticky navbar, white text, height 64px. Left: Logo "Fun Run" (bold, 20px, white). Right: Admin login menu link.
Footer: Midnight Navy (#1A1A2E) footer, text #9CA3AF "© 2026 Fun Run · Stadion Si Jalak Harupat · Soreang, Kab. Bandung".
Lookup Card:
- Container: max-w-600px mx-auto px-24px py-48px.
- Heading: "CEK STATUS PENDAFTARAN" in 800 weight, 36px, text-primary (#FF4D00).
- Tabs: "Email", "Nomor Registrasi", "Nomor HP". Tabs active state: bg-primary (#FF4D00), text-white. Inactive state: bg-gray-100, text-gray-700.
- Input Fields:
  - Email tab: input type="email" placeholder="contoh@email.com".
  - Nomor Registrasi tab: input type="text" placeholder="BR2026-0001".
  - Nomor HP tab: input type="text" placeholder="081234567890".
- CTA: Primary button "Cari Pendaftaran" (width full, height 44px, hover #E64500).

Result Section:
- If pending_payment: Show Yellow Warning card. Header: "Menunggu Pembayaran", Details: Nama, Event, Kategori, Nomor Registrasi, Harga. Action: "Bayar Sekarang" button (opens Snap popup).
- If paid: Show Green Success card. Header: "Pendaftaran Aktif", Details: Nama, Event, Kategori, Nomor Registrasi. Render E-Ticket card containing dynamic QR Code (URL: {BASE_URL}/verify/{qr_code_token}) and Print button.
- If expired: Show Gray card. Header: "Pendaftaran Kedaluwarsa", Details: Nama, Event, Kategori, Nomor Registrasi. Description: "Batas waktu pembayaran 24 jam telah habis."
- If cancelled: Show Red Danger card. Header: "Pendaftaran Dibatalkan", Details: Nama, Event, Kategori, Nomor Registrasi.

BAGIAN 2: TECHNICAL SPEC
1. Components:
   - `src/app/status/page.tsx` (Status lookup page client component)
   - `src/components/forms/status-lookup-form.tsx` (Handles form input, active tab state, API fetch)
   - `src/components/ticket/e-ticket.tsx` (E-ticket details + QR code rendering)
2. APIs Called:
   - API-003 (GET /api/v1/registrations/status) to search registrations by query.
3. States:
   - Loading: Pulsing skeleton lookup cards.
   - Empty: If registration not found, show: "Pendaftaran tidak ditemukan. Pastikan data yang dimasukkan benar."
   - Success: Render registration information and (if paid) the ticket component.
   - Error: Toast "Gagal mencari data. Silakan coba lagi."
4. UI Specs & Tokens:
   - Fonts: Inter.
   - Status colors: paid (#10B981), pending_payment (#F59E0B), expired (#6B7280), cancelled (#E63946).

VALIDASI B5c-DETAIL:
[x] Mandiri (tidak perlu buka file lain)
[x] 4 states ada dengan teks eksak
[x] Semua API-ID ada di MASTER REFERENCES (API-003)
[x] Navbar + footer dari B5a di-paste penuh
[x] Success state SATU pilihan saja
[x] Data mock realistis

═══════════════════════════════════════════════
END PAGE: Status & E-Ticket
═══════════════════════════════════════════════

═══════════════════════════════════════════════
PAGE: Admin Login
Route: /admin/login | Role: public
Generated on-demand dari B5c-LITE No. 4
═══════════════════════════════════════════════

BAGIAN 1: STITCH PROMPT
Style: Bold, energetic, and confident (Bold Modern).
Container: min-h-screen bg-[#1A1A2E] flex flex-col justify-center py-12 sm:px-6 lg:px-8.
Login Card:
- Container: max-w-md w-full mx-auto bg-white rounded-2xl border border-gray-100 p-8 shadow-elevated.
- Heading: "LOGIN ADMIN" in 800 weight, 28px, text-secondary (#1A1A2E) text-center.
- Subtitle: "Masukkan kredensial Anda untuk mengakses panel administrasi." in 14px text-text-secondary text-center mb-6.
- Input Fields:
  - Email: input type="email" label="Email Address" placeholder="admin@domain.com".
  - Password: input type="password" label="Password" placeholder="••••••••".
- CTA: Primary button "Login Admin" (width full, height 44px, hover #E64500).

BAGIAN 2: TECHNICAL SPEC
1. Components:
   - `src/app/admin/login/page.tsx` (Login page component with form submit, validation, redirect)
2. APIs Called:
   - API-005 (POST /api/v1/auth/login) to authenticate admin session.
3. States:
   - Loading: Button showing spinner "Authenticating...".
   - Success: Redirect to `/admin`.
   - Error: Display red alert text "Email atau password salah".
4. UI Specs & Tokens:
   - Primary: #FF4D00, Secondary: #1A1A2E.
   - Fonts: Inter.

VALIDASI B5c-DETAIL:
[x] Mandiri (tidak perlu buka file lain)
[x] 4 states ada dengan teks eksak
[x] Semua API-ID ada di MASTER REFERENCES (API-005)
[x] Navbar + footer dari B5a di-paste penuh
[x] Success state SATU pilihan saja
[x] Data mock realistis

═══════════════════════════════════════════════
END PAGE: Admin Login
═══════════════════════════════════════════════

═══════════════════════════════════════════════
PAGE: Admin Dashboard
Route: /admin | Role: admin
Generated on-demand dari B5c-LITE No. 5
═══════════════════════════════════════════════

BAGIAN 1: STITCH PROMPT
Style: Bold, energetic, and confident (Bold Modern).
Stats Cards Grid:
- Container: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8.
- Card 1: bg white, border 1px #F3F4F6, radius 12px, shadow, padding 24px. Title: "Total Pendaftaran" (gray-500, 14px), Value: number (bold, 28px).
- Card 2: bg white. Title: "Pembayaran Lunas", Value: number, badge success ("paid").
- Card 3: bg white. Title: "Menunggu Pembayaran", Value: number, badge warning ("pending").
- Card 4: bg white. Title: "Total Pendapatan", Value: IDR Currency format (bold, 24px, primary color).

Category Quotas Section:
- Heading: "Ketersediaan Kuota Kategori" (bold, 20px, text-secondary).
- Grid: list of categories showing progress bar of reserved slots vs quota limit.

Recent Registrations Section:
- Heading: "Pendaftaran Terbaru" (bold, 20px, text-secondary).
- Table: simple table showing recent registrations. Header: No Registrasi, Nama, Kategori, Status.

BAGIAN 2: TECHNICAL SPEC
1. Components:
   - `src/app/admin/page.tsx` (Server page fetching dashboard stats and rendering view)
   - `src/components/admin/stats-card.tsx` (Summary statistic card component)
2. APIs Called:
   - API-012 (GET /api/v1/admin/dashboard) to fetch stats metadata.
3. States:
   - Loading: pulsing card and list skeletons.
   - Empty: display text "Belum ada pendaftaran" if zero count.
   - Success: render dashboard panels with dynamic counts.
   - Error: toast message showing error details.
4. UI Specs & Tokens:
   - Fonts: Inter.

VALIDASI B5c-DETAIL:
[x] Mandiri (tidak perlu buka file lain)
[x] 4 states ada dengan teks eksak
[x] Semua API-ID ada di MASTER REFERENCES (API-012)
[x] Navbar + footer dari B5a di-paste penuh
[x] Success state SATU pilihan saja
[x] Data mock realistis

═══════════════════════════════════════════════
END PAGE: Admin Dashboard
═══════════════════════════════════════════════

═══════════════════════════════════════════════
PAGE: Admin Peserta
Route: /admin/peserta | Role: admin
Generated on-demand dari B5c-LITE No. 6
═══════════════════════════════════════════════

BAGIAN 1: STITCH PROMPT
Style: Bold, energetic, and confident (Bold Modern).
Search & Filter Panel:
- Search Input: placeholder "Cari nama, email, hp, reg..."
- Category Filter: dropdown select for category.
- Status Filter: dropdown select for status.
Table:
- Container: bg white, radius 12px, border 1px #F3F4F6, shadow, overflow-x-auto.
- Columns: No. Registrasi, Nama, Email, Kategori, Status, Tanggal Daftar, Aksi.
- Aksi: Button "Detail" (Secondary variant).
Pagination:
- Next and Previous buttons, page indicator.
Detail Modal:
- bg overlay dark semi-transparent.
- Modal box: max-w-2xl bg white, radius 12px, padding 24px, scrollable.
- Fields: NIK, Gender, Tempat Tanggal Lahir, Kewarganegaraan, Ukuran Jersey, Alamat, Golongan Darah, Riwayat Kesehatan, Kontak Darurat (Nama & HP).
- Close button.

BAGIAN 2: TECHNICAL SPEC
1. Components:
   - `src/app/admin/peserta/page.tsx` (Parent dashboard client component for list)
   - `src/components/admin/registration-table.tsx` (Table lists registrations with search and pagination)
   - `src/components/admin/registration-detail.tsx` (Detail modal displaying sensitive fields)
2. APIs Called:
   - API-007 (GET /api/v1/admin/registrations) to fetch list of participants.
   - API-008 (GET /api/v1/admin/registrations/[id]) to fetch specific participant detail.
3. States:
   - Loading: Pulsing table skeletons.
   - Empty: display text "Belum ada peserta" if zero results returned.
   - Success: render table containing registration rows.
   - Error: toast message "Gagal memuat peserta".
4. UI Specs & Tokens:
   - Fonts: Inter.

VALIDASI B5c-DETAIL:
[x] Mandiri (tidak perlu buka file lain)
[x] 4 states ada dengan teks eksak
[x] Semua API-ID ada di MASTER REFERENCES (API-007, API-008)
[x] Navbar + footer dari B5a di-paste penuh
[x] Success state SATU pilihan saja
[x] Data mock realistis

═══════════════════════════════════════════════
END PAGE: Admin Peserta
═══════════════════════════════════════════════

═══════════════════════════════════════════════
PAGE: Admin Transaksi
Route: /admin/transaksi | Role: admin
Generated on-demand dari B5c-LITE No. 7
═══════════════════════════════════════════════

BAGIAN 1: STITCH PROMPT
Style: Bold, energetic, and confident (Bold Modern).
Top Action Bar:
- Heading: "TRANSAKSI & KUOTA" (bold, 24px, text-secondary).
- Action Buttons:
  - "Ekspor CSV" button: Primary secondary outline or primary, download file trigger.
  - "Kelola Kuota" button: opens Quota management panel.
Table:
- Container: bg white, radius 12px, border 1px #F3F4F6, shadow, overflow-x-auto.
- Columns: Order ID, Nama Peserta, Nominal, Metode, Status, Tanggal Transaksi.
Modal Edit Kuota:
- bg overlay dark semi-transparent.
- Modal container: max-w-md w-full bg white, radius 12px, p-24px.
- Heading: "EDIT KUOTA KATEGORI" (bold, 18px).
- Dropdown select category.
- Number Input for new quota.
- CTA buttons: "Batal" and "Simpan Kuota".

BAGIAN 2: TECHNICAL SPEC
1. Components:
   - `src/app/admin/transaksi/page.tsx` (Transactions admin page view)
   - `src/components/admin/transaction-table.tsx` (Table lists transactions + export CSV + quota updates)
2. APIs Called:
   - API-010 (GET /api/v1/admin/transactions) to fetch transactions.
   - API-009 (GET /api/v1/admin/registrations/export) to trigger CSV download.
   - API-011 (PATCH /api/v1/admin/categories/[id]) to update quota of a specific category.
3. States:
   - Loading: pulsing skeletons of table list.
   - Empty: display text "Belum ada transaksi" if list is empty.
   - Success: render transactions table with export action. Show toast "Kuota berhasil diperbarui" upon quota patch success.
   - Error: show warning toast "Kuota gagal diperbarui".
4. UI Specs & Tokens:
   - Fonts: Inter.

VALIDASI B5c-DETAIL:
[x] Mandiri (tidak perlu buka file lain)
[x] 4 states ada dengan teks eksak
[x] Semua API-ID ada di MASTER REFERENCES (API-009, API-010, API-011)
[x] Navbar + footer dari B5a di-paste penuh
[x] Success state SATU pilihan saja
[x] Data mock realistis

═══════════════════════════════════════════════
END PAGE: Admin Transaksi
═══════════════════════════════════════════════





---

## ERROR PAGES

### 404
Standalone (no navbar). Icon Search 64px #D1D5DB. "404" 96px #E5E7EB. "Halaman tidak ditemukan". Sub: "Halaman yang kamu cari tidak ada atau sudah dipindahkan." Button: "Kembali ke Beranda" → /

### 500
Standalone. Icon AlertTriangle 64px #E63946. "500" 96px #E5E7EB. "Terjadi kesalahan". Sub: "Maaf, terjadi kesalahan pada server." Button: "Kembali ke Beranda" → /

### Maintenance
Standalone. Icon Wrench 64px #F59E0B. "Sedang dalam perbaikan". Sub: "Silakan kembali dalam beberapa menit." No button.
