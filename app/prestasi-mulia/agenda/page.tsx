'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
  Loader2,
  Calendar,
  User,
  FileText,
  ArrowRight,
  ExternalLink,
  FileSpreadsheet,
} from 'lucide-react'

interface AgendaItem {
  id: string
  title: string
  author_name: string
  upload_date: string
  short_description: string
  pdf_url: string
}

export default function AgendaUserPage() {
  const [items, setItems] = useState<AgendaItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAgenda = async () => {
      try {
        const { data, error } = await supabase
          .from('agenda')
          .select('*')
          .eq('is_active', true)
          .order('upload_date', { ascending: false })

        if (error) throw error
        setItems(data || [])
      } catch (err) {
        console.error('Gagal memuat agenda:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAgenda()
  }, [])

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#070d1c] font-sans text-slate-300 antialiased selection:bg-amber-400/20 selection:text-amber-100">
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
        className="pointer-events-none fixed inset-0 -z-10 bg-repeat opacity-[0.04]"
        style={{
          backgroundImage: "url('/batik.png')",
          backgroundSize: '600px auto',
          maskImage: 'radial-gradient(ellipse 100% 80% at 50% 30%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 100% 80% at 50% 30%, black 20%, transparent 80%)',
        }}
      />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <header className="mx-auto mb-10 max-w-5xl text-center sm:mb-12">
          <p className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-400/80 sm:text-xs">
            <span className="h-px w-8 bg-amber-400/50" />
            Jadwal &amp; Kalender
            <span className="h-px w-8 bg-amber-400/50" />
          </p>
          <div className="mx-auto mt-5 w-full max-w-4xl rounded-2xl border border-amber-400/25 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 px-5 py-6 shadow-[0_24px_50px_rgba(0,0,0,0.18)] ring-1 ring-white/5 sm:py-7">
            <h1
              className="flex items-center justify-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-5xl"
              style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
            >
              Agenda 
            </h1>
          </div>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">
            Unduh dan pelajari kalender akademik, jadwal kegiatan, serta informasi agenda sekolah terbaru.
          </p>
        </header>

        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center text-slate-400">
            <Loader2 className="h-7 w-7 animate-spin text-amber-400" />
            <p className="mt-3 text-sm font-medium">Memuat agenda sekolah...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <a
                key={item.id}
                href={item.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:shadow-[0_20px_40px_rgba(0,0,0,0.28)]"
              >
                <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/[0.08] text-amber-300 transition group-hover:border-amber-400/35 group-hover:bg-amber-400/[0.12]">
                      <FileSpreadsheet className="h-5 w-5" />
                    </span>
                    <span className="inline-flex rounded-full border border-amber-400/20 bg-amber-400/[0.07] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200">
                      Dokumen PDF
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <h2 className="line-clamp-2 text-base font-bold leading-snug text-white transition-colors group-hover:text-amber-200">
                      {item.title}
                    </h2>
                    <p className="line-clamp-3 text-xs leading-relaxed text-slate-400">
                      {item.short_description}
                    </p>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-[11px] text-slate-400">
                    <span className="flex min-w-0 items-center gap-1.5 font-medium">
                      <User className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                      <span className="truncate">{item.author_name}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-amber-400" />
                      {new Date(item.upload_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/10 px-5 py-4 sm:px-6">
                  <span className="flex items-center justify-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-2.5 text-xs font-bold text-amber-200 transition group-hover:border-amber-400/40 group-hover:bg-amber-400 group-hover:text-slate-950">
                    <span>Buka &amp; baca dokumen</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    <ExternalLink className="h-3.5 w-3.5" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] py-16 text-center text-slate-400">
            <FileText className="mb-3 h-12 w-12 text-amber-400/60" />
            <p className="text-sm font-medium">Belum ada agenda atau kalender yang dipublikasikan.</p>
          </div>
        )}
      </main>
    </div>
  )
}