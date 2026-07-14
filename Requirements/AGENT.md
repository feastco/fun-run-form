# AGENT.md
# Baca file ini sebelum melakukan apapun di project ini.
# Berlaku di seluruh session. Tidak boleh diabaikan.

## FILE MAP
- AGENT.md       → Rules & behavior (ini)
- ARCHITECTURE.md → DB schema, API endpoints, folder structure
- DESIGN.md      → Design system, UI spec per halaman
- TASKS.md       → Sprint aktif & task tracker

Verifikasi semua keputusan kode ke file-file di atas.
Jika tidak ada di sana → STOP, jangan menebak.

---

## SECURITY DEFAULTS
bcrypt          : 12 rounds
Login limit     : 5x / 15 menit / IP
API limit       : 100 req/menit / user
JWT access      : 15 menit
JWT refresh     : 7 hari
HTTPS           : wajib
CORS            : domain eksplisit, bukan *
Auth middleware : semua protected route
Env validation  : saat startup, throw jika tidak ada
No hardcode     : tidak ada secret di kode
ORM only        : tidak ada raw SQL tanpa binding
Log wajib       : login + aksi admin
Log dilarang    : password, token, OTP, kartu, secret
Error message   : generic ("Email atau password salah")

Security headers:
HSTS            : max-age=31536000; includeSubDomains
X-Content-Type  : nosniff
X-Frame-Options : DENY
Referrer-Policy : strict-origin-when-cross-origin

---

## EXECUTION RULES
1.  Tidak ada di ARCHITECTURE.md → STOP, jangan menebak.
2.  Auth/payment/DB/security ambigu → STOP, tanya user.
3.  Maks 3 pertanyaan per pesan.
4.  Output executable. Tidak ada TODO/placeholder.
5.  Naming konsisten sesuai ARCHITECTURE.md.
6.  Context panjang → pakai ID reference.
7.  Output terpotong → lanjut otomatis:
    "LANJUTAN TASK-[ID] Part [X/N]. Dari [posisi]."
8.  Satu task = satu output = satu konfirmasi.
9.  Jangan gabungkan beberapa task dalam satu output.
10. Semua asumsi baru WAJIB ditampilkan ke user sebelum lanjut.

---

## ANTI-HALLUCINATION
DILARANG KERAS:
→ Membuat tabel/endpoint/route/ID baru tanpa ada di ARCHITECTURE.md
→ Mengubah security values tanpa konfirmasi user
→ Menulis kode dengan nilai security berbeda dari SECURITY DEFAULTS
→ Menyembunyikan Senior Flag
→ Berasumsi untuk auth/payment/DB/security
→ Melanjutkan jika ada konflik yang belum resolved

---

## SECURITY VALIDATION
Setiap generate kode auth/DB/API, verifikasi:
[ ] bcrypt 12 rounds
[ ] Login error selalu generic
[ ] CORS tidak menggunakan *
[ ] Tidak ada raw SQL tanpa binding
[ ] Env vars divalidasi startup
[ ] Tidak ada secret hardcoded

Jika ada yang tidak sesuai → STOP + perbaiki dulu.

---

## SENIOR THINKING LAYER
Sebelum setiap output, verifikasi:
1. Apakah ini bisa gagal di production?
2. Apakah ada edge case yang belum ditangani?
3. Apakah ada dependency yang terlewat?
4. Apakah ini over-engineered untuk MVP?
5. Apakah ini menyulitkan perubahan nanti?

Jika ada risiko → wajib tampilkan:
⚠️ SENIOR FLAG: [risiko spesifik] → [rekomendasi konkret]
Tidak boleh generik. Tidak boleh disembunyikan.

---

## AI-RISK LEVELS
🔴 Review manual 100%:
   auth, payment, DB migration, security, env/secrets
   → Setelah generate: "Sudah review 🔴 ini? Ketik 'reviewed' untuk lanjut."

🟡 Review sampel ≥50%:
   API logic, validasi, transformasi data

🟢 Spot check:
   UI stateless, styling, utility

---

## RECOVERY COMMANDS
"jalankan senior thinking layer" → jalankan 5 checklist, tampilkan eksplisit
"stop — [penjelasan]"           → STOP, tampilkan apa yang hendak dilakukan
"format ulang"                  → ulangi output terakhir, tidak ada perubahan konten
"acknowledge rules"             → baca ulang AGENT.md, konfirmasi siap
"handoff"                       → generate HANDOFF SUMMARY sekarang
"hotfix TASK-[ID]"              → jalankan HOTFIX PROTOCOL

---

## GSB-COMPACT (pakai ini jika context panjang)
SECURITY: bcrypt 12|login 5x/15m|API 100/m|JWT 15m/7d
CORS eksplisit|ORM only|env validate startup
no hardcode|log login+admin|error generic
headers: HSTS,nosniff,DENY,strict-origin
RULES: no guess|no new entity tanpa ARCHITECTURE.md
STOP jika auth/payment/DB ambigu|max 3 tanya
no TODO|satu task satu output satu konfirmasi
ANTI-HALLUCINATION: dilarang buat entity baru tanpa ref
SENIOR-FLAG: wajib|tidak generik|ada rekomendasi konkret
ASSUMPTION: tampilkan ke user sebelum lanjut
TRIGGER-COMPACT: >15 pesan|no senior flag|no validasi otomatis
