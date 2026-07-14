# B6 — FOLDER STRUCTURE

> Struktur file Next.js App Router. Maks 4 level untuk komponen, API routes mengikuti konvensi Next.js.

```
fun-run/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 → Root layout: font Inter, metadata, navbar
│   │   ├── page.tsx                   → Landing page (API-001)
│   │   ├── globals.css                → Tailwind @theme + custom tokens
│   │   ├── not-found.tsx              → 404 page
│   │   ├── error.tsx                  → 500 page
│   │   ├── daftar/
│   │   │   └── page.tsx               → Form pendaftaran (API-001, API-002)
│   │   ├── status/
│   │   │   └── page.tsx               → Cek status + e-ticket (API-003)
│   │   ├── maintenance/
│   │   │   └── page.tsx               → Maintenance page
│   │   ├── admin/
│   │   │   ├── layout.tsx             → Admin layout: sidebar + auth guard
│   │   │   ├── page.tsx               → Dashboard (API-012)
│   │   │   ├── login/
│   │   │   │   └── page.tsx           → Login form (API-005)
│   │   │   ├── peserta/
│   │   │   │   └── page.tsx           → List + detail peserta (API-007,008,009)
│   │   │   └── transaksi/
│   │   │       └── page.tsx           → List transaksi + edit kuota (API-010,011)
│   │   └── api/v1/
│   │       ├── events/
│   │       │   └── route.ts           → API-001 GET
│   │       ├── registrations/
│   │       │   ├── route.ts           → API-002 POST
│   │       │   └── status/
│   │       │       └── route.ts       → API-003 GET
│   │       ├── payments/
│   │       │   └── notification/
│   │       │       └── route.ts       → API-004 POST (webhook)
│   │       ├── auth/
│   │       │   ├── login/
│   │       │   │   └── route.ts       → API-005 POST
│   │       │   └── logout/
│   │       │       └── route.ts       → API-006 POST
│   │       └── admin/
│   │           ├── dashboard/
│   │           │   └── route.ts       → API-012 GET
│   │           ├── registrations/
│   │           │   ├── route.ts       → API-007 GET
│   │           │   ├── [id]/
│   │           │   │   └── route.ts   → API-008 GET
│   │           │   └── export/
│   │           │       └── route.ts   → API-009 GET (CSV)
│   │           ├── transactions/
│   │           │   └── route.ts       → API-010 GET
│   │           └── categories/
│   │               └── [id]/
│   │                   └── route.ts   → API-011 PATCH
│   ├── components/
│   │   ├── ui/                        → Reusable UI primitives
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── card.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── modal.tsx
│   │   │   └── pagination.tsx
│   │   ├── forms/                     → Form composites
│   │   │   ├── registration-form.tsx  → 15-field registration form
│   │   │   └── status-lookup-form.tsx → Email/reg_number/phone lookup
│   │   ├── landing/                   → Landing page sections
│   │   │   ├── hero-section.tsx
│   │   │   └── category-card.tsx
│   │   ├── ticket/
│   │   │   └── e-ticket.tsx           → E-ticket layout + QR code
│   │   └── admin/                     → Admin-specific components
│   │       ├── sidebar.tsx
│   │       ├── stats-card.tsx
│   │       ├── registration-table.tsx
│   │       ├── registration-detail.tsx
│   │       └── transaction-table.tsx
│   ├── lib/
│   │   ├── env.ts                     → Env var validation (throw on missing)
│   │   ├── utils.ts                   → formatCurrency, formatDate, cn() helper
│   │   ├── supabase/
│   │   │   ├── client.ts              → createBrowserClient()
│   │   │   ├── server.ts              → createServerClient() with cookies
│   │   │   └── admin.ts              → createClient() with service_role key
│   │   ├── midtrans/
│   │   │   └── client.ts             → Snap + CoreApi client init
│   │   └── validations/
│   │       └── registration.ts        → Zod schema: registrationSchema
│   ├── services/
│   │   ├── event.service.ts           → getActiveEvents, getCategoryById
│   │   ├── registration.service.ts    → createRegistration, getByEmail, getByRegNumber, getByPhone
│   │   ├── payment.service.ts         → createSnapTransaction, handleWebhookNotification, verifySignature
│   │   └── admin.service.ts           → getDashboardStats, getRegistrations, exportCSV, updateQuota
│   └── types/
│       ├── database.ts                → Supabase generated types (npx supabase gen types)
│       ├── api.ts                     → ApiResponse<T>, ApiError, PaginationMeta
│       └── midtrans.ts               → MidtransNotification, SnapResponse
├── public/
│   └── images/                        → Logo, hero image
├── supabase/
│   ├── migrations/
│   │   └── 20260101000000_initial_schema.sql
│   └── seed.sql
├── middleware.ts                       → Next.js middleware: admin auth check, redirect
├── .env.example
├── .env.local                         → (gitignored)
├── .gitignore
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── package.json
├── sentry.client.config.ts
├── sentry.server.config.ts
└── README.md
```

**Wajib ada:** ✅ `.env.example` | ✅ `.gitignore` | ✅ `README.md`

┌────────────────────────────────┐
│ RINGKASAN B6                   │
│ Folder: 22 | Depth: 4 (komponen)│
│ API routes: 12 (sesuai B2)    │
│ Config: 8 files               │
└────────────────────────────────┘

---

# B7 — TASKS & SPRINT

## SP REFERENCE

| SP | DURASI REAL | CONTOH TASK |
|----|-------------|-------------|
| 1 | <2 jam | Error page standalone |
| 2 | 2-4 jam | Setup Supabase client, Midtrans frontend |
| 3 | 4-8 jam | 1 API + 1 page, admin auth |
| 5 | 1-2 hari | Complex form, webhook handler, admin CRUD pages |

**Kapasitas:** 15-25 SP/sprint | **Buffer:** 3-5 SP | **Maks:** 25 SP  
**Learning curve:** Supabase SSR + Midtrans → +1 level untuk task pertama kali

---

## TASK TABLE

| ID | TASK | KATEGORI | DEPENDS ON | SP | RISK | EST |
|----|------|----------|------------|-----|------|-----|
| TASK-001 | Project setup: `npx create-next-app`, install deps, TypeScript strict, Tailwind v4 @theme, Sentry init, env.ts validation, folder skeleton | FOUNDATION | — | 3 | 🔴 | 4 jam |
| TASK-002 | Supabase: run migration (semua tabel B1), create functions (fn_reserve_slot, fn_release_slot, fn_generate_registration_number), RLS policies, triggers, seed data | FOUNDATION | TASK-001 | 3 | 🔴 | 4 jam |
| TASK-003 | Supabase client: browser client, server client, admin client (service_role), generate types, Next.js middleware auth helper | FOUNDATION | TASK-001 | 2 | 🔴 | 3 jam |
| TASK-004 | API-001 GET /events + Landing page: hero section, category cards with quota badge, responsive grid, skeleton loading | CORE-API + FRONTEND | TASK-002, TASK-003 | 3 | 🟡 | 4 jam |
| TASK-005 | Registration form: React Hook Form + Zod, 15 fields, client-side validation, error per-field, step indicator, responsive layout | FRONTEND | TASK-004 | 5 | 🟡 | 8 jam |
| TASK-006 | API-002 POST /registrations: server validation, duplicate email check, fn_reserve_slot, create registration, Midtrans createTransaction, return snap_token. Rollback jika Midtrans gagal. | CORE-API | TASK-002, TASK-003 | 5 | 🔴 | 8 jam |
| TASK-007 | Midtrans Snap frontend: load snap.js via script tag, open popup setelah form submit, handle onSuccess/onPending/onError/onClose callbacks, redirect ke /status | FRONTEND + CORE-API | TASK-005, TASK-006 | 3 | 🔴 | 4 jam |
| TASK-008 | API-004 Webhook handler: signature SHA512 verify, idempotent status update, settlement→paid+qr_code_token, expire→expired+fn_release_slot, raw_notification save. Gunakan service_role. | CORE-API | TASK-006 | 3 | 🔴 | 4 jam |
| TASK-009 | Status page + API-003: lookup form (email/reg_number/phone tabs), API query, display result card, conditional rendering based on status | FRONTEND + CORE-API | TASK-008 | 3 | 🟡 | 4 jam |
| TASK-010 | E-ticket: QR code (qrcode.react) with qr_code_token, ticket layout (nama, event, kategori, reg number), download/print-friendly CSS | FRONTEND | TASK-009 | 2 | 🟢 | 2 jam |
| TASK-011 | Admin auth: API-005 login + API-006 logout, middleware redirect non-admin, admin layout with sidebar, session management | CORE-API + FRONTEND | TASK-003 | 3 | 🔴 | 4 jam |
| TASK-012 | Admin dashboard + peserta: API-012 stats, API-007 list (pagination, search, filter), API-008 detail modal, stats cards, registration table | FRONTEND + CORE-API | TASK-011 | 5 | 🟡 | 8 jam |
| TASK-013 | Admin transaksi + CSV + kuota: API-010 transaction table, API-009 CSV export download, API-011 quota PATCH + modal edit kuota | FRONTEND + CORE-API | TASK-011 | 3 | 🟡 | 4 jam |
| TASK-014 | Expired transaction cron: Vercel Cron (vercel.json), GET /api/v1/cron/expire-transactions, cek pending >24 jam, release slot. Error pages: 404, 500, maintenance (standalone layout, design tokens). | DEVOPS + FRONTEND | TASK-008 | 2 | 🔴 | 3 jam |
| TASK-015 | E2E testing: 5 payment scenarios manual test, npm audit, ESLint pass, env production check, launch checklist B8b, smoke test | TESTING + LAUNCH | ALL | 2 | 🔴 | 3 jam |

---

## SPRINT PLAN

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Sprint 1: Setup + Pendaftaran + Payment**
Goal: User bisa daftar, pilih kategori, isi form, bayar via Midtrans Snap
Durasi: 1 minggu (5 hari) | SP Max: 25 | Buffer: 1 SP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| NO | ID | TASK | SP | DEPENDS ON | RISK |
|----|------|------|-----|------------|------|
| 1 | TASK-001 | Project setup | 3 | — | 🔴 |
| 2 | TASK-002 | Database setup | 3 | TASK-001 | 🔴 |
| 3 | TASK-003 | Supabase client | 2 | TASK-001 | 🔴 |
| 4 | TASK-004 | Landing page + API events | 3 | TASK-002, TASK-003 | 🟡 |
| 5 | TASK-005 | Registration form | 5 | TASK-004 | 🟡 |
| 6 | TASK-006 | API registrations + Midtrans | 5 | TASK-002, TASK-003 | 🔴 |
| 7 | TASK-007 | Midtrans Snap frontend | 3 | TASK-005, TASK-006 | 🔴 |

**Total SP: 24** (buffer: 1 SP)  
**Deliverable:** Demo: pilih kategori → isi form → popup Midtrans → bayar sandbox

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Sprint 2: Status + Admin + Launch**
Goal: User bisa cek status + e-ticket, admin kelola peserta, siap production
Durasi: 1 minggu (5 hari) | SP Max: 25 | Buffer: 2 SP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| NO | ID | TASK | SP | DEPENDS ON | RISK |
|----|------|------|-----|------------|------|
| 8 | TASK-008 | Webhook handler complete | 3 | TASK-006 | 🔴 |
| 9 | TASK-009 | Status page + API | 3 | TASK-008 | 🟡 |
| 10 | TASK-010 | E-ticket + QR | 2 | TASK-009 | 🟢 |
| 11 | TASK-011 | Admin auth + layout | 3 | TASK-003 | 🔴 |
| 12 | TASK-012 | Admin dashboard + peserta | 5 | TASK-011 | 🟡 |
| 13 | TASK-013 | Admin transaksi + CSV + kuota | 3 | TASK-011 | 🟡 |
| 14 | TASK-014 | Cron expired + error pages | 2 | TASK-008 | 🔴 |
| 15 | TASK-015 | Testing + launch | 2 | ALL | 🔴 |

**Total SP: 23** (buffer: 2 SP)  
**Deliverable:** Production-ready: full flow end-to-end, admin dashboard, error pages

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
                                        TASK-015 (depends on ALL)
```

**Circular dependency check:** ✅ Tidak ada circular dependency.

---

## DEFINITION OF DONE (per task)

- ✅ Kode lengkap — no TODO, no placeholder
- ✅ Security sesuai SECURITY_DEFAULTS.md
- ✅ Happy path + min 1 edge case ditest
- ✅ Loading + error state dihandle
- ✅ Commit format: `feat/fix/chore: TASK-XXX deskripsi`
- ✅ [🔴] tasks → reviewed manual, dicatat di commit

---

## SP VALIDATION

┌────────────────────────────────────┐
│ SP VALIDATION                      │
│ Σ SP task   : 47                   │
│ Σ SP sprint : 24 + 23 = 47        │
│ Match?      : ✅                   │
│                                    │
│ Sprint 1: 24 SP | Buffer: 1 SP    │
│ Sprint 2: 23 SP | Buffer: 2 SP    │
└────────────────────────────────────┘

## MASTER REFERENCES UPDATE

```
TASK IDs: TASK-001, TASK-002, TASK-003, TASK-004, TASK-005, TASK-006, TASK-007, TASK-008, TASK-009, TASK-010, TASK-011, TASK-012, TASK-013, TASK-014, TASK-015
```

┌────────────────────────────────┐
│ RINGKASAN B7                   │
│ Task: 15 | SP: 47 | Sprint: 2 │
│ Free tier task: tidak (Preset B)│
│ Est: 2 minggu | Valid: ✅       │
└────────────────────────────────┘
