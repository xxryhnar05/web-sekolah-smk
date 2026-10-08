'use client'

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlignLeft,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  List,
  ListOrdered,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  X,
  Edit3,
} from 'lucide-react'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowserClient'

type ContentType = 'paragraph' | 'bullet' | 'number'

interface SnbtSection {
  id: string
  title: string
  content: string
  content_type: ContentType
  order_index: number
  is_active: boolean
}

function errorMessage(error: unknown, fallback: string) {
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

export default function AdminSnbtPage() {
  const router = useRouter()
  const [sections, setSections] = useState<SnbtSection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [contentType, setContentType] = useState<ContentType>('paragraph')
  const [orderIndex, setOrderIndex] = useState(1)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    let isCurrent = true

    const loadSections = async () => {
      try {
        const { data, error } = await supabase
          .from('snbt_sections')
          .select('*')
          .order('order_index', { ascending: true })

        if (error) throw error
        if (isCurrent) setSections(data ?? [])
      } catch (error) {
        if (isCurrent) {
          setStatusMessage({
            type: 'error',
            text: errorMessage(error, 'Gagal memuat data SNBT.'),
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

  const fetchSections = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('snbt_sections')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error
      setSections(data ?? [])
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: errorMessage(error, 'Gagal memuat data SNBT.'),
      })
    }
  }, [])

  const openAddModal = () => {
    setEditingId(null)
    setTitle('')
    setContent('')
    setContentType('paragraph')
    setOrderIndex(sections.length + 1)
    setIsActive(true)
    setIsModalOpen(true)
  }

  const openEditModal = (section: SnbtSection) => {
    setEditingId(section.id)
    setTitle(section.title)
    setContent(section.content)
    setContentType(section.content_type)
    setOrderIndex(section.order_index)
    setIsActive(section.is_active)
    setIsModalOpen(true)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
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

      const result = editingId
        ? await supabase
            .from('snbt_sections')
            .update(payload)
            .eq('id', editingId)
        : await supabase.from('snbt_sections').insert([payload])

      if (result.error) throw result.error

      setIsModalOpen(false)
      setStatusMessage({
        type: 'success',
        text: editingId
          ? 'Bab SNBT berhasil diperbarui.'
          : 'Bab SNBT berhasil ditambahkan.',
      })
      await fetchSections()
      router.refresh()
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: errorMessage(error, 'Gagal menyimpan bab SNBT.'),
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (section: SnbtSection) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus bab "${section.title}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('snbt_sections')
        .delete()
        .eq('id', section.id)

      if (error) throw error
      setStatusMessage({
        type: 'success',
        text: `Bab "${section.title}" berhasil dihapus.`,
      })
      await fetchSections()
      router.refresh()
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: errorMessage(error, 'Gagal menghapus bab SNBT.'),
      })
    }
  }

  const handleToggleActive = async (section: SnbtSection) => {
    try {
      const { error } = await supabase
        .from('snbt_sections')
        .update({
          is_active: !section.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', section.id)

      if (error) throw error
      setStatusMessage({
        type: 'success',
        text: section.is_active
          ? 'Bab SNBT disembunyikan.'
          : 'Bab SNBT ditampilkan.',
      })
      await fetchSections()
      router.refresh()
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: errorMessage(error, 'Gagal mengubah status bab SNBT.'),
      })
    }
  }

  const filteredSections = sections.filter((section) => {
    const query = searchQuery.toLowerCase()
    return (
      section.title.toLowerCase().includes(query) ||
      section.content.toLowerCase().includes(query)
    )
  })

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
            Informasi SNBT
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/65">
            Kelola bab dan informasi Seleksi Nasional Berdasarkan Tes yang
            ditampilkan pada halaman kuliah.
          </p>
        </div>
        <div className="mt-7 border-t border-white/10 pt-5 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
            Area pengelolaan
          </p>
          <div className="flex min-h-14 items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3">
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#c99a42]/15 text-amber-300">
                <GraduationCap className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-xs font-medium text-white/85">SNBT</span>
                <span className="mt-1 block text-[11px] text-white/45">
                  {loading ? 'Memuat daftar informasi...' : `${sections.length} bab informasi`}
                </span>
              </span>
            </span>
            <button
              type="button"
              onClick={openAddModal}
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
              <GraduationCap className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-[#17231f]">
                Daftar Informasi SNBT
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
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Cari judul bab atau isi teks SNBT..."
              aria-label="Cari informasi SNBT"
              className="w-full rounded-lg border border-[#dedbd2] bg-[#faf9f6] py-2.5 pl-10 pr-4 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
            />
          </div>

      {loading ? (
        <div className="flex min-h-48 items-center justify-center rounded-xl border border-[#e3e0d8] bg-[#faf9f6]/70 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-[#bd9142]" />
          <span className="ml-3">Memuat data Admin SNBT...</span>
        </div>
      ) : filteredSections.length > 0 ? (
        <div className="space-y-4">
          {filteredSections.map((section) => (
            <article
              key={section.id}
              className={`group relative overflow-hidden rounded-xl border bg-white shadow-[0_3px_12px_rgba(40,51,46,0.035)] transition hover:border-[#cbb783] hover:shadow-[0_8px_20px_rgba(40,51,46,0.07)] ${
                section.is_active
                  ? 'border-[#e3e0d8]'
                  : 'border-[#e3e0d8] opacity-65'
              }`}
            >
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-[#dfcfaa] bg-[#fbf8f0] px-2.5 py-1 font-mono text-[10px] font-semibold text-[#785e2d]">
                      Urutan #{section.order_index}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-[#e3e0d8] bg-[#faf9f6] px-2.5 py-1 text-[10px] text-slate-600">
                      {section.content_type === 'paragraph' && (
                        <AlignLeft className="h-3 w-3 text-[#a57c31]" />
                      )}
                      {section.content_type === 'bullet' && (
                        <List className="h-3 w-3 text-[#a57c31]" />
                      )}
                      {section.content_type === 'number' && (
                        <ListOrdered className="h-3 w-3 text-[#a57c31]" />
                      )}
                      <span className="capitalize">{section.content_type}</span>
                    </span>
                    <span className={`rounded-md border px-2.5 py-1 text-[10px] font-semibold ${section.is_active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-500'}`}>
                      {section.is_active ? 'Tampil' : 'Disembunyikan'}
                    </span>
                  </div>

                  <h2 className="text-sm font-semibold text-[#17231f]">
                    {section.title}
                  </h2>
                  <p className="line-clamp-3 whitespace-pre-line text-xs leading-6 text-slate-500">
                    {section.content}
                  </p>
                </div>

                <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#eeece6] pt-3 sm:border-0 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => void handleToggleActive(section)}
                    title={section.is_active ? 'Sembunyikan' : 'Tampilkan'}
                    aria-label={
                      section.is_active
                        ? `Sembunyikan ${section.title}`
                        : `Tampilkan ${section.title}`
                    }
                    className={`rounded-lg border p-1.5 transition ${
                      section.is_active
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white'
                        : 'border-[#e3e0d8] bg-[#faf9f6] text-slate-500 hover:border-[#bd9142] hover:text-[#785e2d]'
                    }`}
                  >
                    {section.is_active ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(section)}
                    className="flex items-center gap-1.5 rounded-lg border border-[#e3e0d8] bg-[#faf9f6] px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-[#bd9142] hover:text-[#785e2d]"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-[#a57c31]" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(section)}
                    className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:border-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#d9d5ca] bg-[#faf9f6]/70 py-12 text-center text-sm text-slate-500">
          {searchQuery
            ? 'Tidak ada bab SNBT yang cocok dengan pencarian.'
            : 'Belum ada bab informasi SNBT. Klik "Tambah Bab Informasi" untuk memulai.'}
        </div>
      )}
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17231f]/65 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#e3e0d8] bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.25)] sm:p-7">
            <div className="flex items-center justify-between border-b border-[#e3e0d8] pb-4">
              <h2 className="flex items-center gap-3 text-base font-bold text-[#17231f]">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f2efe7] text-[#a57c31]">
                  <GraduationCap className="h-4 w-4" />
                </span>
                {editingId ? 'Edit Bab Informasi SNBT' : 'Tambah Bab Informasi SNBT'}
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
                <label
                  htmlFor="snbt-title"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Judul Bab / Seksi
                </label>
                <input
                  id="snbt-title"
                  type="text"
                  required
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Contoh: Persyaratan Pendaftaran"
                  className="w-full rounded-lg border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="snbt-content-type"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Format Tampilan
                  </label>
                  <select
                    id="snbt-content-type"
                    value={contentType}
                    onChange={(event) =>
                      setContentType(event.target.value as ContentType)
                    }
                    className="w-full rounded-lg border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  >
                    <option value="paragraph">Teks Paragraf Biasa</option>
                    <option value="bullet">Poin Bullet (Enter = Poin Baru)</option>
                    <option value="number">Poin Nomor (Enter = Nomor Baru)</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="snbt-order"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Urutan Tampil
                  </label>
                  <input
                    id="snbt-order"
                    type="number"
                    min="1"
                    value={orderIndex}
                    onChange={(event) => setOrderIndex(Number(event.target.value))}
                    className="w-full rounded-lg border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 font-mono text-sm text-[#17231f] transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="snbt-content"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Isi Teks Konten
                </label>
                <textarea
                  id="snbt-content"
                  rows={8}
                  required
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Tuliskan isi bab. Untuk format bullet atau nomor, tekan Enter untuk membuat poin baru..."
                  className="w-full resize-y rounded-lg border border-[#dedbd2] bg-[#faf9f6] p-3.5 text-sm leading-6 text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[#e3e0d8] bg-[#faf9f6]/70 p-4">
                <span className="text-xs font-semibold text-[#17231f]">
                  Tampilkan di Halaman User?
                </span>
                <button
                  type="button"
                  onClick={() => setIsActive((active) => !active)}
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
                      <span>Simpan Bab SNBT</span>
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
