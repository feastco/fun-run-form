# B2 — API ENDPOINTS

> Kontrak API yang tidak perlu diubah saat project berkembang.  
> Versioning: `/api/v1/` | Rate limit: 100 req/menit (global), 5x/15min (auth)

## Standard Response

```json
// Sukses
{ "status": "success", "data": {}, "meta": { "page": 1, "total": 100 } }

// Error
{ "status": "error", "code": 422, "message": "pesan ramah", "errors": [{"field":"x","message":"x"}] }
// errors[] → ISI hanya untuk 422 | KOSONG [] lainnya
```

---

## OVERVIEW

| ID | METHOD | ENDPOINT | AUTH | RINGKASAN | REQ |
|----|--------|----------|------|-----------|-----|
| API-001 | GET | /api/v1/events | public | List event aktif + kategori + kuota | REQ-001, REQ-002 |
| API-002 | POST | /api/v1/registrations | public | Buat pendaftaran + snap token Midtrans | REQ-003–007 |
| API-003 | GET | /api/v1/registrations/status | public | Cek status via email/reg_number/phone | REQ-012–014 |
| API-004 | POST | /api/v1/payments/notification | server | Webhook Midtrans (server-to-server) | REQ-009–011 |
| API-005 | POST | /api/v1/auth/login | public | Login admin | REQ-015, REQ-021, REQ-022 |
| API-006 | POST | /api/v1/auth/logout | admin | Logout admin | REQ-015 |
| API-007 | GET | /api/v1/admin/registrations | admin | List peserta (paginated) | REQ-016 |
| API-008 | GET | /api/v1/admin/registrations/[id] | admin | Detail peserta + data sensitif | REQ-017 |
| API-009 | GET | /api/v1/admin/registrations/export | admin | Export CSV peserta | REQ-018 |
| API-010 | GET | /api/v1/admin/transactions | admin | List transaksi (paginated) | REQ-019 |
| API-011 | PATCH | /api/v1/admin/categories/[id] | admin | Update kuota kategori | REQ-020 |
| API-012 | GET | /api/v1/admin/dashboard | admin | Stats overview | REQ-016 |

---

## DETAIL PER ENDPOINT

### [API-001] GET /api/v1/events

**Auth:** public  
**REQ:** REQ-001, REQ-002

**Request:** none

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "Fun Run 2026",
      "description": "string",
      "event_date": "2026-11-15",
      "location": "Stadion Si Jalak Harupat, Soreang",
      "registration_open_at": "timestamptz",
      "registration_close_at": "timestamptz",
      "is_registration_open": true,
      "categories": [
        {
          "id": "uuid",
          "name": "5K Fun Run",
          "distance_km": 5.0,
          "price": 150000,
          "quota": 500,
          "available_slots": 498,
          "is_active": true
        }
      ]
    }
  ]
}
```

**Errors:** 500 Internal  
**Senior:** `is_registration_open` = computed: `now() BETWEEN registration_open_at AND registration_close_at AND is_active`. `available_slots` = `quota - reserved_count`.

---

### [API-002] POST /api/v1/registrations

**Auth:** public (rate limit: 5x/15min/IP)  
**REQ:** REQ-003, REQ-004, REQ-005, REQ-006, REQ-007

**Request:**
```json
{
  "event_category_id": "uuid (required)",
  "full_name": "string (required, max 255)",
  "email": "string (required, valid email)",
  "phone": "string (required, 10-15 digit)",
  "nik": "string (required, exactly 16 digit)",
  "gender": "string (required, 'male'|'female')",
  "birth_place": "string (required, max 255)",
  "birth_date": "string (required, YYYY-MM-DD, harus >10 tahun lalu)",
  "nationality": "string (optional, default 'WNI')",
  "address": "string (required, min 10 char)",
  "blood_type": "string (optional, 'A'|'B'|'AB'|'O')",
  "medical_history": "string (optional, max 1000)",
  "jersey_size": "string (required, 'S'|'M'|'L'|'XL'|'XXL')",
  "emergency_contact_name": "string (required, max 255)",
  "emergency_contact_phone": "string (required, 10-15 digit)"
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "registration_id": "uuid",
    "registration_number": "BR2026-0001",
    "snap_token": "string",
    "snap_redirect_url": "https://app.midtrans.com/snap/..."
  }
}
```

**Errors:**
| Code | Kondisi |
|------|---------|
| 400 | Validasi field gagal (errors[] berisi detail per field) |
| 409 | Email sudah terdaftar untuk event ini (status aktif) |
| 409 | Kuota kategori penuh |
| 422 | Kategori tidak ditemukan atau tidak aktif |
| 500 | Gagal membuat transaksi Midtrans |

**Senior:**
- Flow atomik: `fn_reserve_slot` → create registration → create Midtrans transaction. Jika Midtrans gagal, rollback: delete registration + `fn_release_slot`.
- Idempotency: cek duplikat email SEBELUM reserve slot. Gunakan partial unique index.
- `snap_token` dari Midtrans expired ~24 jam. Frontend harus handle re-request jika user kembali ke halaman.

---

### [API-003] GET /api/v1/registrations/status

**Auth:** public (rate limit: 10x/15min/IP)  
**REQ:** REQ-012, REQ-013, REQ-014

**Request (query params, minimal 1 wajib):**
```
?email=budi.santoso@gmail.com
?registration_number=BR2026-0001
?phone=081234567890
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "registration_number": "BR2026-0001",
    "full_name": "Budi Santoso",
    "event_name": "Fun Run 2026",
    "category_name": "5K Fun Run",
    "registration_status": "paid",
    "qr_code_token": "uuid (null jika belum paid)",
    "paid_at": "2026-10-01T10:15:00+07:00"
  }
}
```

**Errors:**
| Code | Kondisi |
|------|---------|
| 400 | Tidak ada query parameter |
| 404 | Pendaftaran tidak ditemukan |

**Senior:** JANGAN expose NIK, data kesehatan, atau alamat di endpoint public ini. Hanya nama, event, status, dan QR token.

---

### [API-004] POST /api/v1/payments/notification

**Auth:** server (Midtrans server-to-server, signature verification)  
**REQ:** REQ-009, REQ-010, REQ-011

**Request (dari Midtrans):**
```json
{
  "transaction_time": "2026-10-01 10:15:00",
  "transaction_status": "settlement",
  "transaction_id": "midtrans-txn-id",
  "status_code": "200",
  "signature_key": "sha512-hash",
  "payment_type": "qris",
  "order_id": "EVT-BR2026-0001-1731600000",
  "gross_amount": "150000.00",
  "fraud_status": "accept"
}
```

**Response:** `200 OK` `{ "status": "success" }`

**Errors:**
| Code | Kondisi |
|------|---------|
| 401 | Signature verification gagal |
| 404 | Order ID tidak ditemukan di DB |

**Senior — CRITICAL:**
- WAJIB verifikasi: `SHA512(order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY)` === `signature_key`
- Handler HARUS idempotent — Midtrans bisa kirim webhook berulang kali
- Status mapping:
  - `settlement` → registration `paid` + generate `qr_code_token` (uuid baru)
  - `expire` → registration `expired` + `fn_release_slot`
  - `cancel`/`deny` → registration `cancelled` + `fn_release_slot`
  - `pending` → no-op (sudah default)
- Simpan seluruh payload ke `raw_notification` (jsonb) untuk audit trail
- Gunakan Supabase **service_role key** (bypass RLS)

---

### [API-005] POST /api/v1/auth/login

**Auth:** public (rate limit: 5x/15min/IP — REQ-022)  
**REQ:** REQ-015, REQ-021, REQ-022

**Request:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": { "id": "uuid", "email": "admin@bedasrun.id", "full_name": "Admin Fun Run", "role": "admin" },
    "session": { "access_token": "jwt", "refresh_token": "string", "expires_at": 1731600000 }
  }
}
```

**Errors:**
| Code | Kondisi |
|------|---------|
| 401 | "Email atau password salah" — SELALU generic, REQ-021 |
| 429 | Rate limit exceeded |

**Senior:** Setelah Supabase Auth sukses, WAJIB cek profile `role='admin'`. Jika user bukan admin, return 401 generik yang sama.

---

### [API-006] POST /api/v1/auth/logout

**Auth:** admin  
**REQ:** REQ-015

**Request:** none (session dari cookie/header)  
**Response:** `{ "status": "success" }`  
**Errors:** 401 Tidak ada session aktif

---

### [API-007] GET /api/v1/admin/registrations

**Auth:** admin  
**REQ:** REQ-016

**Request (query):**
```
?page=1 &limit=20 (max 100)
&status=paid (filter: pending_payment|paid|cancelled|expired)
&category_id=uuid
&search=string (search nama/email/registration_number)
```

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "registration_number": "BR2026-0001",
      "full_name": "Budi Santoso",
      "email": "budi.santoso@gmail.com",
      "phone": "081234567890",
      "category_name": "5K Fun Run",
      "registration_status": "paid",
      "created_at": "timestamptz"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 100, "total_pages": 5 }
}
```

**Errors:** 401 Unauthorized  
**Senior:** List view TIDAK expose NIK/data kesehatan. Hanya tampil di detail (API-008).

---

### [API-008] GET /api/v1/admin/registrations/[id]

**Auth:** admin  
**REQ:** REQ-017

**Request:** id di URL path  
**Response (200):** Full registration record termasuk NIK, blood_type, medical_history + linked transaction data (order_id, amount, payment_type, transaction_status, paid_at)  
**Errors:** 401 | 404

---

### [API-009] GET /api/v1/admin/registrations/export

**Auth:** admin  
**REQ:** REQ-018

**Request (query):** sama dengan API-007 (filter by status, category, search)  
**Response:** File CSV download (`Content-Type: text/csv`, `Content-Disposition: attachment; filename="peserta-export-2026-10-01.csv"`)  
**Errors:** 401 Unauthorized  
**Senior:** Max 5.000 rows per export. Header CSV: No,Registration Number,Nama,Email,HP,NIK,Gender,Tempat Lahir,Tanggal Lahir,Alamat,Gol Darah,Riwayat Penyakit,Jersey,Status,Tanggal Daftar

---

### [API-010] GET /api/v1/admin/transactions

**Auth:** admin  
**REQ:** REQ-019

**Request (query):** `?page=1 &limit=20 &status=settlement|pending|expire`  
**Response (200):** Paginated list of transactions (order_id, registration_number, full_name, amount, payment_type, transaction_status, paid_at, created_at)  
**Errors:** 401 Unauthorized

---

### [API-011] PATCH /api/v1/admin/categories/[id]

**Auth:** admin  
**REQ:** REQ-020

**Request:**
```json
{ "quota": 600 }
```

**Response (200):**
```json
{
  "status": "success",
  "data": { "id": "uuid", "name": "5K Fun Run", "quota": 600, "reserved_count": 450, "available_slots": 150 }
}
```

**Errors:**
| Code | Kondisi |
|------|---------|
| 400 | `quota` < `reserved_count` saat ini |
| 401 | Unauthorized |
| 404 | Category not found |

---

### [API-012] GET /api/v1/admin/dashboard

**Auth:** admin  
**REQ:** REQ-016

**Request (query):** `?event_id=uuid` (optional, default: event aktif terbaru)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "total_registrations": 450,
    "total_paid": 380,
    "total_pending": 50,
    "total_expired": 20,
    "total_revenue": 62500000,
    "categories": [
      { "name": "5K Fun Run", "quota": 500, "reserved_count": 300, "paid_count": 260 },
      { "name": "10K Competitive", "quota": 500, "reserved_count": 150, "paid_count": 120 }
    ],
    "recent_registrations": [
      { "registration_number": "BR2026-0450", "full_name": "Rina Marlina", "category_name": "5K Fun Run", "registration_status": "paid", "created_at": "timestamptz" }
    ]
  }
}
```

**Errors:** 401 Unauthorized

---

## SENIOR API CHECKLIST

- [x] Semua list endpoint ada pagination (API-007, API-010)
- [x] Semua write endpoint ada validasi input (API-002, API-005, API-011)
- [x] Tidak ada endpoint expose data sensitif ke public (NIK/kesehatan hanya di API-008 admin)
- [x] Rate limit di endpoint auth (API-005: 5x/15min/IP)
- [x] Semua ID tercatat di MASTER REFERENCES

## ⚠️ SENIOR FLAGS

> **⚠️ SENIOR FLAG: Midtrans Snap token re-generation**  
> Jika user meninggalkan halaman bayar lalu kembali, `snap_token` mungkin sudah expired. Frontend harus detect ini dan hit API-002 ulang HANYA jika status masih `pending_payment`.  
> → **Rekomendasi:** Simpan `snap_token` di response API-002. Frontend check: jika sudah ada registration dengan status `pending_payment` untuk email ini, return existing snap_token (jika masih valid) atau generate baru.

> **⚠️ SENIOR FLAG: Webhook idempotency**  
> Midtrans bisa kirim webhook berkali-kali untuk transaksi yang sama. Handler di API-004 HARUS cek status current di DB sebelum update. Jika sudah `paid`, jangan proses ulang.

---

## MASTER REFERENCES UPDATE

```
API IDs: API-001, API-002, API-003, API-004, API-005, API-006, API-007, API-008, API-009, API-010, API-011, API-012
```

┌────────────────────────────────┐
│ RINGKASAN B2                   │
│ Total : 12 | P0: 12            │
│ Public: 4 | Admin: 7 | Server:1│
│ Senior Flag: 2 (snap re-gen,  │
│   webhook idempotency)         │
└────────────────────────────────┘
