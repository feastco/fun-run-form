'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registrationSchema, RegistrationFormInput } from '@/lib/validations/registration'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
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

export function RegistrationForm({ categories, defaultCategoryId }: RegistrationFormProps) {
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Address cascade state
  const [provinces, setProvinces] = useState<Region[]>([])
  const [cities, setCities] = useState<Region[]>([])
  const [districts, setDistricts] = useState<Region[]>([])
  const [villages, setVillages] = useState<Region[]>([])

  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')

  const [loadingProvince, setLoadingProvince] = useState(false)
  const [loadingCity, setLoadingCity] = useState(false)
  const [loadingDistrict, setLoadingDistrict] = useState(false)
  const [loadingVillage, setLoadingVillage] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
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

  // Load provinces on mount
  useEffect(() => {
    setLoadingProvince(true)
    fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
      .then(r => r.json())
      .then((data: Region[]) => setProvinces(data))
      .catch(() => setProvinces([]))
      .finally(() => setLoadingProvince(false))
  }, [])

  // Load cities when province changes
  useEffect(() => {
    if (!selectedProvince) { setCities([]); setDistricts([]); setVillages([]) ; return }
    setLoadingCity(true)
    setCities([]); setDistricts([]); setVillages([])
    setSelectedCity(''); setSelectedDistrict('')
    setValue('city', ''); setValue('district', ''); setValue('village', '')
    fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProvince}.json`)
      .then(r => r.json())
      .then((data: Region[]) => setCities(data))
      .catch(() => setCities([]))
      .finally(() => setLoadingCity(false))
  }, [selectedProvince, setValue])

  // Load districts when city changes
  useEffect(() => {
    if (!selectedCity) { setDistricts([]); setVillages([]); return }
    setLoadingDistrict(true)
    setDistricts([]); setVillages([])
    setSelectedDistrict('')
    setValue('district', ''); setValue('village', '')
    fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${selectedCity}.json`)
      .then(r => r.json())
      .then((data: Region[]) => setDistricts(data))
      .catch(() => setDistricts([]))
      .finally(() => setLoadingDistrict(false))
  }, [selectedCity, setValue])

  // Load villages when district changes
  useEffect(() => {
    if (!selectedDistrict) { setVillages([]); return }
    setLoadingVillage(true)
    setVillages([])
    setValue('village', '')
    fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${selectedDistrict}.json`)
      .then(r => r.json())
      .then((data: Region[]) => setVillages(data))
      .catch(() => setVillages([]))
      .finally(() => setLoadingVillage(false))
  }, [selectedDistrict, setValue])

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

      if (!response.ok) {
        throw new Error(resJson.message || 'Pendaftaran gagal dikirim. Silakan cek data Anda.')
      }

      if (resJson.status === 'success' && resJson.data.snap_token) {
        const snapToken = resJson.data.snap_token
        const regNum = resJson.data.registration_number

        const win = window as unknown as { snap?: { pay: (token: string, options: Record<string, unknown>) => void } }
        if (win.snap) {
          win.snap.pay(snapToken, {
            onSuccess: () => { window.location.href = `/status?reg=${regNum}` },
            onPending: () => { window.location.href = `/status?reg=${regNum}` },
            onError: () => { setErrorMsg('Pembayaran gagal dilakukan. Coba panggil ulang via portal status.') },
            onClose: () => { window.location.href = `/status?reg=${regNum}` },
          })
        } else {
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
    { value: 'S', label: 'S' },
    { value: 'M', label: 'M' },
    { value: 'L', label: 'L' },
    { value: 'XL', label: 'XL' },
    { value: 'XXL', label: 'XXL' },
  ]

  const provinceOptions = [
    { value: '', label: loadingProvince ? 'Memuat...' : '-- Pilih Provinsi --' },
    ...provinces.map(p => ({ value: p.id, label: p.name })),
  ]

  const cityOptions = [
    { value: '', label: loadingCity ? 'Memuat...' : '-- Pilih Kabupaten --' },
    ...cities.map(c => ({ value: c.id, label: c.name })),
  ]

  const districtOptions = [
    { value: '', label: loadingDistrict ? 'Memuat...' : '-- Pilih Kecamatan --' },
    ...districts.map(d => ({ value: d.id, label: d.name })),
  ]

  const villageOptions = [
    { value: '', label: loadingVillage ? 'Memuat...' : '-- Pilih Desa --' },
    ...villages.map(v => ({ value: v.id, label: v.name })),
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
          <Select
            id="nationality"
            label="Kewarganegaraan"
            options={nationalityOptions}
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
      </div>

      {/* Section 3: Alamat */}
      <div>
        <h3 className="text-[18px] font-bold text-text-primary mb-4 pb-2 border-b border-[#E5E7EB]">
          Alamat Domisili
        </h3>

        {/* Province */}
        <div className="mb-4">
          <label htmlFor="province" className="block text-[14px] font-semibold text-text-primary mb-1">
            Provinsi <span className="text-danger">*</span>
          </label>
          <select
            id="province"
            className={`w-full px-3 h-11 rounded-lg border text-sm bg-white text-text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${errors.province ? 'border-danger' : 'border-gray-300'}`}
            value={selectedProvince}
            {...register('province')}
            onChange={(e) => {
              setSelectedProvince(e.target.value)
              setValue('province', e.target.value)
              const found = provinces.find(p => p.id === e.target.value)
              if (found) setValue('province', found.name)
            }}
          >
            {provinceOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {errors.province && <p className="mt-1 text-xs text-danger">{errors.province.message}</p>}
        </div>

        {/* City */}
        <div className="mb-4">
          <label htmlFor="city" className="block text-[14px] font-semibold text-text-primary mb-1">
            Kota / Kabupaten <span className="text-danger">*</span>
          </label>
          <select
            id="city"
            disabled={!selectedProvince || loadingCity}
            className={`w-full px-3 h-11 rounded-lg border text-sm bg-white text-text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-gray-50 disabled:text-gray-400 ${errors.city ? 'border-danger' : 'border-gray-300'}`}
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value)
              const found = cities.find(c => c.id === e.target.value)
              if (found) setValue('city', found.name)
            }}
          >
            {cityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {errors.city && <p className="mt-1 text-xs text-danger">{errors.city.message}</p>}
        </div>

        {/* District */}
        <div className="mb-4">
          <label htmlFor="district" className="block text-[14px] font-semibold text-text-primary mb-1">
            Kecamatan <span className="text-danger">*</span>
          </label>
          <select
            id="district"
            disabled={!selectedCity || loadingDistrict}
            className={`w-full px-3 h-11 rounded-lg border text-sm bg-white text-text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-gray-50 disabled:text-gray-400 ${errors.district ? 'border-danger' : 'border-gray-300'}`}
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value)
              const found = districts.find(d => d.id === e.target.value)
              if (found) setValue('district', found.name)
            }}
          >
            {districtOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {errors.district && <p className="mt-1 text-xs text-danger">{errors.district.message}</p>}
        </div>

        {/* Village */}
        <div className="mb-4">
          <label htmlFor="village" className="block text-[14px] font-semibold text-text-primary mb-1">
            Desa / Kelurahan <span className="text-danger">*</span>
          </label>
          <select
            id="village"
            disabled={!selectedDistrict || loadingVillage}
            className={`w-full px-3 h-11 rounded-lg border text-sm bg-white text-text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-gray-50 disabled:text-gray-400 ${errors.village ? 'border-danger' : 'border-gray-300'}`}
            onChange={(e) => {
              const found = villages.find(v => v.id === e.target.value)
              if (found) setValue('village', found.name)
            }}
          >
            {villageOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {errors.village && <p className="mt-1 text-xs text-danger">{errors.village.message}</p>}
        </div>

        {/* Detail Address */}
        <Input
          id="address"
          label="Alamat Lengkap"
          placeholder="Nama jalan, RT/RW, nomor rumah"
          error={errors.address?.message}
          {...register('address')}
        />
      </div>

      {/* Section 4: Riwayat Medis */}
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

      {/* Section 5: Kontak Darurat */}
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

      {/* Section 6: Peraturan & Ketentuan */}
      <div>
        <h3 className="text-[18px] font-bold text-text-primary mb-4 pb-2 border-b border-[#E5E7EB]">
          Peraturan &amp; Ketentuan
        </h3>

        {/* Important Notice */}
        <div className="mb-4 p-4 bg-amber-50 border border-amber-300 rounded-lg flex gap-3">
          <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-[13px] font-bold text-amber-800 mb-1">Informasi Penting</p>
            <p className="text-[12px] text-amber-700 leading-relaxed">
              Dengan melakukan pendaftaran dan mengambil racepack, peserta dianggap telah membaca, memahami, dan menyetujui seluruh peraturan. Pelanggaran dapat berakibat diskualifikasi tanpa pengembalian biaya pendaftaran.
            </p>
          </div>
        </div>

        {/* Accordion sections */}
        {[
          {
            icon: '📋',
            title: 'Peraturan Pendaftaran',
            items: [
              'Pendaftaran hanya dapat dilakukan melalui website resmi Fun Run 2026.',
              'Peserta wajib mengisi data pribadi dengan benar, lengkap, dan sesuai dengan identitas resmi (KTP/SIM/Paspor).',
              'Pendaftaran bersifat non-transferable dan non-refundable (tidak dapat dipindahtangankan maupun dikembalikan).',
              'Biaya pendaftaran sudah termasuk racepack (jersey resmi, nomor BIB, dan souvenir lainnya).',
              'Peserta akan menerima konfirmasi pendaftaran melalui email setelah pembayaran berhasil diverifikasi.',
              'Pendaftaran akan ditutup apabila kuota peserta telah terpenuhi, meskipun sebelum batas waktu yang ditentukan.',
            ],
          },
          {
            icon: '🏃',
            title: 'Ketentuan Peserta',
            items: [
              'Peserta datang 1 jam sebelum waktu start.',
              'Peserta dianjurkan mengenakan jersey yang telah disediakan oleh panitia.',
              'Peserta wajib menggunakan nomor BIB milik sendiri yang terpasang di depan dada.',
              'Peserta DILARANG KERAS memakai pakaian yang mengandung unsur SARA dan politik.',
              'Peserta DILARANG KERAS membawa minuman keras, senjata tajam, atau barang berbahaya.',
              'Peserta DILARANG KERAS merokok di area Fun Run 2026.',
            ],
          },
          {
            icon: '🎽',
            title: 'Pengambilan Racepack',
            items: [
              'Racepack meliputi jersey, nomor BIB, dan material promosi lainnya.',
              'Nomor BIB merupakan nomor yang telah ditentukan oleh panitia.',
              'Peserta tanpa BIB DILARANG MASUK ke dalam venue.',
              'Nomor BIB tidak dapat dipindahtangankan atau diperjualbelikan.',
              'Peserta wajib membawa email konfirmasi dan identitas resmi (KTP/SIM/PASSPORT).',
              'Pengambilan dapat diwakilkan dengan surat kuasa bermaterai.',
              'Panitia tidak melayani pengambilan di luar jadwal yang ditentukan.',
            ],
          },
          {
            icon: '📅',
            title: 'Jadwal Pengambilan',
            items: [
              'Kamis, 03 September 2026 (09:00 - 15:00 WIB) - Stadion Si Jalak Harupat Kutawaringin',
              'Jumat, 04 September 2026 (09:00 - 15:00 WIB) - Stadion Si Jalak Harupat Kutawaringin',
              'Sabtu, 05 September 2026 (09:00 - 18:00 WIB) - Stadion Si Jalak Harupat Kutawaringin',
            ],
          },
          {
            icon: '✅',
            title: 'Persyaratan Peserta',
            items: [
              'Pendaftaran terbuka untuk WNI dan WNA.',
              'Peserta wajib memiliki identitas resmi (KTP/SIM/PASSPORT).',
              'Peserta wajib memilih kategori sesuai ketentuan yang berlaku.',
              'Pendaftaran tidak dapat dialihnamakan setelah konfirmasi.',
              'Pembatalan pendaftaran tidak dapat dilakukan dengan pengembalian dana.',
            ],
          },
          {
            icon: '🏆',
            title: 'Ketentuan Pemenang',
            items: [
              'Peserta yang menyelesaikan pertandingan dengan catatan waktu terbaik, sesuai kategori resmi.',
              'Menggunakan nomor BIB asli sesuai data pendaftaran dan dilarang melakukan kecurangan.',
              'Panitia berhak membatalkan hasil lomba jika terbukti secara sah melakukan kecurangan.',
              'Hadiah tidak dapat diwakilkan atau dipindahtangankan; wajib menunjukkan identitas asli.',
              'Keputusan pemenang oleh juri adalah sah dan mutlak (final).',
              'Hadiah dapat berupa barang/uang tunai/transfer sesuai kebijakan panitia.',
              'Pajak hadiah ditanggung sepenuhnya oleh pemenang.',
              'WNA diperbolehkan lari, namun hak podium eksklusif untuk kategori Nasional (WNI).',
            ],
          },
        ].map((section) => (
          <details key={section.title} className="group mb-2 border border-gray-200 rounded-lg overflow-hidden">
            <summary className="flex items-center justify-between px-4 py-3 cursor-pointer bg-white hover:bg-gray-50 transition-colors select-none">
              <span className="font-semibold text-[14px] text-text-primary flex items-center gap-2">
                <span>{section.icon}</span> {section.title}
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
                    <span dangerouslySetInnerHTML={{ __html: item.replace(/DILARANG KERAS/g, '<strong class="text-danger">DILARANG KERAS</strong>').replace(/DILARANG MASUK/g, '<strong class="text-danger">DILARANG MASUK</strong>') }} />
                  </li>
                ))}
              </ul>
            </div>
          </details>
        ))}
      </div>

      {/* Section 7: Pernyataan */}
      <div>
        <h3 className="text-[18px] font-bold text-text-primary mb-4 pb-2 border-b border-[#E5E7EB]">
          Dengan ini saya Menyatakan Bahwa:
        </h3>
        <div className="space-y-3">
          {/* Agree data truth */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              id="agree_data_truth"
              {...register('agree_data_truth')}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer flex-shrink-0"
            />
            <span className="text-[13px] text-text-secondary leading-relaxed group-hover:text-text-primary transition-colors">
              Data yang saya isi dalam{' '}
              <span className="text-primary font-semibold">formulir ini</span> adalah benar.
            </span>
          </label>
          {errors.agree_data_truth && (
            <p className="text-xs text-danger ml-7">{errors.agree_data_truth.message}</p>
          )}

          {/* Agree healthy */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              id="agree_healthy"
              {...register('agree_healthy')}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer flex-shrink-0"
            />
            <span className="text-[13px] text-text-secondary leading-relaxed group-hover:text-text-primary transition-colors">
              Saya dalam kondisi sehat jasmani dan rohani, serta siap dan sanggup mengikuti seluruh rangkaian kegiatan.
            </span>
          </label>
          {errors.agree_healthy && (
            <p className="text-xs text-danger ml-7">{errors.agree_healthy.message}</p>
          )}

          {/* Agree terms */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              id="agree_terms"
              {...register('agree_terms')}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer flex-shrink-0"
            />
            <span className="text-[13px] text-text-secondary leading-relaxed group-hover:text-text-primary transition-colors">
              Saya telah membaca, memahami, dan dengan ini menyatakan tunduk pada{' '}
              <span className="text-primary font-semibold">seluruh peraturan serta ketentuan</span>{' '}
              yang berlaku dalam{' '}
              <span className="text-primary font-semibold">event ini</span>.
            </span>
          </label>
          {errors.agree_terms && (
            <p className="text-xs text-danger ml-7">{errors.agree_terms.message}</p>
          )}
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" variant="primary" className="w-full h-[48px]" isLoading={isLoading}>
          Daftar Sekarang
        </Button>
      </div>
    </form>
  )
}
