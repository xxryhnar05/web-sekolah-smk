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
  GraduationCap,
  User,
  Calendar,
  Eye,
  EyeOff,
  Save,
  Search,
  Upload,
  Image as ImageIcon,
} from 'lucide-react'

interface EventWisudaItem {
  id: string
  title: string
  author_name: string
  upload_date: string
  cover_image_url: string
  detail_images: string[]
  is_active: boolean
}

export default function AdminEventWisudaPage() {
  const router = useRouter()
  const [items, setItems] = useState<EventWisudaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingDetails, setUploadingDetails] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // State Modal CRUD
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // State Form Input
  const [title, setTitle] = useState('')
  const [authorName, setAuthorName] = useState('Admin Redaksi')
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0])
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [detailImages, setDetailImages] = useState<string[]>([])
  const [isActive, setIsActive] = useState<boolean>(true)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('event_wisuda')
        .select('*')
        .order('upload_date', { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal memuat data event wisuda.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleOpenAddModal = () => {
    setEditingId(null)
    setTitle('')
    setAuthorName('Admin Redaksi')
    setUploadDate(new Date().toISOString().split('T')[0])
    setCoverImageUrl('')
    setDetailImages([])
    setIsActive(true)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item: EventWisudaItem) => {
    setEditingId(item.id)
    setTitle(item.title)
    setAuthorName(item.author_name)
    setUploadDate(item.upload_date)
    setCoverImageUrl(item.cover_image_url)
    setDetailImages(item.detail_images || [])
    setIsActive(item.is_active)
    setIsModalOpen(true)
  }

  // Upload Foto Utama
  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingCover(true)
    setStatusMessage(null)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `cover-wisuda-${Date.now()}.${fileExt}`
      const filePath = `covers/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('event-wisuda')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('event-wisuda')
        .getPublicUrl(filePath)

      setCoverImageUrl(urlData.publicUrl)
      setStatusMessage({ type: 'success', text: 'Foto utama berhasil diunggah!' })
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal mengunggah foto utama.' })
    } finally {
      setUploadingCover(false)
    }
  }

  // Upload Beberapa Foto Detail (Galeri)
  const handleUploadDetailImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingDetails(true)
    setStatusMessage(null)

    try {
      const uploadedUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `detail-wisuda-${Date.now()}-${i}.${fileExt}`
        const filePath = `details/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('event-wisuda')
          .upload(filePath, file, { upsert: true })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('event-wisuda')
          .getPublicUrl(filePath)

        uploadedUrls.push(urlData.publicUrl)
      }

      setDetailImages((prev) => [...prev, ...uploadedUrls])
      setStatusMessage({ type: 'success', text: `${uploadedUrls.length} foto detail berhasil ditambahkan!` })
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal mengunggah foto detail.' })
    } finally {
      setUploadingDetails(false)
    }
  }

  const handleRemoveDetailImage = (index: number) => {
    setDetailImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!coverImageUrl) {
      setStatusMessage({ type: 'error', text: 'Harap unggah foto utama wisuda terlebih dahulu.' })
      return
    }

    setSaving(true)
    setStatusMessage(null)

    try {
      const payload = {
        title: title.trim(),
        author_name: authorName.trim(),
        upload_date: uploadDate,
        cover_image_url: coverImageUrl,
        detail_images: detailImages,
        description: '',
        is_active: isActive,
        updated_at: new Date().toISOString(),
      }

      if (editingId) {
        const { error } = await supabase
          .from('event_wisuda')
          .update(payload)
          .eq('id', editingId)

        if (error) throw error
        setStatusMessage({ type: 'success', text: 'Event Wisuda berhasil diperbarui!' })
      } else {
        const { error } = await supabase
          .from('event_wisuda')
          .insert([payload])

        if (error) throw error
        setStatusMessage({ type: 'success', text: 'Event Wisuda baru berhasil ditambahkan!' })
      }

      setIsModalOpen(false)
      fetchEvents()
      router.refresh()
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menyimpan Event Wisuda.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, itemTitle: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus Event "${itemTitle}"?`)) return

    try {
      const { error } = await supabase
        .from('event_wisuda')
        .delete()
        .eq('id', id)

      if (error) throw error
      setStatusMessage({ type: 'success', text: `Event "${itemTitle}" berhasil dihapus.` })
      fetchEvents()
      router.refresh()
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menghapus event.' })
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('event_wisuda')
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      fetchEvents()
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Gagal mengubah status aktif event.' })
    }
  }

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.author_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
        <span className="ml-3 text-sm">Memuat data Admin Event Wisuda...</span>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-7 font-sans text-[#34443b] antialiased">
      <header className="relative isolate flex flex-col gap-4 overflow-hidden rounded-2xl bg-[#17231f] px-6 py-7 text-white shadow-[0_16px_36px_rgba(23,35,31,0.16)] sm:flex-row sm:items-center sm:justify-between sm:px-9 sm:py-8">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[url('/batik2.png')] bg-[length:420px_auto] bg-right-top bg-no-repeat opacity-35 mix-blend-screen" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#17231f] via-[#17231f]/95 to-[#17231f]/35" />
        <div className="relative max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300">
            Galeri &amp; Momen Spesial
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-amber-400" />
            Kelola Event Wisuda
          </h1>
          <p className="mt-1.5 text-xs text-white/65 sm:text-sm">
            Tambah dan atur dokumentasi wisuda, foto utama, serta deretan foto detail kegiatan.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-amber-500/20 px-4 py-2.5 text-xs font-bold text-amber-300 shadow-lg transition hover:border-amber-400 hover:bg-amber-400 hover:text-slate-950 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Event Wisuda</span>
        </button>
      </header>

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

      {/* Bar Pencarian */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari judul event wisuda atau pengunggah..."
          className="w-full rounded-xl border border-[#dedbd2] bg-white pl-10 pr-4 py-3 text-sm text-[#17231f] placeholder:text-slate-400 focus:border-[#bd9142] focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
        />
      </div>

      {/* Grid Daftar Event Wisuda */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`group flex flex-col justify-between rounded-2xl border overflow-hidden bg-white shadow-[0_8px_24px_rgba(40,51,46,0.045)] transition ${
                item.is_active
                  ? 'border-[#e3e0d8] hover:border-[#c99a42]'
                  : 'border-[#e3e0d8] opacity-60'
              }`}
            >
              {/* Cover Image */}
              <div className="relative h-48 w-full overflow-hidden border-b border-[#e3e0d8] bg-[#f2efe7]">
                <img
                  src={item.cover_image_url}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                {!item.is_active && (
                  <span className="absolute top-2 right-2 rounded-md border border-red-500/30 bg-red-500/20 px-2 py-0.5 text-[10px] text-red-300 font-semibold backdrop-blur-md">
                    Sembunyi
                  </span>
                )}
                <span className="absolute bottom-2 left-2 rounded-md bg-slate-950/80 px-2 py-1 text-[10px] font-semibold text-amber-300 backdrop-blur-md border border-white/10">
                  {item.detail_images?.length || 0} Foto Detail
                </span>
              </div>

              {/* Info Details */}
              <div className="flex flex-1 flex-col justify-between space-y-3 bg-white p-4">
                <div>
                  <h3 className="text-sm font-bold text-[#17231f] line-clamp-2 group-hover:text-[#a57c31] transition-colors">
                    {item.title}
                  </h3>
                  <div className="mt-3 space-y-1 text-xs text-slate-500">
                    <p className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-[#a57c31]" />
                      <span>Pengunggah: <strong className="text-[#34443b]">{item.author_name}</strong></span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#a57c31]" />
                      <span>Tanggal: <strong className="text-[#34443b]">{new Date(item.upload_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-[#e3e0d8]">
                  <button
                    onClick={() => handleToggleActive(item.id, item.is_active)}
                    title={item.is_active ? 'Sembunyikan' : 'Tampilkan'}
                    className={`rounded-lg border p-1.5 transition ${
                      item.is_active
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white'
                        : 'border-[#dedbd2] bg-[#faf9f6] text-slate-500 hover:bg-slate-600 hover:text-white'
                    }`}
                  >
                    {item.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="flex items-center gap-1 rounded-lg border border-[#dedbd2] bg-[#faf9f6] px-3 py-1.5 text-xs font-medium text-[#34443b] transition hover:border-[#bd9142] hover:bg-[#f5ecda]"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-[#a57c31]" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#dedbd2] bg-[#faf9f6] py-12 text-center text-sm text-slate-500">
          Belum ada postingan Event Wisuda.
        </div>
      )}

      {/* MODAL FORM CREATE / EDIT EVENT WISUDA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#dfcfaa] bg-white p-6 text-[#34443b] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e3e0d8] pb-4">
              <h2 className="text-base font-bold text-[#17231f] flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-[#a57c31]" />
                {editingId ? 'Edit Event Wisuda' : 'Tambah Event Wisuda Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg bg-[#f2efe7] p-1.5 text-slate-500 transition hover:bg-[#e8e2d4] hover:text-[#17231f]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 [&_label]:text-[#34443b] [&_input:not([type=file])]:border-[#dedbd2] [&_input:not([type=file])]:bg-[#faf9f6] [&_input:not([type=file])]:text-[#17231f] [&_input:not([type=file])]:placeholder:text-slate-400 [&_input:not([type=file])]:focus:border-[#bd9142]">
              {/* Judul Event */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">
                  Judul Event Wisuda
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Wisuda Purna Siswa Angkatan XV Tahun 2026"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-amber-400/60 focus:outline-none"
                />
              </div>

              {/* Upload Foto Utama */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">
                  Foto Utama Wisuda (Cover)
                </label>
                <div className="space-y-3">
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-slate-950 p-4 hover:border-amber-400/50 transition">
                    <Upload className="h-6 w-6 text-amber-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-300">
                      {uploadingCover ? 'Mengunggah foto utama...' : 'Pilih Foto Utama'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadCover}
                      disabled={uploadingCover}
                      className="hidden"
                    />
                  </label>

                  {coverImageUrl && (
                    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-950 p-2 max-h-48 flex justify-center">
                      <img src={coverImageUrl} alt="Preview Cover" className="h-full object-contain rounded-lg" />
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Foto Detail / Galeri */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">
                  Foto Detail Kegiatan Wisuda (Bisa Banyak Foto)
                </label>
                <div className="space-y-3">
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-slate-950 p-4 hover:border-amber-400/50 transition">
                    <ImageIcon className="h-6 w-6 text-amber-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-300">
                      {uploadingDetails ? 'Mengunggah foto detail...' : '+ Pilih Foto Detail Wisuda (Bisa Multiple)'}
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleUploadDetailImages}
                      disabled={uploadingDetails}
                      className="hidden"
                    />
                  </label>

                  {/* List Pratinjau Foto Detail */}
                  {detailImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-white/10 rounded-xl bg-slate-950">
                      {detailImages.map((img, idx) => (
                        <div key={idx} className="relative group h-20 rounded-lg overflow-hidden border border-white/10 bg-slate-900">
                          <img src={img} alt={`Detail ${idx}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveDetailImage(idx)}
                            className="absolute top-1 right-1 rounded-full bg-red-600/80 p-1 text-white hover:bg-red-600 transition"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Pengunggah & Tanggal Upload */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    Nama Akun Pengunggah
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Contoh: Panitia Wisuda / Humas"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-amber-400/60 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    Tanggal Upload / Acara
                  </label>
                  <input
                    type="date"
                    required
                    value={uploadDate}
                    onChange={(e) => setUploadDate(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-amber-400/60 focus:outline-none"
                  />
                </div>
              </div>

              {/* Toggle Status */}
              <div className="flex items-center justify-between rounded-xl border border-[#e3e0d8] bg-[#faf9f6] p-3">
                <span className="text-xs font-semibold text-[#34443b]">Tampilkan di Halaman User?</span>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`rounded-lg border px-3 py-1 text-xs font-bold transition ${
                    isActive
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-[#dedbd2] bg-white text-slate-500'
                  }`}
                >
                  {isActive ? 'Aktif (Tampil)' : 'Sembunyi'}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 border-t border-[#e3e0d8] pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-[#dedbd2] px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#bd9142] hover:text-[#17231f]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingCover || uploadingDetails}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#d3aa5d] to-[#c99a42] px-5 py-2.5 text-xs font-semibold text-[#17231f] shadow-[0_4px_12px_rgba(201,154,66,0.25)] transition hover:from-[#dcb472] hover:to-[#d3aa5d] disabled:cursor-wait disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Simpan Event Wisuda</span>
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