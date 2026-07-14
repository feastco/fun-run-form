# B5a — DESIGN SYSTEM

> Finalisasi design system berdasarkan UI Direction dari T6.

## SOURCE: T6 EXT

- Design Style: **Bold Modern**
- Mood: Berani + Modern
- Loading: skeleton
- Palette konfirmasi: Primary #FF4D00 | Secondary #1A1A2E | Danger #E63946

---

## DESIGN TOKENS

**DESIGN STYLE:** Bold Modern  
**VIBE STATEMENT:** "Bold, energetic, and confident"

### COLORS

| Token | Hex | Nama | Dipakai untuk |
|-------|-----|------|---------------|
| Primary | `#FF4D00` | Blaze Orange | CTA, primary buttons, active states, links |
| Secondary | `#1A1A2E` | Midnight Navy | Navbar, footer, dark surfaces, admin sidebar |
| Danger | `#E63946` | Crimson | Error toast, destructive button, form error |
| Success | `#10B981` | Emerald | Payment confirmed, success toast, "paid" badge |
| Warning | `#F59E0B` | Amber | Pending badge, expiring warnings |
| Info | `#3B82F6` | Blue | Info toast, help text |

**Neutral Scale:**

| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
|----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| #F9FAFB | #F3F4F6 | #E5E7EB | #D1D5DB | #9CA3AF | #6B7280 | #4B5563 | #374151 | #1F2937 | #111827 |

| Token | Hex | Deskripsi |
|-------|-----|-----------|
| Background | `#FFFFFF` | Clean white — form areas, content |
| Surface | `#F9FAFB` | Light gray — cards, panels, table rows alternate |
| Text Primary | `#111827` | Near-black — headings, body text |
| Text Secondary | `#6B7280` | Medium gray — captions, placeholders, helper text |

**Mood color description (Stitch-ready):**  
"Blaze Orange as primary accent for CTAs and energy, Midnight Navy for headers and grounding surfaces, clean white backgrounds with subtle gray cards for form readability."

### TYPOGRAPHY

| Token | Value |
|-------|-------|
| Font utama | `Inter`, fallback: `system-ui, -apple-system, sans-serif` |
| Base size | 16px minimum |
| H1 | 800 weight, 36px mobile / 48px desktop |
| H2 | 700 weight, 28px mobile / 36px desktop |
| H3 | 600 weight, 20px mobile / 24px desktop |
| Body | 400 weight, 16px |
| Body semibold | 500 weight, 16px |
| Caption | 400 weight, 14px, text-secondary |
| Small | 500 weight, 12px |

### SPACING & SHAPE

| Token | Value |
|-------|-------|
| Radius default | `8px` |
| Radius large | `12px` (cards) |
| Radius full | `9999px` (badges, pills) |
| Shadow default | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` |
| Shadow elevated | `0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)` |
| Shadow hover | `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)` |
| Spacing base | `4px` (semua spacing kelipatan 4: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64) |
| Border default | `1px solid #E5E7EB` |
| Border focus | `2px solid #FF4D00` |

---

## GLOBAL UI ELEMENTS

### NAVBAR

| Property | Value |
|----------|-------|
| Height | `64px` |
| Background | `#1A1A2E` |
| Text | `#FFFFFF` |
| Border bottom | none |
| Left | Logo/nama event (text bold, 20px, white) |
| Right | Public: kosong. Admin: nama admin + logout button (ghost white) |
| Scroll | `sticky top-0 z-50` |
| Stitch | "Dark Midnight Navy sticky navbar, white text, orange logo accent on hover" |

### SIDEBAR (Admin only)

| Property | Value |
|----------|-------|
| Width | `240px` desktop, hidden mobile (hamburger toggle) |
| Background | `#1A1A2E` |
| Items | Dashboard, Peserta, Transaksi |
| Active item | `bg-white/10`, left border `3px #FF4D00` |
| Stitch | "Dark sidebar matching navbar, orange left-border accent for active item" |

### FOOTER

| Property | Value |
|----------|-------|
| Background | `#1A1A2E` |
| Text | `#9CA3AF` |
| Content | © 2026 Fun Run · Kontak panitia · Powered by [organizer] |
| Padding | `24px 0` |
| Stitch | "Dark footer matching navbar, gray muted text, minimal one-liner" |

### TOAST

| Property | Value |
|----------|-------|
| Position | bottom-right |
| Duration | `5000ms` |
| z-index | `9999` |
| Success | bg `#10B981`, text white |
| Error | bg `#E63946`, text white |
| Warning | bg `#F59E0B`, text `#111827` |
| Info | bg `#3B82F6`, text white |
| Animation | slide-in from right, fade-out |

### BUTTONS

| Variant | Style |
|---------|-------|
| Primary | `bg-[#FF4D00] text-white font-semibold rounded-[8px] h-[44px] px-[24px] hover:bg-[#E64500] active:bg-[#CC3D00] transition-colors duration-150` |
| Secondary | `bg-transparent border-[1px] border-[#FF4D00] text-[#FF4D00] rounded-[8px] h-[44px] px-[24px] hover:bg-[#FF4D00]/10 transition-colors` |
| Danger | `bg-[#E63946] text-white rounded-[8px] h-[44px] px-[24px] hover:bg-[#D32F3E]` |
| Ghost | `bg-transparent text-[#6B7280] rounded-[8px] h-[44px] px-[24px] hover:bg-[#F3F4F6]` |
| Disabled | `bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed rounded-[8px] h-[44px]` |
| Height | `44px` default, `36px` compact (admin tables) |

### INPUT FIELDS

| Property | Value |
|----------|-------|
| Border | `1px solid #D1D5DB` |
| Radius | `8px` |
| Height | `44px` |
| Focus | `ring-2 ring-[#FF4D00]/30 border-[#FF4D00] outline-none` |
| Error | `border-[#E63946] ring-2 ring-[#E63946]/30` |
| Label | Above input (not floating), `font-medium text-[14px] text-[#374151] mb-[4px]` |
| Placeholder | `text-[#9CA3AF]` |
| Helper text | `text-[12px] text-[#6B7280] mt-[4px]` |
| Error text | `text-[12px] text-[#E63946] mt-[4px]` |

### CARDS

| Property | Value |
|----------|-------|
| Background | `#FFFFFF` |
| Shadow | `0 1px 3px rgba(0,0,0,0.1)` |
| Radius | `12px` |
| Padding | `24px` |
| Border | `1px solid #F3F4F6` |
| Hover | `shadow-elevated transition-shadow duration-200` |

### PAGE SHELL

| Property | Value |
|----------|-------|
| Max width | `1280px` |
| Padding | `16px` mobile / `24px` tablet / `32px` desktop |
| Center | `mx-auto` |

---

### STATUS BADGES

| Status | Style |
|--------|-------|
| paid | `bg-[#10B981]/10 text-[#10B981] font-medium px-[8px] py-[2px] rounded-full text-[12px]` |
| pending_payment | `bg-[#F59E0B]/10 text-[#F59E0B] font-medium px-[8px] py-[2px] rounded-full text-[12px]` |
| expired | `bg-[#6B7280]/10 text-[#6B7280] font-medium px-[8px] py-[2px] rounded-full text-[12px]` |
| cancelled | `bg-[#E63946]/10 text-[#E63946] font-medium px-[8px] py-[2px] rounded-full text-[12px]` |

---

┌─────────────────────────────────────────────┐
│ RINGKASAN B5a                               │
│ Style    : Bold Modern                      │
│ Primary  : #FF4D00 | Secondary: #1A1A2E    │
│ Font     : Inter | Radius: 8px             │
│ Loading  : skeleton                         │
│ Senior Flag: NONE                           │
└─────────────────────────────────────────────┘

---

# B5b — SITEMAP

```
/
├── /                          → Landing / pilih kategori
├── /daftar                    → Form pendaftaran
├── /status                    → Cek status & e-ticket
│
├── /admin
│   ├── /admin/login           → Login admin
│   ├── /admin                 → Dashboard admin
│   ├── /admin/peserta         → List peserta
│   └── /admin/transaksi      → List transaksi
│
├── not-found.tsx              → 404
├── error.tsx                  → 500
└── /maintenance               → Maintenance
```

## HALAMAN → ROUTE → ROLE → SUMBER DATA

| HALAMAN | ROUTE | ROLE | SUMBER DATA |
|---------|-------|------|-------------|
| Landing | `/` | public | API-001 |
| Form Pendaftaran | `/daftar` | public | API-001, API-002 |
| Status & E-Ticket | `/status` | public | API-003 |
| Admin Login | `/admin/login` | public | API-005 |
| Admin Dashboard | `/admin` | admin | API-012 |
| Admin Peserta | `/admin/peserta` | admin | API-007, API-008, API-009 |
| Admin Transaksi | `/admin/transaksi` | admin | API-010, API-011 |
| 404 | `not-found.tsx` | public | — |
| 500 | `error.tsx` | public | — |
| Maintenance | `/maintenance` | public | — |

## MASTER REFERENCES UPDATE

```
Routes: /, /daftar, /status, /admin/login, /admin, /admin/peserta, /admin/transaksi, /maintenance
```

---

# B5c — PAGE SPEC (LITE)

> B5c-DETAIL di-generate on-demand di Phase 3.  
> Perintah: `generate B5c-detail [nama halaman]`

## B5c-LITE INDEX

Total halaman: **10** (sama persis dengan B5b)

| No | Nama Halaman | Route | Role | API-ID Utama |
|----|-------------|-------|------|-------------|
| 1 | Landing | `/` | public | API-001 |
| 2 | Form Pendaftaran | `/daftar` | public | API-001, API-002 |
| 3 | Status & E-Ticket | `/status` | public | API-003 |
| 4 | Admin Login | `/admin/login` | public | API-005 |
| 5 | Admin Dashboard | `/admin` | admin | API-012 |
| 6 | Admin Peserta | `/admin/peserta` | admin | API-007, API-008, API-009 |
| 7 | Admin Transaksi | `/admin/transaksi` | admin | API-010, API-011 |
| 8 | 404 | not-found.tsx | public | — |
| 9 | 500 | error.tsx | public | — |
| 10 | Maintenance | /maintenance | public | — |

## Form Summary

| No | Nama Halaman | Fields utama | Validasi kritis |
|----|-------------|-------------|-----------------|
| 2 | Form Pendaftaran | nama, email, HP, NIK, gender, tempat/tgl lahir, kewarganegaraan, alamat, gol darah, riwayat penyakit, jersey, emergency contact (nama+HP) | NIK 16 digit, email format, HP 10-15 digit, birth_date >10 tahun lalu, semua required terisi |
| 3 | Status & E-Ticket | email / registration_number / phone (min 1) | Minimal 1 field terisi, format valid |
| 4 | Admin Login | email, password | Email format, rate limit 5x/15min |
| 7 | Admin Transaksi | quota (pada modal edit kuota) | quota >= reserved_count |

## State Summary

| No | Loading | Empty state heading | Success type |
|----|---------|-------------------|--------------|
| 1 | skeleton (category cards) | — (selalu ada min 1 event seed) | — |
| 2 | skeleton (on submit, button loading) | — | redirect `/status?reg={registration_number}` |
| 3 | skeleton (on lookup) | "Pendaftaran tidak ditemukan" | — (display result inline) |
| 4 | — (instant) | — | redirect `/admin` |
| 5 | skeleton (stats cards + table) | "Belum ada pendaftaran untuk event ini" | — |
| 6 | skeleton (table) | "Belum ada peserta terdaftar" | — |
| 7 | skeleton (table) | "Belum ada transaksi" | toast "Kuota berhasil diubah" 3000ms |

---

┌────────────────────────────────────┐
│ RINGKASAN B5c-LITE                 │
│ Halaman   : 10                     │
│ Form      : 4 halaman dengan form  │
│ Public    : 6 | Admin: 4           │
│ Senior Flag: NONE                  │
└────────────────────────────────────┘
