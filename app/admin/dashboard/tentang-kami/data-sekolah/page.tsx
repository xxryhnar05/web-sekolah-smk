'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowserClient'
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  FileText,
  Zap,
  Calendar,
} from 'lucide-react'

export default function AdminDataSekolahPage() {
  const router = useRouter()
  const [identityId, setIdentityId] = useState<string | null>(null)

  // Field Form Identitas Umum
  const [name, setName] = useState('')
  const [npsn, setNpsn] = useState('')
  const [status, setStatus] = useState('Swasta')
  const [educationForm, setEducationForm] = useState('SMK')
  const [educationLevel, setEducationLevel] = useState('SMA/SMK')
  const [fosteringMinistry, setFosteringMinistry] = useState('Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi')
  const [umbrellaOrganization, setUmbrellaOrganization] = useState('Majelis Dikdasmen Muhammadiyah')
  const [npyp, setNpyp] = useState('')

  // Field Form Alamat & Wilayah
  const [address, setAddress] = useState('')
  const [village, setVillage] = useState('')
  const [district, setDistrict] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')

  // Field Form SK & Akreditasi
  const [establishmentSkNumber, setEstablishmentSkNumber] = useState('')
  const [establishmentSkDate, setEstablishmentSkDate] = useState('')
  const [operationalSkNumber, setOperationalSkNumber] = useState('')
  const [operationalSkDate, setOperationalSkDate] = useState('')
  const [accreditation, setAccreditation] = useState('A')

  // Field Form Fasilitas Ringkas
  const [landArea, setLandArea] = useState('')
  const [internetAccess, setInternetAccess] = useState('')
  const [electricitySource, setElectricitySource] = useState('')

  // State Interface Status
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Fetch data identitas sekolah saat halaman dibuka
  useEffect(() => {
    async function fetchSchoolIdentity() {
      try {
        const { data, error } = await supabase
          .from('school_identities')
          .select('*')
          .limit(1)
          .maybeSingle()

        if (error) throw error

        if (data) {
          setIdentityId(data.id)
          setName(data.name || '')
          setNpsn(data.npsn || '')
          setStatus(data.status || 'Swasta')
          setEducationForm(data.education_form || 'SMK')
          setEducationLevel(data.education_level || 'SMA/SMK')
          setFosteringMinistry(data.fostering_ministry || '')
          setUmbrellaOrganization(data.umbrella_organization || '')
          setNpyp(data.npyp || '')

          setAddress(data.address || '')
          setVillage(data.village || '')
          setDistrict(data.district || '')
          setCity(data.city || '')
          setProvince(data.province || '')

          setEstablishmentSkNumber(data.establishment_sk_number || '')
          setEstablishmentSkDate(data.establishment_sk_date ? data.establishment_sk_date.split('T')[0] : '')
          setOperationalSkNumber(data.operational_sk_number || '')
          setOperationalSkDate(data.operational_sk_date ? data.operational_sk_date.split('T')[0] : '')
          setAccreditation(data.accreditation || 'A')

          setLandArea(data.land_area || '')
          setInternetAccess(data.internet_access || '')
          setElectricitySource(data.electricity_source || '')
        }
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: 'Gagal memuat data identitas sekolah.' })
      } finally {
        setLoadingData(false)
      }
    }

    fetchSchoolIdentity()
  }, [])

  // Handle Simpan / Update Data Sekolah
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatusMessage(null)

    try {
      const payload = {
        name,
        npsn,
        status: status || null,
        education_form: educationForm || null,
        education_level: educationLevel || null,
        fostering_ministry: fosteringMinistry || null,
        umbrella_organization: umbrellaOrganization || null,
        npyp: npyp || null,

        address,
        village: village || null,
        district: district || null,
        city: city || null,
        province: province || null,

        establishment_sk_number: establishmentSkNumber || null,
        establishment_sk_date: establishmentSkDate || null,
        operational_sk_number: operationalSkNumber || null,
        operational_sk_date: operationalSkDate || null,
        accreditation: accreditation || null,

        land_area: landArea || null,
        internet_access: internetAccess || null,
        electricity_source: electricitySource || null,
        updated_at: new Date().toISOString(),
      }

      if (identityId) {
        // Update data jika record sudah ada
        const { error } = await supabase
          .from('school_identities')
          .update(payload)
          .eq('id', identityId)

        if (error) throw error
      } else {
        // Insert record baru jika tabel masih kosong
        const { data, error } = await supabase
          .from('school_identities')
          .insert([payload])
          .select('id')
          .single()

        if (error) throw error
        if (data) setIdentityId(data.id)
      }

      setStatusMessage({ type: 'success', text: 'Data identitas sekolah berhasil diperbarui!' })
      router.refresh()
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menyimpan data sekolah.' })
    } finally {
      setSaving(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-[#bd9142]" />
        <span className="ml-3 text-sm">Memuat data identitas sekolah...</span>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-7 font-sans text-[#34443b] antialiased">
      <section className="relative isolate grid overflow-hidden rounded-2xl bg-[#17231f] px-6 py-8 text-white shadow-[0_16px_36px_rgba(23,35,31,0.16)] sm:px-9 sm:py-9 lg:grid-cols-[1fr_300px] lg:items-center lg:gap-8">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[url('/batik2.png')] bg-[length:420px_auto] bg-right-top bg-no-repeat opacity-35 mix-blend-screen" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#17231f] via-[#17231f]/95 to-[#17231f]/35" />
        <div className="max-w-xl">
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300"><span className="h-px w-6 bg-amber-300" /> Tentang Kami</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Data Identitas Sekolah</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/65">Perbarui informasi legalitas, alamat, dokumen, dan fasilitas sekolah.</p>
        </div>
        <div className="mt-7 border-t border-white/10 pt-5 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Area pengelolaan</p>
          <div className="flex min-h-14 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c99a42]/15 text-amber-300"><Building2 className="h-4 w-4" /></span>
            <span><span className="block text-xs font-medium text-white/85">Profil sekolah</span><span className="mt-1 block text-[11px] text-white/45">Identitas dan legalitas</span></span>
          </div>
        </div>
      </section>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Pesan Status Notifikasi */}
        {statusMessage && (
          <div
            className={`flex items-center gap-3 rounded-xl border p-4 text-xs font-medium ${
              statusMessage.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* KELOMPOK 1: IDENTITAS UMUM & INSTITUSI */}
        <section className="space-y-5 rounded-2xl border border-[#e3e0d8] bg-white p-5 shadow-[0_8px_24px_rgba(40,51,46,0.045)] sm:p-7">
          <div className="flex items-center gap-3 border-b border-[#e3e0d8] pb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f2efe7] text-[#a57c31]"><Building2 className="h-4 w-4" /></span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#17231f]">
              Identitas Umum &amp; Kelembagaan
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Nama Resmi Sekolah</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: SMA MUTIARA NGORO"
                className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">NPSN</label>
              <input
                type="text"
                required
                value={npsn}
                onChange={(e) => setNpsn(e.target.value)}
                placeholder="Contoh: 20554123"
                className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Status Sekolah</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
              >
                <option value="Swasta">Swasta</option>
                <option value="Negeri">Negeri</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Bentuk Pendidikan</label>
              <input
                type="text"
                value={educationForm}
                onChange={(e) => setEducationForm(e.target.value)}
                placeholder="SMK / SMA"
                className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Kementerian Pembina</label>
              <input
                type="text"
                value={fosteringMinistry}
                onChange={(e) => setFosteringMinistry(e.target.value)}
                placeholder="Kemendikbudristek"
                className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Organisasi Payung / Yayasan</label>
              <input
                type="text"
                value={umbrellaOrganization}
                onChange={(e) => setUmbrellaOrganization(e.target.value)}
                placeholder="Majelis Dikdasmen Muhammadiyah"
                className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">NPYP (Nomor Pokok Yayasan)</label>
              <input
                type="text"
                value={npyp}
                onChange={(e) => setNpyp(e.target.value)}
                placeholder="Contoh: YP0123456"
                className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Akreditasi</label>
              <input
                type="text"
                value={accreditation}
                onChange={(e) => setAccreditation(e.target.value)}
                placeholder="A / Unggul"
                className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
              />
            </div>
          </div>
        </section>

        {/* KELOMPOK 2: ALAMAT & WILAYAH */}
        <section className="space-y-5 rounded-2xl border border-[#e3e0d8] bg-white p-5 shadow-[0_8px_24px_rgba(40,51,46,0.045)] sm:p-7">
          <div className="flex items-center gap-3 border-b border-[#e3e0d8] pb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f2efe7] text-[#a57c31]"><MapPin className="h-4 w-4" /></span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#17231f]">
              Alamat &amp; Lokasi Wilayah
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Alamat Jalan / Jalan Raya</label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. Raya Ngoro No. 123..."
                className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] p-3 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Desa / Kelurahan</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="Sedati"
                  className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Kecamatan</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Ngoro"
                  className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Kabupaten / Kota</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Kab. Mojokerto"
                  className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Provinsi</label>
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="Jawa Timur"
                  className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* KELOMPOK 3: SK PENDIRIAN & SK OPERASIONAL */}
        <section className="space-y-5 rounded-2xl border border-[#e3e0d8] bg-white p-5 shadow-[0_8px_24px_rgba(40,51,46,0.045)] sm:p-7">
          <div className="flex items-center gap-3 border-b border-[#e3e0d8] pb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f2efe7] text-[#a57c31]"><FileText className="h-4 w-4" /></span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#17231f]">
              SK Pendirian &amp; SK Operasional
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">No. SK Pendirian</label>
              <input
                type="text"
                value={establishmentSkNumber}
                onChange={(e) => setEstablishmentSkNumber(e.target.value)}
                placeholder="421.3/123/SK/2005"
                className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Tanggal SK Pendirian</label>
              <input
                type="date"
                value={establishmentSkDate}
                onChange={(e) => setEstablishmentSkDate(e.target.value)}
                className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">No. SK Izin Operasional</label>
              <input
                type="text"
                value={operationalSkNumber}
                onChange={(e) => setOperationalSkNumber(e.target.value)}
                placeholder="19.03/456/2018"
                className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Tanggal SK Izin Operasional</label>
              <input
                type="date"
                value={operationalSkDate}
                onChange={(e) => setOperationalSkDate(e.target.value)}
                className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
              />
            </div>
          </div>

        </section>

        {/* KELOMPOK 4: SARANA & PRASARANA RINGKAS */}
        <section className="space-y-5 rounded-2xl border border-[#e3e0d8] bg-white p-5 shadow-[0_8px_24px_rgba(40,51,46,0.045)] sm:p-7">
          <div className="flex items-center gap-3 border-b border-[#e3e0d8] pb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f2efe7] text-[#a57c31]"><Zap className="h-4 w-4" /></span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#17231f]">
              Sarana &amp; Fasilitas Pendukung
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Luas Tanah</label>
              <input
                type="text"
                value={landArea}
                onChange={(e) => setLandArea(e.target.value)}
                placeholder="Contoh: 4.500 m²"
                className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Akses Internet</label>
              <input
                type="text"
                value={internetAccess}
                onChange={(e) => setInternetAccess(e.target.value)}
                placeholder="Contoh: Dedicated Fiber 100 Mbps"
                className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Sumber Listrik</label>
              <input
                type="text"
                value={electricitySource}
                onChange={(e) => setElectricitySource(e.target.value)}
                placeholder="Contoh: PLN 13.000 VA + Genset"
                className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
              />
            </div>
          </div>
        </section>

        {/* Tombol Simpan Perubahan */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#d3aa5d] to-[#c99a42] px-8 py-3 text-sm font-semibold text-[#17231f] shadow-[0_6px_16px_rgba(201,154,66,0.35)] transition hover:from-[#dcb472] hover:to-[#d3aa5d] disabled:cursor-wait disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Simpan Data Sekolah</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
