'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowserClient'
import { normalizeMissionContent } from '@/lib/mission-content'
import { Save, Loader2, CheckCircle2, AlertCircle, Compass, Target } from 'lucide-react'

export default function AdminVisiMisiPage() {
  const router = useRouter()
  const [profileId, setProfileId] = useState<string | null>(null)
  const [vision, setVision] = useState('')
  const [mission, setMission] = useState('')
  const [motto, setMotto] = useState('')

  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Fetch data Visi & Misi dari Supabase
  useEffect(() => {
    async function fetchVisiMisi() {
      try {
        const { data, error } = await supabase
          .from('school_profiles')
          .select('id, vision, mission, motto')
          .limit(1)
          .maybeSingle()

        if (error) throw error

        if (data) {
          setProfileId(data.id)
          setVision(data.vision || '')
          setMission(normalizeMissionContent(data.mission))
          setMotto(data.motto || '')
        }
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: 'Gagal memuat data Visi & Misi dari database.' })
      } finally {
        setLoadingData(false)
      }
    }

    fetchVisiMisi()
  }, [])

  // Fungsi simpan perubahan ke database
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatusMessage(null)

    const cleanedMission = mission.trim()

    try {
      if (profileId) {
        // Update record yang sudah ada
        const { error } = await supabase
          .from('school_profiles')
          .update({
            vision: vision,
            mission: cleanedMission,
            motto: motto.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', profileId)

        if (error) throw error
      } else {
        // Insert record baru jika tabel masih kosong
        const { data, error } = await supabase
          .from('school_profiles')
          .insert([
            {
              vision: vision,
              mission: cleanedMission,
              motto: motto.trim(),
            },
          ])
          .select('id')
          .single()

        if (error) throw error
        if (data) setProfileId(data.id)
      }

      setStatusMessage({ type: 'success', text: 'Visi & Misi sekolah berhasil diperbarui!' })
      router.refresh()
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menyimpan data.' })
    } finally {
      setSaving(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-[#bd9142]" />
        <span className="ml-3 text-sm">Memuat data Visi &amp; Misi...</span>
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
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Visi &amp; Misi</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/65">Atur visi, misi, dan motto yang ditampilkan pada profil sekolah.</p>
        </div>
        <div className="mt-7 border-t border-white/10 pt-5 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Area pengelolaan</p>
          <div className="flex min-h-14 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c99a42]/15 text-amber-300"><Compass className="h-4 w-4" /></span>
            <span><span className="block text-xs font-medium text-white/85">Profil sekolah</span><span className="mt-1 block text-[11px] text-white/45">Konten halaman publik</span></span>
          </div>
        </div>
      </section>

      <div className="w-full overflow-hidden rounded-2xl border border-[#e3e0d8] bg-white shadow-[0_8px_24px_rgba(40,51,46,0.045)]">
        <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-3 overflow-hidden border-b border-[#e3e0d8] bg-gradient-to-r from-[#faf9f6] via-white to-[#faf9f6] px-5 py-5 sm:px-7 lg:px-8">
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-64 bg-[url('/batik2.png')] bg-[length:240px_auto] bg-right bg-no-repeat opacity-[0.07]" />
          <div className="relative flex items-center gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#17231f] text-amber-300 shadow-[0_4px_12px_rgba(23,35,31,0.2)]"><Target className="h-4 w-4" /></span>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-[#17231f]">Formulir Visi &amp; Misi</h2>
              <p className="mt-0.5 text-xs text-slate-500">Perubahan langsung tampil di halaman publik setelah disimpan.</p>
            </div>
          </div>
          <span className="relative inline-flex items-center gap-2 rounded-full border border-[#dfcfaa] bg-[#fbf8f0] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#785e2d]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c99a42]" /> Profil Sekolah
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 px-5 py-6 sm:px-7 sm:py-7 lg:px-8 lg:py-8">
          {statusMessage && (
            <div className={`flex items-start gap-3 rounded-xl border p-4 text-xs font-medium shadow-sm ${statusMessage.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
              {statusMessage.type === 'success' ? <CheckCircle2 className="mt-px h-4 w-4 shrink-0 text-emerald-600" /> : <AlertCircle className="mt-px h-4 w-4 shrink-0 text-red-600" />}
              <span className="flex-1 leading-relaxed">{statusMessage.text}</span>
            </div>
          )}

          <div className="grid items-start gap-6 xl:grid-cols-2">
            <section className="space-y-5 rounded-xl border border-[#e3e0d8] bg-[#faf9f6]/70 p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f2efe7] text-[#a57c31]"><Compass className="h-4 w-4" /></span>
                <div>
                  <h3 className="text-sm font-semibold text-[#17231f]">Visi Sekolah</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">Tuliskan arah dan cita-cita utama sekolah.</p>
                </div>
              </div>
              <textarea
                id="vision"
                rows={8}
                required
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                placeholder="Tuliskan visi utama sekolah di sini..."
                className="min-h-56 w-full resize-y rounded-lg border border-[#dedbd2] bg-[#faf9f6] p-4 text-sm leading-7 text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
              />
            </section>

            <section className="space-y-5 rounded-xl border border-[#e3e0d8] bg-[#faf9f6]/70 p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f2efe7] text-[#a57c31]"><Target className="h-4 w-4" /></span>
                <div>
                  <h3 className="text-sm font-semibold text-[#17231f]">Misi Sekolah</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">Tuliskan misi dalam bentuk paragraf seperti visi.</p>
                </div>
              </div>
              <textarea
                id="mission"
                rows={8}
                required
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                placeholder="Tuliskan misi sekolah di sini..."
                className="min-h-56 w-full resize-y rounded-lg border border-[#dedbd2] bg-[#faf9f6] p-4 text-sm leading-7 text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
              />
            </section>
          </div>

          <section className="space-y-5 rounded-xl border border-[#e3e0d8] bg-white p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f2efe7] text-[#a57c31]"><Target className="h-4 w-4" /></span>
              <div>
                <h3 className="text-sm font-semibold text-[#17231f]">Motto Sekolah</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">Tuliskan motto singkat yang menjadi semboyan sekolah.</p>
              </div>
            </div>
            <input
              id="motto"
              type="text"
              value={motto}
              onChange={(e) => setMotto(e.target.value)}
              placeholder="Tuliskan motto sekolah di sini..."
              className="w-full rounded-lg border border-[#dedbd2] bg-[#faf9f6] p-4 text-sm leading-7 text-[#17231f] placeholder:text-slate-400 transition focus:border-[#bd9142] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#bd9142]/10"
            />
          </section>

          <div className="flex flex-col-reverse items-stretch gap-3 border-t border-[#e3e0d8] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-slate-400">Data tersimpan ke tabel <span className="font-mono text-slate-500">school_profiles</span>.</p>
            <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#d3aa5d] to-[#c99a42] px-6 py-3 text-sm font-semibold text-[#17231f] shadow-[0_6px_16px_rgba(201,154,66,0.35)] transition hover:from-[#dcb472] hover:to-[#d3aa5d] hover:shadow-[0_8px_20px_rgba(201,154,66,0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bd9142] active:scale-[0.98] disabled:cursor-wait disabled:opacity-50 disabled:shadow-none disabled:active:scale-100">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /><span>Menyimpan...</span></> : <><Save className="h-4 w-4" /><span>Simpan Visi &amp; Misi</span></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
