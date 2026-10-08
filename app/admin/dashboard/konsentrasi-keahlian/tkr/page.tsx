'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowserClient'
import CustomSectionsEditor from '../custom-sections-editor'
import {
  parseCustomSections,
  type CustomSection,
} from '@/lib/custom-sections'
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Upload,
  ImageIcon,
  X,
  Building2,
  Save,
  GraduationCap,
  Briefcase,
  Wrench,
  Star,
} from 'lucide-react'

interface MajorDPIB {
  id: string
  code: string
  name: string
  slug: string
  head_of_major: string | null
  graduate_competency: string | null
  job_intro: string | null
  job_opportunities: string[] | null
  lab_facilities_list: string[] | null
  advantages: string[] | null
  banner_urls: string[] | null
  banner_url: string | null
  custom_sections: CustomSection[] | null
}

const inputClass =
  'w-full rounded-lg border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10'
const textareaClass =
  'w-full rounded-lg border border-[#dedbd2] bg-[#faf9f6] p-3.5 text-sm leading-7 text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10'
const listTextareaClass = `${textareaClass} font-mono text-xs`

export default function AdminTkrPage() {
  const router = useRouter()
  const [dpibData, setDpibData] = useState<MajorDPIB | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // State Form Input Text
  const [name, setName] = useState('Desain Pemodelan dan Informasi Bangunan')
  const [headOfMajor, setHeadOfMajor] = useState('')
  const [graduateCompetency, setGraduateCompetency] = useState('')
  const [jobIntro, setJobIntro] = useState('Tamatan siswa Desain Pemodelan dan Informasi Bangunan tersalurkan di berbagai bidang seperti :')
  const [jobOpportunitiesText, setJobOpportunitiesText] = useState('')
  const [labFacilitiesText, setLabFacilitiesText] = useState('')
  const [advantagesText, setAdvantagesText] = useState('')

  // State Multiple Banner Upload
  const [existingBannerUrls, setExistingBannerUrls] = useState<string[]>([])
  const [selectedBannerFiles, setSelectedBannerFiles] = useState<File[]>([])
  const [bannerPreviewUrls, setBannerPreviewUrls] = useState<string[]>([])
  const [customSections, setCustomSections] = useState<CustomSection[]>([])

  const fetchDpibData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('majors')
        .select('*')
        .or('slug.eq.dpib,code.ilike.dpib')
        .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setDpibData(data)
        setCustomSections(parseCustomSections(data.custom_sections))
        setName(data.name || 'Desain Pemodelan dan Informasi Bangunan')
        setHeadOfMajor(data.head_of_major || '')
        setGraduateCompetency(data.graduate_competency || data.description || '')
        setJobIntro(data.job_intro || 'Tamatan siswa Desain Pemodelan dan Informasi Bangunan tersalurkan di berbagai bidang seperti :')
        setJobOpportunitiesText(data.job_opportunities ? data.job_opportunities.join('\n') : '')
        setLabFacilitiesText(data.lab_facilities_list ? data.lab_facilities_list.join('\n') : '')
        setAdvantagesText(data.advantages ? data.advantages.join('\n') : '')

        // Load Multiple Banner URLs (Fallback ke banner_url lama jika banner_urls belum ada)
        if (data.banner_urls && data.banner_urls.length > 0) {
          setExistingBannerUrls(data.banner_urls)
        } else if (data.banner_url) {
          setExistingBannerUrls([data.banner_url])
        } else {
          setExistingBannerUrls([])
        }
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Gagal memuat data TKR dari database.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDpibData()
  }, [])

  // Handler Multiple Banner Selection
  const handleBannerFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setSelectedBannerFiles((prev) => [...prev, ...filesArray])

      const newPreviews = filesArray.map((f) => URL.createObjectURL(f))
      setBannerPreviewUrls((prev) => [...prev, ...newPreviews])
    }
  }

  const handleRemoveNewBannerFile = (index: number) => {
    setSelectedBannerFiles((prev) => prev.filter((_, i) => i !== index))
    setBannerPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRemoveExistingBannerUrl = (url: string) => {
    setExistingBannerUrls((prev) => prev.filter((u) => u !== url))
  }

  const uploadSingleFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `dpib-banner-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `majors/dpib/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('school-media')
      .upload(filePath, file, { upsert: true })

    if (uploadError) throw new Error(`Gagal upload ${file.name}: ${uploadError.message}`)

    const { data: publicUrlData } = supabase.storage
      .from('school-media')
      .getPublicUrl(filePath)

    return publicUrlData.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatusMessage(null)

    try {
      // Upload foto banner baru dari laptop jika ada
      let finalBannerUrls = [...existingBannerUrls]
      if (selectedBannerFiles.length > 0) {
        setUploading(true)
        for (const file of selectedBannerFiles) {
          const uploadedUrl = await uploadSingleFile(file)
          finalBannerUrls.push(uploadedUrl)
        }
      }

      const parsePoints = (text: string) =>
        text
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean)

      const jobArr = parsePoints(jobOpportunitiesText)
      const labArr = parsePoints(labFacilitiesText)
      const advantagesArr = parsePoints(advantagesText)

      const payload = {
        code: 'DPIB',
        name: name.trim(),
        slug: 'dpib',
        head_of_major: headOfMajor.trim() || null,
        graduate_competency: graduateCompetency.trim() || null,
        description: graduateCompetency.trim() || null,
        job_intro: jobIntro.trim() || null,
        job_opportunities: jobArr.length > 0 ? jobArr : null,
        lab_facilities_list: labArr.length > 0 ? labArr : null,
        advantages: advantagesArr.length > 0 ? advantagesArr : null,
        banner_urls: finalBannerUrls.length > 0 ? finalBannerUrls : null,
        banner_url: finalBannerUrls.length > 0 ? finalBannerUrls[0] : null,
        custom_sections: customSections.filter(
          (section) => section.title.trim() !== '',
        ),
      }

      if (dpibData?.id) {
        const { error } = await supabase
          .from('majors')
          .update(payload)
          .eq('id', dpibData.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('majors')
          .insert([payload])

        if (error) throw error
      }

      setStatusMessage({ type: 'success', text: 'Halaman TKR berhasil diperbarui!' })
      setSelectedBannerFiles([])
      setBannerPreviewUrls([])
      fetchDpibData()
      router.refresh()
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menyimpan data TKR.' })
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-[#bd9142]" />
        <span className="ml-3 text-sm">Memuat data Admin TKR...</span>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-7 font-sans text-[#34443b] antialiased">
      <section className="relative isolate grid overflow-hidden rounded-2xl bg-[#17231f] px-6 py-8 text-white shadow-[0_16px_36px_rgba(23,35,31,0.16)] sm:px-9 sm:py-9 lg:grid-cols-[1fr_300px] lg:items-center lg:gap-8">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[url('/batik2.png')] bg-[length:420px_auto] bg-right-top bg-no-repeat opacity-35 mix-blend-screen" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#17231f] via-[#17231f]/95 to-[#17231f]/35" />
        <div className="max-w-xl">
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300">
            <span className="h-px w-6 bg-amber-300" /> Konsentrasi Keahlian
          </p>
          <h1 className="mt-4 flex items-center gap-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            <Building2 className="h-7 w-7 shrink-0 text-amber-300" />
            Kelola TKR
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/65">
            Perbarui galeri, kompetensi lulusan, prospek kerja, fasilitas, dan keunggulan Desain Pemodelan dan Informasi Bangunan.
          </p>
        </div>
        <div className="mt-7 border-t border-white/10 pt-5 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
            Area pengelolaan
          </p>
          <div className="flex min-h-14 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c99a42]/15 text-amber-300">
              <Building2 className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-xs font-medium text-white/85">Profil TKR</span>
              <span className="mt-1 block text-[11px] text-white/45">Konten halaman publik</span>
            </span>
          </div>
        </div>
      </section>

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

      <form onSubmit={handleSubmit} className="overflow-hidden rounded-2xl border border-[#e3e0d8] bg-white shadow-[0_8px_24px_rgba(40,51,46,0.045)]">
        <div className="relative flex flex-wrap items-center justify-between gap-3 overflow-hidden border-b border-[#e3e0d8] bg-gradient-to-r from-[#faf9f6] via-white to-[#faf9f6] px-5 py-5 sm:px-7 lg:px-8">
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-64 bg-[url('/batik2.png')] bg-[length:240px_auto] bg-right bg-no-repeat opacity-[0.07]" />
          <div className="relative flex items-center gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#17231f] text-amber-300 shadow-[0_4px_12px_rgba(23,35,31,0.2)]">
              <Building2 className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-[#17231f]">Formulir Konsentrasi Keahlian TKR</h2>
              <p className="mt-0.5 text-xs text-slate-500">Perubahan akan tampil di halaman publik setelah disimpan.</p>
            </div>
          </div>
          <span className="relative inline-flex items-center gap-2 rounded-full border border-[#dfcfaa] bg-[#fbf8f0] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#785e2d]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c99a42]" /> Konsentrasi Keahlian
          </span>
        </div>

        <div className="space-y-8 px-5 py-6 sm:px-7 sm:py-7 lg:px-8 lg:py-8">
        {/* Nama Jurusan & Kaprodi */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Nama Konsentrasi Keahlian
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Kaprodi (Ketua Program Studi)
            </label>
            <input
              type="text"
              value={headOfMajor}
              onChange={(e) => setHeadOfMajor(e.target.value)}
              placeholder="Contoh: Nama Kaprodi TKR, S.T."
              className={inputClass}
            />
          </div>
        </div>

        {/* SECTION MULTIPLE UPLOAD BANNER UTAMA SLIDER */}
        <section className="space-y-5 rounded-xl border border-[#e3e0d8] bg-[#faf9f6]/70 p-4 sm:p-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-[#17231f]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f2efe7] text-[#a57c31]">
              <ImageIcon className="h-4 w-4" />
            </span>
            Galeri Foto TKR
          </label>

          {/* Banner tersimpan */}
          {existingBannerUrls.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Foto tersimpan ({existingBannerUrls.length})</span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {existingBannerUrls.map((url, idx) => (
                  <div key={idx} className="group relative aspect-[16/9] overflow-hidden rounded-lg border border-[#e3e0d8] bg-white">
                    <img src={url} alt={`Banner TKR ${idx}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingBannerUrl(url)}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white opacity-0 shadow transition group-hover:opacity-100 hover:bg-red-500 focus:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Dropzone untuk Banner */}
          <label
            htmlFor="dpib_multiple_banners_input"
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#dedbd2] bg-white p-6 text-center transition hover:border-[#bd9142] hover:bg-[#fbf8f0]"
          >
            <Upload className="mb-2 h-5 w-5 text-[#a57c31]" />
            <span className="text-xs font-semibold text-[#17231f]">Pilih beberapa foto sekaligus</span>
            <span className="mt-1 text-[11px] text-slate-500">PNG, JPG, WEBP (Maks. 5 MB per file)</span>
            <input
              id="dpib_multiple_banners_input"
              type="file"
              multiple
              accept="image/*"
              onChange={handleBannerFilesChange}
              className="hidden"
            />
          </label>

          {/* Preview Banner Baru */}
          {bannerPreviewUrls.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Foto baru ({bannerPreviewUrls.length})</span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {bannerPreviewUrls.map((url, idx) => (
                  <div key={idx} className="group relative aspect-[16/9] overflow-hidden rounded-lg border border-[#dfcfaa] bg-white">
                    <img src={url} alt={`Preview TKR ${idx}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewBannerFile(idx)}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white shadow hover:bg-red-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 1. KOMPETENSI LULUSAN */}
        <section className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-[#17231f]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f2efe7] text-[#a57c31]">
              <GraduationCap className="h-4 w-4" />
            </span>
            Kompetensi Lulusan
          </label>
          <textarea
            rows={4}
            value={graduateCompetency}
            onChange={(e) => setGraduateCompetency(e.target.value)}
            placeholder="Desain Pemodelan dan Informasi Bangunan adalah jurusan yang mempelajari tentang gambar perencanaan bangunan, gambar konstruksi, pemodelan 3D/BIM, perhitungan RAB..."
            className={textareaClass}
          />
        </section>

        {/* 2. LAPANGAN KERJA */}
        <section className="space-y-5 rounded-xl border border-[#e3e0d8] bg-[#faf9f6]/70 p-4 sm:p-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-[#17231f]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f2efe7] text-[#a57c31]">
              <Briefcase className="h-4 w-4" />
            </span>
            Lapangan Kerja
          </label>
          
          <div>
            <span className="mb-1 block text-xs font-medium text-slate-600">Teks pengantar</span>
            <input
              type="text"
              value={jobIntro}
              onChange={(e) => setJobIntro(e.target.value)}
              placeholder="Tamatan siswa Desain Pemodelan dan Informasi Bangunan tersalurkan di berbagai bidang seperti :"
              className={inputClass}
            />
          </div>

          <div>
            <span className="mb-1 block text-xs font-medium text-slate-600">Poin lapangan kerja (satu poin per baris)</span>
            <textarea
              rows={5}
              value={jobOpportunitiesText}
              onChange={(e) => setJobOpportunitiesText(e.target.value)}
              placeholder="Drafter / Juru Gambar Bangunan&#10;BIM Modeler (Building Information Modeling)&#10;Estimator / Cost Planner (RAB)&#10;Surveyor Pemetaan & Pengukuran&#10;Pelaksana Konstruksi Bangunan&#10;Wirausaha Konsultan Desain Interior / Arsitektur"
              className={listTextareaClass}
            />
          </div>
        </section>

        {/* 3. FASILITAS LABORATORIUM */}
        <section className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-[#17231f]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f2efe7] text-[#a57c31]">
              <Wrench className="h-4 w-4" />
            </span>
            Fasilitas Laboratorium <span className="text-xs font-normal text-slate-500">(satu poin per baris)</span>
          </label>
          <textarea
            rows={4}
            value={labFacilitiesText}
            onChange={(e) => setLabFacilitiesText(e.target.value)}
            placeholder="Studio Gambar Arsitektur & Manual Drafting&#10;Laboratorium Komputer CAD & AutoCAD&#10;Laboratorium Pemodelan 3D BIM & SketchUp&#10;Peralatan Survey Ilmu Ukur Tanah (Total Station & Waterpass)"
            className={listTextareaClass}
          />
        </section>

        {/* 4. KEUNGGULAN */}
        <section className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-[#17231f]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f2efe7] text-[#a57c31]">
              <Star className="h-4 w-4" />
            </span>
            Keunggulan <span className="text-xs font-normal text-slate-500">(satu poin per baris)</span>
          </label>
          <textarea
            rows={4}
            value={advantagesText}
            onChange={(e) => setAdvantagesText(e.target.value)}
            placeholder="Menguasai Perangkat Lunak Desain AutoCAD, SketchUp & Revit&#10;Mampu Menghitung Rencana Anggaran Biaya (RAB) Bangunan&#10;Mampu Membaca dan Membuat Gambar Kerja Konstruksi Lengkap&#10;Menguasai Pemetaan dan Pengukuran Tanah"
            className={listTextareaClass}
          />
        </section>

        <CustomSectionsEditor sections={customSections} onChange={setCustomSections} />

        <div className="flex justify-end border-t border-[#e3e0d8] pt-5">
          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#d3aa5d] to-[#c99a42] px-6 py-3 text-sm font-semibold text-[#17231f] shadow-[0_6px_16px_rgba(201,154,66,0.25)] transition hover:from-[#dcb472] hover:to-[#d3aa5d] hover:shadow-[0_8px_20px_rgba(201,154,66,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bd9142] active:scale-[0.98] disabled:cursor-wait disabled:opacity-50 disabled:shadow-none disabled:active:scale-100"
          >
            {saving || uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{uploading ? 'Mengunggah foto...' : 'Menyimpan...'}</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Simpan Perubahan TKR</span>
              </>
            )}
          </button>
        </div>
        </div>
      </form>
    </div>
  )
}