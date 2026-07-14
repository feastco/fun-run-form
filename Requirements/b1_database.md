# B1 — DATABASE SCHEMA

> Sistem Pendaftaran & Pembayaran Event Lari  
> Stack: Supabase (PostgreSQL)  
> Senior insight: Desain seolah data akan 100× dalam 1 tahun. Schema buruk di awal = migration hell nanti.

---

## Tabel 1: `events`

**Tujuan:** Menyimpan data event lari. Satu record = satu event (misal Fun Run 2026).

| KOLOM | TIPE | CONSTRAINT | DEFAULT | KETERANGAN |
|-------|------|-----------|---------|------------|
| id | uuid | PK | `gen_random_uuid()` | ID unik event |
| name | varchar(255) | NOT NULL | — | Nama event, misal "Fun Run 2026" |
| description | text | — | — | Deskripsi event |
| event_date | date | NOT NULL | — | Tanggal pelaksanaan |
| location | varchar(500) | NOT NULL | — | Lokasi event |
| registration_open_at | timestamptz | NOT NULL | — | Waktu buka pendaftaran |
| registration_close_at | timestamptz | NOT NULL | — | Waktu tutup pendaftaran |
| is_active | boolean | NOT NULL | `true` | Apakah event masih aktif |
| created_at | timestamptz | NOT NULL | `now()` | Timestamp dibuat |
| updated_at | timestamptz | NOT NULL | `now()` | Timestamp terakhir diubah |

**Relasi:** `events` 1→N `event_categories`  
**Index:**
- `idx_events_is_active` pada `(is_active)` — alasan: filter event aktif di landing page
- `idx_events_event_date` pada `(event_date)` — alasan: sort event mendatang

**SEED DATA:**

| name | event_date | location | is_active |
|------|-----------|----------|-----------|
| "Fun Run 2026" | 2026-11-15 | "Stadion Si Jalak Harupat, Soreang, Kab. Bandung" | true |
| "Bandung City Run 2027" | 2027-03-22 | "Gedung Sate, Jl. Diponegoro No.22, Bandung" | true |
| "Garuda Heritage Run 2027" | 2027-06-01 | "Candi Prambanan, Sleman, Yogyakarta" | false |

---

## Tabel 2: `event_categories`

**Tujuan:** Kategori lari per event (5K, 10K) termasuk kuota dan harga.

| KOLOM | TIPE | CONSTRAINT | DEFAULT | KETERANGAN |
|-------|------|-----------|---------|------------|
| id | uuid | PK | `gen_random_uuid()` | ID unik kategori |
| event_id | uuid | FK NOT NULL | — | Referensi ke `events.id` |
| name | varchar(50) | NOT NULL | — | Nama kategori: "5K", "10K" |
| distance_km | numeric(5,2) | NOT NULL | — | Jarak tempuh dalam KM |
| price | integer | NOT NULL | — | Harga registrasi dalam IDR (tanpa desimal) |
| quota | integer | NOT NULL | — | Kuota maksimal peserta |
| reserved_count | integer | NOT NULL | `0` | Jumlah slot terpakai (pending + paid). Diupdate atomik via Postgres function |
| is_active | boolean | NOT NULL | `true` | Kategori masih bisa didaftar |
| created_at | timestamptz | NOT NULL | `now()` | Timestamp dibuat |
| updated_at | timestamptz | NOT NULL | `now()` | Timestamp terakhir diubah |

**Relasi:**
- `event_categories` N→1 `events`
- `event_categories` 1→N `registrations`

**FK:** `event_id` → `events.id`, ON DELETE: **RESTRICT**  
**Index:**
- `idx_event_categories_event_id` pada `(event_id)` — alasan: list kategori per event
- `idx_event_categories_event_active` pada `(event_id, is_active)` — alasan: filter kategori aktif per event

**SEED DATA** (untuk event "Fun Run 2026"):

| name | distance_km | price | quota | reserved_count |
|------|------------|-------|-------|----------------|
| "5K Fun Run" | 5.00 | 150000 | 500 | 2 |
| "10K Competitive" | 10.00 | 250000 | 500 | 1 |

---

## Tabel 3: `registrations`

**Tujuan:** Data pendaftaran peserta. Satu record = satu peserta mendaftar ke satu kategori event. Berisi semua field form sesuai format Fun Run.

| KOLOM | TIPE | CONSTRAINT | DEFAULT | KETERANGAN |
|-------|------|-----------|---------|------------|
| id | uuid | PK | `gen_random_uuid()` | ID unik registrasi |
| registration_number | varchar(20) | UNIQUE NOT NULL | — | Nomor registrasi, format: `BR2026-0001` |
| event_id | uuid | FK NOT NULL | — | Denormalisasi dari event_categories untuk query & unique constraint |
| event_category_id | uuid | FK NOT NULL | — | Kategori yang dipilih |
| full_name | varchar(255) | NOT NULL | — | Nama lengkap sesuai KTP |
| email | varchar(255) | NOT NULL | — | Email peserta |
| phone | varchar(20) | NOT NULL | — | Nomor HP peserta |
| nik | varchar(16) | NOT NULL | — | Nomor Induk Kependudukan (16 digit) |
| gender | varchar(10) | NOT NULL | — | `'male'` / `'female'` |
| birth_place | varchar(255) | NOT NULL | — | Tempat lahir |
| birth_date | date | NOT NULL | — | Tanggal lahir |
| nationality | varchar(50) | NOT NULL | `'WNI'` | Kewarganegaraan |
| address | text | NOT NULL | — | Alamat lengkap |
| blood_type | varchar(5) | — | — | Golongan darah: A / B / AB / O |
| medical_history | text | — | — | Riwayat penyakit (opsional) |
| jersey_size | varchar(5) | NOT NULL | — | Ukuran jersey: S / M / L / XL / XXL |
| emergency_contact_name | varchar(255) | NOT NULL | — | Nama kontak darurat |
| emergency_contact_phone | varchar(20) | NOT NULL | — | Nomor HP kontak darurat |
| registration_status | varchar(20) | NOT NULL | `'pending_payment'` | Status: `pending_payment` / `paid` / `cancelled` / `expired` |
| qr_code_token | uuid | UNIQUE | — | Token unik untuk QR code e-ticket. Di-generate saat status menjadi `paid` |
| created_at | timestamptz | NOT NULL | `now()` | Timestamp dibuat |
| updated_at | timestamptz | NOT NULL | `now()` | Timestamp terakhir diubah |

**Relasi:**
- `registrations` N→1 `events`
- `registrations` N→1 `event_categories`
- `registrations` 1→1 `transactions`

**FK:**
- `event_id` → `events.id`, ON DELETE: **RESTRICT**
- `event_category_id` → `event_categories.id`, ON DELETE: **RESTRICT**

**Index:**
- `idx_registrations_email_event_active` pada `(email, event_id)` WHERE `registration_status NOT IN ('cancelled', 'expired')` — alasan: **partial unique index** untuk cegah duplikat email aktif per event
- `idx_registrations_registration_number` — sudah UNIQUE constraint
- `idx_registrations_phone` pada `(phone)` — alasan: lookup via nomor HP (edge case user lupa no. registrasi)
- `idx_registrations_event_category_id` pada `(event_category_id)` — alasan: list peserta per kategori
- `idx_registrations_status` pada `(registration_status)` — alasan: filter by status di admin dashboard
- `idx_registrations_qr_code_token` — sudah UNIQUE constraint

**SEED DATA:**

| registration_number | full_name | email | phone | nik | gender | birth_place | birth_date | nationality | blood_type | jersey_size | registration_status |
|---------------------|-----------|-------|-------|-----|--------|-------------|------------|-------------|------------|-------------|---------------------|
| "BR2026-0001" | "Budi Santoso" | "budi.santoso@gmail.com" | "081234567890" | "3273012505900001" | male | "Bandung" | 1990-05-25 | WNI | O | L | paid |
| "BR2026-0002" | "Siti Rahayu Putri" | "siti.rahayu@yahoo.co.id" | "085678901234" | "3273024612950002" | female | "Surabaya" | 1995-12-06 | WNI | M | pending_payment |
| "BR2026-0003" | "Andi Wijaya Kusuma" | "andi.wk@outlook.com" | "087890123456" | "3273031708880003" | male | "Jakarta" | 1988-08-17 | WNI | XL | paid |

---

## Tabel 4: `transactions`

**Tujuan:** Menyimpan data transaksi pembayaran Midtrans. Satu registration = satu transaction aktif. Raw webhook payload disimpan untuk audit trail.

| KOLOM | TIPE | CONSTRAINT | DEFAULT | KETERANGAN |
|-------|------|-----------|---------|------------|
| id | uuid | PK | `gen_random_uuid()` | ID unik transaksi |
| registration_id | uuid | FK NOT NULL | — | Referensi ke registrasi terkait |
| order_id | varchar(50) | UNIQUE NOT NULL | — | Order ID untuk Midtrans, format: `EVT-BR2026-0001-{timestamp}` |
| amount | integer | NOT NULL | — | Jumlah pembayaran dalam IDR |
| payment_type | varchar(30) | — | — | Jenis pembayaran dari Midtrans: `qris`, `bank_transfer`, `echannel` |
| transaction_status | varchar(20) | NOT NULL | `'pending'` | Status Midtrans: `pending` / `settlement` / `expire` / `cancel` / `deny` |
| midtrans_transaction_id | varchar(100) | — | — | Transaction ID dari Midtrans |
| snap_token | varchar(255) | — | — | Snap token untuk frontend payment popup |
| snap_redirect_url | text | — | — | URL redirect Midtrans Snap |
| paid_at | timestamptz | — | — | Timestamp pembayaran berhasil |
| expired_at | timestamptz | — | — | Timestamp transaksi kadaluarsa |
| raw_notification | jsonb | — | — | Raw JSON dari webhook Midtrans — untuk audit trail |
| created_at | timestamptz | NOT NULL | `now()` | Timestamp dibuat |
| updated_at | timestamptz | NOT NULL | `now()` | Timestamp terakhir diubah |

**Relasi:** `transactions` N→1 `registrations` (praktisnya 1→1 untuk MVP, tapi N→1 agar bisa re-create jika expired)

**FK:** `registration_id` → `registrations.id`, ON DELETE: **RESTRICT**

**Index:**
- `idx_transactions_order_id` — sudah UNIQUE constraint, alasan: **lookup utama dari Midtrans webhook**
- `idx_transactions_registration_id` pada `(registration_id)` — alasan: cari transaksi per registrasi
- `idx_transactions_status` pada `(transaction_status)` — alasan: filter transaksi pending/settlement di admin

**SEED DATA:**

| order_id | registration_id (ref) | amount | payment_type | transaction_status | paid_at |
|----------|----------------------|--------|--------------|-------------------|---------|
| "EVT-BR2026-0001-1731600000" | → BR2026-0001 | 150000 | "qris" | "settlement" | 2026-10-01T10:15:00+07:00 |
| "EVT-BR2026-0002-1731600100" | → BR2026-0002 | 250000 | — | "pending" | — |
| "EVT-BR2026-0003-1731600200" | → BR2026-0003 | 250000 | "bank_transfer" | "settlement" | 2026-10-02T14:30:00+07:00 |

---

## Tabel 5: `profiles`

**Tujuan:** Profil admin yang terhubung ke Supabase Auth (`auth.users`). Hanya role admin untuk MVP.

| KOLOM | TIPE | CONSTRAINT | DEFAULT | KETERANGAN |
|-------|------|-----------|---------|------------|
| id | uuid | PK | — | Sama dengan `auth.users.id` |
| full_name | varchar(255) | NOT NULL | — | Nama lengkap admin |
| role | varchar(20) | NOT NULL | `'admin'` | Role: `admin` (expandable di masa depan) |
| created_at | timestamptz | NOT NULL | `now()` | Timestamp dibuat |
| updated_at | timestamptz | NOT NULL | `now()` | Timestamp terakhir diubah |

**Relasi:** `profiles` 1→1 `auth.users`

**FK:** `id` → `auth.users.id`, ON DELETE: **CASCADE**  
(Jika akun Supabase Auth dihapus, profil ikut terhapus)

**Index:** Tidak perlu tambahan — PK sudah cukup untuk lookup.

**SEED DATA:**

| full_name | role |
|-----------|------|
| "Admin Fun Run" | admin |
| "Rina Koordinator" | admin |
| "Dedi Panitia" | admin |

---

## Postgres Functions (Atomic Operations)

### `fn_reserve_slot(p_category_id uuid)`

**Tujuan:** Increment `reserved_count` secara atomik dengan row-level locking. Cegah race condition saat pendaftaran bersamaan.

```sql
CREATE OR REPLACE FUNCTION fn_reserve_slot(p_category_id uuid)
RETURNS boolean AS $$
DECLARE
  v_quota integer;
  v_reserved integer;
BEGIN
  SELECT quota, reserved_count
  INTO v_quota, v_reserved
  FROM event_categories
  WHERE id = p_category_id
  FOR UPDATE;  -- row-level lock

  IF v_reserved >= v_quota THEN
    RETURN false;  -- kuota penuh
  END IF;

  UPDATE event_categories
  SET reserved_count = reserved_count + 1,
      updated_at = now()
  WHERE id = p_category_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql;
```

### `fn_release_slot(p_category_id uuid)`

**Tujuan:** Decrement `reserved_count` saat pembayaran expired/cancelled.

```sql
CREATE OR REPLACE FUNCTION fn_release_slot(p_category_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE event_categories
  SET reserved_count = GREATEST(reserved_count - 1, 0),
      updated_at = now()
  WHERE id = p_category_id;
END;
$$ LANGUAGE plpgsql;
```

### `fn_generate_registration_number(p_event_prefix varchar)`

**Tujuan:** Generate nomor registrasi sequential per event. Format: `{PREFIX}-{NNNN}`.

```sql
CREATE OR REPLACE FUNCTION fn_generate_registration_number(p_event_id uuid)
RETURNS varchar AS $$
DECLARE
  v_prefix varchar;
  v_count integer;
BEGIN
  -- Get event prefix from name (first 2 chars + year)
  SELECT UPPER(LEFT(REPLACE(name, ' ', ''), 2)) || 
         EXTRACT(YEAR FROM event_date)::varchar
  INTO v_prefix
  FROM events WHERE id = p_event_id;

  -- Count existing registrations for this event
  SELECT COUNT(*) + 1
  INTO v_count
  FROM registrations
  WHERE event_id = p_event_id;

  RETURN v_prefix || '-' || LPAD(v_count::varchar, 4, '0');
END;
$$ LANGUAGE plpgsql;
```

---

## Trigger: Auto-update `updated_at`

```sql
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER trg_events_updated BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_event_categories_updated BEFORE UPDATE ON event_categories
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_registrations_updated BEFORE UPDATE ON registrations
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_transactions_updated BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
```

---

## RLS (Row Level Security) — Supabase

```sql
-- Events: public read, admin write
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events public read" ON events FOR SELECT USING (true);
CREATE POLICY "Events admin write" ON events FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Event Categories: public read, admin write
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories public read" ON event_categories FOR SELECT USING (true);
CREATE POLICY "Categories admin write" ON event_categories FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Registrations: public insert (form submit), admin all, user read own (via email/phone — handled by API)
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Registrations public insert" ON registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Registrations admin all" ON registrations FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Transactions: service role only (webhook + admin)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Transactions admin read" ON transactions FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Profiles: own profile only
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles own read" ON profiles FOR SELECT
  USING (id = auth.uid());
```

> [!IMPORTANT]
> Transaction writes (INSERT/UPDATE) dari webhook Midtrans dilakukan via **Supabase service_role key** di server-side API route, bukan via anon key. RLS tidak berlaku untuk service_role.

---

## SENIOR DATABASE CHECKLIST

- [x] **Bottleneck query?** → `reserved_count` di `event_categories` bisa jadi bottleneck saat banyak pendaftar simultan. **Mitigasi:** `fn_reserve_slot` menggunakan `FOR UPDATE` row-level lock — cukup untuk 150 concurrent.
- [x] **Soft delete?** → Tidak diperlukan. Registrasi dan transaksi menggunakan status changes, data tidak pernah dihapus.
- [x] **Enkripsi at-rest?** → CONFIRMED: standar Supabase (disk-level encryption). Column-level encryption untuk NIK/data kesehatan ditunda ke P1.
- [x] **Index mencakup query tersering?** → Ya. Email lookup, phone lookup, status filter, order_id webhook lookup, semua ter-index.

---

## FK VERIFICATION

| FK | ASAL | KOLOM | TARGET | TYPE | ON DELETE | STATUS |
|----|------|-------|--------|------|-----------|--------|
| FK1 | event_categories | event_id | events.id | N→1 | RESTRICT | ✅ |
| FK2 | registrations | event_id | events.id | N→1 | RESTRICT | ✅ |
| FK3 | registrations | event_category_id | event_categories.id | N→1 | RESTRICT | ✅ |
| FK4 | transactions | registration_id | registrations.id | N→1 | RESTRICT | ✅ |
| FK5 | profiles | id | auth.users.id | 1→1 | CASCADE | ✅ |

┌────────────────────────────────┐
│ FK SUMMARY                     │
│ Total: 5 | Lulus: 5 | ❌ 0     │
│ Status: **LULUS**              │
└────────────────────────────────┘

---

## ⚠️ SENIOR FLAGS

> **⚠️ SENIOR FLAG #1: Race condition kuota**
> Saat peak (150 concurrent), banyak user bisa submit form bersamaan untuk kategori yang sama.
> → **Rekomendasi:** `fn_reserve_slot` dengan `SELECT FOR UPDATE` sudah cukup untuk skala 1.000 pendaftar. Jika scale ke 10.000+, pertimbangkan Redis distributed lock.

> **⚠️ SENIOR FLAG #2: Expired transaction → slot release**
> Jika user tidak bayar dan transaksi expire, slot kuota harus dilepas otomatis.
> → **Rekomendasi:** Andalkan Midtrans webhook `expire` notification untuk trigger `fn_release_slot`. Sebagai backup, buat cron job (Vercel Cron) yang jalan setiap 30 menit untuk cek transaksi pending >24 jam dan release slot-nya.

> **⚠️ SENIOR FLAG #3: `registration_number` generation**
> `fn_generate_registration_number` menggunakan `COUNT(*)` yang bisa non-sequential jika ada delete. Untuk MVP ini acceptable karena registrasi tidak pernah dihapus.
> → **Rekomendasi:** Jika perlu strictly sequential di masa depan, gunakan Postgres SEQUENCE per event.

---

## MASTER REFERENCES UPDATE

```
DB Tables: events, event_categories, registrations, transactions, profiles
DB Functions: fn_reserve_slot, fn_release_slot, fn_generate_registration_number, fn_update_timestamp
```

---

┌─────────────────────────────────────┐
│ RINGKASAN B1                        │
│ Tabel    : 5                        │
│ Function : 4 (3 business + 1 trg)  │
│ Index    : 10 (termasuk UNIQUE)     │
│ FK       : LULUS (5/5)              │
│ RLS      : 6 policies              │
│ Senior Flag: 3 (kuota race,        │
│   expired slot, reg number)         │
└─────────────────────────────────────┘

**Sudah benar? Ketik "ya" / "ulang B1".**
