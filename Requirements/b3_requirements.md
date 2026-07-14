# B3 — REQUIREMENTS

> Satu REQ = satu aksi yang bisa diverifikasi pass/fail.

## REQUIREMENTS TABLE

| ID | FITUR | SUB-FITUR | ATURAN | ROLE | PRI | ALASAN |
|----|-------|-----------|--------|------|-----|--------|
| REQ-001 | Pendaftaran | Lihat Event | User melihat event aktif beserta kategori (5K/10K), harga, dan sisa kuota real-time | User | P0 | Informasi lengkap sebelum pilih kategori |
| REQ-002 | Pendaftaran | Pilih Kategori | User memilih kategori. Kategori nonaktif atau kuota=0 → tombol disabled, tidak bisa dipilih | User | P0 | Cegah pendaftaran ke kategori penuh |
| REQ-003 | Pendaftaran | Form Data | User isi: nama, email, HP, NIK, gender, tempat/tgl lahir, kewarganegaraan, alamat, gol darah, riwayat penyakit, jersey, kontak darurat (nama+HP) | User | P0 | Data wajib untuk event + keselamatan |
| REQ-004 | Pendaftaran | Validasi | Client + server: NIK exactly 16 digit numerik, email format valid, HP 10-15 digit numerik, birth_date >10 tahun lalu, semua required field terisi. Error per-field. | User | P0 | Cegah data invalid masuk DB |
| REQ-005 | Pendaftaran | Cegah Duplikat | Email hanya bisa 1 pendaftaran aktif (pending/paid) per event. Email yang expired/cancelled bisa daftar ulang. | User | P0 | Cegah double booking kuota |
| REQ-006 | Pendaftaran | Cek Kuota | Kuota dicek atomik (fn_reserve_slot dengan row lock). Jika penuh → 409 "Kuota kategori ini sudah penuh". | System | P0 | Race condition saat 150 concurrent |
| REQ-007 | Pembayaran | Inisiasi | Setelah submit form → generate snap_token Midtrans → tampilkan popup Snap. | User | P0 | Flow bayar seamless dari form |
| REQ-008 | Pembayaran | Metode | Midtrans Snap hanya menampilkan QRIS + Virtual Account. Metode lain dinonaktifkan via enabled_payments config. | System | P0 | Sesuai T6: hanya QRIS + VA |
| REQ-009 | Pembayaran | Webhook Verify | Webhook WAJIB verifikasi SHA512(order_id + status_code + gross_amount + server_key) === signature_key. Gagal verify → 401. | System | P0 | Cegah fake webhook |
| REQ-010 | Pembayaran | Konfirmasi | transaction_status=settlement → registration_status=paid + generate qr_code_token. Proses otomatis, zero rekonsiliasi manual. | System | P0 | Metrik sukses utama proyek |
| REQ-011 | Pembayaran | Expired | transaction_status=expire → registration_status=expired + fn_release_slot. Backup: cron setiap 30 menit cek transaksi pending >24 jam. | System | P0 | Kuota tidak terkunci selamanya |
| REQ-012 | Status | Cek Email/RegNo | User input email ATAU nomor registrasi → tampil status pendaftaran. | User | P0 | Flow utama pengecekan |
| REQ-013 | Status | Cek via HP | User yang lupa no. registrasi → cek via nomor HP sebagai fallback. | User | P0 | Edge case T6 |
| REQ-014 | Status | E-Ticket | QR code unik (berisi qr_code_token) hanya tampil jika registration_status=paid. QR scannable, berisi URL verifikasi. | User | P0 | Bukti pendaftaran resmi |
| REQ-015 | Auth | Login Admin | Admin login email+password via Supabase Auth. Harus punya profile role=admin. Session JWT 15 min access / 7 hari refresh. | Admin | P0 | Akses dashboard admin |
| REQ-016 | Admin | List Peserta | Admin lihat semua peserta: paginated (20/halaman), searchable (nama/email/reg_number), filterable (status, kategori). | Admin | P0 | Manajemen peserta |
| REQ-017 | Admin | Detail Peserta | Admin lihat detail peserta termasuk NIK, gol. darah, riwayat penyakit + data transaksi terkait. | Admin | P0 | Data kesehatan untuk panitia medis |
| REQ-018 | Admin | Export CSV | Admin export data peserta ke CSV dengan filter sama seperti list. Max 5.000 rows/export. | Admin | P0 | Koordinasi vendor jersey/medis |
| REQ-019 | Admin | Transaksi | Admin lihat status semua transaksi: paginated, filterable by status. | Admin | P0 | Monitoring keuangan |
| REQ-020 | Admin | Ubah Kuota | Admin ubah kuota per kategori. Kuota baru >= reserved_count. | Admin | P0 | Fleksibilitas panitia |
| REQ-021 | Security | Error Login | Login gagal SELALU tampilkan "Email atau password salah" — tidak bedakan email/password salah. | System | P0 | Cegah user enumeration |
| REQ-022 | Security | Rate Limit | Endpoint auth: 5 request / 15 menit / IP. Endpoint registrasi: 5 request / 15 menit / IP. | System | P0 | Cegah brute force + spam |

---

## FITUR DITOLAK

| FITUR | ALASAN BISNIS | KAPAN? |
|-------|---------------|--------|
| Pendaftaran tim/grup | Alur berbeda: 1 pembayaran multi-peserta, validasi per anggota, split jersey. Kompleksitas tinggi. | P1 — setelah launch stabil, ~Sprint 3 |
| Cicilan/kartu kredit | Nominal Rp 150rb-250rb terlalu kecil untuk cicilan. Biaya MDR kartu kredit ~2.9% makan margin. | Tidak dijadwalkan |
| Notifikasi WhatsApp | WA Business API ~$15/bulan. ROI belum jelas di ~1.000 peserta. Email cukup untuk P0. | P1 — jika budget memungkinkan |
| Enkripsi column-level | pgcrypto column-level menambah kompleksitas query (WHERE on encrypted). Disk-level encryption Supabase sudah aktif. | P1 — sebelum scale >5.000 peserta |

---

## SENIOR VALIDATION B3

- [x] Setiap REQ punya kriteria pass/fail yang jelas (field spesifik, angka threshold, status eksak)
- [x] Tidak ada REQ yang ambigu
- [x] REQ-ID konsisten dengan B2 (setiap API-ID punya min 1 REQ) dan B7 (setiap REQ tercakup dalam task)

---

## MASTER REFERENCES UPDATE

```
REQ IDs: REQ-001, REQ-002, REQ-003, REQ-004, REQ-005, REQ-006, REQ-007, REQ-008, REQ-009, REQ-010, REQ-011, REQ-012, REQ-013, REQ-014, REQ-015, REQ-016, REQ-017, REQ-018, REQ-019, REQ-020, REQ-021, REQ-022
```

┌────────────────────────────────┐
│ RINGKASAN B3                   │
│ Total: 22 | P0: 22 | P1: 0    │
│ Ditolak: 4                     │
└────────────────────────────────┘
