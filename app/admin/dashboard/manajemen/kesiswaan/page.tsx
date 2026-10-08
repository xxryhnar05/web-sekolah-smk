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
  Users,
  Compass,
  Eye,
  EyeOff,
  Hash,
} from 'lucide-react'

interface StudentAffair {
  id: string
  title: string
  slug: string | null
  content: string
  order_index: number | null
  is_active: boolean | null
  created_at: string
}

export default function AdminKesiswaanPage() {
  const router = useRouter()
  const [affairsList, setAffairsList] = useState<StudentAffair[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // State Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // State Input Form
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [orderIndex, setOrderIndex] = useState(1)
  const [isActive, setIsActive] = useState(true)

  // Fetch Data Kesiswaan dari Supabase
  const fetchStudentAffairs = async () => {
    try {
      setLoadingData(true)
      const { data, error } = await supabase
        .from('student_affairs')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error
      setAffairsList(data || [])
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Gagal memuat data kesiswaan.' })
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    fetchStudentAffairs()
  }, [])

  // Auto Generate Slug saat Judul diisi
  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!editingId) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
      setSlug(generatedSlug)
    }
  }

  // Buka Modal Tambah Data
  const handleOpenAddModal = () => {
    setEditingId(null)
    setTitle('')
    setSlug('')
    setContent('')
    setOrderIndex(affairsList.length + 1)
    setIsActive(true)
    setIsModalOpen(true)
  }

  // Buka Modal Edit Data
  const handleOpenEditModal = (item: StudentAffair) => {
    setEditingId(item.id)
    setTitle(item.title || '')
    setSlug(item.slug || '')
    setContent(item.content || '')
    setOrderIndex(item.order_index ?? 1)
    setIsActive(item.is_active ?? true)
    setIsModalOpen(true)
  }

  // Submit Handler (Create & Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatusMessage(null)

    const payload = {
      title,
      slug: slug.trim().toLowerCase() || null,
      content,
      order_index: Number(orderIndex),
      is_active: isActive,
    }

    try {
      if (editingId) {
        // Update Data
        const { error } = await supabase
          .from('student_affairs')
          .update(payload)
          .eq('id', editingId)

        if (error) throw error
        setStatusMessage({ type: 'success', text: 'Data kesiswaan berhasil diperbarui!' })
      } else {
        // Insert Data Baru
        const { error } = await supabase
          .from('student_affairs')
          .insert([payload])

        if (error) throw error
        setStatusMessage({ type: 'success', text: 'Program kesiswaan baru berhasil ditambahkan!' })
      }

      setIsModalOpen(false)
      fetchStudentAffairs()
      router.refresh()
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menyimpan data.' })
    } finally {
      setSaving(false)
    }
  }

  // Quick Toggle Switch Status Active
  const handleToggleActive = async (item: StudentAffair) => {
    try {
      const { error } = await supabase
        .from('student_affairs')
        .update({ is_active: !item.is_active })
        .eq('id', item.id)

      if (error) throw error
      fetchStudentAffairs()
      router.refresh()
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Gagal merubah status aktif.' })
    }
  }

  // Delete Handler
  const handleDelete = async (id: string, itemTitle: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${itemTitle}"?`)) return

    try {
      const { error } = await supabase
        .from('student_affairs')
        .delete()
        .eq('id', id)

      if (error) throw error
      setStatusMessage({ type: 'success', text: `Program "${itemTitle}" berhasil dihapus.` })
      fetchStudentAffairs()
      router.refresh()
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menghapus data.' })
    }
  }

  if (loadingData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-[#bd9142]" />
        <span className="ml-3 text-sm">Memuat data Kesiswaan...</span>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-7 font-sans text-[#34443b] antialiased">
      <section className="relative isolate grid overflow-hidden rounded-2xl bg-[#17231f] px-6 py-8 text-white shadow-[0_16px_36px_rgba(23,35,31,0.16)] sm:px-9 sm:py-9 lg:grid-cols-[1fr_300px] lg:items-center lg:gap-8">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[url('/batik2.png')] bg-[length:420px_auto] bg-right-top bg-no-repeat opacity-35 mix-blend-screen" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#17231f] via-[#17231f]/95 to-[#17231f]/35" />
        <div className="max-w-xl">
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300"><span className="h-px w-6 bg-amber-300" /> Manajemen Sekolah</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Program Kesiswaan</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/65">Atur informasi program kerja, tata tertib, dan organisasi kesiswaan yang ditampilkan pada halaman publik.</p>
        </div>
        <div className="mt-7 border-t border-white/10 pt-5 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Area pengelolaan</p>
          <div className="flex min-h-14 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c99a42]/15 text-amber-300"><Users className="h-4 w-4" /></span>
            <span><span className="block text-xs font-medium text-white/85">Kesiswaan</span><span className="mt-1 block text-[11px] text-white/45">Konten halaman publik</span></span>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#e3e0d8] bg-white shadow-[0_8px_24px_rgba(40,51,46,0.045)]">
        <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-3 overflow-hidden border-b border-[#e3e0d8] bg-gradient-to-r from-[#faf9f6] via-white to-[#faf9f6] px-5 py-5 sm:px-7 lg:px-8">
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-64 bg-[url('/batik2.png')] bg-[length:240px_auto] bg-right bg-no-repeat opacity-[0.07]" />
          <div className="relative flex items-center gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#17231f] text-amber-300 shadow-[0_4px_12px_rgba(23,35,31,0.2)]"><Compass className="h-4 w-4" /></span>
            <div><h2 className="text-sm font-semibold tracking-tight text-[#17231f]">Daftar Program Kesiswaan</h2><p className="mt-0.5 text-xs text-slate-500">Kelola konten dan status publikasi program.</p></div>
          </div>
          <button onClick={handleOpenAddModal} className="relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#d3aa5d] to-[#c99a42] px-4 py-2.5 text-xs font-semibold text-[#17231f] shadow-[0_6px_16px_rgba(201,154,66,0.25)] transition hover:from-[#dcb472] hover:to-[#d3aa5d]">
            <Plus className="h-4 w-4" /><span>Tambah Program</span>
          </button>
        </div>

      {/* Pesan Status Notifikasi */}
      {statusMessage && (
        <div
          className={`mx-5 mt-5 flex items-center gap-3 rounded-xl border p-4 text-xs font-medium shadow-sm sm:mx-7 lg:mx-8 ${
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

      {/* Daftar Kartu Kesiswaan */}
      {affairsList.length > 0 ? (
        <div className="space-y-3 p-5 sm:p-7 lg:p-8">
          {affairsList.map((item) => (
            <div
              key={item.id}
              className={`group relative flex flex-col justify-between rounded-xl border p-5 shadow-sm transition sm:flex-row sm:items-center ${
                item.is_active
                  ? 'border-[#e3e0d8] bg-white hover:border-[#c99a42]/50 hover:bg-[#faf9f6]/70'
                  : 'border-[#e3e0d8] bg-[#faf9f6] opacity-65'
              }`}
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f2efe7] text-xs font-mono font-bold text-[#a57c31]">
                    #{item.order_index ?? 1}
                  </span>
                  <h3 className="text-base font-semibold text-[#17231f] transition-colors group-hover:text-[#a57c31]">
                    {item.title}
                  </h3>
                  {item.slug && (
                    <span className="rounded-md bg-[#f2efe7] px-2 py-0.5 font-mono text-[10px] text-slate-500">
                      /{item.slug}
                    </span>
                  )}
                </div>

                <p className="line-clamp-2 pl-9 text-xs leading-relaxed text-slate-500">
                  {item.content}
                </p>
              </div>

              {/* Status & Action Buttons */}
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#e3e0d8] pt-3 sm:mt-0 sm:border-t-0 sm:pt-0">
                {/* Toggle Active Badge */}
                <button
                  type="button"
                  onClick={() => handleToggleActive(item)}
                  title="Klik untuk mengubah status tampil"
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                    item.is_active
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'border border-[#dedbd2] bg-[#f2efe7] text-slate-500 hover:bg-[#e8e3d6]'
                  }`}
                >
                  {item.is_active ? (
                    <>
                      <Eye className="h-3.5 w-3.5 text-emerald-600" /> Aktif
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3.5 w-3.5 text-slate-500" /> Nonaktif
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="flex items-center gap-1 rounded-lg border border-[#dedbd2] bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-[#bd9142] hover:text-[#17231f]"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-[#a57c31]" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mx-5 my-6 rounded-xl border border-dashed border-[#dedbd2] bg-[#faf9f6] py-12 text-center text-sm text-slate-500 sm:mx-7 lg:mx-8">
          Belum ada data Kesiswaan. Klik tombol &quot;Tambah Program&quot; untuk menambahkan data baru.
        </div>
      )}

      </section>

      {/* MODAL DIALOG FORM (CREATE / EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17231f]/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#e3e0d8] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e3e0d8] pb-4">
              <h2 className="text-base font-semibold text-[#17231f]">
                {editingId ? 'Edit Program Kesiswaan' : 'Tambah Program Kesiswaan Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg bg-[#f2efe7] p-1.5 text-slate-500 transition hover:bg-[#e8e3d6] hover:text-[#17231f]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Judul & Slug */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#34443b]">
                    Judul Program / Kegiatan
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Organisasi Siswa Intra Sekolah (OSIS)"
                    className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#34443b]">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="osis / tata-tertib-siswa"
                    className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 font-mono text-xs text-[#17231f] placeholder:text-slate-400 focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  />
                </div>
              </div>

              {/* Urutan Index & Status Aktif */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#34443b]">
                    Urutan Tampil
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#a57c31]">
                      <Hash className="h-4 w-4" />
                    </div>
                    <input
                      type="number"
                      required
                      value={orderIndex}
                      onChange={(e) => setOrderIndex(Number(e.target.value))}
                      className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] py-2.5 pl-9 pr-3 text-sm text-[#17231f] focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#34443b]">
                    Status Publikasi
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition ${
                      isActive
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-[#dedbd2] bg-[#faf9f6] text-slate-500'
                    }`}
                  >
                    <span>{isActive ? 'Aktif (Tampil)' : 'Nonaktif (Disembunyikan)'}</span>
                    {isActive ? (
                      <Eye className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-slate-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Isi Konten Teks */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#34443b]">
                  Isi Konten &amp; Rincian Program
                </label>
                <textarea
                  rows={8}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tuliskan rincian program kerja, susunan pengurus, atau peraturan kesiswaan di sini..."
                  className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] p-4 text-sm leading-relaxed text-[#17231f] placeholder:text-slate-400 focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 border-t border-[#e3e0d8] pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-[#dedbd2] px-4 py-2 text-xs font-semibold text-slate-500 transition hover:bg-[#faf9f6] hover:text-[#17231f]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#d3aa5d] to-[#c99a42] px-5 py-2 text-xs font-semibold text-[#17231f] shadow-[0_6px_16px_rgba(201,154,66,0.25)] transition hover:from-[#dcb472] hover:to-[#d3aa5d] disabled:cursor-wait disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    'Simpan Program'
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
