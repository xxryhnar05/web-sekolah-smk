import { supabase } from '@/lib/supabaseClient'
import CustomSectionsDisplay from '../custom-sections-display'
import { parseCustomSections } from '@/lib/custom-sections'
import PhotoCarousel from '../photo-carousel'

export const revalidate = 0

export default async function DkfUserPage() {
  const { data: major } = await supabase
    .from('majors')
    .select('*')
    .or('slug.eq.tei,code.ilike.tei')
    .maybeSingle()

  const background = (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-20 bg-gradient-to-b from-[#0a1429] via-[#0b1322] to-[#05080f]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-1/2 top-[-20%] -z-10 h-[500px] w-[80%] -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-[-10%] right-[-10%] -z-10 h-[400px] w-[50%] rounded-full bg-indigo-700/5 blur-[120px]"
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

  if (!major) {
    return (
      <div className="relative isolate min-h-screen overflow-hidden bg-[#070d1c] font-sans text-slate-300 antialiased selection:bg-cyan-400/20 selection:text-cyan-100">
        {background}
        <main className="relative z-10 mx-auto w-full max-w-5xl px-6 py-16 md:px-10 md:py-24">
          <div className="mx-auto max-w-5xl px-4 py-2 text-center sm:px-6 lg:px-8">
            <header className="mb-9">
              <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/80">
                <span className="h-px w-8 bg-amber-400/50" />
                Konsentrasi Keahlian
                <span className="h-px w-8 bg-amber-400/50" />
              </p>
              <div className="mx-auto mt-5 w-full max-w-4xl rounded-2xl border border-amber-400/25 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 px-5 py-6 shadow-[0_24px_50px_rgba(0,0,0,0.18)] ring-1 ring-white/5 sm:py-7">
                <h1
                  className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-5xl"
                  style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
                >
                  DKF
                </h1>
              </div>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                Data konsentrasi keahlian ini belum tersedia.
              </p>
            </header>
          </div>
        </main>
      </div>
    )
  }

  const bannerImages: string[] = major.banner_urls?.length
    ? major.banner_urls
    : major.banner_url
      ? [major.banner_url]
      : []
  const customSections = parseCustomSections(major.custom_sections)

  const numberedList = (items: string[]) => (
    <ul className="divide-y divide-white/10 border-y border-white/10">
      {items.map((item, index) => (
        <li
          key={`${index}-${item}`}
          className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 py-5 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-4"
        >
          <span className="pt-1 font-mono text-xs tracking-widest text-amber-400/75">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-sm leading-7 text-slate-400 sm:text-base">
            {item}
          </span>
        </li>
      ))}
    </ul>
  )

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#070d1c] font-sans text-slate-300 antialiased selection:bg-cyan-400/20 selection:text-cyan-100">
      {background}
      <main className="relative z-10 mx-auto w-full max-w-5xl px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-5xl px-4 py-2 sm:px-6 lg:px-8">
          <header className="mb-9 text-center">
            <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/80">
              <span className="h-px w-8 bg-amber-400/50" />
              Konsentrasi Keahlian
              <span className="h-px w-8 bg-amber-400/50" />
            </p>
            <div className="mx-auto mt-5 w-full max-w-4xl rounded-2xl border border-amber-400/25 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 px-5 py-6 shadow-[0_24px_50px_rgba(0,0,0,0.18)] ring-1 ring-white/5 sm:py-7">
              <h1
                className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-5xl"
                style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
              >
                DKF
              </h1>
            </div>
          </header>

          <PhotoCarousel images={bannerImages} title="DKF" />

          <div className="mx-auto max-w-3xl">
            {(major.graduate_competency || major.head_of_major) && (
              <section className="py-8 sm:py-10">
                <div className="mb-6">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-400/80">
                    Profil Lulusan
                  </p>
                  <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Kompetensi Lulusan
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    <span className="font-medium text-amber-300">
                      DKF
                    </span>
                    {major.head_of_major && (
                      <>
                        <span className="mx-2 text-slate-600">·</span>
                        Ketua Program Keahlian: {major.head_of_major}
                      </>
                    )}
                  </p>
                </div>
                {major.graduate_competency && (
                  <p className="whitespace-pre-line text-sm leading-7 text-slate-400 sm:text-base">
                    {major.graduate_competency}
                  </p>
                )}
              </section>
            )}

            {major.job_opportunities && major.job_opportunities.length > 0 && (
              <section className="border-t border-white/10 py-8 sm:py-10">
                <div className="mb-6">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-400/80">
                    Prospek Karier
                  </p>
                  <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Lapangan Kerja
                  </h2>
                </div>
                {major.job_intro && (
                  <p className="mb-4 text-sm leading-7 text-slate-400 sm:text-base">
                    {major.job_intro}
                  </p>
                )}
                {numberedList(major.job_opportunities)}
              </section>
            )}

            {major.lab_facilities_list && major.lab_facilities_list.length > 0 && (
              <section className="border-t border-white/10 py-8 sm:py-10">
                <div className="mb-6">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-400/80">
                    Sarana Praktik
                  </p>
                  <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Fasilitas Laboratorium
                  </h2>
                </div>
                {numberedList(major.lab_facilities_list)}
              </section>
            )}

            {major.advantages && major.advantages.length > 0 && (
              <section className="border-t border-white/10 py-8 sm:py-10">
                <div className="mb-6">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-400/80">
                    Mengapa DKF
                  </p>
                  <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Keunggulan
                  </h2>
                </div>
                {numberedList(major.advantages)}
              </section>
            )}

            <CustomSectionsDisplay sections={customSections} />
          </div>
        </div>
      </main>
    </div>
  )
}
