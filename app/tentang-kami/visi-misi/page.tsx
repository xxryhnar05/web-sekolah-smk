import { supabase } from "@/lib/supabaseClient";
import { normalizeMissionContent } from "@/lib/mission-content";

export const revalidate = 0;

export default async function VisiMisiPage() {
  const { data: profile } = await supabase
    .from("school_profiles")
    .select("vision, mission, motto, school_data")
    .limit(1)
    .single();

  const schoolData =
    (profile?.school_data as {
      nama_sekolah?: string;
      name?: string;
    }) || {};
  const schoolName =
    schoolData.nama_sekolah || schoolData.name || "Sekolah Kami";
  const mission = normalizeMissionContent(profile?.mission);
  const motto = profile?.motto?.trim();

  return (
    <main className="mx-auto max-w-7xl px-6 pt-0 pb-8 lg:px-8">
      <div className="mb-7 text-center">
        <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/80">
          <span className="h-px w-8 bg-amber-400/50" />
          Tentang Kami &bull; {schoolName}
          <span className="h-px w-8 bg-amber-400/50" />
        </p>
      </div>

      <div className="mb-4 flex justify-center">
        <div className="w-full max-w-4xl rounded-2xl border border-amber-400/25 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 p-5 shadow-[0_24px_50px_rgba(0,0,0,0.18)] ring-1 ring-white/5 md:p-7">
          <h1 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-5xl" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
            Visi &amp; Misi
          </h1>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 items-start gap-12 sm:mt-28 lg:mx-auto lg:max-w-6xl lg:translate-x-6 lg:grid-cols-12 lg:gap-10">
        <section className="grid grid-cols-1 items-start gap-6 lg:col-span-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/80">
              01 &nbsp; Visi Sekolah
            </p>
          </div>
          <div className="text-base leading-relaxed text-slate-300 sm:text-lg lg:col-span-8 lg:pl-8">
            {profile?.vision ? (
              <blockquote className="border-l-2 border-amber-400/50 pl-6 font-serif text-xl italic leading-relaxed text-amber-100/90 sm:text-2xl">
                &ldquo;{profile.vision}&rdquo;
              </blockquote>
            ) : (
              <p className="italic text-slate-500">
                Visi sekolah belum diisi di database.
              </p>
            )}
          </div>
        </section>

        <section className="mt-16 grid grid-cols-1 items-start gap-9 border-t border-slate-700/50 pt-12 lg:col-span-12 lg:mt-7 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/80">
              02 &nbsp; Misi Sekolah
            </p>
          </div>
          <div className="text-base leading-relaxed text-slate-300 sm:text-lg lg:col-span-8 lg:pl-8">
            {mission ? (
              <blockquote className="whitespace-pre-line border-l-2 border-amber-400/50 pl-6 font-serif text-xl italic leading-relaxed text-amber-100/90 sm:text-2xl">
                {mission}
              </blockquote>
            ) : (
              <p className="italic text-slate-500">
                Misi sekolah belum diisi di database.
              </p>
            )}
          </div>
        </section>

        <section className="mt-16 grid grid-cols-1 items-start gap-9 border-t border-slate-700/50 pt-12 lg:col-span-12 lg:mt-7 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/80">
              03 &nbsp; Motto Sekolah
            </p>
          </div>
          <div className="text-base leading-relaxed text-slate-300 sm:text-lg lg:col-span-8 lg:pl-8">
            {motto ? (
              <blockquote className="border-l-2 border-amber-400/50 pl-6 font-serif text-xl italic leading-relaxed text-amber-100/90 sm:text-2xl">
                &ldquo;{motto}&rdquo;
              </blockquote>
            ) : (
              <p className="italic text-slate-500">
                Motto sekolah belum diisi di database.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
