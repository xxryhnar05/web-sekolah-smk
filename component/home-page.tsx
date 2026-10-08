'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import {
  Users,
  Award,
  Calendar,
  ArrowRight,
  Sparkles,
  Loader2,
  School,
} from 'lucide-react'

// Interface Data
interface HomepageConfig {
  hero_title: string
  hero_subtitle: string
  hero_image_url: string
  stat_siswa: number
  stat_guru: number
  stat_staf: number
  stat_prestasi: number
  ppdb_banner_title: string
  ppdb_banner_desc: string
}

interface BeritaItem {
  id: string
  title: string
  image_url: string
  upload_date: string
  content: string
}

interface AlumniItem {
  id: string
  name: string
  graduation_year: string
  profession: string
  quote: string
}

interface GalleryItem {
  id: string
  title: string
  type: 'video' | 'image'
  url: string
}

// Helper Converter YouTube URL to Embed Iframe
function getYouTubeEmbedUrl(url: string) {
  if (!url) return ''

  const value = url.trim()
  const directId = value.match(/^[A-Za-z0-9_-]{11}$/)?.[0]
  if (directId) return `https://www.youtube.com/embed/${directId}`

  try {
    const parsed = new URL(value)
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '')
    let videoId: string | null = null

    if (hostname === 'youtu.be') {
      videoId = parsed.pathname.split('/').filter(Boolean)[0] || null
    } else if (['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(hostname)) {
      if (parsed.pathname === '/watch') {
        videoId = parsed.searchParams.get('v')
      } else {
        const [route, id] = parsed.pathname.split('/').filter(Boolean)
        if (['embed', 'shorts', 'live', 'v'].includes(route || '')) videoId = id || null
      }
    }

    return videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId)
      ? `https://www.youtube.com/embed/${videoId}`
      : ''
  } catch {
    return ''
  }
}

// Komponen Counter Animasi Angka (0 ke Target)
function AnimatedCounter({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const countRef = useRef<HTMLSpanElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (countRef.current) {
      observer.observe(countRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible || !end) return

    let start = 0
    const increment = end / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [isVisible, end, duration])

  return (
    <span ref={countRef}>
      {count.toLocaleString('id-ID')}
      {suffix}
    </span>
  )
}

export default function HomePage() {
  const [config, setConfig] = useState<HomepageConfig | null>(null)
  const [beritaList, setBeritaList] = useState<BeritaItem[]>([])
  const [alumniList, setAlumniList] = useState<AlumniItem[]>([])
  const [galleryList, setGalleryList] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dataErrors, setDataErrors] = useState<string[]>([])

  // Fetch Semua Data Terintegrasi Database
  useEffect(() => {
    const fetchHomepageData = async () => {
      const requestController = new AbortController()
      const timeoutId = setTimeout(() => requestController.abort(), 15_000)

      try {
        setLoading(true)

        const [configResult, beritaResult, alumniResult, galleryResult] = await Promise.all([
          supabase
            .from('homepage_config')
            .select('*')
            .order('updated_at', { ascending: false, nullsFirst: false })
            .order('created_at', { ascending: false, nullsFirst: false })
            .limit(1)
            .abortSignal(requestController.signal)
            .maybeSingle(),
          supabase
            .from('berita')
            .select('id, title, image_url, upload_date, content')
            .eq('is_active', true)
            .order('upload_date', { ascending: false })
            .limit(3)
            .abortSignal(requestController.signal),
          supabase
            .from('alumni_testimonials')
            .select('id, name, graduation_year, profession, quote')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(3)
            .abortSignal(requestController.signal),
          supabase
            .from('gallery_items')
            .select('*')
            .order('created_at', { ascending: false, nullsFirst: false })
            .abortSignal(requestController.signal),
        ])

        const errors: string[] = []

        if (configResult.error) {
          console.error('Gagal memuat konfigurasi beranda:', configResult.error)
          errors.push('konfigurasi')
        } else if (configResult.data) {
          setConfig(configResult.data)
        }

        if (beritaResult.error) {
          console.error('Gagal memuat berita beranda:', beritaResult.error)
          errors.push('berita')
        } else {
          setBeritaList(beritaResult.data || [])
        }

        if (alumniResult.error) {
          console.error('Gagal memuat testimoni alumni:', alumniResult.error)
          errors.push('testimoni alumni')
        } else {
          setAlumniList(alumniResult.data || [])
        }

        if (galleryResult.error) {
          console.error('Gagal memuat galeri beranda:', galleryResult.error)
          errors.push('galeri')
        } else {
          setGalleryList(galleryResult.data || [])
        }

        setDataErrors(errors)
      } catch (err) {
        console.error('Gagal memuat data beranda:', err)
        setDataErrors(['koneksi ke database'])
      } finally {
        clearTimeout(timeoutId)
        setLoading(false)
      }
    }

    fetchHomepageData()
  }, [])

  // Program Unggulan
  const programUnggulan = [
    {
      title: 'Pendidikan Karakter & Religius',
      description: 'Pembentukan akhlakul karimah, pembiasaan ibadah harian, dan hafalan Al-Qur\'an.',
      icon: School,
    },
    {
      title: 'Berbasis Teknologi & Industri',
      description: 'Kurikulum berbasis keahlian praktis, laboratorium modern, dan kesiapan kerja nasional.',
      icon: Sparkles,
    },
    {
      title: 'Ekstrakurikuler & Prestasi',
      description: 'Pengembangan minat bakat dalam bidang olahraga, seni, sains, dan robotika.',
      icon: Award,
    },
    {
      title: 'Program Kemitraan & Magang',
      description: 'Kerjasama dengan instansi pemerintah dan perusahaan swasta untuk penyaluran lulusan.',
      icon: Users,
    },
  ]

  // Pisahkan item video dan gambar
  const videoItem = galleryList.find((item) => item.type === 'video')
  const videoEmbedUrl = videoItem ? getYouTubeEmbedUrl(videoItem.url) : ''
  const imageItems = galleryList.filter((item) => item.type === 'image')
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#070d1c] font-sans text-slate-300 antialiased selection:bg-amber-400/20 selection:text-amber-100">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20 bg-gradient-to-b from-[#0a1429] via-[#0b1322] to-[#05080f]" />
      <div aria-hidden="true" className="pointer-events-none fixed left-1/2 top-[-20%] -z-10 h-[500px] w-[80%] -translate-x-1/2 rounded-full bg-amber-500/5 blur-[120px]" />
      <div aria-hidden="true" className="pointer-events-none fixed bottom-[-10%] right-[-10%] -z-10 h-[400px] w-[50%] rounded-full bg-indigo-700/5 blur-[120px]" />
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
      {dataErrors.length > 0 && (
        <div
          role="status"
          className="border-b border-amber-400/30 bg-amber-400/10 px-5 py-3 text-center text-xs text-amber-100"
        >
          Beberapa informasi beranda belum dapat dimuat. Silakan coba kembali nanti.
        </div>
      )}

      {/* 1. HERO BANNER / FOTO UTAMA PALING ATAS */}
      <section className="relative isolate flex min-h-[min(680px,calc(100svh-5rem))] items-center overflow-hidden">
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 text-center sm:px-8 sm:py-20 lg:px-10">
          <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
            <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/80">
              <span className="h-px w-8 bg-amber-400/50" />
              SMK Muhammadiyah 1 Kota Mojokerto
              <span className="h-px w-8 bg-amber-400/50" />
            </p>

            <h1 className="text-3xl font-bold leading-[1.12] tracking-tight text-white sm:text-4xl md:text-5xl xl:text-6xl" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
              {config?.hero_title || 'Mewujudkan Generasi Unggul, Berkarakter & Berdaya Saing'}
            </h1>

            <p className="mx-auto max-w-3xl text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
              {config?.hero_subtitle || 'Mendidik dengan hati, membentuk integritas moral, dan memfasilitasi setiap potensi siswa menuju masa depan yang gemilang.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1 sm:gap-4">
              <Link
                href="/ppdb"
                className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 transition hover:bg-amber-300 sm:px-6"
              >
                <span>Pendaftaran PPDB</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/prestasi-mulia/berita"
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:border-amber-300/50 hover:text-amber-200 sm:px-6"
              >
                <span>Jelajahi Berita</span>
              </Link>
            </div>
          </div>

        </div>
      </section>

      <div className="relative isolate">
      {/* 2. PROGRAM UNGGULAN */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-8 sm:py-20 lg:px-10">
          <div className="mb-8 space-y-3 text-center sm:mb-12">
          <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/80">
            <span className="h-px w-8 bg-amber-400/50" />
            Keunggulan Kami
            <span className="h-px w-8 bg-amber-400/50" />
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
            Program Unggulan Sekolah
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-400">
            Komitmen kami dalam memberikan kualitas pendidikan terbaik bagi setiap peserta didik.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-5">
          {programUnggulan.map((prog, idx) => {
            const IconComp = prog.icon
            return (
              <div
                key={idx}
                className="group border-t border-slate-700/50 px-1 py-6 transition-colors duration-300 hover:border-amber-400/50 sm:px-3"
              >
                <IconComp className="mb-5 h-5 w-5 text-amber-400/80 transition-colors group-hover:text-amber-300" />
                <h3 className="text-sm font-semibold leading-6 text-white transition-colors group-hover:text-amber-200 sm:text-base">
                  {prog.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {prog.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* 3. STATISTIK DENGAN ANIMASI COUNTER */}
      <section className="border-y border-slate-700/50 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-10">
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 text-center sm:grid-cols-4 sm:gap-6">
            <div className="space-y-2">
              <h3 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                <AnimatedCounter end={config?.stat_siswa || 1250} suffix="+" />
              </h3>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 sm:text-xs">
                Siswa Aktif
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                <AnimatedCounter end={config?.stat_guru || 75} suffix="+" />
              </h3>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 sm:text-xs">
                Guru Pengajar
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                <AnimatedCounter end={config?.stat_staf || 30} suffix="+" />
              </h3>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 sm:text-xs">
                Staf &amp; Karyawan
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                <AnimatedCounter end={config?.stat_prestasi || 180} suffix="+" />
              </h3>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 sm:text-xs">
                Penghargaan &amp; Juara
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INFORMASI PENDAFTARAN (PPDB) */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="relative overflow-hidden rounded-xl border border-amber-400/25 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 p-5 sm:p-8 lg:p-10">
          <div aria-hidden="true" className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-amber-400/[0.05] blur-3xl" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200 sm:text-xs">
              Penerimaan Peserta Didik Baru (PPDB)
            </span>
            <h2 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
              {config?.ppdb_banner_title || 'Pendaftaran Siswa Baru Telah Dibuka!'}
            </h2>
            <p className="text-sm leading-7 text-slate-300">
              {config?.ppdb_banner_desc || 'Bergabunglah bersama kami dan jadilah bagian dari lingkungan belajar yang suportif, modern, dan berprestasi.'}
            </p>
            <div className="pt-2">
              <Link
                href="/ppdb"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-3 text-xs font-bold text-slate-950 transition hover:bg-amber-300 sm:px-6"
              >
                <span>Informasi Syarat &amp; Cara Daftar</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DATA BERITA TERBARU */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-14 lg:px-10">
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-400/80 sm:text-xs">
              Kabar Terbaru
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
              Berita &amp; Artikel Sekolah
            </h2>
          </div>
          <Link
            href="/prestasi-mulia/berita"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 transition hover:text-amber-200"
          >
            <span>Lihat Semua Berita</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex py-12 items-center justify-center text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
            <span className="ml-2 text-xs">Memuat berita...</span>
          </div>
        ) : beritaList.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
            {beritaList.map((item) => (
              <article
                key={item.id}
                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] transition-colors duration-300 hover:border-amber-400/30"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between space-y-4 p-5 sm:p-6">
                  <div>
                    <span className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-amber-300">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.upload_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <h3 className="line-clamp-2 text-base font-semibold leading-6 text-white transition-colors group-hover:text-amber-200">
                      {item.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
                      {item.content}
                    </p>
                  </div>

                  <Link
                    href={`/prestasi-mulia/berita/${item.id}`}
                    className="flex items-center gap-1.5 border-t border-white/[0.08] pt-3 text-xs font-semibold text-amber-300 transition hover:text-amber-200"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-xs text-slate-500 border border-dashed border-white/10 rounded-2xl">
            Belum ada berita yang diterbitkan.
          </div>
        )}
      </section>

      {/* 6. GALERI MOMEN KEGIATAN (1 VIDEO KIRI & GRID FOTO KANAN SESUAI FOTO) */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="mb-9 space-y-3 text-center">
          <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/80">
            <span className="h-px w-8 bg-amber-400/50" />
            Dokumentasi
            <span className="h-px w-8 bg-amber-400/50" />
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
            Galeri Momen Kegiatan
          </h2>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-3 sm:gap-4 lg:grid-cols-12 lg:gap-5">
          <div className="flex min-h-[260px] flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] sm:min-h-[340px] lg:col-span-7">
            {videoItem && videoEmbedUrl ? (
              <iframe
                src={videoEmbedUrl}
                title={videoItem.title || 'Video Kegiatan Sekolah'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="h-full min-h-[260px] w-full border-0 sm:min-h-[340px] lg:min-h-[400px]"
              />
            ) : videoItem ? (
              <div className="flex min-h-[260px] flex-1 flex-col items-center justify-center gap-3 px-6 text-center text-sm text-slate-400 sm:min-h-[340px] lg:min-h-[400px]">
                <p>Format tautan video tidak dikenali.</p>
                <a className="text-amber-300 underline underline-offset-4" href={videoItem.url} target="_blank" rel="noreferrer">
                  Buka video di YouTube
                </a>
              </div>
            ) : (
              <div className="flex min-h-[260px] flex-1 items-center justify-center text-sm text-slate-500 sm:min-h-[340px] lg:min-h-[400px]">
                Belum ada video kegiatan.
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 lg:col-span-5">
            {imageItems.length > 0 ? imageItems.slice(0, 6).map((item, idx) => (
              <div
                key={item.id}
                className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.02]"
              >
                <img
                  src={item.url}
                  alt={`Galeri Momen ${idx + 1}`}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
            )) : (
              <div className="col-span-2 flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-slate-500">
                Belum ada foto kegiatan.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. KESAN & PESAN ALUMNI */}
      <section className="border-t border-slate-700/50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-10">
          <div className="mb-8 space-y-3 text-center sm:mb-12">
            <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/80">
              <span className="h-px w-8 bg-amber-400/50" />
              Kisah Sukses
              <span className="h-px w-8 bg-amber-400/50" />
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
              Kesan &amp; Pesan Alumni
            </h2>
          </div>

          {alumniList.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-4 sm:gap-5">
              {alumniList.map((alumni) => (
                <div
                  key={alumni.id}
                  className="relative flex w-full max-w-md flex-col justify-between border-t border-slate-700/50 py-6 sm:px-4 xl:w-[calc(33.333%-1.25rem)]"
                >
                  <p className="mb-6 text-sm italic leading-7 text-slate-300">
                    &quot;{alumni.quote}&quot;
                  </p>

                  <div className="border-t border-white/[0.08] pt-4">
                    <h4 className="text-sm font-semibold text-white">{alumni.name}</h4>
                    <p className="mt-1 text-xs font-medium text-amber-300">{alumni.graduation_year}</p>
                    <p className="mt-1 text-xs text-slate-500">{alumni.profession}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-slate-500 border border-dashed border-white/10 rounded-2xl">
              Belum ada testimoni alumni yang ditampilkan.
            </div>
          )}
        </div>
      </section>
      </div>
    </div>
  )
}
