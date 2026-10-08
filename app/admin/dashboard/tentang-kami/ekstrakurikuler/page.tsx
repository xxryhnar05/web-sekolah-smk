'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowserClient'
import {
  Plus,
  Trash2,
  Edit3,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  ImageIcon,
  Calendar,
  User,
  Sparkles,
} from 'lucide-react'

interface Extracurricular {
  id: string
  name: string
  slug: string
  description: string | null
  supervisor: string | null
  logo_url: string | null
  image_url: string | null
  schedule: string | null
  created_at: string
}

export default function AdminEkstrakurikulerPage() {
  const router = useRouter()
  const [extraList, setExtraList] = useState<Extracurricular[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // State Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // State Form Input
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [supervisor, setSupervisor] = useState('')
  const [schedule, setSchedule] = useState('')

  // State Upload Image & Logo dari Komputer
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('')

  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null)
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>('')

  const [uploading, setUploading] = useState(false)

  // Fetch Data Ekstrakurikuler
  const fetchExtracurriculars = async () => {
    try {
      setLoadingData(true)
      const { data, error } = await supabase
        .from('extracurriculars')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setExtraList(data || [])
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Gagal memuat data ekstrakurikuler.' })
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    fetchExtracurriculars()
  }, [])

  // Auto Generate Slug saat Nama diisi
  const handleNameChange = (val: string) => {
    setName(val)
    if (!editingId) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
      setSlug(generatedSlug)
    }
  }

  // Upload Single File ke Supabase Storage (Bucket: 'school-media')
  const uploadFileToStorage = async (file: File, folder: string): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}-${Date.now()}.${fileExt}`
    const filePath = `extracurriculars/${folder}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('school-media')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      throw new Error(`Gagal mengunggah file ${folder}: ${uploadError.message}`)
    }

    const { data: publicUrlData } = supabase.storage
      .from('school-media')
      .getPublicUrl(filePath)

    return publicUrlData.publicUrl
  }

  // Buka Modal Tambah Data
  const handleOpenAddModal = () => {
    setEditingId(null)
    setName('')
    setSlug('')
    setDescription('')
    setSupervisor('')
    setSchedule('')
    setSelectedImageFile(null)
    setImagePreviewUrl('')
    setSelectedLogoFile(null)
    setLogoPreviewUrl('')
    setIsModalOpen(true)
  }

  // Buka Modal Edit Data
  const handleOpenEditModal = (item: Extracurricular) => {
    setEditingId(item.id)
    setName(item.name || '')
    setSlug(item.slug || '')
    setDescription(item.description || '')
    setSupervisor(item.supervisor || '')
    setSchedule(item.schedule || '')

    setImagePreviewUrl(item.image_url || '')
    setSelectedImageFile(null)

    setLogoPreviewUrl(item.logo_url || '')
    setSelectedLogoFile(null)

    setIsModalOpen(true)
  }

  // Submit Handler (Create & Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatusMessage(null)

    try {
      let finalImageUrl = imagePreviewUrl
      let finalLogoUrl = logoPreviewUrl

      // Process upload foto utama jika dipilih
      if (selectedImageFile) {
        setUploading(true)
        finalImageUrl = await uploadFileToStorage(selectedImageFile, 'images')
      }

      // Process upload logo jika dipilih
      if (selectedLogoFile) {
        setUploading(true)
        finalLogoUrl = await uploadFileToStorage(selectedLogoFile, 'logos')
      }

      const payload = {
        name,
        slug: slug.trim().toLowerCase(),
        description: description || null,
        supervisor: supervisor || null,
        schedule: schedule || null,
        image_url: finalImageUrl || null,
        logo_url: finalLogoUrl || null,
      }

      if (editingId) {
        // Update
        const { error } = await supabase
          .from('extracurriculars')
          .update(payload)
          .eq('id', editingId)

        if (error) throw error
        setStatusMessage({ type: 'success', text: 'Ekstrakurikuler berhasil diperbarui!' })
      } else {
        // Insert
        const { error } = await supabase
          .from('extracurriculars')
          .insert([payload])

        if (error) throw error
        setStatusMessage({ type: 'success', text: 'Ekstrakurikuler baru berhasil ditambahkan!' })
      }

      setIsModalOpen(false)
      fetchExtracurriculars()
      router.refresh()
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menyimpan data.' })
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  // Delete Handler
  const handleDelete = async (id: string, extraName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ekstrakurikuler "${extraName}"?`)) return

    try {
      const { error } = await supabase
        .from('extracurriculars')
        .delete()
        .eq('id', id)

      if (error) throw error
      setStatusMessage({ type: 'success', text: `Ekstrakurikuler "${extraName}" berhasil dihapus.` })
      fetchExtracurriculars()
      router.refresh()
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menghapus data.' })
    }
  }

  if (loadingData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-[#bd9142]" />
        <span className="ml-3 text-sm">Memuat data Ekstrakurikuler...</span>
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
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Ekstrakurikuler</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/65">Kelola kegiatan, jadwal, pembina, foto, dan logo ekstrakurikuler sekolah.</p>
        </div>
        <div className="mt-7 border-t border-white/10 pt-5 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Area pengelolaan</p>
          <div className="flex min-h-14 items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3">
            <span className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c99a42]/15 text-amber-300"><Sparkles className="h-4 w-4" /></span><span><span className="block text-xs font-medium text-white/85">Profil sekolah</span><span className="mt-1 block text-[11px] text-white/45">Kegiatan siswa</span></span></span>
            <button onClick={handleOpenAddModal} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-b from-[#d3aa5d] to-[#c99a42] px-3 py-2 text-[11px] font-semibold text-[#17231f] shadow-sm transition hover:from-[#dcb472] hover:to-[#d3aa5d]"><Plus className="h-3.5 w-3.5" /> Tambah</button>
          </div>
        </div>
      </section>

      {/* Pesan Status */}
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

      {/* Grid Kartu Ekstrakurikuler */}
      {extraList.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {extraList.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e3e0d8] bg-white shadow-[0_8px_24px_rgba(40,51,46,0.045)] transition hover:-translate-y-0.5 hover:border-[#cbb783] hover:shadow-[0_10px_24px_rgba(40,51,46,0.08)]"
            >
              <div>
                {/* Header Foto & Logo */}
                <div className="relative h-64 w-full overflow-hidden bg-[#f3f2ee] sm:h-72">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : item.logo_url ? (
                    <div className="relative h-full w-full overflow-hidden bg-[#f3f2ee]">
                      <img
                        src={item.logo_url}
                        alt={`Logo ${item.name}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#f3f2ee] text-slate-400">
                      <Sparkles className="h-12 w-12" />
                    </div>
                  )}

                  {/* Logo Badge Overlay */}
                  {item.image_url && item.logo_url && (
                    <div className="absolute top-3 left-3 h-11 w-11 overflow-hidden rounded-xl border border-white/80 bg-white/90 p-1 shadow-md backdrop-blur">
                      <img src={item.logo_url} alt="Logo" className="h-full w-full object-contain" />
                    </div>
                  )}
                </div>

                {/* Content Details */}
                <div className="p-5">
                  <h3 className="text-base font-bold text-[#17231f] transition-colors group-hover:text-[#785e2d]">
                    {item.name}
                  </h3>

                  {item.description && (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-4 space-y-1.5 border-t border-[#eeece6] pt-3 text-[11px] text-slate-500">
                    {item.supervisor && (
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 shrink-0 text-[#a57c31]" />
                        <span>Pembina: {item.supervisor}</span>
                      </div>
                    )}
                    {item.schedule && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-[#a57c31]" />
                        <span>Jadwal: {item.schedule}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-[#eeece6] p-4">
                <button
                  onClick={() => handleOpenEditModal(item)}
                  className="flex items-center gap-1 rounded-lg border border-[#e3e0d8] bg-[#faf9f6] px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-[#bd9142] hover:text-[#785e2d]"
                >
                  <Edit3 className="h-3.5 w-3.5 text-[#a57c31]" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.name)}
                  className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:border-red-500 hover:bg-red-500 hover:text-white"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#d9d5ca] bg-white py-12 text-center text-sm text-slate-500">
          Belum ada data Ekstrakurikuler. Klik tombol &quot;Tambah Ekstrakurikuler&quot; untuk menambahkan.
        </div>
      )}

      {/* MODAL DIALOG FORM (CREATE / EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17231f]/65 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#e3e0d8] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e3e0d8] pb-4">
              <h2 className="text-base font-bold text-[#17231f]">
                {editingId ? 'Edit Ekstrakurikuler' : 'Tambah Ekstrakurikuler Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg bg-[#f3f2ee] p-1.5 text-slate-500 transition hover:bg-[#e9f0eb] hover:text-[#17231f]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Nama & Slug */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Nama Ekstrakurikuler</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Pramuka / PMR / Futsal"
                    className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="pramuka / pmr"
                    className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Pembina & Jadwal */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Nama Pembina / Pelatih</label>
                  <input
                    type="text"
                    value={supervisor}
                    onChange={(e) => setSupervisor(e.target.value)}
                    placeholder="Ahmad Fauzi, S.Pd."
                    className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Jadwal Latihan / Kegiatan</label>
                  <input
                    type="text"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    placeholder="Jumat, 15:00 - 17:00 WIB"
                    className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Deskripsi Singkat</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Penjelasan kegiatan ekstrakurikuler..."
                  className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] p-3 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                />
              </div>

              {/* UPLOAD FOTO UTAMA DARI KOMPUTER */}
              <div className="space-y-2 border-t border-[#e3e0d8] pt-3">
                <label className="block text-xs font-semibold text-slate-700">Foto Dokumentasi Kegiatan (Upload dari Komputer)</label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="flex flex-col items-center justify-center rounded-xl border border-[#e3e0d8] bg-[#faf9f6] p-2 sm:col-span-1">
                    {imagePreviewUrl ? (
                      <img src={imagePreviewUrl} alt="Preview Foto" className="h-48 w-full rounded-lg border border-[#dfcfaa] object-contain" />
                    ) : (
                      <div className="flex h-48 w-full items-center justify-center rounded-lg bg-[#f3f2ee] text-slate-400">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-center sm:col-span-2">
                    <label htmlFor="extra_image_file" className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d9d5ca] bg-[#faf9f6] p-4 transition hover:border-[#bd9142]/70 hover:bg-[#fbf8f0]">
                      <Upload className="mb-1 h-5 w-5 text-[#a57c31]" />
                      <span className="text-xs font-medium text-slate-700">Pilih foto dari komputer</span>
                      <span className="text-[10px] text-slate-400">PNG, JPG, WEBP (Maks. 5 MB)</span>
                      <input
                        id="extra_image_file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setSelectedImageFile(file)
                            setImagePreviewUrl(URL.createObjectURL(file))
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {selectedImageFile && (
                      <p className="mt-1.5 truncate font-mono text-[11px] text-[#785e2d]">
                        Terpilih: {selectedImageFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* UPLOAD LOGO DARI KOMPUTER */}
              <div className="space-y-2 border-t border-[#e3e0d8] pt-3">
                <label className="block text-xs font-semibold text-slate-700">Logo Ekstrakurikuler (Upload dari Komputer - Opsional)</label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <div className="flex flex-col items-center justify-center rounded-xl border border-[#e3e0d8] bg-[#faf9f6] p-2 sm:col-span-1">
                    {logoPreviewUrl ? (
                      <img src={logoPreviewUrl} alt="Preview Logo" className="h-16 w-16 rounded-lg border border-[#dfcfaa] object-contain" />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#f3f2ee] text-slate-400">
                        <Sparkles className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-center sm:col-span-3">
                    <label htmlFor="extra_logo_file" className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d9d5ca] bg-[#faf9f6] p-3 transition hover:border-[#bd9142]/70 hover:bg-[#fbf8f0]">
                      <Upload className="mb-1 h-4 w-4 text-[#a57c31]" />
                      <span className="text-xs font-medium text-slate-700">Pilih logo dari komputer</span>
                      <input
                        id="extra_logo_file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setSelectedLogoFile(file)
                            setLogoPreviewUrl(URL.createObjectURL(file))
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {selectedLogoFile && (
                      <p className="mt-1 truncate font-mono text-[11px] text-[#785e2d]">
                        Terpilih: {selectedLogoFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 border-t border-[#e3e0d8] pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-[#dedbd2] px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-[#f3f2ee] hover:text-[#17231f]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#d3aa5d] to-[#c99a42] px-5 py-2.5 text-xs font-semibold text-[#17231f] shadow-sm transition hover:from-[#dcb472] hover:to-[#d3aa5d] disabled:cursor-wait disabled:opacity-50"
                >
                  {saving || uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{uploading ? 'Mengunggah file...' : 'Menyimpan...'}</span>
                    </>
                  ) : (
                    'Simpan Data'
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
