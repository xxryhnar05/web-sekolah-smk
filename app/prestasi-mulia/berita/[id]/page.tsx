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
  Newspaper,
  ArrowRight,
} from 'lucide-react'

interface BeritaItem {
  id: string
  title: string
  image_url: string
  author_name: string
  upload_date: string
  content: string
}

interface RelatedBeritaItem {
  id: string
  title: string
  image_url: string
  author_name: string
  upload_date: string
}

export default function DetailBeritaPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [item, setItem] = useState<BeritaItem | null>(null)
  const [otherNews, setOtherNews] = useState<RelatedBeritaItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchDetailBerita = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('berita')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .single()

        if (error) throw error
        setItem(data)

        const { data: relatedData, error: relatedError } = await supabase
          .from('berita')
          .select('id, title, image_url, author_name, upload_date')
          .eq('is_active', true)
          .neq('id', id)
          .order('upload_date', { ascending: false })
          .limit(4)

        if (relatedError) {
          console.error('Gagal memuat berita lainnya:', relatedError)
        } else {
          setOtherNews(relatedData || [])
        }
      } catch (err) {
        console.error('Gagal mengambil detail berita:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDetailBerita()
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#070d1c] font-sans text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
        <p className="mt-3 text-sm font-medium">Memuat berita...</p>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="relative isolate flex min-h-[70vh] flex-col items-center justify-center overflow-hidden bg-[#070d1c] px-5 py-20 text-center font-sans text-slate-300">
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-[#0a1429] via-[#0b1322] to-[#05080f]" />
        <Newspaper className="mb-3 h-12 w-12 text-amber-400/70" />
        <h1 className="text-xl font-bold text-white">Berita tidak ditemukan</h1>
        <p className="mt-2 text-sm text-slate-400">Artikel atau berita yang Anda cari tidak tersedia.</p>
        <Link
          href="/prestasi-mulia/berita"
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-5 py-2.5 text-xs font-bold text-amber-200 transition hover:bg-amber-400/20"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Berita
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

      <main className="relative z-10 mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
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
            <p className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-400/80 sm:text-xs">
              <span className="h-px w-7 bg-amber-400/50" />
              Kabar Sekolah
              <span className="h-px w-7 bg-amber-400/50" />
            </p>
            <div className="mt-4 rounded-2xl border border-amber-400/25 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 p-5 shadow-[0_24px_50px_rgba(0,0,0,0.18)] ring-1 ring-white/5 sm:p-7">
              <h1
                className="text-2xl font-bold leading-snug tracking-tight text-white sm:text-3xl lg:text-4xl"
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
              src={item.image_url}
              alt={item.title}
              className="max-h-[600px] w-full rounded-xl object-cover"
            />
          </div>

          <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 shadow-lg shadow-black/10 sm:p-8">
            
            <div className="whitespace-pre-line text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
              {item.content}
            </div>
          </section>
        </article>

        {otherNews.length > 0 && (
          <section className="mt-14 border-t border-white/10 pt-9 sm:mt-16 sm:pt-11">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-400/80">
                  Temukan kabar lainnya
                </p>
                <h2
                  className="mt-2 flex items-center gap-2 text-xl font-bold text-white sm:text-2xl"
                  style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
                >
                  Berita Lainnya
                </h2>
              </div>
              <Link
                href="/prestasi-mulia/berita"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 transition hover:text-amber-200"
              >
                Lihat semua <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {otherNews.map((news) => (
                <Link
                  key={news.id}
                  href={`/prestasi-mulia/berita/${news.id}`}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-900/70 shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-amber-400/35 hover:bg-slate-900/90"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
                    <img
                      src={news.image_url}
                      alt={news.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070d1c]/65 via-transparent to-transparent" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-3 sm:p-4">
                    <div>
                      <h3 className="line-clamp-3 text-sm font-bold leading-5 text-white transition group-hover:text-amber-200">
                        {news.title}
                      </h3>
                      <p className="mt-1.5 line-clamp-1 text-[11px] text-slate-400">
                        Oleh {news.author_name}
                      </p>
                    </div>
                    <p className="flex items-center gap-1.5 border-t border-white/10 pt-2.5 text-[10px] text-slate-300 sm:text-xs">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                      {new Date(news.upload_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
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