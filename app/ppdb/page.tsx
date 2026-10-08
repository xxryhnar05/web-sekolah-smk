'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { ExternalLink, FileImage, Loader2 } from 'lucide-react'

interface PpdbConfig {
  title: string
  short_text: string
  poster_url: string
}

export default function PpdbUserPage() {
  const [config, setConfig] = useState<PpdbConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPpdbConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('ppdb_config')
          .select('*')
          .limit(1)
          .single()

        if (error && error.code !== 'PGRST116') throw error
        if (data) setConfig(data)
      } catch (err) {
        console.error('Gagal mengambil data PPDB:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPpdbConfig()
  }, [])

  const background = (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-20 bg-gradient-to-b from-[#0a1429] via-[#0b1322] to-[#05080f]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-1/2 top-[-20%] -z-10 h-[500px] w-[80%] -translate-x-1/2 rounded-full bg-amber-500/[0.06] blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-[-10%] right-[-10%] -z-10 h-[400px] w-[50%] rounded-full bg-indigo-700/[0.06] blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-repeat opacity-[0.04]"
        style={{
          backgroundImage: "url('/batik.png')",
          backgroundSize: '600px auto',
          maskImage:
            'radial-gradient(ellipse 100% 80% at 50% 30%, black 20%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 100% 80% at 50% 30%, black 20%, transparent 80%)',
        }}
      />
    </>
  )

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#070d1c] font-sans text-slate-300 antialiased selection:bg-amber-400/20 selection:text-amber-100">
      {background}
      <main className="relative z-10 mx-auto w-full max-w-5xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <header className="mx-auto max-w-5xl text-center">
          <p className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-400/80 sm:text-xs">
            <span className="h-px w-8 bg-amber-400/50" />
            Penerimaan Peserta Didik Baru
            <span className="h-px w-8 bg-amber-400/50" />
          </p>

          <div className="mx-auto mt-5 w-full max-w-4xl rounded-2xl border border-amber-400/25 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 px-5 py-7 shadow-[0_24px_50px_rgba(0,0,0,0.18)] ring-1 ring-white/5 sm:px-8 sm:py-8">
            <h1
              className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-5xl"
              style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
            >
              {config?.title || 'Informasi Penerimaan Peserta Didik Baru (PPDB)'}
            </h1>
          </div>

          <p className="mx-auto mt-5 max-w-2xl whitespace-pre-line text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">
            {loading
              ? 'Memuat informasi PPDB...'
              : config?.short_text ||
                'Selamat datang di Portal Resmi Penerimaan Peserta Didik Baru (PPDB). Kami membuka pendaftaran siswa baru untuk tahun ajaran mendatang. Silakan pelajari rincian alur pendaftaran, persyaratan, gelombang pendaftaran, serta kontak panitia melalui poster resmi di bawah ini.'}
          </p>
        </header>

        <section id="poster" className="mx-auto mt-14 max-w-4xl scroll-mt-28 sm:mt-16">
          <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-400/75">
                Panduan pendaftaran
              </p>
              <h2 className="flex items-center gap-3 text-lg font-bold tracking-tight text-white sm:text-2xl">
                Informasi &amp; Persyaratan PPDB
              </h2>
            </div>
            {!loading && config?.poster_url && (
              <a
                href={config.poster_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-amber-300 transition hover:text-amber-200"
              >
                Buka poster penuh
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02]">
              <Loader2 className="h-7 w-7 animate-spin text-amber-400" />
              <p className="mt-3 text-sm text-slate-400">Memuat poster PPDB...</p>
            </div>
          ) : config?.poster_url ? (
            <div className="mx-auto w-fit max-w-full overflow-hidden rounded-2xl border border-amber-400/15 bg-slate-900/60 p-2 shadow-2xl backdrop-blur-sm sm:p-4">
              <img
                src={config.poster_url}
                alt="Poster informasi dan persyaratan PPDB"
                className="block h-auto max-h-[1100px] w-auto max-w-full rounded-xl object-contain"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/[0.06]">
                <FileImage className="h-8 w-8 text-amber-400/70" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-white">
                Poster PPDB belum tersedia
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                Poster detail informasi dan persyaratan PPDB belum diunggah oleh admin. Silakan kunjungi kembali halaman ini untuk mendapatkan informasi terbaru.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}