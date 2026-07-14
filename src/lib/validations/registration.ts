import { z } from 'zod'

export const registrationSchema = z.object({
  event_category_id: z.string().uuid({ message: 'Pilih kategori event yang valid.' }),
  full_name: z.string().min(1, 'Nama lengkap harus diisi.').max(255, 'Nama lengkap terlalu panjang.'),
  email: z.string().min(1, 'Email harus diisi.').email('Format email tidak valid.'),
  phone: z.string()
    .min(1, 'Nomor HP harus diisi.')
    .regex(/^\+?[0-9]{10,15}$/, 'Nomor HP harus 10-15 digit.'),
  nik: z.string()
    .min(1, 'NIK harus diisi.')
    .regex(/^[0-9]{16}$/, 'NIK harus tepat 16 digit angka.'),
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'Jenis kelamin harus diisi.' }),
  }),
  birth_place: z.string().min(1, 'Tempat lahir harus diisi.').max(255, 'Tempat lahir terlalu panjang.'),
  birth_date: z.string()
    .min(1, 'Tanggal lahir harus diisi.')
    .refine((dateStr) => {
      const birthDate = new Date(dateStr)
      if (isNaN(birthDate.getTime())) return false
      const tenYearsAgo = new Date()
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10)
      return birthDate <= tenYearsAgo
    }, { message: 'Peserta harus berusia minimal 10 tahun.' }),
  nationality: z.string().default('WNI'),
  address: z.string().min(10, 'Alamat lengkap minimal 10 karakter.'),
  blood_type: z.enum(['A', 'B', 'AB', 'O']).optional().or(z.literal('')),
  medical_history: z.string().max(1000, 'Riwayat penyakit maksimal 1000 karakter.').optional(),
  jersey_size: z.enum(['S', 'M', 'L', 'XL', 'XXL'], {
    errorMap: () => ({ message: 'Pilih ukuran jersey.' }),
  }),
  emergency_contact_name: z.string().min(1, 'Nama kontak darurat harus diisi.').max(255, 'Nama terlalu panjang.'),
  emergency_contact_phone: z.string()
    .min(1, 'Nomor HP kontak darurat harus diisi.')
    .regex(/^\+?[0-9]{10,15}$/, 'Nomor HP harus 10-15 digit.'),
})

export type RegistrationFormInput = z.infer<typeof registrationSchema>
