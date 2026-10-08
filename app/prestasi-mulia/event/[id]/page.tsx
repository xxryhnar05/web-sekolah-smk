'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import {
  ArrowLeft,
  Calendar,
  User,
  Loader2,
  GraduationCap,
  ArrowRight,
  Maximize2,
  ImageIcon,
} from 'lucide-react'

interface EventWisudaItem {
  id: string
  title: string
  author_name: string
  upload_date: string
  cover_image_url: string
  detail_images: string[]
}

interface EventRelatedItem {
  id: string
  title: string
  author_name: string
  upload_date: string
  cover_image_url: string
  detail_images: string[]
}

export default function DetailEventWisudaPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [item, setItem] = useState<EventWisudaItem | null>(null)
  const [otherEvents, setOtherEvents] = useState<EventRelatedItem[]>([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    if (!id) return

    const fetchEvent = async () => {
      try {
        setLoading(true)

        const { data: wisudaData, error: wisudaError } = await supabase
          .from('event_wisuda')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .single()

        if (wisudaError) throw wisudaError
        setItem(wisudaData)

        const { data: relatedData, error: relatedError } = await supabase
          .from('event_wisuda')
          .select('id, title, author_name, upload_date, cover_image_url, detail_images')
          .eq('is_active', true)
          .neq('id', id)
          .order('upload_date', { ascending: false })
          .limit(4)

        if (relatedError) {
          console.error('Gagal memuat event wisuda lainnya:', relatedError)
        } else {
          setOtherEvents(relatedData || [])
        }
      } catch (err) {
        console.error('Gagal mengambil detail Event Wisuda:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [id])

  if (loading) {
    return (
      <div className="relative isolate flex min-h-[70vh] flex-col items-center justify-center overflow-hidden bg-[#070d1c] font-sans text-slate-400">
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20 bg-gradient-to-b from-[#0a1429] via-[#0b1322] to-[#05080f]" />
        <div aria-hidden="true" className="pointer-events-none fixed left-1/2 top-[-20%] -z-10 h-[500px] w-[80%] -translate-x-1/2 rounded-full bg-amber-500/[0.06] blur-[120px]" />
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-repeat opacity-[0.04]" style={{ backgroundImage: "url('/batik.png')", backgroundSize: '600px auto' }} />
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
        <p className="mt-3 text-sm font-medium">Memuat dokumentasi wisuda...</p>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="relative isolate flex min-h-[70vh] flex-col items-center justify-center overflow-hidden bg-[#070d1c] px-5 py-20 text-center font-sans text-slate-300">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-[#0a1429] via-[#0b1322] to-[#05080f]"
        />
        <div aria-hidden="true" className="pointer-events-none fixed left-1/2 top-[-20%] -z-10 h-[500px] w-[80%] -translate-x-1/2 rounded-full bg-amber-500/[0.06] blur-[120px]" />
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-repeat opacity-[0.04]" style={{ backgroundImage: "url('/batik.png')", backgroundSize: '600px auto' }} />
        <GraduationCap className="mb-3 h-12 w-12 text-amber-400/70" />
        <h1 className="text-xl font-bold text-white">Event Wisuda Tidak Ditemukan</h1>
        <p className="mt-2 text-sm text-slate-400">
          Dokumentasi wisuda yang Anda cari tidak tersedia atau telah disembunyikan.
        </p>
        <Link
          href="/prestasi-mulia/event"
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-5 py-2.5 text-xs font-bold text-amber-200 transition hover:bg-amber-400/20"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Event Wisuda
        </Link>
      </div>
    )
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#070d1c] font-sans text-slate-300 antialiased selection:bg-amber-400/20 selection:text-amber-100">
      {/* Background Decorative Gradient & Batik */}
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
          maskImage:
            'radial-gradient(ellipse 100% 80% at 50% 30%, black 20%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 100% 80% at 50% 30%, black 20%, transparent 80%)',
        }}
      />

      <main className="relative z-10 mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        {/* Tombol Kembali */}
        <div className="mb-7">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-amber-400/30 hover:bg-amber-400/[0.07] hover:text-amber-200"
          >
            <ArrowLeft className="h-4 w-4 text-amber-400" />
            <span>Kembali</span>
          </button>
        </div>

        <article className="space-y-7">
          <header>
            <p className="flex items-center justify-center gap-3 text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-400/80 sm:text-xs">
              <span className="h-px w-7 bg-amber-400/50" />
              Dokumentasi Event
              <span className="h-px w-7 bg-amber-400/50" />
            </p>

            <div
              className="mt-4 rounded-2xl border border-amber-400/25 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 p-5 shadow-[0_24px_50px_rgba(0,0,0,0.18)] ring-1 ring-white/5 sm:p-7"
            >
              <h1
                className="break-words text-2xl font-bold leading-snug tracking-tight text-white sm:text-3xl lg:text-4xl"
                style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
              >
                {item.title}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-4 text-xs font-medium text-slate-400">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4 text-amber-400" />
                  Oleh: <strong className="text-slate-200">{item.author_name}</strong>
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-amber-400" />
                  Diterbitkan:
                  <strong className="text-slate-200">
                    {new Date(item.upload_date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </strong>
                </span>
              </div>
            </div>

          </header>

          <div className="overflow-hidden rounded-2xl border border-amber-400/15 bg-slate-900/60 p-2 shadow-2xl backdrop-blur-sm sm:p-3">
            <img
                src={item.cover_image_url}
                alt={item.title}
                className="max-h-[600px] w-full rounded-xl object-cover"
            />
          </div>

            {/* Galeri Foto Detail Wisuda */}
            {item.detail_images && item.detail_images.length > 0 && (
              <section className="mt-12 w-full border-t border-white/10 pt-9 sm:pt-11">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-400/80">
                      Momen pilihan
                    </p>
                    <h2
                      className="mt-2 flex items-center gap-2 text-xl font-bold text-white sm:text-2xl"
                      style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
                    >
                      <GraduationCap className="h-5 w-5 text-amber-400" />
                      Galeri Wisuda
                    </h2>
                  </div>
                  <span className="rounded-full border border-amber-400/20 bg-amber-400/[0.06] px-3 py-1 text-xs font-semibold text-amber-200">
                    {item.detail_images.length} foto
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {item.detail_images.map((img, idx) => (
                    <div
                      key={idx}
                      className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/75 p-1.5 shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-0.5 hover:border-amber-400/40 hover:bg-slate-900/95"
                    >
                      <img
                        src={img}
                        alt={`Dokumentasi ${idx + 1}`}
                        className="aspect-[4/3] w-full rounded-lg object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                      <a
                        href={img}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-3 right-3 rounded-lg bg-slate-950/85 p-2 text-white opacity-100 transition backdrop-blur-md hover:bg-amber-500 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 sm:opacity-0 sm:group-hover:opacity-100"
                        title="Buka Foto Penuh"
                        aria-label={`Buka foto dokumentasi ${idx + 1}`}
                      >
                        <Maximize2 className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            )}
        </article>

        <section className="mt-14 border-t border-white/10 pt-9 sm:mt-16 sm:pt-11">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-400/80">
                  Jelajahi event lainnya
                </p>
                <h2
                  className="mt-2 flex items-center gap-2 text-xl font-bold text-white sm:text-2xl"
                  style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
                >
                  Event Lainnya
                </h2>
              </div>
              <Link
                href="/prestasi-mulia/event"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 transition hover:text-amber-200"
              >
                Lihat semua <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {otherEvents.map((otherEvent) => (
                <Link
                  key={otherEvent.id}
                  href={`/prestasi-mulia/event/${otherEvent.id}`}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-900/70 shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-amber-400/35 hover:bg-slate-900/90"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
                    <img
                      src={otherEvent.cover_image_url}
                      alt={otherEvent.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-slate-950/85 px-1.5 py-1 text-[9px] font-semibold text-white">
                      <ImageIcon className="h-3 w-3 text-amber-400" />
                      {otherEvent.detail_images?.length || 0} Foto
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-3 sm:p-4">
                    <div>
                      <h3 className="line-clamp-4 text-sm font-bold leading-5 text-white transition group-hover:text-amber-200 sm:text-base">
                        {otherEvent.title}
                      </h3>
                      <p className="mt-1.5 line-clamp-1 text-[11px] text-slate-400">
                        {otherEvent.author_name}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2.5">
                      <p className="flex items-center gap-1.5 text-[10px] text-slate-300 sm:text-xs">
                        <Calendar className="h-3 w-3 shrink-0 text-amber-400" />
                        {new Date(otherEvent.upload_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold text-amber-300 transition group-hover:text-amber-200 sm:text-xs">
                        Lihat <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
        </section>
      </main>
    </div>
  )
}
