'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowserClient'
import { 
  Plus, 
  Trash2, 
  Edit3, 
  UserCheck, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  GraduationCap, 
  IdCard, 
  MapPin, 
  Phone,
  Upload,
  Link as LinkIcon,
  ImageIcon
} from 'lucide-react'

interface LeadershipStaff {
  id: string
  name: string
  nip: string | null
  position: string
  subject: string | null
  education: string | null
  address: string | null
  phone: string | null
  photo_url: string | null
  order_index: number
}

export default function AdminKepalaDanWakilPage() {
  const router = useRouter()
  const [leadershipList, setLeadershipList] = useState<LeadershipStaff[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // State Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form Fields
  const [name, setName] = useState('')
  const [nip, setNip] = useState('')
  const [position, setPosition] = useState('Kepala Sekolah')
  const [subject, setSubject] = useState('')
  const [education, setEducation] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [orderIndex, setOrderIndex] = useState(1)

  // State Upload Foto Komputer
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [uploadingImage, setUploadingImage] = useState(false)

  // 1. READ: Fetch Data
  const fetchLeadershipData = async () => {
    try {
      setLoadingData(true)
      const { data, error } = await supabase
        .from('v_school_leadership')
        .select('id, name, nip, position, subject, education, address, phone, photo_url, order_index')

      if (error) throw error
      setLeadershipList(data || [])
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Gagal memuat data dari v_school_leadership.' })
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    fetchLeadershipData()
  }, [])

  // Handler Pilihan File dari Komputer
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  // Fungsi Upload Foto ke Supabase Storage (Bucket: 'school-media')
  const uploadPhotoToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `pimpinan-${Date.now()}.${fileExt}`
    const filePath = `leadership/${fileName}`

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

  // Buka Modal Tambah
  const handleOpenAddModal = () => {
    setEditingId(null)
    setName('')
    setNip('')
    setPosition('Wakil Kepala Sekolah')
    setSubject('')
    setEducation('')
    setAddress('')
    setPhone('')
    setPhotoUrl('')
    setSelectedFile(null)
    setPreviewUrl('')
    setUploadMode('file')
    setOrderIndex(leadershipList.length + 1)
    setIsModalOpen(true)
  }

  // Buka Modal Edit
  const handleOpenEditModal = (item: LeadershipStaff) => {
    setEditingId(item.id)
    setName(item.name || '')
    setNip(item.nip || '')
    setPosition(item.position || '')
    setSubject(item.subject || '')
    setEducation(item.education || '')
    setAddress(item.address || '')
    setPhone(item.phone || '')
    setPhotoUrl(item.photo_url || '')
    setPreviewUrl(item.photo_url || '')
    setSelectedFile(null)
    setUploadMode('file')
    setOrderIndex(item.order_index || 1)
    setIsModalOpen(true)
  }

  // 2. CREATE / UPDATE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatusMessage(null)

    try {
      let finalPhotoUrl = photoUrl

      // Upload file jika memilih opsi dari komputer
      if (uploadMode === 'file' && selectedFile) {
        setUploadingImage(true)
        finalPhotoUrl = await uploadPhotoToStorage(selectedFile)
        setPhotoUrl(finalPhotoUrl)
        setUploadingImage(false)
      }

      const payload = {
        name,
        nip: nip || null,
        position,
        subject: subject || null,
        education: education || null,
        address: address || null,
        phone: phone || null,
        photo_url: finalPhotoUrl || null,
        order_index: Number(orderIndex),
        is_leadership: true,
      }

      if (editingId) {
        // Update
        const { error } = await supabase
          .from('staff')
          .update(payload)
          .eq('id', editingId)

        if (error) throw error
        setStatusMessage({ type: 'success', text: 'Data pimpinan berhasil diperbarui!' })
      } else {
        // Insert
        const { error } = await supabase
          .from('staff')
          .insert([{ ...payload, category: 'guru' }])

        if (error) throw error
        setStatusMessage({ type: 'success', text: 'Data pimpinan baru berhasil ditambahkan!' })
      }

      setIsModalOpen(false)
      fetchLeadershipData()
      router.refresh()
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menyimpan data.' })
    } finally {
      setSaving(false)
      setUploadingImage(false)
    }
  }

  // 3. DELETE
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pimpinan ${name}?`)) return

    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id)

      if (error) throw error
      setStatusMessage({ type: 'success', text: `Data ${name} berhasil dihapus.` })
      fetchLeadershipData()
      router.refresh()
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menghapus data.' })
    }
  }

  if (loadingData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-[#bd9142]" />
        <span className="ml-3 text-sm">Memuat data pimpinan...</span>
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
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Kepala &amp; Wakil Sekolah</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/65">Tambah, ubah, atau hapus susunan pimpinan sekolah yang tampil di website.</p>
        </div>
        <div className="mt-7 border-t border-white/10 pt-5 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Area pengelolaan</p>
          <div className="flex min-h-14 items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3">
            <span className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c99a42]/15 text-amber-300"><UserCheck className="h-4 w-4" /></span><span><span className="block text-xs font-medium text-white/85">Profil pimpinan</span><span className="mt-1 block text-[11px] text-white/45">Konten halaman publik</span></span></span>
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

      {/* Grid Kartu Pimpinan */}
      {leadershipList.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {leadershipList.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e3e0d8] bg-white p-5 shadow-[0_8px_24px_rgba(40,51,46,0.045)] transition hover:-translate-y-0.5 hover:border-[#cbb783] hover:shadow-[0_10px_24px_rgba(40,51,46,0.08)]"
            >
              <div>
                <div className="flex flex-col items-center text-center">
                  <span className="inline-flex items-center gap-1 rounded-md border border-[#dfcfaa] bg-[#fbf8f0] px-2.5 py-1 font-mono text-[10px] font-semibold text-[#785e2d]">
                    <UserCheck className="h-3 w-3" /> Urutan: {item.order_index}
                  </span>

                  <h3 className="mt-3 text-base font-bold text-[#17231f] transition-colors group-hover:text-[#785e2d]">
                    {item.name}
                  </h3>
                  <p className="mt-0.5 text-xs font-semibold text-[#967538]">
                    {item.position}
                  </p>
                </div>

                <div className="mt-4 space-y-1.5 border-t border-[#eeece6] pt-3 text-[11px] text-slate-500">
                  {item.nip && item.nip !== '-' && (
                    <div className="flex items-center gap-2">
                      <IdCard className="h-3.5 w-3.5 shrink-0 text-[#a57c31]" />
                      <span>NIP: {item.nip}</span>
                    </div>
                  )}
                  {item.education && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-3.5 w-3.5 shrink-0 text-[#a57c31]" />
                      <span>{item.education}</span>
                    </div>
                  )}
                  {item.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#a57c31]" />
                      <span className="line-clamp-1">{item.address}</span>
                    </div>
                  )}
                  {item.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-[#a57c31]" />
                      <span>{item.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 border-t border-[#eeece6] pt-3">
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
          Belum ada data pimpinan di <code className="text-[#967538]">v_school_leadership</code>. Klik &quot;Tambah Pimpinan&quot; untuk menambahkan data baru.
        </div>
      )}

      {/* MODAL FORM (CREATE / EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17231f]/65 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#e3e0d8] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e3e0d8] pb-4">
              <h2 className="text-base font-bold text-[#17231f]">
                {editingId ? 'Edit Data Pimpinan' : 'Tambah Pimpinan Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg bg-[#f3f2ee] p-1.5 text-slate-500 transition hover:bg-[#e9f0eb] hover:text-[#17231f]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Nama Lengkap &amp; Gelar</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Drs. H. Ahmad Dahlan, M.Pd."
                  className="w-full rounded-lg border border-[#dedbd2] bg-[#faf9f6] px-3 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Jabatan Pimpinan</label>
                  <input
                    type="text"
                    required
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Kepala Sekolah / Waka Kurikulum"
                    className="w-full rounded-lg border border-[#dedbd2] bg-[#faf9f6] px-3 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Urutan Tampil</label>
                  <input
                    type="number"
                    required
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#dedbd2] bg-[#faf9f6] px-3 py-2.5 text-sm text-[#17231f] transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  />
                </div>
              </div>

              {/* UPLOAD FOTO DARI KOMPUTER / URL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">Foto Profil Pimpinan</label>
                  <div className="flex rounded-lg border border-[#e3e0d8] bg-[#f3f2ee] p-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setUploadMode('file')}
                      className={`flex items-center gap-1 rounded-md px-2 py-0.5 font-medium transition ${
                        uploadMode === 'file'
                          ? 'border border-[#dfcfaa] bg-white text-[#785e2d] shadow-sm'
                          : 'text-slate-500 hover:text-[#17231f]'
                      }`}
                    >
                      <Upload className="h-3 w-3" /> Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode('url')}
                      className={`flex items-center gap-1 rounded-md px-2 py-0.5 font-medium transition ${
                        uploadMode === 'url'
                          ? 'border border-[#dfcfaa] bg-white text-[#785e2d] shadow-sm'
                          : 'text-slate-500 hover:text-[#17231f]'
                      }`}
                    >
                      <LinkIcon className="h-3 w-3" /> URL Gambar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  {/* Preview Foto */}
                  <div className="flex min-h-32 flex-col items-center justify-center overflow-hidden rounded-xl border border-[#e3e0d8] bg-[#faf9f6] p-2 sm:col-span-1">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-36 w-full object-contain object-bottom drop-shadow-[0_8px_14px_rgba(23,35,31,0.16)]"
                      />
                    ) : (
                      <div className="flex h-20 w-16 items-center justify-center rounded-lg bg-[#f3f2ee] text-slate-400">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  {/* Input File atau URL */}
                  <div className="flex flex-col justify-center sm:col-span-3">
                    {uploadMode === 'file' ? (
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="pimpinan_photo_file"
                          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d9d5ca] bg-[#faf9f6] p-4 transition hover:border-[#bd9142]/70 hover:bg-[#fbf8f0]"
                        >
                          <Upload className="mb-1 h-5 w-5 text-[#a57c31]" />
                          <span className="text-xs font-medium text-slate-700">Pilih foto dari komputer</span>
                          <span className="text-[10px] text-slate-400">PNG, JPG, WEBP (Maks. 5 MB)</span>
                          <input
                            id="pimpinan_photo_file"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                        {selectedFile && (
                          <p className="truncate font-mono text-[11px] text-[#785e2d]">
                            File: {selectedFile.name}
                          </p>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={photoUrl}
                        onChange={(e) => {
                          setPhotoUrl(e.target.value)
                          setPreviewUrl(e.target.value)
                        }}
                        placeholder="https://domain.com/foto.png"
                        className="w-full rounded-lg border border-[#dedbd2] bg-[#faf9f6] px-3 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">NIP / NBM</label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="19780514..."
                    className="w-full rounded-lg border border-[#dedbd2] bg-[#faf9f6] px-3 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Pendidikan Terakhir</label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="S2 Manajemen Pendidikan"
                    className="w-full rounded-lg border border-[#dedbd2] bg-[#faf9f6] px-3 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Alamat Singkat</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ngoro, Mojokerto"
                    className="w-full rounded-lg border border-[#dedbd2] bg-[#faf9f6] px-3 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">No. HP / WA</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full rounded-lg border border-[#dedbd2] bg-[#faf9f6] px-3 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  />
                </div>
              </div>

              {/* Buttons */}
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
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#d3aa5d] to-[#c99a42] px-5 py-2.5 text-xs font-semibold text-[#17231f] shadow-sm transition hover:from-[#dcb472] hover:to-[#d3aa5d] disabled:opacity-50"
                >
                  {saving || uploadingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{uploadingImage ? 'Mengunggah...' : 'Menyimpan...'}</span>
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
