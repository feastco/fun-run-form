'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registrationSchema, RegistrationFormInput } from '@/lib/validations/registration'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Combobox } from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

interface Region {
  id: string
  name: string
}

interface RegistrationFormProps {
  categories: {
    id: string
    name: string
    price: number
    availableSlots: number
  }[]
  defaultCategoryId?: string
}

// Section header with icon
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#E5E7EB]">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <h3 className="text-[17px] font-bold text-text-primary">{title}</h3>
    </div>
  )
}

export function RegistrationForm({ categories, defaultCategoryId }: RegistrationFormProps) {
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Address cascade state
  const [provinces, setProvinces] = useState<Region[]>([])
  const [cities, setCities] = useState<Region[]>([])
  const [districts, setDistricts] = useState<Region[]>([])
  const [villages, setVillages] = useState<Region[]>([])

  const [selectedProvinceId, setSelectedProvinceId] = useState('')
  const [selectedCityId, setSelectedCityId] = useState('')
  const [selectedDistrictId, setSelectedDistrictId] = useState('')
  const [selectedVillageId, setSelectedVillageId] = useState('')

  const [loadingCity, setLoadingCity] = useState(false)
  const [loadingDistrict, setLoadingDistrict] = useState(false)
  const [loadingVillage, setLoadingVillage] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegistrationFormInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      event_category_id: defaultCategoryId || '',
      nationality: undefined,
      blood_type: '',
      medical_history: '',
    },
  })

  const watchedNationality = watch('nationality')


  // Load provinces on mount
  useEffect(() => {
    fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
      .then(r => r.json())
      .then((data: Region[]) => setProvinces(data))
      .catch(() => setProvinces([]))
  }, [])

  // Load cities when province changes
  useEffect(() => {
    if (!selectedProvinceId) { setCities([]); setDistricts([]); setVillages([]); return }
    setLoadingCity(true)
    setCities([]); setDistricts([]); setVillages([])
    setSelectedCityId(''); setSelectedDistrictId(''); setSelectedVillageId('')
    setValue('city', ''); setValue('district', ''); setValue('village', '')
    fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProvinceId}.json`)
      .then(r => r.json())
      .then((data: Region[]) => setCities(data))
      .catch(() => setCities([]))
      .finally(() => setLoadingCity(false))
  }, [selectedProvinceId, setValue])

  // Load districts when city changes
  useEffect(() => {
    if (!selectedCityId) { setDistricts([]); setVillages([]); return }
    setLoadingDistrict(true)
    setDistricts([]); setVillages([])
    setSelectedDistrictId(''); setSelectedVillageId('')
    setValue('district', ''); setValue('village', '')
    fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${selectedCityId}.json`)
      .then(r => r.json())
      .then((data: Region[]) => setDistricts(data))
      .catch(() => setDistricts([]))
      .finally(() => setLoadingDistrict(false))
  }, [selectedCityId, setValue])

  // Load villages when district changes
  useEffect(() => {
    if (!selectedDistrictId) { setVillages([]); return }
    setLoadingVillage(true)
    setVillages([])
    setSelectedVillageId('')
    setValue('village', '')
    fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${selectedDistrictId}.json`)
      .then(r => r.json())
      .then((data: Region[]) => setVillages(data))
      .catch(() => setVillages([]))
      .finally(() => setLoadingVillage(false))
  }, [selectedDistrictId, setValue])

  const onSubmit = async (data: RegistrationFormInput) => {
    setIsLoading(true)
    setErrorMsg('')
    try {
      const response = await fetch('/api/v1/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const resJson = await response.json()
      if (!response.ok) throw new Error(resJson.message || 'Pendaftaran gagal dikirim.')
      if (resJson.status === 'success' && resJson.data.snap_token) {
        const snapToken = resJson.data.snap_token
        const regNum = resJson.data.registration_number
        const win = window as unknown as { snap?: { pay: (t: string, o: Record<string, unknown>) => void } }
        if (win.snap) {
          win.snap.pay(snapToken, {
            onSuccess: () => { window.location.href = `/status?reg=${regNum}` },
            onPending: () => { window.location.href = `/status?reg=${regNum}` },
            onError: () => { setErrorMsg('Pembayaran gagal. Coba lagi melalui halaman status.') },
            onClose: () => { window.location.href = `/status?reg=${regNum}` },
          })
        } else {
          window.location.href = (resJson.data.snap_redirect_url as string) || `/status?reg=${regNum}`
        }
      } else {
        throw new Error('Gagal mendapatkan token pembayaran.')
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan.')
    } finally {
      setIsLoading(false)
    }
  }

  // Options
  const categoryOptions = [
    { value: '', label: '-- Pilih Kategori Lari --' },
    ...categories.map(cat => ({
      value: cat.id,
      label: `${cat.name} (${formatCurrency(cat.price)}) — Sisa: ${cat.availableSlots} Slot`,
    })),
  ]

  const genderOptions = [
    { value: '', label: '-- Pilih Jenis Kelamin --' },
    { value: 'male', label: 'Laki-laki' },
    { value: 'female', label: 'Perempuan' },
  ]

  const nationalityOptions = [
    { value: '', label: '-- Pilih --' },
    { value: 'WNI', label: 'WNI (Warga Negara Indonesia)' },
    { value: 'WNA', label: 'WNA (Warga Negara Asing)' },
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
    { value: 'S',   label: 'S  — Lebar: 47cm, Panjang: 66cm' },
    { value: 'M',   label: 'M  — Lebar: 50cm, Panjang: 69cm' },
    { value: 'L',   label: 'L  — Lebar: 53cm, Panjang: 72cm' },
    { value: 'XL',  label: 'XL  — Lebar: 56cm, Panjang: 75cm' },
    { value: 'XXL', label: 'XXL — Lebar: 60cm, Panjang: 78cm' },
    { value: '3XL', label: '3XL — Lebar: 64cm, Panjang: 81cm' },
    { value: '4XL', label: '4XL — Lebar: 68cm, Panjang: 84cm' },
    { value: '5XL', label: '5XL — Lebar: 72cm, Panjang: 87cm' },
  ]

  const provinceOptions = provinces.map(p => ({ value: p.id, label: p.name }))
  const cityOptions = cities.map(c => ({ value: c.id, label: c.name }))
  const districtOptions = districts.map(d => ({ value: d.id, label: d.name }))
  const villageOptions = villages.map(v => ({ value: v.id, label: v.name }))

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (errors) => {
        console.warn('Form validation failed:', errors)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })}
      className="space-y-8"
    >
      {errorMsg && (
        <div className="bg-danger/10 border border-danger text-danger p-4 rounded-default text-[14px]">
          {errorMsg}
        </div>
      )}

      {/* Section 1: Kategori */}
      <div>
        <SectionHeader
          title="Kategori Event"
          icon={
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <Select
          id="event_category_id"
          label="Pilih Kategori Lari"
          required
          options={categoryOptions}
          error={errors.event_category_id?.message}
          {...register('event_category_id')}
        />
      </div>

      {/* Section 2: Data Diri */}
      <div>
        <SectionHeader
          title="Data Diri Peserta"
          icon={
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />

        <Input id="full_name" label="Nama Lengkap (Sesuai KTP)" required placeholder="Masukkan nama lengkap Anda" error={errors.full_name?.message} {...register('full_name')} />

        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6">
          <Input id="email" type="email" label="Alamat Email" required placeholder="contoh@domain.com" error={errors.email?.message} {...register('email')} />
          <Input id="phone" type="tel" label="Nomor HP / WhatsApp" required placeholder="0812xxxxxxxx" error={errors.phone?.message} {...register('phone')} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6">
          <Input id="nik" label="Nomor Induk Kependudukan (NIK)" required placeholder="16 digit angka KTP" maxLength={16} error={errors.nik?.message} {...register('nik')} />
          <Select id="gender" label="Jenis Kelamin" required options={genderOptions} error={errors.gender?.message} {...register('gender')} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6">
          <Input id="birth_place" label="Tempat Lahir" required placeholder="Kota kelahiran" error={errors.birth_place?.message} {...register('birth_place')} />
          <Input id="birth_date" type="date" label="Tanggal Lahir" required error={errors.birth_date?.message} {...register('birth_date')} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6">
          <Select id="nationality" label="Kewarganegaraan" required options={nationalityOptions} error={errors.nationality?.message} {...register('nationality')} />
          <Select id="blood_type" label="Golongan Darah" options={bloodTypeOptions} error={errors.blood_type?.message} {...register('blood_type')} />
        </div>

        <Select id="jersey_size" label="Ukuran Jersey" required options={jerseyOptions} error={errors.jersey_size?.message} {...register('jersey_size')} />
        <p className="text-xs text-text-secondary -mt-3 mb-4 pl-1">* Ukuran lebar dan panjang jersey sudah tertera di setiap pilihan di atas.</p>
      </div>

      {/* Section 3: Alamat */}
      <div>
        <SectionHeader
          title="Alamat Domisili"
          icon={
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />

        {watchedNationality === 'WNI' && (
          <>
            <Combobox
              id="province"
              label="Provinsi"
              required
              options={provinceOptions}
              value={selectedProvinceId}
              placeholder="Ketik nama provinsi..."
              error={errors.province?.message}
              onChange={(id, name) => {
                setSelectedProvinceId(id)
                setValue('province', name)
              }}
            />

            <Combobox
              id="city"
              label="Kota / Kabupaten"
              required
              options={cityOptions}
              value={selectedCityId}
              placeholder={loadingCity ? 'Memuat...' : 'Ketik nama kota/kabupaten...'}
              disabled={!selectedProvinceId || loadingCity}
              error={errors.city?.message}
              onChange={(id, name) => {
                setSelectedCityId(id)
                setValue('city', name)
              }}
            />

            <Combobox
              id="district"
              label="Kecamatan"
              required
              options={districtOptions}
              value={selectedDistrictId}
              placeholder={loadingDistrict ? 'Memuat...' : 'Ketik nama kecamatan...'}
              disabled={!selectedCityId || loadingDistrict}
              error={errors.district?.message}
              onChange={(id, name) => {
                setSelectedDistrictId(id)
                setValue('district', name)
              }}
            />

            <Combobox
              id="village"
              label="Desa / Kelurahan"
              required
              options={villageOptions}
              value={selectedVillageId}
              placeholder={loadingVillage ? 'Memuat...' : 'Ketik nama desa/kelurahan...'}
              disabled={!selectedDistrictId || loadingVillage}
              error={errors.village?.message}
              onChange={(id, name) => {
                setSelectedVillageId(id)
                setValue('village', name)
              }}
            />
          </>
        )}

        <Input id="address" label="Alamat Lengkap" required placeholder="Nama jalan, RT/RW, nomor rumah" error={errors.address?.message} {...register('address')} />
      </div>

      {/* Section 4: Kesehatan */}
      <div>
        <SectionHeader
          title="Riwayat Kesehatan"
          icon={
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }
        />
        <Input id="medical_history" label="Riwayat Penyakit (Kosongkan jika tidak ada)" placeholder="Contoh: Asma, Hipertensi, alergi obat" error={errors.medical_history?.message} {...register('medical_history')} />
      </div>

      {/* Section 5: Kontak Darurat */}
      <div>
        <SectionHeader
          title="Kontak Darurat"
          icon={
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6">
          <Input id="emergency_contact_name" label="Nama Kontak Darurat" placeholder="Nama pasangan / orang tua / saudara" error={errors.emergency_contact_name?.message} {...register('emergency_contact_name')} />
          <Input id="emergency_contact_phone" type="tel" label="Nomor HP Kontak Darurat" placeholder="0812xxxxxxxx" error={errors.emergency_contact_phone?.message} {...register('emergency_contact_phone')} />
        </div>
      </div>

      {/* Section 6: Peraturan & Ketentuan */}
      <div>
        <SectionHeader
          title="Peraturan & Ketentuan"
          icon={
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        />

        {/* Important Notice */}
        <div className="mb-4 p-4 bg-amber-50 border border-amber-300 rounded-lg flex gap-3">
          <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-[12px] text-amber-700 leading-relaxed">
            <strong className="text-amber-800">Informasi Penting:</strong>{' '}
            Dengan mendaftar dan mengambil racepack, peserta dianggap telah membaca, memahami, dan menyetujui seluruh peraturan. Pelanggaran dapat berakibat diskualifikasi tanpa pengembalian biaya.
          </p>
        </div>

        {/* Accordion sections */}
        {[
          {
            iconKey: 'pendaftaran',
            title: 'Peraturan Pendaftaran',
            items: [
              'Pendaftaran dilakukan melalui website resmi Fun Run 2026.',
              'Data pribadi wajib diisi dengan benar sesuai identitas resmi (KTP/SIM/Paspor).',
              'Pendaftaran bersifat non-transferable dan non-refundable.',
              'Biaya pendaftaran termasuk racepack (jersey, nomor BIB, dan souvenir).',
              'Konfirmasi pendaftaran dikirim melalui email setelah pembayaran berhasil.',
              'Pendaftaran ditutup jika kuota penuh, meskipun belum mencapai batas waktu.',
            ],
          },
          {
            iconKey: 'peserta',
            title: 'Ketentuan Peserta',
            items: [
              'Peserta hadir 1 jam sebelum waktu start.',
              'Dianjurkan mengenakan jersey yang disediakan panitia.',
              'Wajib memakai nomor BIB sendiri, terpasang di depan dada.',
              'Dilarang memakai pakaian bermuatan SARA atau politik.',
              'Dilarang membawa minuman keras, senjata tajam, atau benda berbahaya.',
              'Dilarang merokok di area venue.',
            ],
          },
          {
            iconKey: 'racepack',
            title: 'Pengambilan Racepack',
            items: [
              'Racepack meliputi jersey, nomor BIB, dan material lainnya.',
              'Nomor BIB ditentukan oleh panitia; tidak dapat dipindahtangankan.',
              'Peserta tanpa BIB tidak diizinkan masuk venue.',
              'Wajib membawa email konfirmasi dan identitas resmi saat pengambilan.',
              'Dapat diwakilkan dengan surat kuasa bermaterai.',
              'Pengambilan di luar jadwal tidak dilayani.',
            ],
          },
          {
            iconKey: 'jadwal',
            title: 'Jadwal Pengambilan Racepack',
            items: [
              'Kamis, 03 September 2026 · 09.00–15.00 WIB — Stadion Si Jalak Harupat',
              'Jumat, 04 September 2026 · 09.00–15.00 WIB — Stadion Si Jalak Harupat',
              'Sabtu, 05 September 2026 · 09.00–18.00 WIB — Stadion Si Jalak Harupat',
            ],
          },
          {
            iconKey: 'persyaratan',
            title: 'Persyaratan Peserta',
            items: [
              'Terbuka untuk WNI dan WNA.',
              'Wajib memiliki identitas resmi (KTP/SIM/Paspor).',
              'Kategori dipilih sesuai ketentuan yang berlaku.',
              'Pendaftaran tidak dapat dialihnamakan setelah konfirmasi.',
              'Pembatalan pendaftaran tidak dapat disertai pengembalian dana.',
            ],
          },
          {
            iconKey: 'pemenang',
            title: 'Ketentuan Pemenang',
            items: [
              'Pemenang ditentukan berdasarkan catatan waktu terbaik per kategori.',
              'Wajib menggunakan BIB asli sesuai data pendaftaran.',
              'Kecurangan yang terbukti mengakibatkan diskualifikasi.',
              'Hadiah tidak dapat diwakilkan; wajib menunjukkan identitas asli.',
              'Keputusan juri bersifat final dan mengikat.',
              'Pajak hadiah ditanggung sepenuhnya oleh pemenang.',
              'WNA boleh berpartisipasi, namun hak podium kategori Nasional hanya untuk WNI.',
            ],
          },
        ].map((section) => {
          const accordionIcons: Record<string, React.ReactNode> = {
            pendaftaran: (
              <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
            peserta: (
              <svg className="w-4 h-4 text-text-secondary" fill="currentColor" viewBox="0 0 512 512">
                <path d="M272 96c26.5 0 48-21.5 48-48S298.5 0 272 0s-48 21.5-48 48 21.5 48 48 48zm113.7 121.9l-47.8-63.7c-8.3-11.1-21-18.2-34.9-18.2H203c-23.4 0-42.5 19.1-42.5 42.5v119.8c0 14 11.4 25.5 25.5 25.5s25.5-11.4 25.5-25.5v-83.3l21-8.4v132.3l-55.6 111.2c-5.7 11.3-1.1 25.1 10.2 30.8 11.3 5.7 25.1 1.1 30.8-10.2l56-112c3.4-6.8 4-14.7 1.7-22L256 256v-65.4l24 32v113.2c0 10 5.8 19 14.8 23.2l128 60c13 6.1 28.3.3 34.4-12.7s.3-28.3-12.7-34.4L320 312v-84.8l47.8 63.7c12 16 35.1 19.2 51.1 7.2s19.2-35.1 7.2-51.1z" />
              </svg>
            ),
            racepack: (
              <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            ),
            jadwal: (
              <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            ),
            persyaratan: (
              <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            pemenang: (
              <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm-2 4h4M9 14h6" />
              </svg>
            ),
          }

          return (
            <details key={section.title} className="group mb-2 border border-gray-200 rounded-lg overflow-hidden">
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer bg-white hover:bg-gray-50 transition-colors select-none">
                <span className="font-semibold text-[14px] text-text-primary flex items-center gap-2">
                  <span>{accordionIcons[section.iconKey]}</span> {section.title}
                </span>
                <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-100">
                <ul className="space-y-1.5">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] text-text-secondary leading-relaxed">
                      <span className="text-primary font-bold mt-0.5 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          )
        })}
      </div>

      {/* Section 7: Pernyataan */}
      <div>
        <SectionHeader
          title="Pernyataan Peserta"
          icon={
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <p className="text-[13px] text-text-secondary mb-4">Dengan ini saya menyatakan bahwa:</p>
        <div className="space-y-3">
          {[
            { field: 'agree_data_truth' as const, text: 'Data yang saya isi dalam formulir ini adalah benar dan sesuai dengan identitas resmi saya.' },
            { field: 'agree_healthy' as const, text: 'Saya dalam kondisi sehat jasmani dan rohani, serta siap mengikuti seluruh rangkaian kegiatan.' },
            { field: 'agree_terms' as const, text: 'Saya telah membaca, memahami, dan menyatakan tunduk pada seluruh peraturan dan ketentuan Fun Run 2026.' },
          ].map(({ field, text }) => (
            <div key={field}>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  id={field}
                  {...register(field)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer flex-shrink-0 accent-primary"
                />
                <span className="text-[13px] text-text-secondary leading-relaxed group-hover:text-text-primary transition-colors">{text}</span>
              </label>
              {errors[field] && (
                <p className="text-xs text-danger ml-7 mt-1">{errors[field]?.message}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          variant="primary"
          className="w-full h-auto min-h-[48px] py-3 px-4 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
          isLoading={isLoading}
        >
          <span className="text-center leading-tight">Daftar Sekarang &amp; Lanjut ke Pembayaran</span>
          {!isLoading && (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          )}
        </Button>
      </div>
    </form>
  )
}

