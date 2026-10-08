'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import {
  ArrowLeft,
  Calendar,
  User,
  Loader2,
  Newspaper,
  ArrowRight,
} from 'lucide-react'

interface WartaItem {
  id: string
  title: string
  image_url: string
  author_name: string
  upload_date: string
}

export default function DetailWartaMuliaPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [item, setItem] = useState<WartaItem | null>(null)
  const [otherItems, setOtherItems] = useState<WartaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [posterWidth, setPosterWidth] = useState<number | null>(null)
  const posterFrameRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return

    const fetchDetailWarta = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('warta_mulia')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .single()

        if (error) throw error
        setItem(data)

        const { data: otherData, error: otherError } = await supabase
          .from('warta_mulia')
          .select('id, title, image_url, author_name, upload_date')
          .eq('is_active', true)
          .neq('id', id)
          .order('upload_date', { ascending: false })
          .limit(4)

        if (otherError) {
          console.error('Gagal memuat Warta Mulia lainnya:', otherError)
        } else {
          setOtherItems(otherData || [])
        }
      } catch (err) {
        console.error('Gagal mengambil detail Warta Mulia:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDetailWarta()
  }, [id])

  useEffect(() => {
    const posterFrame = posterFrameRef.current
    if (!posterFrame) return

    const updateWidth = () => {
      const width = posterFrame.getBoundingClientRect().width
      setPosterWidth((currentWidth) =>
        currentWidth !== null && Math.abs(currentWidth - width) < 1
          ? currentWidth
          : width,
      )
    }

    const observer = new ResizeObserver(updateWidth)
    observer.observe(posterFrame)
    updateWidth()

    return () => observer.disconnect()
  }, [item?.image_url])

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#070d1c] font-sans text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
        <p className="mt-3 text-sm font-medium">Memuat detail Warta Mulia...</p>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="relative isolate flex min-h-[70vh] flex-col items-center justify-center overflow-hidden bg-[#070d1c] px-5 py-20 text-center font-sans text-slate-300">
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-[#0a1429] via-[#0b1322] to-[#05080f]" />
        <Newspaper className="mb-3 h-12 w-12 text-amber-400/70" />
        <h1 className="text-xl font-bold text-white">Berita tidak ditemukan</h1>
        <p className="mt-2 text-sm text-slate-400">Kliping berita koran yang Anda cari tidak tersedia atau telah disembunyikan.</p>
        <Link
          href="/prestasi-mulia/warta-mulia"
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-5 py-2.5 text-xs font-bold text-amber-200 transition hover:bg-amber-400/20"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Warta Mulia
        </Link>
      </div>
    )
  }

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

      <main className="relative z-10 mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="mb-7">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-amber-400/30 hover:bg-amber-400/[0.07] hover:text-amber-200"
          >
            <ArrowLeft className="h-4 w-4 text-amber-400" />
            <span>Kembali</span>
          </button>
        </div>

        <article>
          <section className="mx-auto flex w-full max-w-full flex-col items-center">
            <p className="flex items-center justify-center gap-3 text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-400/80 sm:text-xs">
              <span className="h-px w-7 bg-amber-400/50" />
              Kliping Media Cetak
              <span className="h-px w-7 bg-amber-400/50" />
            </p>
            <header
              className="mt-4 w-fit max-w-full rounded-2xl border border-amber-400/25 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 p-5 shadow-[0_24px_50px_rgba(0,0,0,0.18)] ring-1 ring-white/5 sm:p-7"
              style={posterWidth ? { width: posterWidth } : undefined}
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
                  Pengunggah: <strong className="text-slate-200">{item.author_name}</strong>
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
            </header>

            <div
              ref={posterFrameRef}
              className="mt-6 w-fit max-w-full overflow-hidden rounded-2xl border border-amber-400/15 bg-slate-900/60 p-2 shadow-2xl backdrop-blur-sm sm:p-4"
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="mx-auto h-auto max-h-[1200px] w-auto max-w-full rounded-xl object-contain"
              />
            </div>
          </section>
        </article>

        {otherItems.length > 0 && (
          <section className="mt-14 border-t border-white/10 pt-9 sm:mt-16 sm:pt-11">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-400/80">
                  Jelajahi kliping lainnya
                </p>
                <h2
                  className="mt-2 flex items-center gap-2 text-xl font-bold text-white sm:text-2xl"
                  style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
                >
                  Warta Mulia Lainnya
                </h2>
              </div>
              <Link
                href="/prestasi-mulia/warta-mulia"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 transition hover:text-amber-200"
              >
                Lihat semua <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {otherItems.map((otherItem) => (
                <Link
                  key={otherItem.id}
                  href={`/prestasi-mulia/warta-mulia/${otherItem.id}`}
                  className="group flex min-w-0 items-stretch overflow-hidden rounded-xl border border-white/10 bg-slate-900/75 shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-0.5 hover:border-amber-400/40 hover:bg-slate-900/95"
                >
                  <div className="relative aspect-[2/3] w-28 shrink-0 overflow-hidden bg-slate-950 sm:w-32">
                    <img
                      src={otherItem.image_url}
                      alt={otherItem.title}
                      className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-3 sm:p-4">
                    <div>
                      <h3 className="line-clamp-4 text-sm font-bold leading-5 text-white transition group-hover:text-amber-200 sm:text-base">
                        {otherItem.title}
                      </h3>
                      <p className="mt-1.5 line-clamp-1 text-[11px] text-slate-400">
                        {otherItem.author_name}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2.5">
                      <p className="flex items-center gap-1.5 text-[10px] text-slate-300 sm:text-xs">
                        <Calendar className="h-3 w-3 shrink-0 text-amber-400" />
                        {new Date(otherItem.upload_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold text-amber-300 transition group-hover:text-amber-200 sm:text-xs">
                        Baca <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
