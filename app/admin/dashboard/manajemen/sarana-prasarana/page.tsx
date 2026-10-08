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
  Compass,
} from 'lucide-react'

interface FacilityPhoto {
  id?: string
  photo_url: string
}

interface FacilityGroup {
  id: string
  title: string | null
  description: string | null
  created_at: string
  facility_photos?: FacilityPhoto[]
}

export default function AdminFasilitasGroupPage() {
  const router = useRouter()
  const [facilities, setFacilities] = useState<FacilityGroup[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // State Form Input (Dipastikan selalu string, bukan null)
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')

  // State Multiple Photos Upload
  const [existingPhotos, setExistingPhotos] = useState<FacilityPhoto[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  // Fetch Data Bab Fasilitas beserta Seluruh Fotonya
  const fetchFacilitiesWithPhotos = async () => {
    try {
      setLoadingData(true)
      const { data, error } = await supabase
        .from('facilities')
        .select(`
          id,
          title,
          description,
          created_at,
          facility_photos (
            id,
            photo_url
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setFacilities(data || [])
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Gagal memuat data Sarana & Prasarana.' })
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    fetchFacilitiesWithPhotos()
  }, [])

  // Handler Multiple File Choice
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setSelectedFiles((prev) => [...prev, ...filesArray])

      const newPreviews = filesArray.map((file) => URL.createObjectURL(file))
      setPreviewUrls((prev) => [...prev, ...newPreviews])
    }
  }

  // Remove File dari Antrean Upload
  const handleRemoveNewFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  // Upload Batch Foto ke Supabase Storage (Bucket: 'school-media')
  const uploadBatchPhotos = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = []

    for (const file of files) {
      const fileExt = file.name.split('.').pop()
      const fileName = `fac-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `facilities/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('school-media')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw new Error(`Gagal upload ${file.name}: ${uploadError.message}`)

      const { data: publicUrlData } = supabase.storage
        .from('school-media')
        .getPublicUrl(filePath)

      uploadedUrls.push(publicUrlData.publicUrl)
    }

    return uploadedUrls
  }

  // Open Modal Add
  const handleOpenAddModal = () => {
    setEditingId(null)
    setTitle('')
    setDescription('')
    setExistingPhotos([])
    setSelectedFiles([])
    setPreviewUrls([])
    setIsModalOpen(true)
  }

  // Open Modal Edit
  const handleOpenEditModal = (item: FacilityGroup) => {
    setEditingId(item.id)
    setTitle(item.title || '')
    setDescription(item.description || '')
    setExistingPhotos(item.facility_photos || [])
    setSelectedFiles([])
    setPreviewUrls([])
    setIsModalOpen(true)
  }

  // Delete Single Existing Photo
  const handleDeleteExistingPhoto = async (photoId: string) => {
    if (!confirm('Hapus foto ini dari bab fasilitas?')) return

    try {
      const { error } = await supabase
        .from('facility_photos')
        .delete()
        .eq('id', photoId)

      if (error) throw error
      setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId))
      fetchFacilitiesWithPhotos()
    } catch (err: any) {
      alert('Gagal menghapus foto.')
    }
  }

  // Submit Handler dengan Detail Error Log
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatusMessage(null)
    let facilityId = editingId

    try {
      // 1. Simpan / Update Bab Fasilitas (Parent Table)
      const payload = {
        title: title.trim(),
        description: description ? description.trim() : null,
      }

      if (editingId) {
        const { error: updateErr } = await supabase
          .from('facilities')
          .update(payload)
          .eq('id', editingId)

        if (updateErr) throw new Error(`Gagal update Bab: ${updateErr.message}`)
      } else {
        const { data: newFacility, error: insertErr } = await supabase
          .from('facilities')
          .insert([payload])
          .select('id')
          .single()

        if (insertErr) throw new Error(`Gagal membuat Bab baru: ${insertErr.message}`)
        if (!newFacility) throw new Error('Gagal mendapatkan ID Bab baru.')

        facilityId = newFacility.id
        setEditingId(newFacility.id)
      }

      // 2. Upload & Simpan Foto-foto Baru jika Ada
      if (selectedFiles.length > 0 && facilityId) {
        setUploading(true)
        const newPhotoUrls = await uploadBatchPhotos(selectedFiles)

        const photosPayload = newPhotoUrls.map((url) => ({
          facility_id: facilityId,
          photo_url: url,
        }))

        const { error: photoInsertError } = await supabase
          .from('facility_photos')
          .insert(photosPayload)

        if (photoInsertError) throw new Error(`Gagal menyimpan foto: ${photoInsertError.message}`)
      }

      setStatusMessage({ type: 'success', text: 'Bab Sarana & Prasarana berhasil disimpan!' })
      setIsModalOpen(false)
      fetchFacilitiesWithPhotos()
      router.refresh()
    } catch (err: unknown) {
      console.error('Error saat simpan data:', err)
      const message = err instanceof Error
        ? err.message
        : 'Gagal menyimpan data. Periksa koneksi atau RLS Supabase.'
      setStatusMessage({ type: 'error', text: message })
      if (facilityId) fetchFacilitiesWithPhotos()
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  // Delete Bab Fasilitas beserta Seluruh Fotonya
  const handleDeleteGroup = async (id: string, groupTitle: string | null) => {
    const titleStr = groupTitle || 'Bab ini'
    if (!confirm(`Apakah Anda yakin ingin menghapus Bab "${titleStr}" beserta seluruh fotonya?`)) return

    try {
      const { error } = await supabase
        .from('facilities')
        .delete()
        .eq('id', id)

      if (error) throw error
      setStatusMessage({ type: 'success', text: `Bab "${titleStr}" berhasil dihapus.` })
      fetchFacilitiesWithPhotos()
      router.refresh()
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menghapus data.' })
    }
  }

  if (loadingData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-[#bd9142]" />
        <span className="ml-3 text-sm">Memuat data Sarana &amp; Prasarana...</span>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-7 font-sans text-[#34443b] antialiased">
      <section className="relative isolate grid overflow-hidden rounded-2xl bg-[#17231f] px-6 py-8 text-white shadow-[0_16px_36px_rgba(23,35,31,0.16)] sm:px-9 sm:py-9 lg:grid-cols-[1fr_300px] lg:items-center lg:gap-8">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[url('/batik2.png')] bg-[length:420px_auto] bg-right-top bg-no-repeat opacity-35 mix-blend-screen" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#17231f] via-[#17231f]/95 to-[#17231f]/35" />
        <div className="max-w-xl">
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300"><span className="h-px w-6 bg-amber-300" /> Manajemen Sarana Sekolah</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Sarana &amp; Prasarana</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/65">Kelompokkan fasilitas sekolah dan unggah foto dokumentasinya untuk ditampilkan pada halaman publik.</p>
        </div>
        <div className="mt-7 border-t border-white/10 pt-5 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Area pengelolaan</p>
          <div className="flex min-h-14 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c99a42]/15 text-amber-300"><Upload className="h-4 w-4" /></span>
            <span><span className="block text-xs font-medium text-white/85">Dokumentasi fasilitas</span><span className="mt-1 block text-[11px] text-white/45">Konten halaman publik</span></span>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#e3e0d8] bg-white shadow-[0_8px_24px_rgba(40,51,46,0.045)]">
        <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-3 overflow-hidden border-b border-[#e3e0d8] bg-gradient-to-r from-[#faf9f6] via-white to-[#faf9f6] px-5 py-5 sm:px-7 lg:px-8">
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-64 bg-[url('/batik2.png')] bg-[length:240px_auto] bg-right bg-no-repeat opacity-[0.07]" />
          <div className="relative flex items-center gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#17231f] text-amber-300 shadow-[0_4px_12px_rgba(23,35,31,0.2)]"><Compass className="h-4 w-4" /></span>
            <div><h2 className="text-sm font-semibold tracking-tight text-[#17231f]">Daftar Bab Fasilitas</h2><p className="mt-0.5 text-xs text-slate-500">Kelola deskripsi dan dokumentasi foto fasilitas.</p></div>
          </div>
          <button onClick={handleOpenAddModal} className="relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#d3aa5d] to-[#c99a42] px-4 py-2.5 text-xs font-semibold text-[#17231f] shadow-[0_6px_16px_rgba(201,154,66,0.25)] transition hover:from-[#dcb472] hover:to-[#d3aa5d]">
            <Plus className="h-4 w-4" /><span>Buat Bab Fasilitas Baru</span>
          </button>
        </div>

      {/* Status Message */}
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

      {/* List Bab Fasilitas */}
      {facilities.length > 0 ? (
        <div className="space-y-4 p-5 sm:p-7 lg:p-8">
          {facilities.map((group) => (
            <div
              key={group.id}
              className="rounded-xl border border-[#e3e0d8] bg-white p-5 shadow-sm transition hover:border-[#c99a42]/50 hover:bg-[#faf9f6]/70"
            >
              <div className="flex flex-col gap-3 border-b border-[#e3e0d8] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#17231f]">{group.title || 'Tanpa Judul'}</h3>
                  {group.description && (
                    <p className="mt-1 text-xs text-slate-500">{group.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(group)}
                    className="flex items-center gap-1 rounded-lg border border-[#dedbd2] bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-[#bd9142] hover:text-[#17231f]"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-[#a57c31]" /> Kelola / Tambah Foto
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id, group.title)}
                    className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Hapus Bab
                  </button>
                </div>
              </div>

              {/* Grid Foto-foto di dalam Bab ini */}
              <div className="mt-4">
                {group.facility_photos && group.facility_photos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                    {group.facility_photos.map((p) => (
                      <div
                        key={p.id}
                        className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[#e3e0d8] bg-[#f2efe7]"
                      >
                        <img
                          src={p.photo_url}
                          alt="Foto Fasilitas"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-2">
                    Belum ada foto pada bab ini. Klik &quot;Kelola / Tambah Foto&quot; untuk mengunggah.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mx-5 my-6 rounded-xl border border-dashed border-[#dedbd2] bg-[#faf9f6] py-12 text-center text-sm text-slate-500 sm:mx-7 lg:mx-8">
          Belum ada Bab Sarana &amp; Prasarana. Klik &quot;Buat Bab Fasilitas Baru&quot; untuk memulai.
        </div>
      )}

      </section>

      {/* MODAL DIALOG (CREATE / EDIT BAB) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17231f]/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#e3e0d8] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e3e0d8] pb-4">
              <h2 className="text-base font-semibold text-[#17231f]">
                {editingId ? 'Edit Bab / Kelola Foto Fasilitas' : 'Buat Bab Fasilitas Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg bg-[#f2efe7] p-1.5 text-slate-500 transition hover:bg-[#e8e3d6] hover:text-[#17231f]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {statusMessage && (
              <div
                role="alert"
                className={`mt-4 flex items-start gap-3 rounded-xl border p-4 text-xs font-medium ${
                  statusMessage.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                )}
                <span className="break-words leading-relaxed">{statusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-5">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#34443b]">
                  Judul Bab Fasilitas
                </label>
                <input
                  type="text"
                  required
                  value={title || ''}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Armada Antar Jemput / Mutia Exhibition Center"
                  className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#34443b]">
                  Deskripsi Singkat Bab
                </label>
                <textarea
                  rows={2}
                  value={description || ''}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Dokumentasi layanan transportasi sekolah..."
                  className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] p-3 text-sm text-[#17231f] placeholder:text-slate-400 focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                />
              </div>

              {/* FOTO YANG SUDAH TER-UPLOAD */}
              {editingId && existingPhotos.length > 0 && (
                <div className="space-y-2 border-t border-[#e3e0d8] pt-3">
                  <label className="block text-xs font-semibold text-[#34443b]">
                    Foto Tersimpan Dalam Bab Ini ({existingPhotos.length})
                  </label>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {existingPhotos.map((photo) => (
                      <div key={photo.id} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-[#e3e0d8] bg-[#f2efe7]">
                        <img src={photo.photo_url} alt="Foto" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => photo.id && handleDeleteExistingPhoto(photo.id)}
                          className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-red-600/90 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* UPLOAD MULTIPLE FOTO BARU DARI KOMPUTER */}
              <div className="space-y-2 border-t border-[#e3e0d8] pt-3">
                <label className="block text-xs font-semibold text-[#34443b]">
                  Tambah Foto Baru (Pilih Banyak File Sekaligus)
                </label>
                <label
                  htmlFor="multiple_photos_input"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#dedbd2] bg-[#faf9f6] p-5 transition hover:border-[#bd9142] hover:bg-white"
                >
                  <Upload className="mb-1 h-6 w-6 text-[#a57c31]" />
                  <span className="text-xs font-medium text-[#34443b]">
                    Klik untuk memilih foto dari komputer
                  </span>
                  <span className="text-[10px] text-slate-500">Bisa memilih beberapa file foto sekaligus</span>
                  <input
                    id="multiple_photos_input"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFilesChange}
                    className="hidden"
                  />
                </label>

                {/* Preview Foto Baru yang Akan Diunggah */}
                {previewUrls.length > 0 && (
                  <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold text-[#a57c31]">
                      Foto Baru Akan Diunggah ({previewUrls.length}):
                    </p>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {previewUrls.map((url, idx) => (
                        <div key={idx} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-[#dfcfaa] bg-[#f2efe7]">
                          <img src={url} alt="Preview" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveNewFile(idx)}
                            className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-500"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  disabled={saving || uploading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#d3aa5d] to-[#c99a42] px-5 py-2 text-xs font-semibold text-[#17231f] shadow-[0_6px_16px_rgba(201,154,66,0.25)] transition hover:from-[#dcb472] hover:to-[#d3aa5d] disabled:cursor-wait disabled:opacity-50"
                >
                  {saving || uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{uploading ? 'Mengunggah foto-foto...' : 'Menyimpan...'}</span>
                    </>
                  ) : (
                    'Simpan Bab &amp; Foto'
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
