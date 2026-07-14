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
