'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registrationSchema, RegistrationFormInput } from '@/lib/validations/registration'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

interface RegistrationFormProps {
  categories: {
    id: string
    name: string
    price: number
    availableSlots: number
  }[]
  defaultCategoryId?: string
}

export function RegistrationForm({ categories, defaultCategoryId }: RegistrationFormProps) {
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      event_category_id: defaultCategoryId || '',
      nationality: 'WNI',
      blood_type: '',
      medical_history: '',
    },
  })

  const onSubmit = async (data: RegistrationFormInput) => {
    setIsLoading(true)
    setErrorMsg('')

    try {
      const response = await fetch('/api/v1/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const resJson = await response.json()

      if (!response.ok) {
        throw new Error(resJson.message || 'Pendaftaran gagal dikirim. Silakan cek data Anda.')
      }

      if (resJson.status === 'success' && resJson.data.snap_token) {
        const snapToken = resJson.data.snap_token
        const regNum = resJson.data.registration_number
        
        // Trigger Snap popup if script is loaded
        const win = window as unknown as { snap?: { pay: (token: string, options: Record<string, unknown>) => void } }
        if (win.snap) {
          win.snap.pay(snapToken, {
            onSuccess: () => {
              window.location.href = `/status?reg=${regNum}`
            },
            onPending: () => {
              window.location.href = `/status?reg=${regNum}`
            },
            onError: () => {
              setErrorMsg('Pembayaran gagal dilakukan. Coba panggil ulang via portal status.')
            },
            onClose: () => {
              window.location.href = `/status?reg=${regNum}`
            }
          })
        } else {
          // Fallback to Midtrans Snap redirect url
          window.location.href = (resJson.data.snap_redirect_url as string) || `/status?reg=${regNum}`
        }
      } else {
        throw new Error('Gagal mendapatkan token pembayaran.')
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses pendaftaran.'
      setErrorMsg(errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const categoryOptions = [
    { value: '', label: '-- Pilih Kategori Lari --' },
    ...categories.map((cat) => ({
      value: cat.id,
      label: `${cat.name} (${formatCurrency(cat.price)}) - Sisa: ${cat.availableSlots} Slot`,
    })),
  ]

  const genderOptions = [
    { value: '', label: '-- Pilih Jenis Kelamin --' },
    { value: 'male', label: 'Laki-laki' },
    { value: 'female', label: 'Perempuan' },
  ]

  const bloodTypeOptions = [
    { value: '', label: '-- Pilih Golongan Darah (Opsional) --' },
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'AB', label: 'AB' },
    { value: 'O', label: 'O' },
  ]

  const jerseyOptions = [
    { value: '', label: '-- Pilih Ukuran Jersey --' },
    { value: 'S', label: 'S' },
    { value: 'M', label: 'M' },
    { value: 'L', label: 'L' },
    { value: 'XL', label: 'XL' },
    { value: 'XXL', label: 'XXL' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {errorMsg && (
        <div className="bg-danger/10 border border-danger text-danger p-4 rounded-default text-[14px]">
          {errorMsg}
        </div>
      )}

      {/* Section 1: Kategori Lari */}
      <div>
        <h3 className="text-[18px] font-bold text-text-primary mb-4 pb-2 border-b border-[#E5E7EB]">
          Kategori Event
        </h3>
        <Select
          id="event_category_id"
          label="Pilih Kategori Lari"
          options={categoryOptions}
          error={errors.event_category_id?.message}
          {...register('event_category_id')}
        />
      </div>

      {/* Section 2: Data Diri */}
      <div>
        <h3 className="text-[18px] font-bold text-text-primary mb-4 pb-2 border-b border-[#E5E7EB]">
          Data Diri Peserta
        </h3>
        
        <Input
          id="full_name"
          label="Nama Lengkap (Sesuai KTP)"
          placeholder="Masukkan nama lengkap Anda"
          error={errors.full_name?.message}
          {...register('full_name')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6">
          <Input
            id="email"
            type="email"
            label="Alamat Email"
            placeholder="contoh@domain.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            id="phone"
            type="tel"
            label="Nomor HP / WhatsApp"
            placeholder="0812xxxxxxxx"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6">
          <Input
            id="nik"
            label="Nomor Induk Kependudukan (NIK)"
            placeholder="16 digit angka KTP"
            maxLength={16}
            error={errors.nik?.message}
            {...register('nik')}
          />
          <Select
            id="gender"
            label="Jenis Kelamin"
            options={genderOptions}
            error={errors.gender?.message}
            {...register('gender')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6">
          <Input
            id="birth_place"
            label="Tempat Lahir"
            placeholder="Kota kelahiran"
            error={errors.birth_place?.message}
            {...register('birth_place')}
          />
          <Input
            id="birth_date"
            type="date"
            label="Tanggal Lahir"
            error={errors.birth_date?.message}
            {...register('birth_date')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6">
          <Input
            id="nationality"
            label="Kewarganegaraan"
            placeholder="WNI / WNA"
            error={errors.nationality?.message}
            {...register('nationality')}
          />
          <Select
            id="blood_type"
            label="Golongan Darah"
            options={bloodTypeOptions}
            error={errors.blood_type?.message}
            {...register('blood_type')}
          />
        </div>

        <Select
          id="jersey_size"
          label="Ukuran Jersey"
          options={jerseyOptions}
          error={errors.jersey_size?.message}
          {...register('jersey_size')}
        />

        <Input
          id="address"
          label="Alamat Lengkap (Sesuai KTP)"
          placeholder="Nama jalan, RT/RW, Kecamatan, Kota/Kabupaten"
          error={errors.address?.message}
          {...register('address')}
        />
      </div>

      {/* Section 3: Riwayat Medis */}
      <div>
        <h3 className="text-[18px] font-bold text-text-primary mb-4 pb-2 border-b border-[#E5E7EB]">
          Riwayat Kesehatan
        </h3>
        <Input
          id="medical_history"
          label="Riwayat Penyakit (Kosongkan jika tidak ada)"
          placeholder="Asma, Jantung, Hipertensi, alergi obat, dll."
          error={errors.medical_history?.message}
          {...register('medical_history')}
        />
      </div>

      {/* Section 4: Kontak Darurat */}
      <div>
        <h3 className="text-[18px] font-bold text-text-primary mb-4 pb-2 border-b border-[#E5E7EB]">
          Kontak Darurat (Wajib Diisi)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6">
          <Input
            id="emergency_contact_name"
            label="Nama Hubungan Kontak Darurat"
            placeholder="Nama pasangan / orang tua / saudara"
            error={errors.emergency_contact_name?.message}
            {...register('emergency_contact_name')}
          />
          <Input
            id="emergency_contact_phone"
            type="tel"
            label="Nomor HP Kontak Darurat"
            placeholder="0812xxxxxxxx"
            error={errors.emergency_contact_phone?.message}
            {...register('emergency_contact_phone')}
          />
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" variant="primary" className="w-full h-[48px]" isLoading={isLoading}>
          Kirim Pendaftaran & Bayar
        </Button>
      </div>
    </form>
  )
}
