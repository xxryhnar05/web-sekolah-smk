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
  User,
  GraduationCap,
  IdCard,
  Phone,
  Mail,
  Crown,
  ImageIcon,
  Link as LinkIcon,
  Compass,
} from 'lucide-react'

interface StaffTU {
  id: string
  nip: string | null
  name: string
  gender: 'L' | 'P' | null
  category: string
  position: string
  photo_url: string | null
  is_leadership: boolean | null
  order_index: number | null
  email: string | null
  phone: string | null
  address: string | null
  education: string | null
  bio: string | null
  birth_place_date: string | null
  created_at: string
}

export default function AdminTataUsahaPage() {
  const router = useRouter()
  const [tuList, setTuList] = useState<StaffTU[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // State Modal Dialog
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // State Input Form
  const [name, setName] = useState<string>('')
  const [nip, setNip] = useState<string>('')
  const [gender, setGender] = useState<'L' | 'P'>('L')
  const [position, setPosition] = useState<string>('Staf Tata Usaha')
  const [education, setEducation] = useState<string>('')
  const [birthPlaceDate, setBirthPlaceDate] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [bio, setBio] = useState<string>('')
  const [photoUrl, setPhotoUrl] = useState<string>('')
  const [isLeadership, setIsLeadership] = useState<boolean>(false)
  const [orderIndex, setOrderIndex] = useState<number>(0)

  // State Upload Foto
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [uploadingImage, setUploadingImage] = useState(false)

  // Fetch Data Tata Usaha
  const fetchTUData = async () => {
    try {
      setLoadingData(true)
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .or('category.eq.tenaga_kependidikan,category.eq.tata_usaha,category.eq.tu')
        .order('order_index', { ascending: true })

      if (error) throw error
      setTuList(data || [])
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Gagal memuat data Tata Usaha.' })
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    fetchTUData()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const uploadPhotoToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `tu-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `staff/tata-usaha/${fileName}`

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

  const handleOpenAddModal = () => {
    setEditingId(null)
    setName('')
    setNip('')
    setGender('L')
    setPosition('Staf Tata Usaha')
    setEducation('')
    setBirthPlaceDate('')
    setPhone('')
    setEmail('')
    setAddress('')
    setBio('')
    setPhotoUrl('')
    setIsLeadership(false)
    setOrderIndex(tuList.length + 1)

    setSelectedFile(null)
    setPreviewUrl('')
    setUploadMode('file')
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item: StaffTU) => {
    setEditingId(item.id)
    setName(item.name || '')
    setNip(item.nip || '')
    setGender(item.gender === 'P' ? 'P' : 'L')
    setPosition(item.position || 'Staf Tata Usaha')
    setEducation(item.education || '')
    setBirthPlaceDate(item.birth_place_date || '')
    setPhone(item.phone || '')
    setEmail(item.email || '')
    setAddress(item.address || '')
    setBio(item.bio || '')
    setPhotoUrl(item.photo_url || '')
    setPreviewUrl(item.photo_url || '')
    setIsLeadership(item.is_leadership ?? false)
    setOrderIndex(item.order_index ?? 0)

    setSelectedFile(null)
    setUploadMode('file')
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatusMessage(null)

    try {
      let finalPhotoUrl = photoUrl

      if (uploadMode === 'file' && selectedFile) {
        setUploadingImage(true)
        finalPhotoUrl = await uploadPhotoToStorage(selectedFile)
        setPhotoUrl(finalPhotoUrl)
        setUploadingImage(false)
      }

      const payload = {
        name: name.trim(),
        nip: nip.trim() || null,
        gender,
        category: 'tenaga_kependidikan',
        position: position.trim() || 'Staf Tata Usaha',
        subject: null,
        education: education.trim() || null,
        birth_place_date: birthPlaceDate.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
        bio: bio.trim() || null,
        photo_url: finalPhotoUrl || null,
        is_leadership: isLeadership,
        order_index: Number(orderIndex),
      }

      if (editingId) {
        const { error } = await supabase
          .from('staff')
          .update(payload)
          .eq('id', editingId)

        if (error) throw error
        setStatusMessage({ type: 'success', text: 'Data Tata Usaha berhasil diperbarui!' })
      } else {
        const { error } = await supabase
          .from('staff')
          .insert([payload])

        if (error) throw error
        setStatusMessage({ type: 'success', text: 'Data Staff Tata Usaha baru berhasil ditambahkan!' })
      }

      setIsModalOpen(false)
      fetchTUData()
      router.refresh()
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menyimpan data Tata Usaha.' })
    } finally {
      setSaving(false)
      setUploadingImage(false)
    }
  }

  const handleDelete = async (id: string, staffName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data Tata Usaha "${staffName}"?`)) return

    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id)

      if (error) throw error
      setStatusMessage({ type: 'success', text: `Data Tata Usaha "${staffName}" berhasil dihapus.` })
      fetchTUData()
      router.refresh()
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menghapus data.' })
    }
  }

  if (loadingData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-[#bd9142]" />
        <span className="ml-3 text-sm">Memuat data Tata Usaha...</span>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-7 font-sans text-[#34443b] antialiased">
      <section className="relative isolate grid overflow-hidden rounded-2xl bg-[#17231f] px-6 py-8 text-white shadow-[0_16px_36px_rgba(23,35,31,0.16)] sm:px-9 sm:py-9 lg:grid-cols-[1fr_300px] lg:items-center lg:gap-8">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[url('/batik2.png')] bg-[length:420px_auto] bg-right-top bg-no-repeat opacity-35 mix-blend-screen" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#17231f] via-[#17231f]/95 to-[#17231f]/35" />
        <div className="max-w-xl">
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300"><span className="h-px w-6 bg-amber-300" /> Manajemen SDM Sekolah</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Tenaga Kependidikan &amp; Tata Usaha</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/65">Kelola profil dan informasi staf administrasi, keuangan, serta kearsipan sekolah.</p>
        </div>
        <div className="mt-7 border-t border-white/10 pt-5 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Area pengelolaan</p>
          <div className="flex min-h-14 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c99a42]/15 text-amber-300"><IdCard className="h-4 w-4" /></span>
            <span><span className="block text-xs font-medium text-white/85">Tenaga kependidikan</span><span className="mt-1 block text-[11px] text-white/45">Konten halaman publik</span></span>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#e3e0d8] bg-white shadow-[0_8px_24px_rgba(40,51,46,0.045)]">
        <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-3 overflow-hidden border-b border-[#e3e0d8] bg-gradient-to-r from-[#faf9f6] via-white to-[#faf9f6] px-5 py-5 sm:px-7 lg:px-8">
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-64 bg-[url('/batik2.png')] bg-[length:240px_auto] bg-right bg-no-repeat opacity-[0.07]" />
          <div className="relative flex items-center gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#17231f] text-amber-300 shadow-[0_4px_12px_rgba(23,35,31,0.2)]"><Compass className="h-4 w-4" /></span>
            <div><h2 className="text-sm font-semibold tracking-tight text-[#17231f]">Daftar Tata Usaha</h2><p className="mt-0.5 text-xs text-slate-500">Kelola profil dan informasi tenaga kependidikan.</p></div>
          </div>
          <button onClick={handleOpenAddModal} className="relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#d3aa5d] to-[#c99a42] px-4 py-2.5 text-xs font-semibold text-[#17231f] shadow-[0_6px_16px_rgba(201,154,66,0.25)] transition hover:from-[#dcb472] hover:to-[#d3aa5d]">
            <Plus className="h-4 w-4" /><span>Tambah Staff TU</span>
          </button>
        </div>

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

      {tuList.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-3 lg:p-8">
          {tuList.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#e3e0d8] bg-white p-5 shadow-sm transition hover:border-[#c99a42]/50 hover:bg-[#faf9f6]/70"
            >
              <div>
                <div className="flex flex-col items-center text-center">
                  <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-2 border-[#dfcfaa] bg-[#f2efe7] shadow-sm">
                    {item.photo_url ? (
                      <img src={item.photo_url} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#f2efe7] text-slate-400">
                        <User className="h-12 w-12" />
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 flex-wrap justify-center">
                    {item.is_leadership && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-[#dfcfaa] bg-[#fbf8f0] px-2 py-0.5 text-[10px] font-bold text-[#785e2d]">
                        <Crown className="h-3 w-3" /> Ka. TU / Pimpinan
                      </span>
                    )}
                    <span className="rounded-md border border-[#e3e0d8] bg-[#faf9f6] px-2 py-0.5 font-mono text-[10px] text-slate-500">
                      Urutan: {item.order_index ?? 0}
                    </span>
                  </div>

                  <h3 className="mt-2 text-base font-semibold text-[#17231f] transition-colors group-hover:text-[#a57c31]">
                    {item.name}
                  </h3>
                  <p className="mt-0.5 text-xs font-semibold text-[#a57c31]">
                    {item.position}
                  </p>
                </div>

                <div className="mt-4 space-y-1.5 border-t border-[#e3e0d8] pt-3 text-[11px] text-slate-500">
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
                  {item.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-[#a57c31]" />
                      <span>{item.phone}</span>
                    </div>
                  )}
                  {item.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-[#a57c31]" />
                      <span className="truncate">{item.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 border-t border-[#e3e0d8] pt-3">
                <button
                  onClick={() => handleOpenEditModal(item)}
                  className="flex items-center gap-1 rounded-lg border border-[#dedbd2] bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-[#bd9142] hover:text-[#17231f]"
                >
                  <Edit3 className="h-3.5 w-3.5 text-[#a57c31]" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.name)}
                  className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-500 hover:text-white"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mx-5 my-6 rounded-xl border border-dashed border-[#dedbd2] bg-[#faf9f6] py-12 text-center text-sm text-slate-500 sm:mx-7 lg:mx-8">
          Belum ada data Tata Usaha. Klik &quot;Tambah Staff TU&quot; untuk menambahkan.
        </div>
      )}

      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17231f]/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#e3e0d8] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e3e0d8] pb-4">
              <h2 className="text-base font-semibold text-[#17231f]">
                {editingId ? 'Edit Data Tata Usaha' : 'Tambah Staff Tata Usaha Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg bg-[#f2efe7] p-1.5 text-slate-500 transition hover:bg-[#e8e3d6] hover:text-[#17231f]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {statusMessage && (
              <div className={`mt-4 flex items-start gap-3 rounded-xl border p-4 text-xs font-medium ${statusMessage.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
                {statusMessage.type === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />}
                <span className="break-words leading-relaxed">{statusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#34443b]">
                  Nama Lengkap &amp; Gelar
                </label>
                <input
                  type="text"
                  required
                  value={name || ''}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Rina Amalia, S.A.P."
                  className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#34443b]">NIP / NBM / NIK</label>
                  <input
                    type="text"
                    value={nip || ''}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="19850412..."
                    className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#34443b]">Pendidikan Terakhir</label>
                  <input
                    type="text"
                    value={education || ''}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="S1 Administrasi Publik / D3 Akuntansi"
                    className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#34443b]">Jabatan / Tugas Administrasi</label>
                <input
                  type="text"
                  required
                  value={position || ''}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Kepala Tata Usaha / Staf Bendahara / Administrasi Kesiswaan"
                  className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#34443b]">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                    className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  >
                    <option value="L">Laki-Laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#34443b]">Urutan Tampil</label>
                  <input
                    type="number"
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#34443b]">Kepala TU / Pimpinan?</label>
                  <button
                    type="button"
                    onClick={() => setIsLeadership(!isLeadership)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition ${
                      isLeadership
                        ? 'border-[#dfcfaa] bg-[#fbf8f0] text-[#785e2d]'
                        : 'border-[#dedbd2] bg-[#faf9f6] text-slate-500'
                    }`}
                  >
                    <span>{isLeadership ? 'Ya (Ka. TU)' : 'Tidak (Staf TU)'}</span>
                    <Crown className={`h-4 w-4 ${isLeadership ? 'text-[#a57c31]' : 'text-slate-400'}`} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 border-t border-[#e3e0d8] pt-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#34443b]">Foto Profil Staff</label>
                  <div className="flex rounded-lg bg-[#f2efe7] p-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setUploadMode('file')}
                      className={`flex items-center gap-1 rounded-md px-2 py-0.5 font-medium transition ${
                        uploadMode === 'file'
                          ? 'border border-[#dfcfaa] bg-[#fbf8f0] text-[#785e2d]'
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
                          ? 'border border-[#dfcfaa] bg-[#fbf8f0] text-[#785e2d]'
                          : 'text-slate-500 hover:text-[#17231f]'
                      }`}
                    >
                      <LinkIcon className="h-3 w-3" /> URL Gambar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <div className="flex flex-col items-center justify-center rounded-xl border border-[#dedbd2] bg-[#faf9f6] p-2 sm:col-span-1">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-20 w-16 rounded-lg border border-[#dfcfaa] object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-16 items-center justify-center rounded-lg bg-[#f2efe7] text-slate-400">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-center sm:col-span-3">
                    {uploadMode === 'file' ? (
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="tu_photo_file"
                          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#dedbd2] bg-[#faf9f6] p-4 transition hover:border-[#bd9142] hover:bg-white"
                        >
                          <Upload className="mb-1 h-5 w-5 text-[#a57c31]" />
                          <span className="text-xs font-medium text-[#34443b]">Pilih foto dari komputer</span>
                          <span className="text-[10px] text-slate-500">PNG, JPG, WEBP (Max 5MB)</span>
                          <input
                            id="tu_photo_file"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                        {selectedFile && (
                          <p className="truncate font-mono text-[11px] text-[#a57c31]">
                            File: {selectedFile.name}
                          </p>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={photoUrl || ''}
                        onChange={(e) => {
                          setPhotoUrl(e.target.value)
                          setPreviewUrl(e.target.value)
                        }}
                        placeholder="https://domain.com/foto-tu.png"
                        className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3 py-2 text-sm text-[#17231f] placeholder:text-slate-400 focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#34443b]">Tempat, Tanggal Lahir</label>
                <input
                  type="text"
                  value={birthPlaceDate || ''}
                  onChange={(e) => setBirthPlaceDate(e.target.value)}
                  placeholder="Mojokerto, 20 Agustus 1990"
                  className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#34443b]">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    value={phone || ''}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#34443b]">Email Kontak</label>
                  <input
                    type="email"
                    value={email || ''}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@sekolah.sch.id"
                    className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#34443b]">Alamat Tempat Tinggal</label>
                <input
                  type="text"
                  value={address || ''}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Raya Ngoro No. 88, Mojokerto"
                  className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#34443b]">Bio / Catatan Tugas</label>
                <textarea
                  rows={2}
                  value={bio || ''}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Deskripsi singkat tugas atau bidang layanan staf..."
                  className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] p-3 text-sm text-[#17231f] placeholder:text-slate-400 focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                />
              </div>

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
                  disabled={saving || uploadingImage}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#d3aa5d] to-[#c99a42] px-5 py-2 text-xs font-semibold text-[#17231f] shadow-[0_6px_16px_rgba(201,154,66,0.25)] transition hover:from-[#dcb472] hover:to-[#d3aa5d] disabled:cursor-wait disabled:opacity-50"
                >
                  {saving || uploadingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{uploadingImage ? 'Mengunggah foto...' : 'Menyimpan...'}</span>
                    </>
                  ) : (
                    'Simpan Data TU'
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
