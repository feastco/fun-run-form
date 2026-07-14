# B8a — TESTING & ERROR PAGES

## TESTING LAYERS

| LAYER | TOOL | TARGET | MIN PER TASK |
|-------|------|--------|--------------|
| Unit | Vitest | Service functions, Zod schemas, utils | 1 happy + 1 edge |
| Integration | Vitest + Supabase local | API route handlers | 1 happy + 1 edge per endpoint |
| E2E | Manual | Full user flows (5 scenarios) | Sprint 2 akhir |
| Security | Manual review | Auth, payment, webhook handlers | Per task 🔴 |

**AI Tools tambahan:**

| LAYER | TOOL | TARGET | FREKUENSI |
|-------|------|--------|-----------|
| Static | ESLint + TypeScript strict | Semua file | Per commit |
| Static | `tsc --noEmit` | Type check | Per commit |
| Security | `npm audit` | Dependencies | Per PR / weekly |
| CVE | GitHub Dependabot | Library vulnerabilities | Weekly |

**AI DEBT CHECK (akhir setiap sprint):**
- [ ] Tidak ada `any` tanpa komentar `// @ts-expect-error: [alasan]`
- [ ] Tidak ada TODO tersisa
- [ ] Query tidak N+1 (semua list query pakai single Supabase query dengan join)
- [ ] Env var divalidasi saat startup (`src/lib/env.ts`)
- [ ] Tidak ada secret hardcoded
- [ ] Error handling di semua async function (try/catch + Sentry capture)
- [ ] Semua API response menggunakan standard format (status/data/meta atau status/code/message/errors)

---

## ERROR PAGES

### PAGE: 404

| Property | Value |
|----------|-------|
| Layout | Standalone — tidak ada navbar/sidebar/footer |
| Background | `#FFFFFF` |
| Anatomy | 1. Icon `Search` (lucide) — 64px — `text-[#D1D5DB]` |
| | 2. Kode "404" — 96px — `font-[800] text-[#E5E7EB]` |
| | 3. Pesan utama: **"Halaman tidak ditemukan"** — 24px — `text-[#111827]` |
| | 4. Pesan sub: "Halaman yang kamu cari tidak ada atau sudah dipindahkan." — 16px — `text-[#6B7280]` |
| | 5. Tombol: **"Kembali ke Beranda"** → `/` — Primary button |
| States | Default only + button redirect |

### PAGE: 500

| Property | Value |
|----------|-------|
| Layout | Standalone — tidak ada navbar/sidebar/footer |
| Background | `#FFFFFF` |
| Anatomy | 1. Icon `AlertTriangle` (lucide) — 64px — `text-[#E63946]` |
| | 2. Kode "500" — 96px — `font-[800] text-[#E5E7EB]` |
| | 3. Pesan utama: **"Terjadi kesalahan"** — 24px — `text-[#111827]` |
| | 4. Pesan sub: "Maaf, terjadi kesalahan pada server. Silakan coba beberapa saat lagi." — 16px — `text-[#6B7280]` |
| | 5. Tombol: **"Kembali ke Beranda"** → `/` — Primary button |
| States | Default only |
| JANGAN | Stack trace, detail teknis, warna di luar design tokens |

### PAGE: Maintenance

| Property | Value |
|----------|-------|
| Layout | Standalone — tidak ada navbar/sidebar/footer |
| Background | `#FFFFFF` |
| Anatomy | 1. Icon `Wrench` (lucide) — 64px — `text-[#F59E0B]` |
| | 2. Pesan utama: **"Sedang dalam perbaikan"** — 24px — `text-[#111827]` |
| | 3. Pesan sub: "Kami sedang melakukan pemeliharaan sistem. Silakan kembali dalam beberapa menit." — 16px — `text-[#6B7280]` |
| | 4. Tidak ada tombol. User refresh manual. |
| Toggle | Controlled via env var `NEXT_PUBLIC_MAINTENANCE_MODE=true` di Vercel |

---

┌────────────────────────────────┐
│ RINGKASAN B8a                  │
│ Layer testing: 4               │
│ Error pages: 404✅ 500✅ maint✅│
└────────────────────────────────┘

---

# B8b — LAUNCH & MAINTENANCE

## LAUNCH CHECKLIST

### Pre-launch

- [ ] Semua P0 (REQ-001 s.d. REQ-022) end-to-end bisa dipakai
- [ ] Auth: login admin, logout, session expire → redirect ke /admin/login
- [ ] Error pages (404, 500) ada dan tampil benar
- [ ] 4 states (loading, empty, error, success) semua halaman P0
- [ ] Tidak ada data sensitif di `console.log` (NIK, server key, token)
- [ ] Env vars production sudah diisi di Vercel dashboard
- [ ] `npm audit` — tidak ada HIGH/CRITICAL vulnerability
- [ ] Backup Supabase aktif (daily, 30 hari retensi) — verifikasi di dashboard
- [ ] `.env.example` update, tidak ada nilai asli
- [ ] Midtrans production credentials sudah di-set (bukan sandbox)
- [ ] Webhook URL production sudah dikonfigurasi di Midtrans dashboard
- [ ] Midtrans enabled_payments hanya QRIS + bank_transfer
- [ ] Domain production sudah pointing ke Vercel

### Day-1

- [ ] Smoke test 5 flow utama berhasil (lihat tabel di bawah)
- [ ] Sentry error monitoring aktif — test dengan throw error manual
- [ ] Login admin dengan akun real (bukan seed)
- [ ] Cek tampilan di mobile (Chrome DevTools + real device)
- [ ] Catat baseline: Lighthouse score + LCP + waktu load halaman form

### Post-launch (minggu pertama)

- [ ] Monitor error rate harian di Sentry
- [ ] Cek backup Supabase berjalan otomatis
- [ ] Catat feedback user pertama — prioritaskan bug P0
- [ ] Jangan tambah fitur baru — stabilkan dulu

---

## SMOKE TEST (5 flow P0)

| NO | FLOW | LANGKAH | EXPECTED |
|----|------|---------|----------|
| 1 | Daftar + bayar QRIS | Landing → pilih 5K → isi form → submit → popup Midtrans → bayar QRIS sandbox → redirect status | Status "Terdaftar" + QR code tampil |
| 2 | Daftar + bayar VA | Landing → pilih 10K → isi form → submit → popup Midtrans → pilih VA → bayar di simulator → webhook fire | Status "Terdaftar" + e-ticket |
| 3 | Expired transaction | Daftar → tidak bayar → tunggu expire (atau trigger manual via Midtrans dashboard) | Status "Kedaluwarsa" + kuota kembali |
| 4 | Duplikat email | Daftar dengan email yang sudah terdaftar (status paid) | Error 409 "Email sudah terdaftar" |
| 5 | Admin full flow | Login admin → lihat dashboard stats → cari peserta → lihat detail → export CSV → ubah kuota | Semua page load, CSV terdownload, kuota terupdate |

---

## MAINTENANCE

**Deploy:** `git push` ke branch `main` → Vercel auto-deploy  
**CI/CD:** Vercel built-in (build + deploy on push)  
**Est deploy:** ~2-3 menit

### Rollback — WAJIB tanpa diskusi:

| Kondisi | Aksi |
|---------|------|
| ❌ Error >5% dalam 5 menit | Rollback via Vercel dashboard (redeploy previous) |
| ❌ Auth rusak (admin tidak bisa login) | Rollback |
| ❌ Payment gagal (webhook error, Midtrans 5xx) | Rollback |
| ❌ Data corrupt | Rollback + restore backup Supabase |
| ❌ Root cause tidak ketemu 15 menit | Rollback dulu, investigate terpisah |

### Hotfix — BOLEH:

| Kondisi | Aksi |
|---------|------|
| ✅ Bug UI (styling, typo) | Hotfix branch → deploy |
| ✅ Root cause jelas + fix <15 menit | Hotfix branch → deploy |
| ✅ Tidak menyentuh auth/payment/data | Langsung fix |

### Timeline hotfix:

| Durasi | Aksi |
|--------|------|
| <15 menit | Hotfix langsung |
| 15-60 menit | Rollback dulu, hotfix branch terpisah |
| >60 menit | Rollback, jadwal sprint berikutnya |

### Monitoring Alerts

| ALERT | THRESHOLD | AKSI | LEVEL |
|-------|-----------|------|-------|
| Error rate | >5% / 5 menit | Cek Sentry → rollback jika perlu | L2 |
| API latency | >2 detik sustained | Cek Supabase dashboard → query performance | L2 |
| Webhook failures | >3 consecutive 5xx | Cek Midtrans status → manual reconcile | L2 |
| Disk/DB size | >80% plan limit | Audit data → cleanup old expired registrations | L2 |
| Supabase connection | Pool exhausted | Restart → check for connection leaks | L2 |

---

┌────────────────────────────────┐
│ RINGKASAN B8b                  │
│ Checklist: 17 | Smoke: 5       │
│ Maintenance: ✅                │
└────────────────────────────────┘

---

# GLOBAL RECONCILIATION CHECK

| # | Check | Status |
|---|-------|--------|
| 1 | Semua API-ID (12) ada di min 1 REQ-ID | ✅ |
| 2 | Semua REQ-ID (22) punya min 1 task di B7 | ✅ (via API yang tercakup dalam TASK) |
| 3 | Semua tabel B1 (5) dipakai min 1 endpoint B2 | ✅ events→API-001, event_categories→API-001/011, registrations→API-002/003/007/008/009, transactions→API-004/010, profiles→API-005 |
| 4 | Semua halaman B5 (10) punya sumber data | ✅ (error pages tanpa API = expected) |
| 5 | Semua role punya akses jelas di B2 dan B3 | ✅ public: API-001–005, admin: API-006–012, server: API-004 |
| 6 | Tidak ada ID yatim di manapun | ✅ |
| 7 | Tidak ada fitur di luar P0/P1 | ✅ (P1 tercatat di Fitur Ditolak) |
| 8 | Tidak ada naming conflict | ✅ |
| 9 | Tidak ada circular dependency di B7 | ✅ (verified in dependency graph) |
| 10 | MASTER REFERENCES lengkap dan konsisten | ✅ |
| 11 | Tidak ada asumsi auth/payment/DB/security belum dikonfirmasi | ✅ (enkripsi CONFIRMED) |
| 12 | Free tier anti-idle task (N/A — Preset B) | ✅ N/A |

**GLOBAL RECONCILIATION: LULUS ✅**

---

# P2→P3 HANDOFF VALIDATOR

## STEP 1 — CEK KELENGKAPAN OUTPUT

| # | Section | Status |
|---|---------|--------|
| 1 | B1 — Database schema (FK lulus) | ✅ |
| 2 | B2 — API endpoints (overview + detail) | ✅ |
| 3 | B3 — Requirements (22 REQ-ID) | ✅ |
| 4 | B4 — Libraries + ENV VARS + deprecation | ✅ |
| 5 | B4 — Free tier checklist (N/A Preset B) | ✅ N/A |
| 6 | B5a — Design system (semua token) | ✅ |
| 7 | B5b — Sitemap (10 routes) | ✅ |
| 8 | B5c — Page spec lite (10 halaman) | ✅ |
| 9 | B6 — Folder structure | ✅ |
| 10 | B7 — Tasks & sprint (SP validation lulus) | ✅ |
| 11 | B7 — Anti-idle task (N/A) | ✅ N/A |
| 12 | B8a — Testing + error pages (404, 500, maintenance) | ✅ |
| 13 | B8b — Launch & maintenance checklist | ✅ |

**KELENGKAPAN: 13/13 LULUS ✅**

---

## MASTER REFERENCES — FINAL

```
DB Tables  : events, event_categories, registrations, transactions, profiles
DB Functions: fn_reserve_slot, fn_release_slot, fn_generate_registration_number, fn_update_timestamp
API IDs    : API-001, API-002, API-003, API-004, API-005, API-006, API-007, API-008, API-009, API-010, API-011, API-012
REQ IDs    : REQ-001 through REQ-022
Routes     : /, /daftar, /status, /admin/login, /admin, /admin/peserta, /admin/transaksi, /maintenance
TASK IDs   : TASK-001 through TASK-015
Roles      : Admin (full access), User (daftar, cek status, unduh e-ticket)
Security   : sesuai SECURITY_DEFAULTS.md — bcrypt 12, JWT 15m/7d, CORS eksplisit, webhook signature verify
```

---

## ⚠️ ASSUMPTIONS LOG — FINAL

| Item | Status | Sumber |
|------|--------|--------|
| Target pendaftar per event: ~1.000 | CONFIRMED | user |
| Timeline: 10 hari (2 sprint × 5 hari) | CONFIRMED | user |
| UI mood/style: Berani/Modern | CONFIRMED | user |
| Stack Preset B (~Rp 75rb-225rb/bulan) | CONFIRMED | user |
| Payment gateway: Midtrans Snap | CONFIRMED | user |
| Alur bayar: form → QRIS/VA | CONFIRMED | user |
| Konfirmasi status: webhook otomatis | CONFIRMED | user |
| Role admin: satu role, tanpa restriksi | CONFIRMED | user |
| Harga jasa develop: Rp 750.000 | CONFIRMED | user |
| Data sensitif: sesuai form Fun Run | CONFIRMED | user |
| Enkripsi NIK/kesehatan: standar dulu, P1 tingkatkan | CONFIRMED | user |

**Tidak ada ASSUMED yang belum di-resolve.**
