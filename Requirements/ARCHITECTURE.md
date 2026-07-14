# ARCHITECTURE.md — Sistem Pendaftaran & Pembayaran Event Lari

> Phase 2 Blueprint → Phase 3 Handoff  
> Generated: 2026-07-14

---

## MASTER REFERENCES

```
DB Tables   : events, event_categories, registrations, transactions, profiles
DB Functions: fn_reserve_slot, fn_release_slot, fn_generate_registration_number, fn_update_timestamp
API IDs     : API-001 .. API-012
REQ IDs     : REQ-001 .. REQ-022
Routes      : /, /daftar, /status, /admin/login, /admin, /admin/peserta, /admin/transaksi, /maintenance
TASK IDs    : TASK-001 .. TASK-015
Roles       : Admin (full), User (daftar + cek status + e-ticket)
Security    : SECURITY_DEFAULTS.md — bcrypt 12, JWT 15m/7d, CORS eksplisit, webhook SHA512 verify
```

---

## TECH STACK

| Layer | Tech | Detail |
|-------|------|--------|
| Frontend | Next.js 15 (App Router) | TypeScript strict, RSC |
| Styling | Tailwind CSS v4 | @theme CSS tokens |
| Backend/DB | Supabase | PostgreSQL, Auth, RLS, Storage |
| Deploy | Vercel | Auto-deploy on push |
| Payment | Midtrans Snap | QRIS + Virtual Account |
| Monitor | Sentry | @sentry/nextjs |
| Budget | ~Rp 75rb–225rb/bulan | Preset B |

---

## DATABASE SCHEMA

### events
| KOLOM | TIPE | CONSTRAINT | DEFAULT | KETERANGAN |
|-------|------|-----------|---------|------------|
| id | uuid | PK | gen_random_uuid() | |
| name | varchar(255) | NOT NULL | | Nama event |
| description | text | | | |
| event_date | date | NOT NULL | | Tanggal event |
| location | varchar(500) | NOT NULL | | |
| registration_open_at | timestamptz | NOT NULL | | Buka pendaftaran |
| registration_close_at | timestamptz | NOT NULL | | Tutup pendaftaran |
| is_active | boolean | NOT NULL | true | |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

Index: `(is_active)`, `(event_date)`

### event_categories
| KOLOM | TIPE | CONSTRAINT | DEFAULT | KETERANGAN |
|-------|------|-----------|---------|------------|
| id | uuid | PK | gen_random_uuid() | |
| event_id | uuid | FK NOT NULL | | → events.id ON DELETE RESTRICT |
| name | varchar(50) | NOT NULL | | "5K", "10K" |
| distance_km | numeric(5,2) | NOT NULL | | |
| price | integer | NOT NULL | | IDR, tanpa desimal |
| quota | integer | NOT NULL | | |
| reserved_count | integer | NOT NULL | 0 | Pending + paid slots |
| is_active | boolean | NOT NULL | true | |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

Index: `(event_id)`, `(event_id, is_active)`

### registrations
| KOLOM | TIPE | CONSTRAINT | DEFAULT | KETERANGAN |
|-------|------|-----------|---------|------------|
| id | uuid | PK | gen_random_uuid() | |
| registration_number | varchar(20) | UNIQUE NOT NULL | | BR2026-0001 |
| event_id | uuid | FK NOT NULL | | → events.id RESTRICT (denormalized) |
| event_category_id | uuid | FK NOT NULL | | → event_categories.id RESTRICT |
| full_name | varchar(255) | NOT NULL | | |
| email | varchar(255) | NOT NULL | | |
| phone | varchar(20) | NOT NULL | | |
| nik | varchar(16) | NOT NULL | | 16 digit KTP |
| gender | varchar(10) | NOT NULL | | male/female |
| birth_place | varchar(255) | NOT NULL | | |
| birth_date | date | NOT NULL | | |
| nationality | varchar(50) | NOT NULL | WNI | |
| address | text | NOT NULL | | |
| blood_type | varchar(5) | | | A/B/AB/O |
| medical_history | text | | | |
| jersey_size | varchar(5) | NOT NULL | | S/M/L/XL/XXL |
| emergency_contact_name | varchar(255) | NOT NULL | | |
| emergency_contact_phone | varchar(20) | NOT NULL | | |
| registration_status | varchar(20) | NOT NULL | pending_payment | pending_payment/paid/cancelled/expired |
| qr_code_token | uuid | UNIQUE | | Generated saat paid |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

Index: Partial unique `(email, event_id) WHERE status NOT IN (cancelled, expired)`, `(phone)`, `(event_category_id)`, `(registration_status)`

### transactions
| KOLOM | TIPE | CONSTRAINT | DEFAULT | KETERANGAN |
|-------|------|-----------|---------|------------|
| id | uuid | PK | gen_random_uuid() | |
| registration_id | uuid | FK NOT NULL | | → registrations.id RESTRICT |
| order_id | varchar(50) | UNIQUE NOT NULL | | Midtrans order ID |
| amount | integer | NOT NULL | | IDR |
| payment_type | varchar(30) | | | qris/bank_transfer/echannel |
| transaction_status | varchar(20) | NOT NULL | pending | pending/settlement/expire/cancel/deny |
| midtrans_transaction_id | varchar(100) | | | |
| snap_token | varchar(255) | | | |
| snap_redirect_url | text | | | |
| paid_at | timestamptz | | | |
| expired_at | timestamptz | | | |
| raw_notification | jsonb | | | Full webhook payload |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

Index: `(registration_id)`, `(transaction_status)`

### profiles
| KOLOM | TIPE | CONSTRAINT | DEFAULT | KETERANGAN |
|-------|------|-----------|---------|------------|
| id | uuid | PK | | = auth.users.id, ON DELETE CASCADE |
| full_name | varchar(255) | NOT NULL | | |
| role | varchar(20) | NOT NULL | admin | |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

### Functions
- `fn_reserve_slot(category_id)` → SELECT FOR UPDATE + increment reserved_count → returns boolean
- `fn_release_slot(category_id)` → decrement reserved_count (min 0)
- `fn_generate_registration_number(event_id)` → PREFIX + LPAD(count+1, 4)
- `fn_update_timestamp()` → trigger BEFORE UPDATE on all tables

### FK Summary (5/5 LULUS)
| FK | ASAL | TARGET | ON DELETE |
|----|------|--------|-----------|
| event_categories.event_id | event_categories | events.id | RESTRICT |
| registrations.event_id | registrations | events.id | RESTRICT |
| registrations.event_category_id | registrations | event_categories.id | RESTRICT |
| transactions.registration_id | transactions | registrations.id | RESTRICT |
| profiles.id | profiles | auth.users.id | CASCADE |

---

## API ENDPOINTS

| ID | METHOD | ENDPOINT | AUTH | RINGKASAN |
|----|--------|----------|------|-----------|
| API-001 | GET | /api/v1/events | public | Event aktif + kategori + kuota |
| API-002 | POST | /api/v1/registrations | public | Buat pendaftaran + snap token |
| API-003 | GET | /api/v1/registrations/status | public | Cek status (email/reg_no/phone) |
| API-004 | POST | /api/v1/payments/notification | server | Webhook Midtrans |
| API-005 | POST | /api/v1/auth/login | public | Login admin |
| API-006 | POST | /api/v1/auth/logout | admin | Logout admin |
| API-007 | GET | /api/v1/admin/registrations | admin | List peserta (paginated) |
| API-008 | GET | /api/v1/admin/registrations/[id] | admin | Detail peserta + sensitif |
| API-009 | GET | /api/v1/admin/registrations/export | admin | Export CSV |
| API-010 | GET | /api/v1/admin/transactions | admin | List transaksi |
| API-011 | PATCH | /api/v1/admin/categories/[id] | admin | Update kuota |
| API-012 | GET | /api/v1/admin/dashboard | admin | Stats overview |

> Detail request/response per endpoint: lihat b2_api_endpoints.md

---

## FOLDER STRUCTURE

```
fun-run/
├── src/
│   ├── app/
│   │   ├── layout.tsx, page.tsx, globals.css
│   │   ├── not-found.tsx, error.tsx
│   │   ├── daftar/page.tsx
│   │   ├── status/page.tsx
│   │   ├── maintenance/page.tsx
│   │   ├── admin/ (layout.tsx, page.tsx, login/, peserta/, transaksi/)
│   │   └── api/v1/ (events/, registrations/, payments/, auth/, admin/)
│   ├── components/ (ui/, forms/, landing/, ticket/, admin/)
│   ├── lib/ (env.ts, utils.ts, supabase/, midtrans/, validations/)
│   ├── services/ (event, registration, payment, admin)
│   └── types/ (database.ts, api.ts, midtrans.ts)
├── supabase/ (migrations/, seed.sql)
├── middleware.ts
├── .env.example, next.config.ts, package.json, tsconfig.json
└── sentry.client.config.ts, sentry.server.config.ts
```

---

## ENV VARS

| VAR | WAJIB | SERVER ONLY |
|-----|-------|-------------|
| NEXT_PUBLIC_SUPABASE_URL | ya | tidak |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ya | tidak |
| SUPABASE_SERVICE_ROLE_KEY | ya | ya |
| MIDTRANS_SERVER_KEY | ya | ya |
| NEXT_PUBLIC_MIDTRANS_CLIENT_KEY | ya | tidak |
| MIDTRANS_IS_PRODUCTION | ya | ya |
| NEXT_PUBLIC_BASE_URL | ya | tidak |
| SENTRY_DSN | ya | tidak |
| SENTRY_AUTH_TOKEN | ya | ya (build) |

---

## LIBRARIES

| Library | Versi | Tujuan |
|---------|-------|--------|
| next | ^15.1 | Framework |
| react / react-dom | ^19.0 | UI |
| typescript | ^5.7 | Type safety |
| tailwindcss | ^4.0 | Styling |
| @supabase/supabase-js | ^2.49 | DB + Auth client |
| @supabase/ssr | ^0.6 | Server auth |
| midtrans-client | ^1.3 | Payment SDK |
| react-hook-form | ^7.54 | Form handling |
| @hookform/resolvers | ^3.9 | Zod bridge |
| zod | ^3.24 | Validation |
| lucide-react | ^0.469 | Icons |
| qrcode.react | ^4.2 | QR code |
| @sentry/nextjs | ^8.50 | Error monitoring |
| eslint | ^9.0 | Linting |
| prettier | ^3.4 | Formatting |
