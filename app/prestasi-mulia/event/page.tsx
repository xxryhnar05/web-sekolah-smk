'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, GraduationCap, User, Calendar, ImageIcon, ArrowRight } from 'lucide-react'

interface EventWisudaItem {
  id: string
  title: string
  author_name: string
  upload_date: string
  cover_image_url: string
  detail_images: string[]
}

export default function EventWisudaUserPage() {
  const [items, setItems] = useState<EventWisudaItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('event_wisuda')
          .select('*')
          .eq('is_active', true)
          .order('upload_date', { ascending: false })

        if (error) throw error
        setItems(data || [])
      } catch (err) {
        console.error('Gagal memuat event wisuda:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#070d1c] font-sans text-slate-300 antialiased selection:bg-amber-400/20 selection:text-amber-100">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20 bg-gradient-to-b from-[#0a1429] via-[#0b1322] to-[#05080f]" />
      <div aria-hidden="true" className="pointer-events-none fixed left-1/2 top-[-20%] -z-10 h-[500px] w-[80%] -translate-x-1/2 rounded-full bg-amber-500/[0.06] blur-[120px]" />
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
            Dokumentasi &amp; Galeri Kegiatan
            <span className="h-px w-8 bg-amber-400/50" />
          </p>
          <div className="mx-auto mt-5 w-full max-w-4xl rounded-2xl border border-amber-400/25 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 px-5 py-6 shadow-[0_24px_50px_rgba(0,0,0,0.18)] ring-1 ring-white/5 sm:py-7">
            <h1
              className="flex items-center justify-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-5xl"
              style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
            >
              Event Wisuda
            </h1>
          </div>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">
            Arsip dokumentasi dan momen istimewa pelaksanaan wisuda purna siswa. Pilih event untuk melihat cerita dan galeri kegiatannya.
          </p>
        </header>

      {loading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center text-slate-400">
          <Loader2 className="h-7 w-7 animate-spin text-amber-400" />
          <p className="mt-3 text-sm font-medium">Memuat momen wisuda...</p>
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:shadow-[0_20px_40px_rgba(0,0,0,0.28)]"
            >
              <Link href={`/prestasi-mulia/event/${item.id}`} className="relative block h-56 w-full overflow-hidden bg-slate-800">
                <img
                  src={item.cover_image_url}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070d1c]/70 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-lg border border-amber-300/30 bg-[#111a2a]/90 px-3 py-1.5 text-[11px] font-semibold text-amber-200 shadow-lg backdrop-blur-sm">
                  Lihat dokumentasi
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#111a2a]/90 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-lg backdrop-blur-sm">
                  <ImageIcon className="h-3 w-3 text-amber-400" /> {item.detail_images?.length || 0} foto
                </span>
              </Link>

              <div className="flex flex-1 flex-col justify-between gap-5 p-5">
                <Link href={`/prestasi-mulia/event/${item.id}`}>
                  <h2 className="line-clamp-2 text-base font-bold leading-snug text-white transition-colors group-hover:text-amber-200">
                    {item.title}
                  </h2>
                </Link>

                <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-[11px] text-slate-400">
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
            </article>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] py-16 text-center text-slate-400">
          <GraduationCap className="mb-3 h-12 w-12 text-amber-400/60" />
          <p className="text-sm font-medium">Belum ada dokumentasi wisuda yang diunggah.</p>
        </div>
      )}
      </main>
    </div>
  )
}
