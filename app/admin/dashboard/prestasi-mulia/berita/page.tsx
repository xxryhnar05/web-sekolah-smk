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
  Newspaper,
  User,
  Calendar,
  Eye,
  EyeOff,
  Save,
  Search,
  Upload,
  FileText,
} from 'lucide-react'

interface BeritaItem {
  id: string
  title: string
  image_url: string
  author_name: string
  upload_date: string
  content: string
  is_active: boolean
}

export default function AdminBeritaPage() {
  const router = useRouter()
  const [items, setItems] = useState<BeritaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // State Modal CRUD
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // State Form Input
  const [title, setTitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [authorName, setAuthorName] = useState('Admin Redaksi')
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0])
  const [content, setContent] = useState('')
  const [isActive, setIsActive] = useState<boolean>(true)

  const fetchBerita = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('berita')
        .select('*')
        .order('upload_date', { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal memuat data berita.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBerita()
  }, [])

  const handleOpenAddModal = () => {
    setEditingId(null)
    setTitle('')
    setImageUrl('')
    setAuthorName('Admin Redaksi')
    setUploadDate(new Date().toISOString().split('T')[0])
    setContent('')
    setIsActive(true)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item: BeritaItem) => {
    setEditingId(item.id)
    setTitle(item.title)
    setImageUrl(item.image_url)
    setAuthorName(item.author_name)
    setUploadDate(item.upload_date)
    setContent(item.content)
    setIsActive(item.is_active)
    setIsModalOpen(true)
  }

  // Upload Foto Utama Berita ke Supabase Storage 'berita'
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setStatusMessage(null)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `berita-${Date.now()}.${fileExt}`
      const filePath = `images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('berita')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('berita')
        .getPublicUrl(filePath)

      setImageUrl(urlData.publicUrl)
      setStatusMessage({ type: 'success', text: 'Foto berita berhasil diunggah!' })
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal mengunggah foto berita.' })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageUrl) {
      setStatusMessage({ type: 'error', text: 'Harap unggah foto berita terlebih dahulu.' })
      return
    }

    setSaving(true)
    setStatusMessage(null)

    try {
      const payload = {
        title: title.trim(),
        image_url: imageUrl,
        author_name: authorName.trim(),
        upload_date: uploadDate,
        content: content.trim(),
        is_active: isActive,
        updated_at: new Date().toISOString(),
      }

      if (editingId) {
        const { error } = await supabase
          .from('berita')
          .update(payload)
          .eq('id', editingId)

        if (error) throw error
        setStatusMessage({ type: 'success', text: 'Berita berhasil diperbarui!' })
      } else {
        const { error } = await supabase
          .from('berita')
          .insert([payload])

        if (error) throw error
        setStatusMessage({ type: 'success', text: 'Berita baru berhasil ditambahkan!' })
      }

      setIsModalOpen(false)
      fetchBerita()
      router.refresh()
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menyimpan berita.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, itemTitle: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus berita "${itemTitle}"?`)) return

    try {
      const { error } = await supabase
        .from('berita')
        .delete()
        .eq('id', id)

      if (error) throw error
      setStatusMessage({ type: 'success', text: `Berita "${itemTitle}" berhasil dihapus.` })
      fetchBerita()
      router.refresh()
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menghapus berita.' })
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('berita')
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      fetchBerita()
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Gagal mengubah status aktif berita.' })
    }
  }

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
        <span className="ml-3 text-sm">Memuat data Admin Berita...</span>
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
            Manajemen Konten
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl flex items-center gap-2">
            <Newspaper className="h-7 w-7 text-amber-400" />
            Kelola Berita Sekolah
          </h1>
          <p className="mt-1.5 text-xs text-white/65 sm:text-sm">
            Tambah, edit, dan kelola berita sekolah lengkap dengan foto, judul, pengunggah, tanggal, dan isi berita.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-amber-500/20 px-4 py-2.5 text-xs font-bold text-amber-300 shadow-lg transition hover:border-amber-400 hover:bg-amber-400 hover:text-slate-950 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Berita Baru</span>
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
          placeholder="Cari judul berita, penulis, atau isi..."
          className="w-full rounded-xl border border-[#dedbd2] bg-white pl-10 pr-4 py-3 text-sm text-[#17231f] placeholder:text-slate-400 focus:border-[#bd9142] focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
        />
      </div>

      {/* Grid Daftar Berita */}
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
              {/* Gambar Berita */}
              <div className="relative h-48 w-full overflow-hidden border-b border-[#e3e0d8] bg-[#f2efe7]">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                {!item.is_active && (
                  <span className="absolute top-2 right-2 rounded-md border border-red-500/30 bg-red-500/20 px-2 py-0.5 text-[10px] text-red-300 font-semibold backdrop-blur-md">
                    Sembunyi
                  </span>
                )}
              </div>

              {/* Rincian Berita */}
              <div className="flex flex-1 flex-col justify-between space-y-3 bg-white p-4">
                <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#17231f] line-clamp-2 group-hover:text-[#a57c31] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-3">
                    {item.content}
                  </p>

                  <div className="pt-2 space-y-1 text-xs text-slate-500 border-t border-[#e3e0d8]">
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

                {/* Tombol Aksi */}
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
          Belum ada berita. Klik tombol &quot;Tambah Berita Baru&quot; di atas.
        </div>
      )}

      {/* MODAL FORM CREATE / EDIT BERITA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#dfcfaa] bg-white p-6 text-[#34443b] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e3e0d8] pb-4">
              <h2 className="text-base font-bold text-[#17231f] flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-[#a57c31]" />
                {editingId ? 'Edit Berita Sekolah' : 'Tambah Berita Sekolah Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg bg-[#f2efe7] p-1.5 text-slate-500 transition hover:bg-[#e8e2d4] hover:text-[#17231f]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 [&_label]:text-[#34443b] [&_input:not([type=file])]:border-[#dedbd2] [&_input:not([type=file])]:bg-[#faf9f6] [&_input:not([type=file])]:text-[#17231f] [&_input:not([type=file])]:placeholder:text-slate-400 [&_input:not([type=file])]:focus:border-[#bd9142] [&_textarea]:border-[#dedbd2] [&_textarea]:bg-[#faf9f6] [&_textarea]:text-[#17231f] [&_textarea]:placeholder:text-slate-400 [&_textarea]:focus:border-[#bd9142]">
              {/* Judul Berita */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">
                  Judul Berita
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Pembukaan Kegiatan Pondok Ramadan 1448 H"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-amber-400/60 focus:outline-none"
                />
              </div>

              {/* Upload Foto Utama */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">
                  Foto Utama Berita
                </label>
                <div className="space-y-3">
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-slate-950 p-4 hover:border-amber-400/50 transition">
                    <Upload className="h-6 w-6 text-amber-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-300">
                      {uploading ? 'Mengunggah foto...' : 'Pilih Foto Berita (PNG, JPG, JPEG)'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadImage}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>

                  {imageUrl && (
                    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-950 p-2 max-h-48 flex justify-center">
                      <img src={imageUrl} alt="Preview Berita" className="h-full object-contain rounded-lg" />
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
                    placeholder="Contoh: Admin Redaksi / Tim Jurnalistik"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-amber-400/60 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    Tanggal Upload
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

              {/* Teks Isi Berita */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">
                  Teks Isi Berita
                </label>
                <textarea
                  rows={8}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tuliskan lengkap artikel atau isi narasi berita di sini..."
                  className="w-full rounded-xl border border-white/10 bg-slate-950 p-3.5 text-sm text-white placeholder-slate-600 focus:border-amber-400/60 focus:outline-none font-sans leading-relaxed"
                />
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
                  disabled={saving || uploading}
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
                      <span>Simpan Berita</span>
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