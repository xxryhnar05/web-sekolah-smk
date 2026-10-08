'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowserClient'
import {
  Loader2,
  Save,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileImage,
  FileText,
} from 'lucide-react'

export default function AdminPpdbPage() {
  const [configId, setConfigId] = useState<string | null>(null)
  const [title, setTitle] = useState('INFORMASI PENERIMAAN PESERTA DIDIK BARU (PPDB)')
  const [shortText, setShortText] = useState('')
  const [posterUrl, setPosterUrl] = useState('')

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Fetch Konfigurasi PPDB
  const fetchConfig = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('ppdb_config')
        .select('*')
        .limit(1)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setConfigId(data.id)
        setTitle(data.title || 'INFORMASI PENERIMAAN PESERTA DIDIK BARU (PPDB)')
        setShortText(data.short_text || '')
        setPosterUrl(data.poster_url || '')
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal mengambil konfigurasi PPDB.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  // Upload Poster & LANGSUNG Simpan URL ke Database
  const handleUploadPoster = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setStatusMessage(null)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `poster-ppdb-${Date.now()}.${fileExt}`
      const filePath = `posters/${fileName}`

      // 1. Upload ke Storage
      const { error: uploadError } = await supabase.storage
        .from('ppdb-posters')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // 2. Ambil Public URL
      const { data: urlData } = supabase.storage
        .from('ppdb-posters')
        .getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl
      setPosterUrl(publicUrl)

      // 3. LANGSUNG Simpan / Update ke Database
      const payload = {
        title: title.trim(),
        short_text: shortText.trim(),
        poster_url: publicUrl,
        updated_at: new Date().toISOString(),
      }

      if (configId) {
        const { error: dbError } = await supabase
          .from('ppdb_config')
          .update(payload)
          .eq('id', configId)

        if (dbError) throw dbError
      } else {
        const { data: newData, error: dbError } = await supabase
          .from('ppdb_config')
          .insert([payload])
          .select('id')
          .single()

        if (dbError) throw dbError
        if (newData) setConfigId(newData.id)
      }

      setStatusMessage({ type: 'success', text: 'Poster berhasil diunggah dan disimpan ke database!' })
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal mengunggah poster.' })
    } finally {
      setUploading(false)
    }
  }

  // Simpan Manual (Teks / Judul)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatusMessage(null)

    try {
      const payload = {
        title: title.trim(),
        short_text: shortText.trim(),
        poster_url: posterUrl,
        updated_at: new Date().toISOString(),
      }

      if (configId) {
        const { error } = await supabase
          .from('ppdb_config')
          .update(payload)
          .eq('id', configId)

        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('ppdb_config')
          .insert([payload])
          .select('id')
          .single()

        if (error) throw error
        if (data) setConfigId(data.id)
      }

      setStatusMessage({ type: 'success', text: 'Data PPDB berhasil disimpan!' })
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menyimpan perubahan.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center font-sans text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-[#bd9142]" />
        <span className="ml-3 text-sm font-medium">Memuat data Admin PPDB...</span>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-7 font-sans text-[#34443b] antialiased">
      <section className="relative isolate grid overflow-hidden rounded-2xl bg-[#17231f] px-6 py-8 text-white shadow-[0_16px_36px_rgba(23,35,31,0.16)] sm:px-9 sm:py-9 lg:grid-cols-[1fr_300px] lg:items-center lg:gap-8">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[url('/batik2.png')] bg-[length:420px_auto] bg-right-top bg-no-repeat opacity-35 mix-blend-screen" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#17231f] via-[#17231f]/95 to-[#17231f]/35" />
        <div className="max-w-xl">
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300">
            <span className="h-px w-6 bg-amber-300" />
            Manajemen Konten Web
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Kelola Halaman PPDB
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/65">
            Atur judul, pengantar, dan poster informasi yang ditampilkan pada halaman PPDB.
          </p>
        </div>
        <div className="mt-7 border-t border-white/10 pt-5 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
            Area pengelolaan
          </p>
          <div className="flex min-h-14 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#c99a42]/15 text-amber-300">
              <FileText className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-xs font-medium text-white/85">Informasi PPDB</span>
              <span className="mt-1 block text-[11px] text-white/45">Konten halaman publik</span>
            </span>
          </div>
        </div>
      </section>

      {statusMessage && (
        <div
          role="status"
          className={`flex items-center gap-3 rounded-xl border p-4 text-xs font-medium ${
            statusMessage.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
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
              <FileText className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-[#17231f]">
                Formulir Halaman PPDB
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Kelola judul, pengantar, dan poster halaman publik.
              </p>
            </div>
          </div>
          <span className="relative inline-flex items-center gap-2 rounded-full border border-[#dfcfaa] bg-[#fbf8f0] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#785e2d]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c99a42]" />
            Konten PPDB
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-7 lg:px-8 lg:py-8">
          <section className="space-y-5 rounded-xl border border-[#e3e0d8] bg-[#faf9f6]/70 p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f2efe7] text-[#a57c31]">
                <FileText className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-[#17231f]">Konten utama</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Atur judul dan pengantar yang tampil di halaman PPDB.
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="ppdb-title" className="mb-2 block text-xs font-semibold text-[#26352e]">
                Judul Utama Halaman PPDB
              </label>
              <input
                id="ppdb-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-[#dedbd2] bg-white px-3.5 py-2.5 text-sm text-[#17231f] outline-none transition placeholder:text-slate-400 focus:border-[#bd9142] focus:ring-4 focus:ring-[#bd9142]/10"
              />
            </div>

            <div>
              <label htmlFor="ppdb-intro" className="mb-2 block text-xs font-semibold text-[#26352e]">
                Teks Singkat Pengantar PPDB
              </label>
              <textarea
                id="ppdb-intro"
                rows={5}
                required
                value={shortText}
                onChange={(e) => setShortText(e.target.value)}
                placeholder="Tuliskan kata pengantar singkat mengenai PPDB di sini..."
                className="w-full resize-y rounded-lg border border-[#dedbd2] bg-white p-3.5 text-sm leading-6 text-[#17231f] outline-none transition placeholder:text-slate-400 focus:border-[#bd9142] focus:ring-4 focus:ring-[#bd9142]/10"
              />
            </div>
          </section>

          <section className="space-y-5 rounded-xl border border-[#e3e0d8] bg-white p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f2efe7] text-[#a57c31]">
                <FileImage className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-[#17231f]">Poster informasi</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Unggah poster jadwal, persyaratan, dan alur pendaftaran.
                </p>
              </div>
            </div>

            <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d8d2c4] bg-[#faf9f6]/70 px-5 py-9 text-center transition hover:border-[#bd9142] hover:bg-[#fbf8f0]">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f2efe7] text-[#a57c31] transition group-hover:bg-[#eee5d2]">
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Upload className="h-5 w-5" />
                )}
              </span>
              <span className="mt-4 text-xs font-semibold text-[#26352e]">
                {uploading ? 'Mengunggah & menyimpan poster...' : 'Pilih File Poster'}
              </span>
              <span className="mt-1 text-xs text-slate-500">
                Format gambar PNG, JPG, atau JPEG
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadPoster}
                disabled={uploading}
                className="sr-only"
              />
            </label>

            {posterUrl && (
              <div className="rounded-xl border border-[#e3e0d8] bg-[#faf9f6]/70 p-4 sm:p-5">
                <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#26352e]">
                  <FileImage className="h-4 w-4 text-[#a57c31]" />
                  Preview poster tersimpan
                </p>
                <div className="mx-auto w-fit max-w-full overflow-hidden rounded-lg border border-[#e3e0d8] bg-white p-2">
                  <img src={posterUrl} alt="Preview Poster PPDB" className="block h-auto max-h-[700px] w-auto max-w-full rounded-md object-contain" />
                </div>
              </div>
            )}
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-[#e3e0d8] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-slate-500">
              Poster tersimpan otomatis setelah unggah. Simpan perubahan untuk memperbarui judul dan pengantar.
            </p>
            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#d3aa5d] to-[#c99a42] px-5 py-3 text-xs font-semibold text-[#17231f] shadow-sm transition hover:from-[#dcb472] hover:to-[#d3aa5d] focus:outline-none focus:ring-4 focus:ring-[#bd9142]/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Simpan Perubahan PPDB</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}