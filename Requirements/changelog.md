# Changelog - Sistem Pendaftaran & Pembayaran Event Lari

## [Sprint 1]

### TASK-001 — Project Setup & Config (Completed)

- Archived legacy static HTML, CSS, JS, and server-dev.js to `static-archive/` folder.
- Bootstrapped Next.js 15.1.0 app using `create-next-app` inside `temp-next-app` and moved contents to the root directory.
- Upgraded Tailwind to v4.3.2 and `@tailwindcss/postcss` to v4.3.2.
- Updated `postcss.config.mjs` to use `@tailwindcss/postcss`.
- Deleted Tailwind v3 configuration file `tailwind.config.ts`.
- Configured custom design system tokens in `src/app/globals.css` using `@theme` syntax.
- Created `src/lib/env.ts` to validate environment variables using Zod.
- Updated root layout `src/app/layout.tsx` to include Inter font, setup SEO metadata, and trigger env validation on startup.
- Created project folder skeleton.
- Created `.env.example` in the root folder.

### TASK-002 — Database Setup (Completed)

- Created migration schema file `supabase/migrations/20260101000000_initial_schema.sql` containing the tables (`events`, `event_categories`, `registrations`, `transactions`, `profiles`), unique indexes, triggers, and RLS policies.
- Implemented core database functions (`fn_reserve_slot`, `fn_release_slot`, `fn_generate_registration_number`, `fn_update_timestamp`).
- Created seed file `supabase/seed.sql` containing mock event data, categories, registrations, transactions, and default admin accounts linked to `auth.users`.

### TASK-003 — Supabase Client Setup (Completed)

- Created `src/types/database.ts` manually to declare TypeScript schemas for all tables.
- Implemented `src/lib/supabase/client.ts` to create the browser-side Supabase client.
- Implemented `src/lib/supabase/server.ts` to create the server-side Supabase client with async cookies support for Next.js 15.
- Implemented `src/lib/supabase/admin.ts` to create the server-only admin Supabase client with service_role key to bypass RLS.
- Created `middleware.ts` to handle session refreshes and guard the administrative routes under `/admin/*` by checking the user's role in the `profiles` table.

### TASK-004 — Landing Page & API Events (Completed)

- Generated and saved `B5c-detail Landing Page` specifications in `Requirements/DESIGN.md`.
- Created `src/types/api.ts` to declare `ApiResponse` and `ApiErrorResponse` structures.
- Implemented `src/services/event.service.ts` to query active events and categories with total/reserved slots.
- Implemented API-001 GET `/api/v1/events` route at `src/app/api/v1/events/route.ts` with computed slots and opening window fields.
- Implemented `src/lib/utils.ts` for Indonesian date formatting and IDR currency conversions.
- Developed `src/components/ui/button.tsx` using standard React 19 props ref.
- Developed `src/components/landing/hero-section.tsx` and `src/components/landing/category-card.tsx`.
- Overwrote `src/app/page.tsx` with the responsive, high-end Bold Modern Landing Page dashboard.

### TASK-005 — Registration Form Component (Completed)

- Generated and saved `B5c-detail Form Pendaftaran` specifications in `Requirements/DESIGN.md`.
- Created UI form primitive fields `src/components/ui/input.tsx` and `src/components/ui/select.tsx` utilizing React 19 props ref.
- Created validation schema `src/lib/validations/registration.ts` enforcing NIK format, email validation, phone validation, and age restrictions (>10 years old).
- Developed `src/components/forms/registration-form.tsx` rendering all 15 registration fields, grouping them logically, and validating client-side via React Hook Form and Zod.
- Implemented `/daftar` page at `src/app/daftar/page.tsx` with dynamic category selection based on URL search query parameters.

### TASK-006 — API Registrations & Midtrans Integration (Completed)

- Initialized Midtrans Snap SDK client at `src/lib/midtrans/client.ts`.
- Developed `src/services/registration.service.ts` to manage the registration transaction, checking category limits, preventing duplicate active emails, calling the atomic `fn_reserve_slot` function, and rolling back slots on failure.
- Implemented API-002 POST `/api/v1/registrations` route handler at `src/app/api/v1/registrations/route.ts` with input Zod validations, error code matching, and Snap credentials responses.

### TASK-007 — Midtrans Snap Frontend Checkout (Completed)

- Integrated the Midtrans Snap.js script dynamically via Next.js `<Script>` component in `/daftar` page at `src/app/daftar/page.tsx` using conditional URLs (Sandbox/Production) based on key prefix checks.
- Bound the form component submit handler to window snap popup `win.snap.pay(snapToken, ...)` with onSuccess, onPending, and onError callbacks redirecting to the status page.
- Verified compilation and optimized static pages generation successfully via production build check.

## [Sprint 2]

### TASK-008 — Webhook handler (Completed)
- Developed API-004 `/api/v1/payments/notification` POST route for Midtrans webhook integration.
- Implemented SHA512 signature verification using parameters: `order_id`, `status_code`, `gross_amount`, and the server key.
- Created idempotent checks verifying existing transaction status before performing database modifications.
- Mapped transaction state updates (updates transactions status; updates registrations status to `paid` and generates a UUID for `qr_code_token` on settlement; updates status to `expired`/`cancelled` and releases slots on failure/expiry).
- Leveraged Supabase admin client to bypass public RLS rules.

### TASK-009 — Status page + API (Completed)
- Generated and saved `B5c-detail Status & E-Ticket` specifications in `Requirements/DESIGN.md`.
- Developed API-003 GET `/api/v1/registrations/status` status lookup endpoint.
- Developed client-side `StatusLookupForm` component handling the tab navigation (Email, Registration Number, Phone), fetching registration data, and launching Midtrans Snap popups for pending payments.
- Created the public status page `/status` at `src/app/status/page.tsx` loading Midtrans Snap script dynamically.

### TASK-010 — E-ticket + QR (Completed)
- Developed printable `ETicket` component at `src/components/ticket/e-ticket.tsx`.
- Integrated QR code rendering via `qrcode.react` package.
- Built print-friendly layout using Tailwind `@media print` utilities to hide interactive page controls and scale the ticket layout during printing.

### TASK-011 — Admin auth + layout (Completed)
- Developed API-005 POST `/api/v1/auth/login` endpoint using Supabase auth with IP-based rate limiting (5 failed attempts per 15 minutes) and verification of the `admin` role in `profiles`.
- Developed API-006 POST `/api/v1/auth/logout` endpoint using Supabase signOut.
- Developed client-side admin login page `/admin/login` at `src/app/admin/login/page.tsx`.
- Developed admin Sidebar component at `src/components/admin/sidebar.tsx` with active menu styling and logout button.
- Developed admin layout container at `src/app/admin/layout.tsx` wrapper checks path to omit Sidebar and Header on the login page.

### TASK-012 — Admin dashboard + peserta (Completed)
- Generated and saved `B5c-detail Admin Dashboard` and `B5c-detail Admin Peserta` specifications in `Requirements/DESIGN.md`.
- Developed API-012 GET `/api/v1/admin/dashboard` statistics endpoint.
- Developed API-007 GET `/api/v1/admin/registrations` paginated list endpoint.
- Developed API-008 GET `/api/v1/admin/registrations/[id]` detailed info endpoint.
- Developed client-side dashboard panel at `src/app/admin/page.tsx` with `StatsCard` and category quota lists.
- Developed detailed overlay component at `src/components/admin/registration-detail.tsx` rendering health records and transactions history.
- Developed search-filtered table at `src/components/admin/registration-table.tsx`.
- Developed participants management tab layout at `src/app/admin/peserta/page.tsx`.

### TASK-013 — Admin transaksi + CSV + kuota (Completed)
- Generated and saved `B5c-detail Admin Transaksi` specifications in `Requirements/DESIGN.md`.
- Developed API-010 GET `/api/v1/admin/transactions` endpoint returning all logs of payment transactions.
- Developed API-009 GET `/api/v1/admin/registrations/export` endpoint producing formatted CSV attachments with escaped CSV characters.
- Developed API-011 PATCH `/api/v1/admin/categories/[id]` endpoint allowing admins to update category quotas, validating that new values are not less than the already reserved slot count.
- Developed search-filtered grid component at `src/components/admin/transaction-table.tsx` with Kelola Kuota sub-modal.
- Developed transaksi page view at `src/app/admin/transaksi/page.tsx`.

### TASK-014 — Expired cron + error pages (Completed)
- Developed API-013 GET/POST `/api/v1/cron/expired-payments` endpoint that cancels pending registrations older than 24 hours and releases reserved category quota slots. Enforced authorization using the `CRON_SECRET` variable.
- Developed custom 404 page at `src/app/not-found.tsx` matching color systems.
- Developed custom 500 error boundary page at `src/app/error.tsx` matching color systems.
- Developed maintenance page at `src/app/maintenance/page.tsx` matching color systems.
### QA Security & Quality Remediation (Completed)
- **Database Slot Race Condition**: Replaced unsafe read-then-write manual slot release inside the cron route with atomic `fn_release_slot` database RPC calls.
- **Frontend Dropdown API Parser**: Fixed format parsing mismatch in `transaction-table.tsx` and `registration-table.tsx` from `resJson.success && resJson.events` to the standard response shape `resJson.status === 'success' && resJson.data[0].categories`.
- **Explicit API Auth Guards**: Created `checkAdminAuth()` helper in `src/lib/api-guards.ts` and integrated it in all admin API handlers to enforce server-side cookie admin role verification.
- **CSV Formula Injection**: Escaped formula trigger characters (`=`, `+`, `-`, `@`, `\t`, `\r`) in the CSV export utility to prevent Excel macro execution attacks.
- **Vercel Cron Config**: Added `vercel.json` to properly map the cron execution path to `/api/v1/cron/expired-payments` on Vercel.
- **HTTP Security Headers**: Set global security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`) inside `next.config.ts`.
- **Sensitive Webhook Logging**: Redacted `signature_key` parameters from webhook payload standard logs.
- **Cron Serverless Security**: Restricted cron route to `GET` requests only, removed query param credentials leak, and replaced cookie-based `createClient()` with `createAdminClient()`.
