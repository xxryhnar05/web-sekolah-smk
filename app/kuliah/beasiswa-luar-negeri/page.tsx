'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface BeasiswaSection {
  id: string
  title: string
  content: string
  content_type: 'paragraph' | 'bullet' | 'number'
  order_index: number
  is_active: boolean
}

export default function BeasiswaLuarNegeriUserPage() {
  const [sections, setSections] = useState<BeasiswaSection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSections = async () => {
      const { data } = await supabase
        .from('beasiswa_luar_negeri_sections')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true })

      if (data) setSections(data)
      setLoading(false)
    }
    fetchSections()
  }, [])

  const renderFormattedText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = text.split(urlRegex)

    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-amber-300 underline decoration-amber-400/40 underline-offset-4 transition hover:text-amber-200"
          >
            {part}
          </a>
        )
      }
      return part
    })
  }

  const background = (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-20 bg-gradient-to-b from-[#0a1429] via-[#0b1322] to-[#05080f]"
      />
      <div aria-hidden="true" className="pointer-events-none fixed left-1/2 top-[-20%] -z-10 h-[500px] w-[80%] -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[120px]" />
      <div aria-hidden="true" className="pointer-events-none fixed bottom-[-10%] right-[-10%] -z-10 h-[400px] w-[50%] rounded-full bg-indigo-700/5 blur-[120px]" />
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
    <div className="relative isolate min-h-screen overflow-hidden bg-[#070d1c] font-sans text-slate-300 antialiased selection:bg-cyan-400/20 selection:text-cyan-100">
      {background}
      <main className="relative z-10 mx-auto w-full max-w-5xl px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-5xl px-4 py-2 sm:px-6 lg:px-8">
          <header className="mb-9 text-center">
            <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/80">
              <span className="h-px w-8 bg-amber-400/50" />
              Akademik &amp; Pembelajaran
              <span className="h-px w-8 bg-amber-400/50" />
            </p>
            <div className="mx-auto mt-5 w-full max-w-4xl rounded-2xl border border-amber-400/25 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 px-5 py-6 shadow-[0_24px_50px_rgba(0,0,0,0.18)] ring-1 ring-white/5 sm:py-7">
              <h1
                className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-5xl"
                style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
              >
                Beasiswa Luar Negeri
              </h1>
            </div>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              {loading
                ? 'Memuat informasi Beasiswa Luar Negeri...'
                : 'Informasi program beasiswa luar negeri bagi calon mahasiswa.'}
            </p>
          </header>

          {loading ? (
            <div className="mx-auto max-w-3xl">
              <div className="h-24 animate-pulse border-y border-white/10 bg-white/[0.02]" />
            </div>
          ) : (
            <div className="mx-auto max-w-3xl">
              {sections.length > 0 ? (
                sections.map((sec, index) => {
                  const points = sec.content
                    .split('\n')
                    .map((point) => point.trim())
                    .filter(Boolean)

                  return (
                    <section
                      key={sec.id}
                      className="border-t border-white/10 py-8 first:border-t-0 first:pt-0 sm:py-10"
                    >
                      <div className="mb-5">
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-400/80">
                          Informasi Beasiswa Luar Negeri &middot;{' '}
                          {String(index + 1).padStart(2, '0')}
                        </p>
                        {sec.title && (
                          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            {sec.title}
                          </h2>
                        )}
                      </div>

                      {sec.content_type === 'paragraph' && (
                        <p className="whitespace-pre-line text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">
                          {renderFormattedText(sec.content)}
                        </p>
                      )}

                      {sec.content_type === 'bullet' && (
                        <ul className="divide-y divide-white/10 border-y border-white/10">
                          {points.map((point, pointIndex) => (
                            <li
                              key={`${sec.id}-${pointIndex}`}
                              className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 py-5 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-4"
                            >
                              <span className="pt-1 font-mono text-xs tracking-widest text-amber-400/75">
                                &bull;
                              </span>
                              <span className="text-sm leading-7 text-slate-400 sm:text-base">
                                {renderFormattedText(point)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {sec.content_type === 'number' && (
                        <ol className="divide-y divide-white/10 border-y border-white/10">
                          {points.map((point, pointIndex) => (
                            <li
                              key={`${sec.id}-${pointIndex}`}
                              className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 py-5 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-4"
                            >
                              <span className="pt-1 font-mono text-xs tracking-widest text-amber-400/75">
                                {String(pointIndex + 1).padStart(2, '0')}
                              </span>
                              <span className="text-sm leading-7 text-slate-400 sm:text-base">
                                {renderFormattedText(point)}
                              </span>
                            </li>
                          ))}
                        </ol>
                      )}
                    </section>
                  )
                })
              ) : (
                <p className="border-y border-white/10 py-6 text-sm text-slate-500">
                  Informasi Beasiswa Luar Negeri belum tersedia.
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
