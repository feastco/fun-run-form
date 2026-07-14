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

---

## ERROR PAGES

### 404
Standalone (no navbar). Icon Search 64px #D1D5DB. "404" 96px #E5E7EB. "Halaman tidak ditemukan". Sub: "Halaman yang kamu cari tidak ada atau sudah dipindahkan." Button: "Kembali ke Beranda" → /

### 500
Standalone. Icon AlertTriangle 64px #E63946. "500" 96px #E5E7EB. "Terjadi kesalahan". Sub: "Maaf, terjadi kesalahan pada server." Button: "Kembali ke Beranda" → /

### Maintenance
Standalone. Icon Wrench 64px #F59E0B. "Sedang dalam perbaikan". Sub: "Silakan kembali dalam beberapa menit." No button.
