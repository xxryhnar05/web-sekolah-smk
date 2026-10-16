'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowserClient'
import * as XLSX from '@e965/xlsx'
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
  FileSpreadsheet,
  Download,
} from 'lucide-react'

interface StaffGuru {
  id: string
  nip: string | null
  name: string
  gender: 'L' | 'P' | null
  category: string
  position: string
  subject: string | null
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

type GuruImportRecord = Omit<StaffGuru, 'id' | 'created_at'>

interface GuruImportPreview {
  fileName: string
  rows: GuruImportRecord[]
  errors: string[]
}

const GURU_IMPORT_HEADERS = [
  'Nama',
  'NIP',
  'Jenis Kelamin (L/P)',
  'Jabatan',
  'Mata Pelajaran',
  'Pendidikan Terakhir',
  'Tempat, Tanggal Lahir',
  'No. HP / WhatsApp',
  'Email',
  'Alamat',
  'Bio / Catatan',
  'Foto URL',
  'Pimpinan (Ya/Tidak)',
  'Urutan',
]

export default function AdminGuruPage() {
  const router = useRouter()
  const importFileRef = useRef<HTMLInputElement>(null)
  const [guruList, setGuruList] = useState<StaffGuru[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [parsingImport, setParsingImport] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importPreview, setImportPreview] = useState<GuruImportPreview | null>(null)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // State Modal Dialog
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // State Input Form (Selalu diinisialisasi string agar aman dari error input null)
  const [name, setName] = useState<string>('')
  const [nip, setNip] = useState<string>('')
  const [gender, setGender] = useState<'L' | 'P'>('L')
  const [position, setPosition] = useState<string>('Guru Pengajar')
  const [subject, setSubject] = useState<string>('')
  const [education, setEducation] = useState<string>('')
  const [birthPlaceDate, setBirthPlaceDate] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [bio, setBio] = useState<string>('')
  const [photoUrl, setPhotoUrl] = useState<string>('')
  const [isLeadership, setIsLeadership] = useState<boolean>(false)
  const [orderIndex, setOrderIndex] = useState<number>(0)

  // State Upload Foto dari Komputer
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [uploadingImage, setUploadingImage] = useState(false)

  const handleDownloadImportTemplate = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([GURU_IMPORT_HEADERS])
    worksheet['!cols'] = GURU_IMPORT_HEADERS.map(() => ({ wch: 22 }))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Guru')
    XLSX.writeFile(workbook, 'template-data-guru.xlsx')
  }

  const handleExcelImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setStatusMessage(null)
    setParsingImport(true)

    try {
      if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
        throw new Error('Pilih file Excel dengan format .xlsx, .xls, atau .csv.')
      }

      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = firstSheetName ? workbook.Sheets[firstSheetName] : undefined
      if (!worksheet) throw new Error('File Excel tidak memiliki lembar kerja yang dapat dibaca.')

      const sheetRows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
        header: 1,
        raw: false,
        defval: '',
      })
      const normalizeHeader = (value: unknown) =>
        String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
      const headers = (sheetRows[0] ?? []).map(normalizeHeader)
      const findColumn = (aliases: string[]) => headers.findIndex((header) => aliases.includes(header))
      const columns = {
        name: findColumn(['nama', 'namalengkap', 'name', 'fullname']),
        nip: findColumn(['nip', 'nbm']),
        gender: findColumn(['jeniskelamin', 'jeniskelaminlp', 'gender', 'jk']),
        position: findColumn(['jabatan', 'position']),
        subject: findColumn(['matapelajaran', 'mapel', 'subject']),
        education: findColumn(['pendidikanterakhir', 'pendidikan', 'education']),
        birthPlaceDate: findColumn(['tempattanggallahir', 'tempatlahir', 'birthplacedate']),
        phone: findColumn(['nohpwhatsapp', 'nohp', 'telepon', 'phone', 'whatsapp']),
        email: findColumn(['email', 'emailkontak']),
        address: findColumn(['alamat', 'address']),
        bio: findColumn(['biocatatan', 'bio', 'catatan']),
        photoUrl: findColumn(['fotourl', 'photourl', 'foto', 'urlfoto']),
        leadership: findColumn(['pimpinanyatidak', 'pimpinan']),
        orderIndex: findColumn(['urutan', 'order', 'orderindex']),
      }

      if (columns.name < 0) {
        throw new Error('Kolom "Nama" tidak ditemukan. Gunakan templat Excel yang tersedia.')
      }

      const rows: GuruImportRecord[] = []
      const errors: string[] = []
      const toText = (row: unknown[], column: number) =>
        column < 0 ? '' : String(row[column] ?? '').trim()
      const dataRows = sheetRows.slice(1)

      dataRows.forEach((row, index) => {
        if (row.every((cell) => String(cell ?? '').trim() === '')) return

        const excelRow = index + 2
        const name = toText(row, columns.name)
        if (!name) {
          errors.push(`Baris ${excelRow}: Nama wajib diisi.`)
          return
        }

        const genderValue = normalizeHeader(toText(row, columns.gender))
        let gender: 'L' | 'P' = 'L'
        if (genderValue && ['p', 'perempuan', 'wanita', 'female'].includes(genderValue)) {
          gender = 'P'
        } else if (genderValue && !['l', 'lakilaki', 'pria', 'male'].includes(genderValue)) {
          errors.push(`Baris ${excelRow}: Jenis kelamin harus L atau P.`)
          return
        }

        const leadershipValue = normalizeHeader(toText(row, columns.leadership))
        let isLeadership = false
        if (['ya', 'y', 'yes', 'true', '1', 'pimpinan'].includes(leadershipValue)) {
          isLeadership = true
        } else if (
          leadershipValue &&
          !['tidak', 't', 'no', 'false', '0', 'bukan'].includes(leadershipValue)
        ) {
          errors.push(`Baris ${excelRow}: Pimpinan harus diisi Ya atau Tidak.`)
          return
        }

        const orderValue = toText(row, columns.orderIndex)
        const orderIndex = orderValue ? Number(orderValue) : guruList.length + rows.length + 1
        if (!Number.isInteger(orderIndex) || orderIndex < 0) {
          errors.push(`Baris ${excelRow}: Urutan harus berupa bilangan bulat nol atau lebih.`)
          return
        }

        rows.push({
          name,
          nip: toText(row, columns.nip) || null,
          gender,
          category: 'guru',
          position: toText(row, columns.position) || 'Guru Pengajar',
          subject: toText(row, columns.subject) || null,
          education: toText(row, columns.education) || null,
          birth_place_date: toText(row, columns.birthPlaceDate) || null,
          phone: toText(row, columns.phone) || null,
          email: toText(row, columns.email) || null,
          address: toText(row, columns.address) || null,
          bio: toText(row, columns.bio) || null,
          photo_url: toText(row, columns.photoUrl) || null,
          is_leadership: isLeadership,
          order_index: orderIndex,
        })
      })

      if (rows.length === 0 && errors.length === 0) {
        errors.push('Tidak ada baris data untuk diimpor. Isi data mulai dari baris kedua.')
      }
      setImportPreview({ fileName: file.name, rows, errors })
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Gagal membaca file Excel.',
      })
    } finally {
      setParsingImport(false)
    }
  }

  const handleConfirmImport = async () => {
    if (!importPreview || importPreview.errors.length > 0 || importPreview.rows.length === 0) return

    setImporting(true)
    setStatusMessage(null)
    try {
      const { error } = await supabase.from('staff').insert(importPreview.rows)
      if (error) throw error

      setStatusMessage({
        type: 'success',
        text: `${importPreview.rows.length} data Guru berhasil diimpor.`,
      })
      setImportPreview(null)
      await fetchGuruData()
      router.refresh()
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Gagal mengimpor data Guru.',
      })
    } finally {
      setImporting(false)
    }
  }

  // Fetch Data Guru (Filter category = 'guru')
  const fetchGuruData = async () => {
    try {
      setLoadingData(true)
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('category', 'guru')
        .order('order_index', { ascending: true })

      if (error) throw error
      setGuruList(data || [])
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Gagal memuat data Guru.' })
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    fetchGuruData()
  }, [])

  // Handler Pilih File Foto dari Komputer
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  // Upload Foto ke Supabase Storage (Bucket: 'school-media')
  const uploadPhotoToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `guru-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `staff/guru/${fileName}`

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

  // Buka Modal Tambah Guru Baru
  const handleOpenAddModal = () => {
    setEditingId(null)
    setName('')
    setNip('')
    setGender('L')
    setPosition('Guru Pengajar')
    setSubject('')
    setEducation('')
    setBirthPlaceDate('')
    setPhone('')
    setEmail('')
    setAddress('')
    setBio('')
    setPhotoUrl('')
    setIsLeadership(false)
    setOrderIndex(guruList.length + 1)

    setSelectedFile(null)
    setPreviewUrl('')
    setUploadMode('file')
    setIsModalOpen(true)
  }

  // Buka Modal Edit Guru
  const handleOpenEditModal = (item: StaffGuru) => {
    setEditingId(item.id)
    setName(item.name || '')
    setNip(item.nip || '')
    setGender(item.gender === 'P' ? 'P' : 'L')
    setPosition(item.position || 'Guru Pengajar')
    setSubject(item.subject || '')
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

  // Submit Handler (Create & Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatusMessage(null)

    try {
      let finalPhotoUrl = photoUrl

      // Upload file jika memilih opsi file komputer
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
        category: 'guru', // Mengisi ENUM sdm_type
        position: position.trim() || 'Guru Pengajar',
        subject: subject.trim() || null,
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
        // Update Data
        const { error } = await supabase
          .from('staff')
          .update(payload)
          .eq('id', editingId)

        if (error) throw error
        setStatusMessage({ type: 'success', text: 'Data Guru berhasil diperbarui!' })
      } else {
        // Insert Data Baru
        const { error } = await supabase
          .from('staff')
          .insert([payload])

        if (error) throw error
        setStatusMessage({ type: 'success', text: 'Data Guru baru berhasil ditambahkan!' })
      }

      setIsModalOpen(false)
      fetchGuruData()
      router.refresh()
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menyimpan data Guru.' })
    } finally {
      setSaving(false)
      setUploadingImage(false)
    }
  }

  // Delete Handler
  const handleDelete = async (id: string, guruName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data Guru "${guruName}"?`)) return

    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id)

      if (error) throw error
      setStatusMessage({ type: 'success', text: `Data Guru "${guruName}" berhasil dihapus.` })
      fetchGuruData()
      router.refresh()
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menghapus data.' })
    }
  }

  if (loadingData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-[#bd9142]" />
        <span className="ml-3 text-sm">Memuat data Guru...</span>
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
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Guru &amp; Pendidik</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/65">Kelola profil, informasi kontak, dan penugasan tenaga pendidik yang ditampilkan pada halaman publik.</p>
        </div>
        <div className="mt-7 border-t border-white/10 pt-5 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Area pengelolaan</p>
          <div className="flex min-h-14 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c99a42]/15 text-amber-300"><GraduationCap className="h-4 w-4" /></span>
            <span><span className="block text-xs font-medium text-white/85">Tenaga pendidik</span><span className="mt-1 block text-[11px] text-white/45">Konten halaman publik</span></span>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#e3e0d8] bg-white shadow-[0_8px_24px_rgba(40,51,46,0.045)]">
        <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-3 overflow-hidden border-b border-[#e3e0d8] bg-gradient-to-r from-[#faf9f6] via-white to-[#faf9f6] px-5 py-5 sm:px-7 lg:px-8">
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-64 bg-[url('/batik2.png')] bg-[length:240px_auto] bg-right bg-no-repeat opacity-[0.07]" />
          <div className="relative flex items-center gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#17231f] text-amber-300 shadow-[0_4px_12px_rgba(23,35,31,0.2)]"><Compass className="h-4 w-4" /></span>
            <div><h2 className="text-sm font-semibold tracking-tight text-[#17231f]">Daftar Guru</h2><p className="mt-0.5 text-xs text-slate-500">Kelola profil dan informasi tenaga pendidik.</p></div>
          </div>
          <button onClick={handleOpenAddModal} className="relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#d3aa5d] to-[#c99a42] px-4 py-2.5 text-xs font-semibold text-[#17231f] shadow-[0_6px_16px_rgba(201,154,66,0.25)] transition hover:from-[#dcb472] hover:to-[#d3aa5d]">
            <Plus className="h-4 w-4" /><span>Tambah Guru Baru</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e3e0d8] bg-[#faf9f6] px-5 py-4 sm:px-7 lg:px-8">
          <div className="flex items-start gap-3">
            <FileSpreadsheet className="mt-0.5 h-5 w-5 shrink-0 text-[#a57c31]" />
            <div>
              <p className="text-xs font-semibold text-[#17231f]">Impor data dari Excel</p>
              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                Nama wajib diisi; jenis kelamin gunakan L/P (kosong berarti L). Isi NIP dan nomor HP sebagai teks agar angka nol di depan tidak hilang.
                Gunakan templat, isi data mulai baris kedua, lalu unggah file .xlsx, .xls, atau .csv.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDownloadImportTemplate}
              className="inline-flex items-center gap-2 rounded-lg border border-[#dedbd2] bg-white px-3 py-2 text-xs font-semibold text-[#34443b] transition hover:border-[#bd9142]"
            >
              <Download className="h-3.5 w-3.5" /> Unduh Templat
            </button>
            <input
              ref={importFileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleExcelImport}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => importFileRef.current?.click()}
              disabled={parsingImport || importing}
              className="inline-flex items-center gap-2 rounded-lg bg-[#17231f] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#263a32] disabled:cursor-wait disabled:opacity-50"
            >
              {parsingImport ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {parsingImport ? 'Membaca file...' : 'Pilih File Excel'}
            </button>
          </div>
        </div>

      {/* Pesan Status */}
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

      {/* Grid Kartu Guru */}
      {guruList.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-3 lg:p-8">
          {guruList.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#e3e0d8] bg-white p-5 shadow-sm transition hover:border-[#c99a42]/50 hover:bg-[#faf9f6]/70"
            >
              <div>
                <div className="flex flex-col items-center text-center">
                  {/* Foto Profil */}
                  <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-2 border-[#dfcfaa] bg-[#f2efe7] shadow-sm">
                    {item.photo_url ? (
                      <img src={item.photo_url} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#f2efe7] text-slate-400">
                        <User className="h-12 w-12" />
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap justify-center">
                    {item.is_leadership && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-[#dfcfaa] bg-[#fbf8f0] px-2 py-0.5 text-[10px] font-bold text-[#785e2d]">
                        <Crown className="h-3 w-3" /> Pimpinan
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
                  {item.subject && (
                    <p className="mt-1 rounded-lg border border-[#e3e0d8] bg-[#faf9f6] px-2.5 py-1 text-xs text-slate-500">
                      Mapel: <span className="font-semibold text-[#17231f]">{item.subject}</span>
                    </p>
                  )}
                </div>

                {/* Info Detail Rincian */}
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

              {/* Action Buttons */}
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
          Belum ada data Guru dengan kategori &quot;guru&quot;. Klik &quot;Tambah Guru Baru&quot; untuk menambahkan.
        </div>
      )}

      </section>

      {importPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17231f]/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#e3e0d8] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e3e0d8] px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-sm font-semibold text-[#17231f]">Tinjau Impor Data Guru</h2>
                <p className="mt-1 max-w-[68vw] truncate text-xs text-slate-500">{importPreview.fileName}</p>
              </div>
              <button
                type="button"
                onClick={() => setImportPreview(null)}
                disabled={importing}
                aria-label="Tutup pratinjau impor"
                className="rounded-lg bg-[#f2efe7] p-1.5 text-slate-500 transition hover:bg-[#e8e3d6] disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[65vh] space-y-4 overflow-y-auto p-5 sm:p-6">
              {statusMessage?.type === 'error' && (
                <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                  {statusMessage.text}
                </p>
              )}
              {importPreview.errors.length > 0 ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                  <p className="font-semibold">
                    Perbaiki {importPreview.errors.length} masalah berikut sebelum impor:
                  </p>
                  <ul className="mt-2 max-h-36 list-inside list-disc space-y-1 overflow-y-auto">
                    {importPreview.errors.map((error, index) => <li key={`${index}-${error}`}>{error}</li>)}
                  </ul>
                </div>
              ) : (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">
                  {importPreview.rows.length} data siap diimpor. Semua baris akan ditambahkan sebagai data baru.
                </p>
              )}
              {importPreview.rows.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-[#e3e0d8]">
                  <table className="w-full min-w-[420px] text-left text-xs">
                    <thead className="bg-[#faf9f6] text-slate-500">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Nama</th>
                        <th className="px-3 py-2 font-semibold">NIP</th>
                        <th className="px-3 py-2 font-semibold">Jabatan</th>
                        <th className="px-3 py-2 font-semibold">Mapel</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e3e0d8]">
                      {importPreview.rows.slice(0, 5).map((row, index) => (
                        <tr key={`${row.name}-${index}`}>
                          <td className="px-3 py-2 text-[#17231f]">{row.name}</td>
                          <td className="px-3 py-2 text-slate-500">{row.nip || '-'}</td>
                          <td className="px-3 py-2 text-slate-500">{row.position}</td>
                          <td className="px-3 py-2 text-slate-500">{row.subject || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {importPreview.rows.length > 5 && (
                    <p className="border-t border-[#e3e0d8] px-3 py-2 text-[11px] text-slate-500">
                      dan {importPreview.rows.length - 5} data lainnya
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-[#e3e0d8] px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setImportPreview(null)}
                disabled={importing}
                className="rounded-xl border border-[#dedbd2] px-4 py-2 text-xs font-semibold text-slate-500 transition hover:bg-[#faf9f6] disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={importing || importPreview.errors.length > 0 || importPreview.rows.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#d3aa5d] to-[#c99a42] px-4 py-2 text-xs font-semibold text-[#17231f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {importing && <Loader2 className="h-4 w-4 animate-spin" />}
                {importing ? 'Mengimpor...' : `Impor ${importPreview.rows.length} Data`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORM EDIT / TAMBAH GURU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17231f]/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#e3e0d8] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e3e0d8] pb-4">
              <h2 className="text-base font-semibold text-[#17231f]">
                {editingId ? 'Edit Data Guru' : 'Tambah Guru Baru'}
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
              {/* Nama & NIP */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#34443b]">
                    Nama Lengkap &amp; Gelar
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Dra. Hj. Siti Aminah, M.Pd."
                    className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#34443b]">NIP / NBM</label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="19820921..."
                    className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  />
                </div>
              </div>

              {/* Jabatan & Mata Pelajaran */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#34443b]">Jabatan / Posisi</label>
                  <input
                    type="text"
                    required
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Guru Matematika / Wali Kelas X"
                    className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#34443b]">Mata Pelajaran (Mapel)</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Matematika / Pemrograman Web"
                    className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  />
                </div>
              </div>

              {/* Jenis Kelamin, Urutan & Status Pimpinan */}
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
                  <label className="mb-1 block text-xs font-semibold text-[#34443b]">Termasuk Pimpinan?</label>
                  <button
                    type="button"
                    onClick={() => setIsLeadership(!isLeadership)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition ${
                      isLeadership
                        ? 'border-[#dfcfaa] bg-[#fbf8f0] text-[#785e2d]'
                        : 'border-[#dedbd2] bg-[#faf9f6] text-slate-500'
                    }`}
                  >
                    <span>{isLeadership ? 'Ya (Pimpinan)' : 'Tidak (Guru)'}</span>
                    <Crown className={`h-4 w-4 ${isLeadership ? 'text-[#a57c31]' : 'text-slate-400'}`} />
                  </button>
                </div>
              </div>

              {/* UPLOAD FOTO DARI KOMPUTER / URL */}
              <div className="space-y-2 border-t border-[#e3e0d8] pt-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#34443b]">Foto Profil Guru</label>
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
                  {/* Preview Foto */}
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

                  {/* Drop File atau Input URL */}
                  <div className="flex flex-col justify-center sm:col-span-3">
                    {uploadMode === 'file' ? (
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="guru_photo_file"
                          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#dedbd2] bg-[#faf9f6] p-4 transition hover:border-[#bd9142] hover:bg-white"
                        >
                          <Upload className="mb-1 h-5 w-5 text-[#a57c31]" />
                          <span className="text-xs font-medium text-[#34443b]">Pilih foto dari komputer</span>
                          <span className="text-[10px] text-slate-500">PNG, JPG, WEBP (Max 5MB)</span>
                          <input
                            id="guru_photo_file"
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
                        value={photoUrl}
                        onChange={(e) => {
                          setPhotoUrl(e.target.value)
                          setPreviewUrl(e.target.value)
                        }}
                        placeholder="https://domain.com/foto-guru.png"
                        className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3 py-2 text-sm text-[#17231f] placeholder:text-slate-400 focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Pendidikan & Tempat Tanggal Lahir */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#34443b]">Pendidikan Terakhir</label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="S1 Pendidikan Matematika"
                    className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#34443b]">Tempat, Tanggal Lahir</label>
                  <input
                    type="text"
                    value={birthPlaceDate}
                    onChange={(e) => setBirthPlaceDate(e.target.value)}
                    placeholder="Mojokerto, 15 Mei 1985"
                    className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  />
                </div>
              </div>

              {/* No. HP & Email */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#34443b]">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#34443b]">Email Kontak</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="guru@sekolah.sch.id"
                    className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  />
                </div>
              </div>

              {/* Alamat & Bio */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#34443b]">Alamat Tempat Tinggal</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Raya Ngoro No. 45, Mojokerto"
                  className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] px-3.5 py-2.5 text-sm text-[#17231f] placeholder:text-slate-400 focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#34443b]">Bio / Catatan Singkat</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Deskripsi singkat profil guru..."
                  className="w-full rounded-xl border border-[#dedbd2] bg-[#faf9f6] p-3 text-sm text-[#17231f] placeholder:text-slate-400 focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
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
                  disabled={saving || uploadingImage}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#d3aa5d] to-[#c99a42] px-5 py-2 text-xs font-semibold text-[#17231f] shadow-[0_6px_16px_rgba(201,154,66,0.25)] transition hover:from-[#dcb472] hover:to-[#d3aa5d] disabled:cursor-wait disabled:opacity-50"
                >
                  {saving || uploadingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{uploadingImage ? 'Mengunggah foto...' : 'Menyimpan...'}</span>
                    </>
                  ) : (
                    'Simpan Data Guru'
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
