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
  Factory,
} from 'lucide-react'

interface ProductionUnit {
  id: string
  title: string
  image_url: string | null
  created_at: string
}

export default function AdminUnitProduksiPage() {
  const router = useRouter()
  const [unitList, setUnitList] = useState<ProductionUnit[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // State Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // State Form Input
  const [title, setTitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  // State Upload Foto dari Komputer
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [uploadingImage, setUploadingImage] = useState(false)

  // Fetch Data Unit Produksi dari Database Supabase
  const fetchUnits = async () => {
    try {
      setLoadingData(true)
      const { data, error } = await supabase
        .from('production_units')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUnitList(data || [])
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Gagal memuat data Unit Produksi.' })
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    fetchUnits()
  }, [])

  // Handler Pilihan File dari Komputer
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  // Upload Foto ke Supabase Storage (Bucket: 'school-media')
  const uploadImageToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `unit-produksi-${Date.now()}.${fileExt}`
    const filePath = `production-units/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('school-media')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      throw new Error(`Gagal mengunggah foto: ${uploadError.message}`)
    }

    const { data: publicUrlData } = supabase.storage
      .from('school-media')
      .getPublicUrl(filePath)

    return publicUrlData.publicUrl
  }

  // Buka Modal Tambah Data Baru
  const handleOpenAddModal = () => {
    setEditingId(null)
    setTitle('')
    setImageUrl('')
    setSelectedFile(null)
    setPreviewUrl('')
    setIsModalOpen(true)
  }

  // Buka Modal Edit Data
  const handleOpenEditModal = (item: ProductionUnit) => {
    setEditingId(item.id)
    setTitle(item.title || '')
    setImageUrl(item.image_url || '')
    setPreviewUrl(item.image_url || '')
    setSelectedFile(null)
    setIsModalOpen(true)
  }

  // Submit Handler (Create & Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatusMessage(null)

    try {
      let finalImageUrl = imageUrl

      // Upload file jika user memilih gambar baru dari komputer
      if (selectedFile) {
        setUploadingImage(true)
        finalImageUrl = await uploadImageToStorage(selectedFile)
        setImageUrl(finalImageUrl)
        setUploadingImage(false)
      }

      const payload = {
        title,
        image_url: finalImageUrl || null,
      }

      if (editingId) {
        // Update Data
        const { error } = await supabase
          .from('production_units')
          .update(payload)
          .eq('id', editingId)

        if (error) throw error
        setStatusMessage({ type: 'success', text: 'Unit Produksi berhasil diperbarui!' })
      } else {
        // Insert Data Baru
        const { error } = await supabase
          .from('production_units')
          .insert([payload])

        if (error) throw error
        setStatusMessage({ type: 'success', text: 'Unit Produksi baru berhasil ditambahkan!' })
      }

      setIsModalOpen(false)
      fetchUnits()
      router.refresh()
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menyimpan data.' })
    } finally {
      setSaving(false)
      setUploadingImage(false)
    }
  }

  // Delete Handler
  const handleDelete = async (id: string, itemTitle: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${itemTitle}"?`)) return

    try {
      const { error } = await supabase
        .from('production_units')
        .delete()
        .eq('id', id)

      if (error) throw error
      setStatusMessage({ type: 'success', text: `"${itemTitle}" berhasil dihapus.` })
      fetchUnits()
      router.refresh()
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menghapus data.' })
    }
  }

  if (loadingData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-[#bd9142]" />
        <span className="ml-3 text-sm">Memuat data Unit Produksi...</span>
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
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Unit Produksi</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/65">Kelola dokumentasi foto produk dan layanan Unit Produksi sekolah.</p>
        </div>
        <div className="mt-7 border-t border-white/10 pt-5 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Area pengelolaan</p>
          <div className="flex min-h-14 items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3">
            <span className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c99a42]/15 text-amber-300"><Factory className="h-4 w-4" /></span><span><span className="block text-xs font-medium text-white/85">Profil sekolah</span><span className="mt-1 block text-[11px] text-white/45">Galeri unit produksi</span></span></span>
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

      {/* Grid Kartu Unit Produksi */}
      {unitList.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {unitList.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e3e0d8] bg-white shadow-[0_8px_24px_rgba(40,51,46,0.045)] transition hover:-translate-y-0.5 hover:border-[#cbb783] hover:shadow-[0_10px_24px_rgba(40,51,46,0.08)]"
            >
              <div>
                {/* Image Container */}
                <div className="relative h-44 w-full overflow-hidden bg-[#f3f2ee]">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#f3f2ee] text-slate-400">
                      <Factory className="h-12 w-12" />
                    </div>
                  )}

                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-base font-bold text-[#17231f] transition-colors group-hover:text-[#785e2d]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[11px] font-mono text-slate-500">
                    Ditambahkan: {new Date(item.created_at).toLocaleDateString('id-ID')}
                  </p>
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
                  onClick={() => handleDelete(item.id, item.title)}
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
          Belum ada data Unit Produksi. Klik tombol &quot;Tambah Unit Produksi&quot; untuk menambahkan.
        </div>
      )}

      {/* MODAL DIALOG (CREATE / EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17231f]/65 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#e3e0d8] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e3e0d8] pb-4">
              <h2 className="text-base font-bold text-[#17231f]">
                {editingId ? 'Edit Unit Produksi' : 'Tambah Unit Produksi Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg bg-[#f3f2ee] p-1.5 text-slate-500 transition hover:bg-[#e9f0eb] hover:text-[#17231f]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Judul Unit Produksi */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Judul Unit Produksi / Layanan
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Unit Produksi Sablon &amp; Percetakan DKV"
                  className="w-full rounded-lg border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                />
              </div>

              {/* Upload Foto Komputer */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Foto / Gambar Produk (Upload dari Komputer)
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  {/* Preview Foto */}
                  <div className="flex flex-col items-center justify-center rounded-xl border border-[#e3e0d8] bg-[#faf9f6] p-2 sm:col-span-1">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-20 w-full rounded-lg border border-[#dfcfaa] object-contain"
                      />
                    ) : (
                      <div className="flex h-20 w-full items-center justify-center rounded-lg bg-[#f3f2ee] text-slate-400">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  {/* Input File Drop Area */}
                  <div className="flex flex-col justify-center sm:col-span-3">
                    <label
                      htmlFor="unit_photo_file"
                      className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d9d5ca] bg-[#faf9f6] p-4 transition hover:border-[#bd9142]/70 hover:bg-[#fbf8f0]"
                    >
                      <Upload className="mb-1 h-5 w-5 text-[#a57c31]" />
                      <span className="text-xs font-medium text-slate-700">Pilih gambar dari komputer</span>
                      <span className="text-[10px] text-slate-400">PNG, JPG, WEBP (Maks. 5 MB)</span>
                      <input
                        id="unit_photo_file"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    {selectedFile && (
                      <p className="mt-1.5 truncate font-mono text-[11px] text-[#785e2d]">
                        Terpilih: {selectedFile.name}
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
                  disabled={saving || uploadingImage}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#d3aa5d] to-[#c99a42] px-5 py-2.5 text-xs font-semibold text-[#17231f] shadow-sm transition hover:from-[#dcb472] hover:to-[#d3aa5d] disabled:cursor-wait disabled:opacity-50"
                >
                  {saving || uploadingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{uploadingImage ? 'Mengunggah gambar...' : 'Menyimpan...'}</span>
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
