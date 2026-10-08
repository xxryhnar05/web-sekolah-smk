'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowserClient'
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
  Upload,
  Layout,
  Users,
  GraduationCap,
  Award,
  School,
  Quote,
  Plus,
  Trash2,
  Edit3,
  X,
  Video,
  Image as ImageIcon,
} from 'lucide-react'

interface AlumniItem {
  id: string
  name: string
  graduation_year: string
  profession: string
  quote: string
  is_active: boolean
}

interface GalleryItem {
  id: string
  title: string
  type: 'video' | 'image'
  url: string
}

export default function AdminBerandaPage() {
  const router = useRouter()
  const [configId, setConfigId] = useState<string | null>(null)

  // State Form Konfigurasi Beranda
  const [heroTitle, setHeroTitle] = useState('')
  const [heroSubtitle, setHeroSubtitle] = useState('')
  const [heroImageUrl, setHeroImageUrl] = useState('')
  const [statSiswa, setStatSiswa] = useState<number>(1250)
  const [statGuru, setStatGuru] = useState<number>(75)
  const [statStaf, setStatStaf] = useState<number>(30)
  const [statPrestasi, setStatPrestasi] = useState<number>(180)
  const [ppdbTitle, setPpdbTitle] = useState('')
  const [ppdbDesc, setPpdbDesc] = useState('')

  // State Alumni & Galeri
  const [alumniList, setAlumniList] = useState<AlumniItem[]>([])
  const [galleryList, setGalleryList] = useState<GalleryItem[]>([])

  // State Loader & Status
  const [loading, setLoading] = useState(true)
  const [savingConfig, setSavingConfig] = useState(false)
  const [uploadingHero, setUploadingHero] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // State Modal Alumni
  const [isAlumniModalOpen, setIsAlumniModalOpen] = useState(false)
  const [editingAlumniId, setEditingAlumniId] = useState<string | null>(null)
  const [alumniName, setAlumniName] = useState('')
  const [alumniYear, setAlumniYear] = useState('')
  const [alumniProfession, setAlumniProfession] = useState('')
  const [alumniQuote, setAlumniQuote] = useState('')
  const [alumniIsActive, setAlumniIsActive] = useState(true)
  const [savingAlumni, setSavingAlumni] = useState(false)

  // State Modal Galeri
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false)
  const [galleryType, setGalleryType] = useState<'video' | 'image'>('image')
  const [galleryUrl, setGalleryUrl] = useState('')
  const [galleryImages, setGalleryImages] = useState<{ title: string; url: string }[]>([])
  const [uploadingGalleryImg, setUploadingGalleryImg] = useState(false)
  const [savingGallery, setSavingGallery] = useState(false)

  // Count existing image items
  const currentImageCount = galleryList.filter((item) => item.type === 'image').length

  // Fetch Data Konfigurasi, Alumni & Galeri
  const fetchData = async () => {
    const requestController = new AbortController()
    const timeoutId = setTimeout(() => requestController.abort(), 15_000)

    try {
      setLoading(true)
      setStatusMessage(null)

      const [configResult, alumniResult, galleryResult] = await Promise.all([
        supabase
          .from('homepage_config')
          .select('*')
          .order('updated_at', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false, nullsFirst: false })
          .limit(1)
          .abortSignal(requestController.signal)
          .maybeSingle(),
        supabase
          .from('alumni_testimonials')
          .select('*')
          .order('created_at', { ascending: false })
          .abortSignal(requestController.signal),
        supabase
          .from('gallery_items')
          .select('*')
          .order('created_at', { ascending: true })
          .abortSignal(requestController.signal),
      ])

      const loadErrors: string[] = []

      if (configResult.error) {
        console.error('Gagal memuat konfigurasi beranda:', configResult.error)
        loadErrors.push('konfigurasi beranda')
      } else if (configResult.data) {
        const configData = configResult.data
        setConfigId(configData.id)
        setHeroTitle(configData.hero_title || '')
        setHeroSubtitle(configData.hero_subtitle || '')
        setHeroImageUrl(configData.hero_image_url || '')
        setStatSiswa(configData.stat_siswa || 1250)
        setStatGuru(configData.stat_guru || 75)
        setStatStaf(configData.stat_staf || 30)
        setStatPrestasi(configData.stat_prestasi || 180)
        setPpdbTitle(configData.ppdb_banner_title || '')
        setPpdbDesc(configData.ppdb_banner_desc || '')
      }

      if (alumniResult.error) {
        console.error('Gagal memuat testimoni alumni:', alumniResult.error)
        loadErrors.push('testimoni alumni')
      } else {
        setAlumniList(alumniResult.data || [])
      }

      if (galleryResult.error) {
        console.error('Gagal memuat galeri beranda:', galleryResult.error)
        loadErrors.push('galeri')
      } else {
        setGalleryList(galleryResult.data || [])
      }

      if (loadErrors.length > 0) {
        setStatusMessage({
          type: 'error',
          text: `Sebagian data gagal dimuat (${loadErrors.join(', ')}). Periksa koneksi dan kebijakan akses baca (RLS) Supabase.`,
        })
      }
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Gagal mengambil data beranda.',
      })
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Upload Foto Hero
  const handleUploadHeroImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingHero(true)
    setStatusMessage(null)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `hero-${Date.now()}.${fileExt}`
      const filePath = `hero/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('homepage')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('homepage')
        .getPublicUrl(filePath)

      setHeroImageUrl(urlData.publicUrl)
      setStatusMessage({ type: 'success', text: 'Foto hero banner berhasil diunggah!' })
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal mengunggah foto hero banner.' })
    } finally {
      setUploadingHero(false)
    }
  }

  // Upload Multiple Foto Galeri (Maksimal 6 foto)
  const handleUploadGalleryImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const availableSlot = 6 - currentImageCount - galleryImages.length
    if (availableSlot <= 0) {
      alert('Galeri foto sudah mencapai batas maksimal 6 foto.')
      return
    }

    const filesToUpload = Array.from(files).slice(0, availableSlot)
    if (files.length > availableSlot) {
      alert(`Hanya ${availableSlot} foto pertama yang diunggah karena batas maksimal adalah 6 foto.`)
    }

    setUploadingGalleryImg(true)
    setStatusMessage(null)

    try {
      const uploaded: { title: string; url: string }[] = []

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `gallery-${Date.now()}-${i}.${fileExt}`
        const filePath = `gallery/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('homepage')
          .upload(filePath, file, { upsert: true })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('homepage')
          .getPublicUrl(filePath)

        uploaded.push({
          title: `Foto Kegiatan ${galleryImages.length + i + 1}`,
          url: urlData.publicUrl,
        })
      }

      setGalleryImages((prev) => [...prev, ...uploaded])
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal mengunggah foto galeri.' })
    } finally {
      setUploadingGalleryImg(false)
    }
  }

  const handleRemoveSelectedImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Simpan Konfigurasi Beranda
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingConfig(true)
    setStatusMessage(null)

    try {
      const payload = {
        hero_title: heroTitle.trim(),
        hero_subtitle: heroSubtitle.trim(),
        hero_image_url: heroImageUrl,
        stat_siswa: Number(statSiswa),
        stat_guru: Number(statGuru),
        stat_staf: Number(statStaf),
        stat_prestasi: Number(statPrestasi),
        ppdb_banner_title: ppdbTitle.trim(),
        ppdb_banner_desc: ppdbDesc.trim(),
        updated_at: new Date().toISOString(),
      }

      if (configId) {
        const { error } = await supabase
          .from('homepage_config')
          .update(payload)
          .eq('id', configId)

        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('homepage_config')
          .insert([payload])
          .select('id')
          .single()

        if (error) throw error
        if (data) setConfigId(data.id)
      }

      setStatusMessage({ type: 'success', text: 'Pengaturan Beranda berhasil disimpan!' })
      router.refresh()
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menyimpan pengaturan beranda.' })
    } finally {
      setSavingConfig(false)
    }
  }

  // Handle Modal Alumni
  const handleOpenAddAlumni = () => {
    if (alumniList.length >= 3) {
      setStatusMessage({ type: 'error', text: 'Maksimal hanya 3 testimoni alumni.' })
      return
    }

    setEditingAlumniId(null)
    setAlumniName('')
    setAlumniYear('')
    setAlumniProfession('')
    setAlumniQuote('')
    setAlumniIsActive(true)
    setIsAlumniModalOpen(true)
  }

  const handleOpenEditAlumni = (item: AlumniItem) => {
    setEditingAlumniId(item.id)
    setAlumniName(item.name)
    setAlumniYear(item.graduation_year)
    setAlumniProfession(item.profession)
    setAlumniQuote(item.quote)
    setAlumniIsActive(item.is_active ?? false)
    setIsAlumniModalOpen(true)
  }

  const handleSaveAlumni = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingAlumniId && alumniList.length >= 3) {
      setStatusMessage({ type: 'error', text: 'Maksimal hanya 3 testimoni alumni.' })
      return
    }

    setSavingAlumni(true)

    try {
      const payload = {
        name: alumniName.trim(),
        graduation_year: alumniYear.trim(),
        profession: alumniProfession.trim(),
        quote: alumniQuote.trim(),
        is_active: alumniIsActive,
        updated_at: new Date().toISOString(),
      }

      if (editingAlumniId) {
        const { error } = await supabase
          .from('alumni_testimonials')
          .update(payload)
          .eq('id', editingAlumniId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('alumni_testimonials')
          .insert([payload])

        if (error) throw error
      }

      setIsAlumniModalOpen(false)
      fetchData()
      setStatusMessage({ type: 'success', text: 'Testimoni alumni berhasil disimpan!' })
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menyimpan testimoni alumni.' })
    } finally {
      setSavingAlumni(false)
    }
  }

  const handleDeleteAlumni = async (id: string, name: string) => {
    if (!confirm(`Hapus testimoni alumni dari "${name}"?`)) return

    try {
      const { error } = await supabase
        .from('alumni_testimonials')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchData()
      setStatusMessage({ type: 'success', text: 'Testimoni alumni berhasil dihapus.' })
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menghapus testimoni.' })
    }
  }

  // Handle Modal Galeri
  const handleOpenAddGallery = () => {
    setGalleryType('image')
    setGalleryUrl('')
    setGalleryImages([])
    setIsGalleryModalOpen(true)
  }

  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault()

    if (galleryType === 'video') {
      if (!galleryUrl) {
        alert('Harap masukkan URL Video YouTube terlebih dahulu.')
        return
      }

      setSavingGallery(true)
      try {
        const payload = {
          title: 'Video Kegiatan Sekolah',
          type: 'video',
          url: galleryUrl.trim(),
          updated_at: new Date().toISOString(),
        }

        const { error } = await supabase.from('gallery_items').insert([payload])
        if (error) throw error

        setIsGalleryModalOpen(false)
        fetchData()
        setStatusMessage({ type: 'success', text: 'Video YouTube berhasil ditambahkan!' })
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: err.message || 'Gagal menyimpan video.' })
      } finally {
        setSavingGallery(false)
      }
    } else {
      if (galleryImages.length === 0) {
        alert('Harap unggah minimal 1 foto kegiatan.')
        return
      }

      setSavingGallery(true)
      try {
        const payloads = galleryImages.map((img) => ({
          title: img.title,
          type: 'image',
          url: img.url,
          updated_at: new Date().toISOString(),
        }))

        const { error } = await supabase.from('gallery_items').insert(payloads)
        if (error) throw error

        setIsGalleryModalOpen(false)
        fetchData()
        setStatusMessage({ type: 'success', text: `${galleryImages.length} foto galeri berhasil disimpan!` })
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: err.message || 'Gagal menyimpan foto galeri.' })
      } finally {
        setSavingGallery(false)
      }
    }
  }

  const handleDeleteGallery = async (id: string) => {
    if (!confirm('Hapus item galeri ini?')) return

    try {
      const { error } = await supabase
        .from('gallery_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchData()
      setStatusMessage({ type: 'success', text: 'Item galeri berhasil dihapus.' })
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menghapus item galeri.' })
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-[#a57c31]" />
        <span className="ml-3 text-sm">Memuat pengaturan beranda...</span>
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
            <span className="h-px w-6 bg-amber-300" /> Manajemen Tampilan Utama
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Kelola Halaman Beranda</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-white/65">
            Atur hero banner, statistik, galeri kegiatan, banner PPDB, dan testimoni alumni yang tampil di halaman utama sekolah.
          </p>
        </div>
        <div className="mt-7 border-t border-white/10 pt-5 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Area pengelolaan</p>
          <div className="flex min-h-14 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c99a42]/15 text-amber-300">
              <Layout className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-xs font-medium text-white/85">Beranda sekolah</span>
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

      <form onSubmit={handleSaveConfig} className="space-y-8">
        {/* BAGIAN 1: HERO BANNER & FOTO UTAMA */}
        <section className="space-y-4 rounded-2xl border border-[#e3e0d8] bg-white p-6 shadow-[0_8px_24px_rgba(40,51,46,0.045)]">
          <h2 className="text-base font-bold text-[#17231f] flex items-center gap-2 border-b border-[#e3e0d8] pb-3">
            <Layout className="h-5 w-5 text-[#a57c31]" />
            1. Hero Banner &amp; Foto Utama Paling Atas
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#34443b]">
                Judul Utama Hero
              </label>
              <input
                type="text"
                required
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full rounded-xl border border-[#e3e0d8] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] focus:border-[#bd9142] focus:bg-white focus:ring-4 focus:ring-[#bd9142]/10 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#34443b]">
                Subjudul / Narasi Hero
              </label>
              <textarea
                rows={3}
                required
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="w-full rounded-xl border border-[#e3e0d8] bg-[#faf9f6] p-3.5 text-sm text-[#17231f] focus:border-[#bd9142] focus:bg-white focus:ring-4 focus:ring-[#bd9142]/10 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#34443b]">
                Foto Utama Hero Banner
              </label>
              <div className="space-y-3">
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#dedbd2] bg-[#faf9f6] p-4 transition hover:border-[#bd9142]">
                  <Upload className="h-6 w-6 text-[#a57c31] mb-1" />
                  <span className="text-xs font-semibold text-[#34443b]">
                    {uploadingHero ? 'Mengunggah foto hero...' : 'Pilih Foto Hero Baru'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadHeroImage}
                    disabled={uploadingHero}
                    className="hidden"
                  />
                </label>

                {heroImageUrl && (
                  <div className="relative overflow-hidden rounded-xl border border-[#e3e0d8] bg-[#faf9f6] p-2 max-h-48 flex justify-center">
                    <img src={heroImageUrl} alt="Preview Hero" className="h-full object-cover rounded-lg" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* BAGIAN 2: STATISTIK ANGKA COUNTER */}
        <section className="space-y-4 rounded-2xl border border-[#e3e0d8] bg-white p-6 shadow-[0_8px_24px_rgba(40,51,46,0.045)]">
          <h2 className="text-base font-bold text-[#17231f] flex items-center gap-2 border-b border-[#e3e0d8] pb-3">
            <Users className="h-5 w-5 text-[#a57c31]" />
            2. Statistik Sekolah (Animasi Counter Angka)
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#34443b] flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-[#a57c31]" /> Total Siswa
              </label>
              <input
                type="number"
                required
                value={statSiswa}
                onChange={(e) => setStatSiswa(Number(e.target.value))}
                className="w-full rounded-xl border border-[#e3e0d8] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] focus:border-[#bd9142] focus:bg-white focus:ring-4 focus:ring-[#bd9142]/10 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#34443b] flex items-center gap-1.5">
                <Users className="h-4 w-4 text-[#a57c31]" /> Total Guru
              </label>
              <input
                type="number"
                required
                value={statGuru}
                onChange={(e) => setStatGuru(Number(e.target.value))}
                className="w-full rounded-xl border border-[#e3e0d8] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] focus:border-[#bd9142] focus:bg-white focus:ring-4 focus:ring-[#bd9142]/10 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#34443b] flex items-center gap-1.5">
                <School className="h-4 w-4 text-[#a57c31]" /> Total Staf
              </label>
              <input
                type="number"
                required
                value={statStaf}
                onChange={(e) => setStatStaf(Number(e.target.value))}
                className="w-full rounded-xl border border-[#e3e0d8] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] focus:border-[#bd9142] focus:bg-white focus:ring-4 focus:ring-[#bd9142]/10 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#34443b] flex items-center gap-1.5">
                <Award className="h-4 w-4 text-[#a57c31]" /> Total Prestasi
              </label>
              <input
                type="number"
                required
                value={statPrestasi}
                onChange={(e) => setStatPrestasi(Number(e.target.value))}
                className="w-full rounded-xl border border-[#e3e0d8] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] focus:border-[#bd9142] focus:bg-white focus:ring-4 focus:ring-[#bd9142]/10 focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* BAGIAN 3: BANNER INFORMASI PPDB */}
        <section className="space-y-4 rounded-2xl border border-[#e3e0d8] bg-white p-6 shadow-[0_8px_24px_rgba(40,51,46,0.045)]">
          <h2 className="text-base font-bold text-[#17231f] flex items-center gap-2 border-b border-[#e3e0d8] pb-3">
            <GraduationCap className="h-5 w-5 text-[#a57c31]" />
            3. Banner Informasi Pendaftaran PPDB
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#34443b]">
                Judul Banner PPDB
              </label>
              <input
                type="text"
                required
                value={ppdbTitle}
                onChange={(e) => setPpdbTitle(e.target.value)}
                className="w-full rounded-xl border border-[#e3e0d8] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] focus:border-[#bd9142] focus:bg-white focus:ring-4 focus:ring-[#bd9142]/10 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#34443b]">
                Deskripsi Singkat Banner PPDB
              </label>
              <textarea
                rows={2}
                required
                value={ppdbDesc}
                onChange={(e) => setPpdbDesc(e.target.value)}
                className="w-full rounded-xl border border-[#e3e0d8] bg-[#faf9f6] p-3.5 text-sm text-[#17231f] focus:border-[#bd9142] focus:bg-white focus:ring-4 focus:ring-[#bd9142]/10 focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* TOMBOL SIMPAN KONFIGURASI UTAMA */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={savingConfig || uploadingHero}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#d3aa5d] to-[#c99a42] px-6 py-3 text-xs font-semibold text-[#17231f] shadow-[0_6px_16px_rgba(201,154,66,0.35)] transition hover:from-[#dcb472] hover:to-[#d3aa5d] hover:shadow-[0_8px_20px_rgba(201,154,66,0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bd9142] disabled:opacity-50"
          >
            {savingConfig ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menyimpan Konfigurasi...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Simpan Perubahan Beranda</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* BAGIAN 4: KELOLA GALERI MOMEN KEGIATAN */}
      <section className="space-y-4 rounded-2xl border border-[#e3e0d8] bg-white p-6 shadow-[0_8px_24px_rgba(40,51,46,0.045)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#e3e0d8] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#17231f] flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-[#a57c31]" />
              4. Kelola Galeri Momen Kegiatan (1 Video YouTube &amp; Maks. 6 Foto)
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Satu Video YouTube di sebelah kiri dan maksimal 6 foto kegiatan di grid sebelah kanan. (Terisi {currentImageCount}/6 Foto)
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddGallery}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#dfcfaa] bg-[#fbf8f0] px-3.5 py-2 text-xs font-bold text-[#785e2d] hover:bg-[#f2efe7] transition shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Item Galeri</span>
          </button>
        </div>

        {galleryList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {galleryList.map((item) => (
              <div
                key={item.id}
                className="relative group overflow-hidden rounded-xl border border-[#e3e0d8] bg-[#faf9f6] p-2 shadow-md flex flex-col justify-between"
              >
                {item.type === 'video' ? (
                  <div className="relative h-32 w-full rounded-lg bg-[#f2efe7] flex flex-col items-center justify-center p-2 text-center border border-[#dfcfaa]">
                    <Video className="h-8 w-8 text-[#a57c31] mb-1" />
                    <span className="text-[10px] font-bold text-[#785e2d] uppercase">Video YouTube</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-full">{item.title || item.url}</span>
                  </div>
                ) : (
                  <div className="relative h-32 w-full rounded-lg overflow-hidden bg-[#f2efe7]">
                    <img src={item.url} alt={item.title || 'Foto Galeri'} className="h-full w-full object-cover" />
                    {item.title && (
                      <span className="absolute bottom-1 left-1 right-1 rounded bg-slate-950/80 px-1.5 py-0.5 text-[10px] text-white truncate">
                        {item.title}
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-2 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => handleDeleteGallery(item.id)}
                    className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-700 hover:bg-red-600 hover:text-white transition"
                  >
                    <Trash2 className="h-3 w-3" /> Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-500 italic border border-dashed border-[#e3e0d8] rounded-xl">
            Belum ada item galeri. Klik &quot;Tambah Item Galeri&quot; untuk menambahkan Video YouTube atau Foto.
          </div>
        )}
      </section>

      {/* BAGIAN 5: KELOLA KESAN & PESAN ALUMNI */}
      <section className="space-y-4 rounded-2xl border border-[#e3e0d8] bg-white p-6 shadow-[0_8px_24px_rgba(40,51,46,0.045)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#e3e0d8] pb-4">
          <h2 className="text-base font-bold text-[#17231f] flex items-center gap-2">
            <Quote className="h-5 w-5 text-[#a57c31]" />
            5. Kelola Kesan &amp; Pesan Alumni
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-slate-500">{alumniList.length}/3 testimoni</span>
            <button
              type="button"
              onClick={handleOpenAddAlumni}
              disabled={alumniList.length >= 3}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#dfcfaa] bg-[#fbf8f0] px-3.5 py-2 text-xs font-bold text-[#785e2d] transition hover:bg-[#f2efe7] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span>{alumniList.length >= 3 ? 'Batas 3 testimoni tercapai' : 'Tambah Testimoni Alumni'}</span>
            </button>
          </div>
        </div>

        {alumniList.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-4">
            {alumniList.map((item) => (
              <div
                key={item.id}
                className="flex w-full max-w-md flex-col justify-between rounded-xl border border-[#e3e0d8] bg-[#faf9f6] p-4 shadow-md xl:w-[calc(33.333%-1rem)]"
              >
                <p className="text-xs text-[#34443b] italic mb-4 line-clamp-4">
                  &quot;{item.quote}&quot;
                </p>

                <div className="space-y-2 border-t border-[#e3e0d8] pt-3">
                  <div>
                    <h4 className="text-xs font-bold text-[#17231f]">{item.name}</h4>
                    <p className="text-[11px] text-[#a57c31]">{item.graduation_year}</p>
                    <p className="text-[10px] text-slate-500">{item.profession}</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e3e0d8]">
                    <button
                      type="button"
                      onClick={() => handleOpenEditAlumni(item)}
                      className="rounded-lg border border-[#e3e0d8] bg-[#f2efe7] p-1.5 text-xs text-[#34443b] hover:text-[#17231f]"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAlumni(item.id, item.name)}
                      className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-xs text-red-700 transition hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-500 italic border border-dashed border-[#e3e0d8] rounded-xl">
            Belum ada testimoni alumni. Klik &quot;Tambah Testimoni Alumni&quot; di atas.
          </div>
        )}
      </section>

      {/* MODAL FORM GALERI */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl border border-[#e3e0d8] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e3e0d8] pb-4">
              <h2 className="text-base font-bold text-[#17231f] flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-[#a57c31]" />
                Tambah Item Galeri Momen
              </h2>
              <button
                type="button"
                onClick={() => setIsGalleryModalOpen(false)}
                className="rounded-lg bg-[#f2efe7] p-1.5 text-slate-400 hover:text-[#17231f]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGallery} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#34443b]">
                  Jenis Item Galeri
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setGalleryType('image'); setGalleryUrl('') }}
                    className={`flex-1 rounded-xl border py-2 text-xs font-bold transition ${
                      galleryType === 'image'
                        ? 'border-[#bd9142] bg-[#fbf8f0] text-[#785e2d]'
                        : 'border-[#e3e0d8] bg-[#faf9f6] text-slate-400'
                    }`}
                  >
                    Foto Kegiatan (Maks 6)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setGalleryType('video'); setGalleryUrl('') }}
                    className={`flex-1 rounded-xl border py-2 text-xs font-bold transition ${
                      galleryType === 'video'
                        ? 'border-[#bd9142] bg-[#fbf8f0] text-[#785e2d]'
                        : 'border-[#e3e0d8] bg-[#faf9f6] text-slate-400'
                    }`}
                  >
                    Video YouTube
                  </button>
                </div>
              </div>

              {galleryType === 'video' ? (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#34443b]">
                    URL Video YouTube
                  </label>
                  <input
                    type="url"
                    required
                    value={galleryUrl}
                    onChange={(e) => setGalleryUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=XXXXX atau https://youtu.be/XXXXX"
                    className="w-full rounded-xl border border-[#e3e0d8] bg-[#faf9f6] px-3.5 py-2.5 text-xs text-[#17231f] focus:border-[#bd9142] focus:bg-white focus:ring-4 focus:ring-[#bd9142]/10 focus:outline-none"
                  />
                  <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                    Pastikan video dapat ditonton publik atau tidak publik, dan izin penyematan video di YouTube aktif.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#34443b]">
                      Upload Foto Kegiatan (Bisa Lebih dari 1 / Multiple)
                    </label>
                    <span className="text-[10px] text-[#a57c31] font-bold">
                      Sisa Slot: {6 - currentImageCount - galleryImages.length} Foto
                    </span>
                  </div>

                  <div className="space-y-3">
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#dedbd2] bg-[#faf9f6] p-4 transition hover:border-[#bd9142]">
                      <Upload className="h-6 w-6 text-[#a57c31] mb-1" />
                      <span className="text-xs font-semibold text-[#34443b]">
                        {uploadingGalleryImg ? 'Mengunggah foto...' : '+ Pilih Foto (Bisa Multiple maks 6)'}
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleUploadGalleryImages}
                        disabled={uploadingGalleryImg || (6 - currentImageCount - galleryImages.length) <= 0}
                        className="hidden"
                      />
                    </label>

                    {/* Preview List Foto yang akan Diunggah */}
                    {galleryImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border border-[#e3e0d8] rounded-xl bg-[#faf9f6]">
                        {galleryImages.map((img, idx) => (
                          <div key={idx} className="relative group h-20 rounded-lg overflow-hidden border border-[#e3e0d8] bg-[#f2efe7]">
                            <img src={img.url} alt={`Preview ${idx}`} className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveSelectedImage(idx)}
                              className="absolute top-1 right-1 rounded-full bg-red-600/80 p-1 text-white transition hover:bg-red-700"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-[#e3e0d8] pt-4">
                <button
                  type="button"
                  onClick={() => setIsGalleryModalOpen(false)}
                  className="rounded-xl border border-[#e3e0d8] px-4 py-2 text-xs font-semibold text-slate-500 transition hover:bg-[#faf9f6] hover:text-[#17231f]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingGallery || uploadingGalleryImg}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#d3aa5d] to-[#c99a42] px-5 py-2 text-xs font-bold text-[#17231f] shadow-[0_6px_16px_rgba(201,154,66,0.25)] transition hover:from-[#dcb472] hover:to-[#d3aa5d] disabled:opacity-50"
                >
                  {savingGallery ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Simpan Galeri</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FORM ALUMNI */}
      {isAlumniModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl border border-[#e3e0d8] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e3e0d8] pb-4">
              <h2 className="text-base font-bold text-[#17231f] flex items-center gap-2">
                <Quote className="h-5 w-5 text-[#a57c31]" />
                {editingAlumniId ? 'Edit Testimoni Alumni' : 'Tambah Testimoni Alumni'}
              </h2>
              <button
                type="button"
                onClick={() => setIsAlumniModalOpen(false)}
                className="rounded-lg bg-[#f2efe7] p-1.5 text-slate-400 hover:text-[#17231f]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAlumni} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#34443b]">
                  Nama Lengkap Alumni
                </label>
                <input
                  type="text"
                  required
                  value={alumniName}
                  onChange={(e) => setAlumniName(e.target.value)}
                  placeholder="Contoh: Ahmad Fauzi, S.Kom."
                  className="w-full rounded-xl border border-[#e3e0d8] bg-[#faf9f6] px-3.5 py-2.5 text-xs text-[#17231f] focus:border-[#bd9142] focus:bg-white focus:ring-4 focus:ring-[#bd9142]/10 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#34443b]">
                    Angkatan Lulusan
                  </label>
                  <input
                    type="text"
                    required
                    value={alumniYear}
                    onChange={(e) => setAlumniYear(e.target.value)}
                    placeholder="Contoh: Alumni Angkatan 2021"
                    className="w-full rounded-xl border border-[#e3e0d8] bg-[#faf9f6] px-3.5 py-2.5 text-xs text-[#17231f] focus:border-[#bd9142] focus:bg-white focus:ring-4 focus:ring-[#bd9142]/10 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#34443b]">
                    Pekerjaan / Status Saat Ini
                  </label>
                  <input
                    type="text"
                    required
                    value={alumniProfession}
                    onChange={(e) => setAlumniProfession(e.target.value)}
                    placeholder="Contoh: Software Engineer"
                    className="w-full rounded-xl border border-[#e3e0d8] bg-[#faf9f6] px-3.5 py-2.5 text-xs text-[#17231f] focus:border-[#bd9142] focus:bg-white focus:ring-4 focus:ring-[#bd9142]/10 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#34443b]">
                  Kesan, Pesan / Testimoni
                </label>
                <textarea
                  rows={4}
                  required
                  value={alumniQuote}
                  onChange={(e) => setAlumniQuote(e.target.value)}
                  placeholder="Tuliskan testimoni atau kesan pesan selama sekolah..."
                  className="w-full rounded-xl border border-[#e3e0d8] bg-[#faf9f6] p-3.5 text-xs text-[#17231f] focus:border-[#bd9142] focus:bg-white focus:ring-4 focus:ring-[#bd9142]/10 focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-[#34443b]">
                <input
                  type="checkbox"
                  checked={alumniIsActive}
                  onChange={(e) => setAlumniIsActive(e.target.checked)}
                  className="h-4 w-4 accent-[#c99a42]"
                />
                Tampilkan testimoni ini di halaman beranda
              </label>

              <div className="flex justify-end gap-2 border-t border-[#e3e0d8] pt-4">
                <button
                  type="button"
                  onClick={() => setIsAlumniModalOpen(false)}
                  className="rounded-xl border border-[#e3e0d8] px-4 py-2 text-xs font-semibold text-slate-500 transition hover:bg-[#faf9f6] hover:text-[#17231f]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingAlumni}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#d3aa5d] to-[#c99a42] px-5 py-2 text-xs font-bold text-[#17231f] shadow-[0_6px_16px_rgba(201,154,66,0.25)] transition hover:from-[#dcb472] hover:to-[#d3aa5d] disabled:opacity-50"
                >
                  {savingAlumni ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Simpan Testimoni</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
