# SECURITY_DEFAULTS.md
# Satu-satunya sumber kebenaran untuk semua nilai security.
# Berlaku untuk Phase 1, Phase 2, Phase 3.
# Jangan ubah nilai ini tanpa konfirmasi eksplisit user
# dan catatan AMENDMENT di TASKS.md.

---

## AUTH & SESSION
bcrypt          : 12 rounds (bukan 10, bukan 8)
Login limit     : 5x / 15 menit / IP
API limit       : 100 req/menit / user
JWT access      : 15 menit
JWT refresh     : 7 hari
Session         : 7 hari

## TRANSPORT & CORS
HTTPS           : wajib — tidak ada exception
CORS            : domain eksplisit, BUKAN *
                  contoh: "https://myapp.com"
                  bukan: "*" atau "http://"

## MIDDLEWARE & DATA
Auth middleware : semua protected route — tanpa exception
Env validation  : throw error saat startup jika tidak ada
                  pesan: "Missing required env var: [NAMA]"
No hardcode     : tidak ada secret di kode — pernah
ORM only        : tidak ada raw SQL tanpa parameterized binding

## LOGGING
Log WAJIB       : login attempt (sukses + gagal)
                  semua aksi admin
                  perubahan data sensitif
Log DILARANG    : password (plaintext maupun hash)
                  token (JWT, API key, OTP)
                  data kartu pembayaran
                  secret / credentials apapun

## ERROR MESSAGES
Auth error      : selalu "Email atau password salah"
                  DILARANG: "Email tidak ditemukan"
                  DILARANG: "Password salah"
Generic error   : jangan expose stack trace ke client
                  jangan expose nama tabel/kolom DB

## SECURITY HEADERS
HSTS            : max-age=31536000; includeSubDomains
X-Content-Type  : nosniff
X-Frame-Options : DENY
Referrer-Policy : strict-origin-when-cross-origin

## PERFORMANCE DEFAULTS
Concurrent      : 50 normal / 150 peak
API simple      : <300ms
API complex     : <800ms
LCP             : <2.5s
Uptime          : 99.5%
Backup          : harian, retensi 30 hari
RTO             : 4 jam
RPO             : 24 jam
Data retention  : 2 tahun

## CHECKLIST VALIDASI
Jalankan setiap kali generate kode auth/DB/API:

[ ] bcrypt 12 rounds — bukan 10, bukan 8
[ ] Login error selalu generic — tidak spesifik
[ ] CORS tidak menggunakan * — domain eksplisit
[ ] Tidak ada raw SQL tanpa binding
[ ] Env vars divalidasi saat startup
[ ] Tidak ada secret hardcoded di kode
[ ] Auth middleware terpasang di semua protected route
[ ] Log tidak mengandung password/token/secret

Jika ada yang tidak sesuai → STOP + perbaiki dulu.

## NILAI YANG TIDAK BOLEH DIASUMSIKAN
(selalu tanya user — tidak ada default)

→ Pilihan auth system (NextAuth / Supabase / custom JWT)
→ Pilihan payment gateway (Midtrans / Xendit / dll)
→ Struktur tabel untuk data sensitif (kesehatan, keuangan)
→ Compliance requirement (HIPAA, PCI-DSS, UU PDP)
→ Budget dan timeline

## GSB-COMPACT SECURITY
(pakai saat context panjang)

SECURITY: bcrypt 12|login 5x/15m|API 100/m|JWT 15m/7d
CORS eksplisit|ORM only|env validate startup
no hardcode|log login+admin|error generic
headers: HSTS,nosniff,DENY,strict-origin
no asumsi: auth|payment|DB-sensitif|compliance|budget
