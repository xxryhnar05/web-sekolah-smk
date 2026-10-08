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
  Globe,
  ListOrdered,
  List,
  AlignLeft,
  Eye,
  EyeOff,
  Save,
  Search,
} from 'lucide-react'

type ContentType = 'paragraph' | 'bullet' | 'number'

interface BeasiswaSection {
  id: string
  title: string
  content: string
  content_type: ContentType
  order_index: number
  is_active: boolean
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }

  return fallback
}

export default function AdminBeasiswaLuarNegeriPage() {
  const router = useRouter()
  const [sections, setSections] = useState<BeasiswaSection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // State Modal CRUD
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // State Form Input
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [contentType, setContentType] = useState<ContentType>('paragraph')
  const [orderIndex, setOrderIndex] = useState<number>(1)
  const [isActive, setIsActive] = useState<boolean>(true)

  const fetchSections = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('beasiswa_luar_negeri_sections')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error
      setSections(data || [])
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: getErrorMessage(error, 'Gagal memuat data Beasiswa Luar Negeri.'),
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isCurrent = true

    const loadSections = async () => {
      try {
        const { data, error } = await supabase
          .from('beasiswa_luar_negeri_sections')
          .select('*')
          .order('order_index', { ascending: true })

        if (error) throw error
        if (isCurrent) setSections(data ?? [])
      } catch (error) {
        if (isCurrent) {
          setStatusMessage({
            type: 'error',
            text: getErrorMessage(error, 'Gagal memuat data Beasiswa Luar Negeri.'),
          })
        }
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    void loadSections()
    return () => {
      isCurrent = false
    }
  }, [])

  const handleOpenAddModal = () => {
    setEditingId(null)
    setTitle('')
    setContent('')
    setContentType('paragraph')
    setOrderIndex(sections.length + 1)
    setIsActive(true)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item: BeasiswaSection) => {
    setEditingId(item.id)
    setTitle(item.title)
    setContent(item.content)
    setContentType(item.content_type)
    setOrderIndex(item.order_index)
    setIsActive(item.is_active)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatusMessage(null)

    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        content_type: contentType,
        order_index: Number(orderIndex),
        is_active: isActive,
        updated_at: new Date().toISOString(),
      }

      if (editingId) {
        const { error } = await supabase
          .from('beasiswa_luar_negeri_sections')
          .update(payload)
          .eq('id', editingId)

        if (error) throw error
        setStatusMessage({ type: 'success', text: 'Bab Beasiswa Luar Negeri berhasil diperbarui!' })
      } else {
        const { error } = await supabase
          .from('beasiswa_luar_negeri_sections')
          .insert([payload])

        if (error) throw error
        setStatusMessage({ type: 'success', text: 'Bab Beasiswa Luar Negeri berhasil ditambahkan!' })
      }

      setIsModalOpen(false)
      fetchSections()
      router.refresh()
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: getErrorMessage(error, 'Gagal menyimpan Bab Beasiswa Luar Negeri.'),
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, babTitle: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus Bab "${babTitle}"?`)) return

    try {
      const { error } = await supabase
        .from('beasiswa_luar_negeri_sections')
        .delete()
        .eq('id', id)

      if (error) throw error
      setStatusMessage({ type: 'success', text: `Bab "${babTitle}" berhasil dihapus.` })
      fetchSections()
      router.refresh()
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: getErrorMessage(error, 'Gagal menghapus Bab.'),
      })
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('beasiswa_luar_negeri_sections')
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      fetchSections()
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: getErrorMessage(error, 'Gagal mengubah status aktif Bab.'),
      })
    }
  }

  const filteredSections = sections.filter((sec) =>
    sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sec.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-7 font-sans text-[#34443b] antialiased">
      <section className="relative isolate grid overflow-hidden rounded-2xl bg-[#17231f] px-6 py-8 text-white shadow-[0_16px_36px_rgba(23,35,31,0.16)] sm:px-9 sm:py-9 lg:grid-cols-[1fr_300px] lg:items-center lg:gap-8">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[url('/batik2.png')] bg-[length:420px_auto] bg-right-top bg-no-repeat opacity-35 mix-blend-screen" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#17231f] via-[#17231f]/95 to-[#17231f]/35" />
        <div className="max-w-xl">
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300">
            <span className="h-px w-6 bg-amber-300" /> Kuliah
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Beasiswa Luar Negeri
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/65">
            Kelola bab dan informasi beasiswa luar negeri yang ditampilkan
            pada halaman kuliah.
          </p>
        </div>
        <div className="mt-7 border-t border-white/10 pt-5 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
            Area pengelolaan
          </p>
          <div className="flex min-h-14 items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3">
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#c99a42]/15 text-amber-300">
                <Globe className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-xs font-medium text-white/85">Beasiswa Luar Negeri</span>
                <span className="mt-1 block text-[11px] text-white/45">
                  {loading ? 'Memuat daftar informasi...' : `${sections.length} bab informasi`}
                </span>
              </span>
            </span>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-b from-[#d3aa5d] to-[#c99a42] px-3 py-2 text-[11px] font-semibold text-[#17231f] shadow-sm transition hover:from-[#dcb472] hover:to-[#d3aa5d]"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah
            </button>
          </div>
        </div>
      </section>

      {statusMessage && (
        <div
          role="status"
          className={`flex items-center gap-3 rounded-xl border p-4 text-xs font-medium shadow-sm ${
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

      <section className="w-full overflow-hidden rounded-2xl border border-[#e3e0d8] bg-white shadow-[0_8px_24px_rgba(40,51,46,0.045)]">
        <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-3 overflow-hidden border-b border-[#e3e0d8] bg-gradient-to-r from-[#faf9f6] via-white to-[#faf9f6] px-5 py-5 sm:px-7 lg:px-8">
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-64 bg-[url('/batik2.png')] bg-[length:240px_auto] bg-right bg-no-repeat opacity-[0.07]" />
          <div className="relative flex items-center gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#17231f] text-amber-300 shadow-[0_4px_12px_rgba(23,35,31,0.2)]">
              <Globe className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-[#17231f]">
                Daftar Informasi Beasiswa
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Kelola konten, format, urutan, dan visibilitas halaman publik.
              </p>
            </div>
          </div>
          <span className="relative inline-flex items-center gap-2 rounded-full border border-[#dfcfaa] bg-[#fbf8f0] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#785e2d]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c99a42]" />
            {sections.filter((section) => section.is_active).length} Aktif
          </span>
        </div>

        <div className="space-y-5 p-5 sm:p-7 lg:px-8 lg:py-7">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul bab atau materi beasiswa..."
              aria-label="Cari informasi Beasiswa Luar Negeri"
              className="w-full rounded-lg border border-[#dedbd2] bg-[#faf9f6] py-2.5 pl-10 pr-4 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
            />
          </div>

      {loading ? (
        <div className="flex min-h-48 items-center justify-center rounded-xl border border-[#e3e0d8] bg-[#faf9f6]/70 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-[#bd9142]" />
          <span className="ml-3">Memuat data Admin Beasiswa Luar Negeri...</span>
        </div>
      ) : filteredSections.length > 0 ? (
        <div className="space-y-4">
          {filteredSections.map((sec) => (
            <div
              key={sec.id}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-white shadow-[0_3px_12px_rgba(40,51,46,0.035)] transition hover:border-[#cbb783] hover:shadow-[0_8px_20px_rgba(40,51,46,0.07)] ${
                sec.is_active
                  ? 'border-[#e3e0d8]'
                  : 'border-[#e3e0d8] opacity-65'
              }`}
            >
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-[#dfcfaa] bg-[#fbf8f0] px-2.5 py-1 font-mono text-[10px] font-semibold text-[#785e2d]">
                      Urutan #{sec.order_index}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-[#e3e0d8] bg-[#faf9f6] px-2.5 py-1 text-[10px] text-slate-600">
                      {sec.content_type === 'paragraph' && <AlignLeft className="h-3 w-3 text-[#a57c31]" />}
                      {sec.content_type === 'bullet' && <List className="h-3 w-3 text-[#a57c31]" />}
                      {sec.content_type === 'number' && <ListOrdered className="h-3 w-3 text-[#a57c31]" />}
                      <span className="capitalize">{sec.content_type}</span>
                    </span>
                    <span className={`rounded-md border px-2.5 py-1 text-[10px] font-semibold ${sec.is_active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-500'}`}>
                      {sec.is_active ? 'Tampil' : 'Disembunyikan'}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-[#17231f]">
                    {sec.title}
                  </h3>

                  <div className="line-clamp-3 whitespace-pre-line text-xs leading-6 text-slate-500">
                    {sec.content}
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#eeece6] pt-3 sm:self-start sm:border-0 sm:pt-0">
                  <button
                    onClick={() => handleToggleActive(sec.id, sec.is_active)}
                    title={sec.is_active ? 'Sembunyikan' : 'Tampilkan'}
                    className={`rounded-lg border p-1.5 transition ${
                      sec.is_active
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white'
                        : 'border-[#e3e0d8] bg-[#faf9f6] text-slate-500 hover:border-[#bd9142] hover:text-[#785e2d]'
                    }`}
                  >
                    {sec.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(sec)}
                    className="flex items-center gap-1.5 rounded-lg border border-[#e3e0d8] bg-[#faf9f6] px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-[#bd9142] hover:text-[#785e2d]"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-[#a57c31]" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(sec.id, sec.title)}
                    className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:border-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#d9d5ca] bg-[#faf9f6]/70 py-12 text-center text-sm text-slate-500">
          {searchQuery
            ? 'Tidak ada bab beasiswa yang cocok dengan pencarian.'
            : 'Belum ada bab informasi Beasiswa Luar Negeri. Klik "Tambah Bab Informasi" untuk memulai.'}
        </div>
      )}
        </div>
      </section>

      {/* MODAL FORM CREATE / EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17231f]/65 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#e3e0d8] bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.25)] sm:p-7">
            <div className="flex items-center justify-between border-b border-[#e3e0d8] pb-4">
              <h2 className="flex items-center gap-3 text-base font-bold text-[#17231f]">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f2efe7] text-[#a57c31]">
                  <Globe className="h-4 w-4" />
                </span>
                {editingId ? 'Edit Bab Beasiswa Luar Negeri' : 'Tambah Bab Beasiswa Luar Negeri'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Tutup formulir"
                className="rounded-lg bg-[#f3f2ee] p-1.5 text-slate-500 transition hover:bg-[#e9f0eb] hover:text-[#17231f]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Judul Bab / Seksi Beasiswa
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Beasiswa S1 (Sarjana)"
                  className="w-full rounded-lg border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Format Tampilan Konten</label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as ContentType)}
                    className="w-full rounded-lg border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  >
                    <option value="paragraph">Teks Paragraf Biasa</option>
                    <option value="bullet">Poin Bullet (Enter = Poin Baru)</option>
                    <option value="number">Poin Nomor (Enter = Nomor Baru)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Urutan Tampil (Order Index)</label>
                  <input
                    type="number"
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(Number(e.target.value))}
                    min="1"
                    className="w-full rounded-lg border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 font-mono text-sm text-[#17231f] transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Isi Teks Detail Bab
                </label>
                <textarea
                  rows={8}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tuliskan isi teks detail bab di sini. Jika memilih Bullet atau Nomor, tekan Enter untuk membuat poin baris baru..."
                  className="w-full resize-y rounded-lg border border-[#dedbd2] bg-[#faf9f6] p-3.5 text-sm leading-6 text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[#e3e0d8] bg-[#faf9f6]/70 p-4">
                <span className="text-xs font-semibold text-[#17231f]">Tampilkan di Halaman User?</span>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`rounded-lg border px-3 py-1 text-xs font-bold transition ${
                    isActive
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-slate-100 text-slate-500'
                  }`}
                >
                  {isActive ? 'Aktif (Tampil)' : 'Sembunyi'}
                </button>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#e3e0d8] pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-[#e3e0d8] bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-[#faf9f6]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-[#d3aa5d] to-[#c99a42] px-5 py-2.5 text-xs font-semibold text-[#17231f] shadow-sm transition hover:from-[#dcb472] hover:to-[#d3aa5d] disabled:cursor-wait disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Simpan Bab Beasiswa</span>
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