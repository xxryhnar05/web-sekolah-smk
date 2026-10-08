'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowserClient'
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  User,
  ImageIcon,
  Upload,
  Link as LinkIcon,
  PenLine,
  Info,
} from 'lucide-react'

export default function SambutanKepalaPage() {
  const router = useRouter()
  const [profileId, setProfileId] = useState<string | null>(null)
  const [headmasterName, setHeadmasterName] = useState('')
  const [welcomeSpeech, setWelcomeSpeech] = useState('')
  const [headmasterPhotoUrl, setHeadmasterPhotoUrl] = useState('')

  // State untuk upload file
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Fetch data dari database saat halaman dimuat
  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from('school_profiles')
          .select('id, welcome_speech, headmaster_name, headmaster_photo_url')
          .order('updated_at', { ascending: false, nullsFirst: false })
          .limit(1)
          .maybeSingle()

        if (error) throw error

        if (data) {
          setProfileId(data.id)
          setHeadmasterName(data.headmaster_name || '')
          setWelcomeSpeech(data.welcome_speech || '')
          setHeadmasterPhotoUrl(data.headmaster_photo_url || '')
        }
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: 'Gagal memuat data dari database.' })
      } finally {
        setLoadingData(false)
      }
    }

    fetchProfile()
  }, [])

  // Handler saat file dari komputer dipilih
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  // Fungsi upload gambar ke Supabase Storage
  const uploadPhotoToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `headmaster-${Date.now()}.${fileExt}`
    const filePath = `headmaster/${fileName}`

    // Upload ke bucket 'school-media' (pastikan bucket ini sudah dibuat & public di Supabase)
    const { error: uploadError } = await supabase.storage
      .from('school-media')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      throw new Error(`Gagal mengunggah foto: ${uploadError.message}`)
    }

    // Dapatkan Public URL gambar
    const { data: publicUrlData } = supabase.storage
      .from('school-media')
      .getPublicUrl(filePath)

    return publicUrlData.publicUrl
  }

  // Fungsi simpan perubahan ke database
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatusMessage(null)

    try {
      let finalPhotoUrl = headmasterPhotoUrl

      // Jika user memilih file dari komputer, upload dulu ke Supabase Storage
      if (uploadMode === 'file' && selectedFile) {
        setUploadingImage(true)
        finalPhotoUrl = await uploadPhotoToStorage(selectedFile)
        setHeadmasterPhotoUrl(finalPhotoUrl)
        setUploadingImage(false)
      }

      if (profileId) {
        // Update data jika record sudah ada
        const { error, count } = await supabase
          .from('school_profiles')
          .update({
            headmaster_name: headmasterName,
            welcome_speech: welcomeSpeech,
            headmaster_photo_url: finalPhotoUrl,
            updated_at: new Date().toISOString(),
          }, { count: 'exact' })
          .eq('id', profileId)

        if (error) throw error
        if (count !== 1) {
          throw new Error('Data sambutan tidak berhasil diperbarui. Muat ulang halaman dan pastikan akses admin masih aktif.')
        }
      } else {
        // Insert record baru jika tabel masih kosong
        const { data, error } = await supabase
          .from('school_profiles')
          .insert([
            {
              headmaster_name: headmasterName,
              welcome_speech: welcomeSpeech,
              headmaster_photo_url: finalPhotoUrl,
            },
          ])
          .select('id')
          .single()

        if (error) throw error
        if (data) setProfileId(data.id)
      }

      setStatusMessage({ type: 'success', text: 'Sambutan Kepala Sekolah berhasil diperbarui!' })
      setSelectedFile(null)
      router.refresh()
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menyimpan perubahan.' })
    } finally {
      setSaving(false)
      setUploadingImage(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-[#bd9142]" />
        <span className="ml-3 text-sm">Memuat data sambutan...</span>
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
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Sambutan Kepala Sekolah</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/65">Perbarui nama, foto, dan teks sambutan yang ditampilkan pada website sekolah.</p>
        </div>
        <div className="mt-7 border-t border-white/10 pt-5 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Area pengelolaan</p>
          <div className="flex min-h-14 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c99a42]/15 text-amber-300"><User className="h-4 w-4" /></span>
            <span><span className="block text-xs font-medium text-white/85">Profil sekolah</span><span className="mt-1 block text-[11px] text-white/45">Konten halaman publik</span></span>
          </div>
        </div>
      </section>

      {/* ===== Form Container ===== */}
      <div className="w-full overflow-hidden rounded-2xl border border-[#e3e0d8] bg-white shadow-[0_8px_24px_rgba(40,51,46,0.045)]">
        {/* Header Formulir */}
        <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-3 overflow-hidden border-b border-[#e3e0d8] bg-gradient-to-r from-[#faf9f6] via-white to-[#faf9f6] px-5 py-5 sm:px-7 lg:px-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-64 bg-[url('/batik2.png')] bg-[length:240px_auto] bg-right bg-no-repeat opacity-[0.07]"
          />
          <div className="relative flex items-center gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#17231f] text-amber-300 shadow-[0_4px_12px_rgba(23,35,31,0.2)]">
              <PenLine className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-[#17231f]">Formulir Sambutan</h2>
              <p className="mt-0.5 text-xs text-slate-500">Perubahan langsung tampil di halaman publik setelah disimpan.</p>
            </div>
          </div>
          <span className="relative inline-flex items-center gap-2 rounded-full border border-[#dfcfaa] bg-[#fbf8f0] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#785e2d]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c99a42]" />
            Profil Sekolah
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 px-5 py-6 sm:px-7 sm:py-7 lg:px-8 lg:py-8">
          {/* Pesan Status Notifikasi */}
          {statusMessage && (
            <div
              className={`flex items-start gap-3 rounded-xl border p-4 text-xs font-medium shadow-sm ${
                statusMessage.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="mt-px h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="mt-px h-4 w-4 shrink-0 text-red-600" />
              )}
              <span className="flex-1 leading-relaxed">{statusMessage.text}</span>
            </div>
          )}

          <div className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <section className="space-y-5 rounded-xl border border-[#e3e0d8] bg-[#faf9f6]/70 p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f2efe7] text-[#a57c31]">
                  <User className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[#17231f]">Identitas Kepala Sekolah</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Atur nama yang ditampilkan dan foto profil untuk halaman sambutan.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
              {/* Input Nama Kepala Sekolah */}
              <div className="space-y-2">
                <label
                  htmlFor="headmaster_name"
                  className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700"
                >
                  Nama Kepala Sekolah &amp; Gelar
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="headmaster_name"
                    type="text"
                    required
                    value={headmasterName}
                    onChange={(e) => setHeadmasterName(e.target.value)}
                    placeholder="Contoh: H. Ahmad Dahlan, M.Pd."
                    className="w-full rounded-lg border border-[#dedbd2] bg-[#faf9f6] py-3 pl-10 pr-4 text-sm font-medium text-[#17231f] placeholder:font-normal placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                  />
                </div>
              </div>

              {/* SECTION FOTO KEPALA SEKOLAH (UPLOAD / URL) */}
              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                    Foto Kepala Sekolah
                  </label>
                  {/* Toggle Opsi Upload atau URL */}
                  <div className="flex w-fit rounded-lg border border-[#e3e0d8] bg-[#f3f2ee] p-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setUploadMode('file')}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition ${
                        uploadMode === 'file'
                          ? 'border border-[#dfcfaa] bg-white text-[#785e2d] shadow-sm'
                          : 'border border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Upload className="h-3.5 w-3.5" /> Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode('url')}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition ${
                        uploadMode === 'url'
                          ? 'border border-[#dfcfaa] bg-white text-[#785e2d] shadow-sm'
                          : 'border border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <LinkIcon className="h-3.5 w-3.5" /> URL Gambar
                    </button>
                  </div>
                </div>

                <div>
                  {uploadMode === 'file' ? (
                    <div className="space-y-2.5">
                      <label
                        htmlFor="photo_file"
                        className="group flex cursor-pointer items-center gap-3.5 rounded-xl border-2 border-dashed border-[#d9d5ca] bg-[#faf9f6] p-4 transition hover:border-[#bd9142]/70 hover:bg-[#fbf8f0]"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f2efe7] text-[#a57c31] transition group-hover:bg-[#c99a42] group-hover:text-white">
                          <Upload className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-semibold text-slate-700 transition group-hover:text-[#785e2d]">
                            Klik untuk memilih foto dari perangkat
                          </span>
                          <span className="mt-1 block text-[11px] text-slate-400">
                            PNG, JPG, JPEG, WEBP &middot; Maksimal 5 MB
                          </span>
                        </span>
                        <span className="hidden shrink-0 rounded-lg border border-[#dedbd2] bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 shadow-sm transition group-hover:border-[#dfcfaa] group-hover:text-[#785e2d] sm:block">
                          Pilih File
                        </span>
                        <input
                          id="photo_file"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      {selectedFile && (
                        <div className="flex items-center gap-2.5 rounded-lg border border-[#dfcfaa] bg-[#fbf8f0] px-3 py-2.5">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#c99a42]/15 text-[#a57c31]">
                            <ImageIcon className="h-3.5 w-3.5" />
                          </span>
                          <p className="min-w-0 flex-1 truncate text-xs font-medium text-[#785e2d]">
                            {selectedFile.name}
                          </p>
                          <span className="shrink-0 text-[10px] font-semibold tabular-nums text-[#a57c31]">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                          <ImageIcon className="h-4 w-4" />
                        </div>
                        <input
                          id="headmaster_photo_url"
                          type="text"
                          value={headmasterPhotoUrl}
                          onChange={(e) => setHeadmasterPhotoUrl(e.target.value)}
                          placeholder="https://alamat-foto.jpg"
                          className="w-full rounded-lg border border-[#dedbd2] bg-[#faf9f6] py-3 pl-10 pr-4 text-sm text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
                        />
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-400">
                        Tempel tautan gambar langsung, misalnya dari Supabase Storage atau CDN lainnya.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              </div>
            </section>

            {/* Input Textarea Sambutan Kepala Sekolah */}
            <section className="flex flex-col gap-3 rounded-xl border border-[#e3e0d8] bg-white p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <label
                    htmlFor="welcome_speech"
                    className="block text-sm font-semibold text-[#17231f]"
                  >
                    Isi Teks Sambutan
                  </label>
                  <p className="mt-1 text-xs text-slate-500">
                    Tulis pesan yang akan dibaca pengunjung pada halaman sekolah.
                  </p>
                </div>
                <span className="rounded-full border border-[#e3e0d8] bg-[#faf9f6] px-2.5 py-1 text-[10px] font-medium tabular-nums text-slate-500">
                  {welcomeSpeech.length} karakter
                </span>
              </div>
              <textarea
                id="welcome_speech"
                rows={12}
                required
                value={welcomeSpeech}
                onChange={(e) => setWelcomeSpeech(e.target.value)}
                placeholder="Tuliskan kata sambutan kepala sekolah di sini..."
                className="min-h-80 w-full flex-1 resize-y rounded-lg border border-[#dedbd2] bg-[#faf9f6] p-4 text-sm leading-7 text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
              />
            </section>
          </div>

          {/* Footer Aksi */}
          <div className="flex flex-col-reverse items-stretch gap-3 border-t border-[#e3e0d8] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Info className="h-3.5 w-3.5 shrink-0" />
              Data tersimpan ke tabel <span className="font-mono text-slate-500">school_profiles</span>.
            </p>
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#d3aa5d] to-[#c99a42] px-6 py-3 text-sm font-semibold text-[#17231f] shadow-[0_6px_16px_rgba(201,154,66,0.35)] transition hover:from-[#dcb472] hover:to-[#d3aa5d] hover:shadow-[0_8px_20px_rgba(201,154,66,0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bd9142] active:scale-[0.98] disabled:cursor-wait disabled:opacity-50 disabled:shadow-none disabled:active:scale-100"
            >
              {saving || uploadingImage ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{uploadingImage ? 'Mengunggah foto...' : 'Menyimpan...'}</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Simpan Sambutan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}