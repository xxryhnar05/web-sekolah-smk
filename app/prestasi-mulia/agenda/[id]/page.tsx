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
  Download,
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

export default function DetailAgendaPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [item, setItem] = useState<AgendaItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchDetailAgenda = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('agenda')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .single()

        if (error) throw error
        setItem(data)
      } catch (err) {
        console.error('Gagal mengambil detail agenda:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDetailAgenda()
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center text-slate-500 font-sans">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <p className="mt-3 text-sm font-medium">Memuat berkas kalender agenda...</p>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center font-sans">
        <FileSpreadsheet className="mx-auto h-12 w-12 text-slate-300 mb-3" />
        <h1 className="text-xl font-bold text-slate-800">Agenda tidak ditemukan</h1>
        <p className="mt-2 text-sm text-slate-500">Berkas agenda atau kalender yang Anda cari tidak tersedia.</p>
        <Link
          href="/agenda"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-slate-800 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Agenda
        </Link>
      </div>
    )
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 font-sans text-slate-800 antialiased sm:px-8 bg-white">
      {/* Tombol Kembali */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4 text-amber-600" />
          <span>Kembali</span>
        </button>
      </div>

      <article className="space-y-6">
        <div className="space-y-3">
          <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold tracking-wider text-amber-800 uppercase">
            Kalender &amp; Agenda Kegiatan
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
            {item.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 pt-2 border-b border-slate-200 pb-4">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-amber-600" />
              Pengunggah: <strong className="text-slate-900">{item.author_name}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-amber-600" />
              Diterbitkan: <strong className="text-slate-900">{new Date(item.upload_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
            </span>
          </div>
        </div>

        {/* Ringkasan Penjelasan */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {item.short_description}
        </div>

        {/* Reader Viewer PDF */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pratinjau Berkas PDF Kalender
            </span>
            <div className="flex items-center gap-2">
              <a
                href={item.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-amber-600 transition"
              >
                <span>Buka Tab Baru</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <a
                href={item.pdf_url}
                download
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow hover:bg-amber-400 transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Unduh PDF</span>
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-lg h-[750px] w-full">
            <iframe
              src={item.pdf_url}
              title={item.title}
              className="w-full h-full border-0"
            />
          </div>
        </div>
      </article>
    </main>
  )
}