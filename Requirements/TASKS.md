# TASKS.md — Sistem Pendaftaran & Pembayaran Event Lari

> Phase 3 Execution Tracker  
> Total: 15 tasks | 47 SP | 2 sprints × 5 hari

---

## STATE SNAPSHOT TERAKHIR

| Field | Value |
|-------|-------|
| Task selesai | TASK-015 |
| Task berikutnya | Sprint 2 completed |
| Berhenti di | Sprint 2 selesai |
| File diubah | src/app/api/v1/admin/transactions/route.ts, src/app/api/v1/admin/registrations/export/route.ts, src/app/api/v1/admin/categories/[id]/route.ts, src/components/admin/transaction-table.tsx, src/app/admin/transaksi/page.tsx, src/app/api/v1/cron/expired-payments/route.ts, src/app/not-found.tsx, src/app/error.tsx, src/app/maintenance/page.tsx, Requirements/DESIGN.md, Requirements/TASKS.md, Requirements/changelog.md |
| Blocker | none |

---

## SPRINT 1 — Setup + Pendaftaran + Payment

**Goal:** User bisa daftar, pilih kategori, isi form, bayar via Midtrans Snap  
**Durasi:** 5 hari | **SP:** 24 | **Buffer:** 1

- [x] **TASK-001** (3 SP 🔴) Project setup
  - `npx create-next-app` dengan App Router + TypeScript
  - Install semua deps dari B4
  - Tailwind v4 @theme config dengan design tokens B5a
  - Sentry init
  - `src/lib/env.ts` — validasi semua env vars saat startup
  - Folder skeleton sesuai B6
  - `.env.example`, `.gitignore`, `README.md`
  - Depends: —

- [x] **TASK-002** (3 SP 🔴) Database setup
  - Supabase project create (atau gunakan existing)
  - Migration SQL: 5 tabel sesuai B1
  - Functions: fn_reserve_slot, fn_release_slot, fn_generate_registration_number
  - Trigger: fn_update_timestamp pada semua tabel
  - RLS policies: 6 policies sesuai B1
  - Seed data: 3 events, 2 categories, 3 registrations, 3 transactions, 3 profiles
  - Depends: TASK-001

- [x] **TASK-003** (2 SP 🔴) Supabase client
  - `src/lib/supabase/client.ts` — createBrowserClient
  - `src/lib/supabase/server.ts` — createServerClient (cookies)
  - `src/lib/supabase/admin.ts` — service_role client
  - `npx supabase gen types` → `src/types/database.ts`
  - `middleware.ts` — refresh session, admin route guard
  - Depends: TASK-001

- [x] **TASK-004** (3 SP 🟡) Landing page + API events
  - API-001: `src/app/api/v1/events/route.ts` — GET active events with categories
  - `src/services/event.service.ts` — getActiveEvents()
  - `src/app/page.tsx` — landing page
  - `src/components/landing/hero-section.tsx` — hero with CTA
  - `src/components/landing/category-card.tsx` — price, quota badge, "Daftar" button
  - Skeleton loading state
  - Responsive: 1 col mobile, 2 col desktop
  - Depends: TASK-002, TASK-003

- [x] **TASK-005** (5 SP 🟡) Registration form
  - `src/lib/validations/registration.ts` — Zod schema (semua field dari B1)
  - `src/components/forms/registration-form.tsx` — React Hook Form, 15 fields
  - `src/app/daftar/page.tsx` — form page with category pre-selected
  - Client-side validation, error per-field
  - Fields: nama, email, HP, NIK, gender, TTL, kewarganegaraan, alamat, gol darah, riwayat penyakit, jersey, emergency contact
  - Responsive layout: 1 col mobile, 2 col desktop for shorter fields
  - Depends: TASK-004

- [x] **TASK-006** (5 SP 🔴) API registrations + Midtrans
  - API-002: `src/app/api/v1/registrations/route.ts` — POST
  - `src/services/registration.service.ts` — createRegistration()
  - `src/lib/midtrans/client.ts` — Snap client init
  - `src/types/midtrans-client.d.ts` — types
  - Flow: validate → check duplicate email → fn_reserve_slot → create registration → Midtrans createTransaction → return snap_token
  - Rollback: if Midtrans fails → delete registration + fn_release_slot
  - Server-side validation (Zod same schema as client)
  - Depends: TASK-002, TASK-003

- [x] **TASK-007** (3 SP 🔴) Midtrans Snap frontend
  - Load Snap.js via `<Script>` tag
  - Open popup after form submit with snap_token
  - Handle callbacks: onSuccess → redirect /status, onPending → redirect /status, onError → toast error, onClose → stay
  - `enabled_payments`: ["gopay", "bank_transfer"] (QRIS via gopay, VA via bank_transfer)
  - Depends: TASK-005, TASK-006

---

## SPRINT 2 — Status + Admin + Launch

**Goal:** User cek status + e-ticket, admin kelola peserta, production-ready  
**Durasi:** 5 hari | **SP:** 23 | **Buffer:** 2

- [x] **TASK-008** (3 SP 🔴) Webhook handler
  - API-004: `src/app/api/v1/payments/notification/route.ts` — POST
  - Signature verify: SHA512(order_id + status_code + gross_amount + server_key)
  - Idempotent: check current status before update
  - settlement → registration paid + generate qr_code_token
  - expire → registration expired + fn_release_slot
  - cancel/deny → registration cancelled + fn_release_slot
  - Save raw_notification (jsonb)
  - Use service_role client (bypass RLS)
  - Depends: TASK-006

- [x] **TASK-009** (3 SP 🟡) Status page + API
  - API-003: `src/app/api/v1/registrations/status/route.ts` — GET
  - `src/components/forms/status-lookup-form.tsx` — tabs: email / reg_number / phone
  - `src/app/status/page.tsx` — lookup form + result card
  - Response: nama, event, kategori, status, qr_code_token (if paid)
  - JANGAN expose NIK/data kesehatan
  - Empty state: "Pendaftaran tidak ditemukan"
  - Support query param `?reg=BR2026-0001` (auto-fill dari redirect)
  - Depends: TASK-008

- [x] **TASK-010** (2 SP 🟢) E-ticket + QR
  - `src/components/ticket/e-ticket.tsx`
  - QR code via qrcode.react (value: `{BASE_URL}/verify/{qr_code_token}`)
  - Ticket layout: nama, event, kategori, reg number, QR
  - Print-friendly CSS (`@media print`)
  - Only render if registration_status = paid
  - Depends: TASK-009

- [x] **TASK-011** (3 SP 🔴) Admin auth + layout
  - API-005: login route — Supabase signInWithPassword + verify profile role=admin
  - API-006: logout route — Supabase signOut
  - `src/app/admin/login/page.tsx` — login form
  - `src/app/admin/layout.tsx` — admin layout with sidebar + auth guard
  - `src/components/admin/sidebar.tsx` — nav: Dashboard, Peserta, Transaksi
  - `middleware.ts` — redirect non-admin to /admin/login
  - Error: selalu "Email atau password salah"
  - Rate limit check (5x/15min — log attempts)
  - Depends: TASK-003

- [x] **TASK-012** (5 SP 🟡) Admin dashboard + peserta
  - API-012: dashboard stats
  - API-007: list registrations (paginated, search, filter)
  - API-008: registration detail
  - `src/app/admin/page.tsx` — stats cards + recent registrations
  - `src/app/admin/peserta/page.tsx` — table + search + filter + detail modal
  - `src/components/admin/stats-card.tsx`
  - `src/components/admin/registration-table.tsx`
  - `src/components/admin/registration-detail.tsx`
  - `src/services/admin.service.ts`
  - Skeleton loading, empty state, pagination
  - Depends: TASK-011

- [x] **TASK-013** (3 SP 🟡) Admin transaksi + CSV + kuota
  - API-010: list transactions
  - API-009: export CSV (Content-Type text/csv, download)
  - API-011: PATCH quota (validate >= reserved_count)
  - `src/app/admin/transaksi/page.tsx` — transaction table + edit kuota modal
  - `src/components/admin/transaction-table.tsx`
  - Export button → download CSV
  - Depends: TASK-011

- [x] **TASK-014** (2 SP 🔴) Expired cron + error pages
  - Vercel Cron: `vercel.json` → `"crons": [{"path":"/api/v1/cron/expire","schedule":"*/30 * * * *"}]`
  - `src/app/api/v1/cron/expire/route.ts` — find pending >24h, expire + release slot
  - `src/app/not-found.tsx` — 404 page (standalone, design tokens)
  - `src/app/error.tsx` — 500 page (standalone)
  - `src/app/maintenance/page.tsx` — maintenance page
  - Depends: TASK-008

- [x] **TASK-015** (2 SP 🔴) Testing + launch
  - Smoke test 5 flows (lihat B8b)
  - `npm audit` — fix HIGH/CRITICAL
  - ESLint pass semua file
  - `tsc --noEmit` — no type errors
  - Env vars production di Vercel
  - Midtrans production credentials
  - Webhook URL production di Midtrans dashboard
  - Sentry verified (throw test error)
  - Launch checklist B8b complete
  - Depends: ALL

---

## DEFINITION OF DONE

- ✅ Kode lengkap — no TODO, no placeholder
- ✅ Security sesuai SECURITY_DEFAULTS.md
- ✅ Happy path + min 1 edge case ditest
- ✅ Loading + error state dihandle
- ✅ Commit: `feat/fix/chore: TASK-XXX deskripsi`
- ✅ 🔴 tasks → reviewed manual, dicatat di commit message

---

## DEPENDENCY GRAPH

```
TASK-001 ─┬→ TASK-002 ─┐
          │            ├→ TASK-004 → TASK-005 ─┐
          └→ TASK-003 ─┤                       ├→ TASK-007
                       ├→ TASK-006 ────────────┘
                       │     └→ TASK-008 → TASK-009 → TASK-010
                       │          └→ TASK-014
                       └→ TASK-011 → TASK-012
                              └→ TASK-013
                                        TASK-015 (ALL)
```
