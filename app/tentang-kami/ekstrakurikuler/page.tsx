import { supabase } from "@/lib/supabaseClient";

interface ExtracurricularItem {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  schedule: string | null;
  supervisor: string | null;
}

export default async function EkstrakurikulerPage() {
  const { data: extras } = await supabase
    .from("extracurriculars")
    .select("id, name, description, logo_url, schedule, supervisor")
    .order("name", { ascending: true });

  const extraList: ExtracurricularItem[] = extras || [];

  return (
    <main className="mx-auto max-w-screen-2xl px-6 pt-0 pb-8 lg:px-8 font-sans text-slate-300 antialiased">
      {/* Header Elegan dengan Aksen Emas */}
      <div className="mb-7 text-center">
        <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/80">
          <span className="h-px w-8 bg-amber-400/50"></span>
          Pengembangan Diri
          <span className="h-px w-8 bg-amber-400/50"></span>
        </p>
      </div>

      <div className="mb-4 flex justify-center">
        <div className="w-full max-w-4xl rounded-2xl border border-amber-400/25 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 p-5 shadow-[0_24px_50px_rgba(0,0,0,0.18)] ring-1 ring-white/5 md:p-7">
          <h1 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-5xl" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
            Ekstrakurikuler
          </h1>
        </div>
      </div>

      <p className="mx-auto mt-6 mb-2 max-w-2xl text-center text-sm leading-relaxed text-slate-400 sm:text-base">
        Wadah pengembangan bakat, minat, kreativitas, serta potensi
        kepemimpinan siswa di luar kegiatan akademis.
      </p>

      {/* Grid Layout Ekstrakurikuler */}
      {extraList.length > 0 ? (
        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3">
          {extraList.map((item: ExtracurricularItem, index) => {
            const isLastItem = index === extraList.length - 1;
            const lastItemLayout = isLastItem
              ? [
                  extraList.length % 2 === 1
                    ? "sm:col-span-2 sm:w-1/2 sm:justify-self-center"
                    : "",
                  extraList.length % 3 === 1
                    ? "2xl:col-span-3 2xl:w-1/3 2xl:justify-self-center"
                    : "2xl:col-span-1 2xl:w-full 2xl:justify-self-stretch",
                ].join(" ")
              : "";

            return (
              <article
                key={item.id}
                className={`group flex flex-col ${lastItemLayout}`}
              >
                {/* Foto / Logo di Atas - Tanpa Card, Ukuran Seragam, Sudut Lengkung */}
                <div className="mb-6 aspect-4/3 w-full overflow-hidden rounded-xl">
                  {item.logo_url ? (
                    <img
                      src={item.logo_url}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-6xl font-bold text-amber-300/80 transition-colors group-hover:text-amber-300">
                        {item.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Konten Teks di Bawah */}
                <div className="flex flex-1 flex-col">
                  <h3 className="text-xl font-bold text-white transition-colors group-hover:text-amber-300">
                    {item.name}
                  </h3>

                  {item.schedule && (
                    <p className="mt-2 flex items-center gap-2 text-xs font-medium text-amber-400/90">
                      <svg
                        className="h-4 w-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {item.schedule}
                    </p>
                  )}

                  {/* Deskripsi */}
                  {item.description && (
                    <p className="mt-4 text-sm leading-relaxed text-slate-400">
                      {item.description}
                    </p>
                  )}

                  {/* Pembina (Dorong ke bawah agar selalu sejajar) */}
                  {item.supervisor && (
                    <div className="mt-auto pt-6">
                      <p className="border-t border-slate-700/50 pt-3 text-xs text-slate-500">
                        Pembina{" "}
                        <span className="text-slate-300">
                          Â· {item.supervisor}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Fallback Jika Data di Supabase Masih Kosong */
        <div className="py-16 text-center text-slate-500 italic">
          Data ekstrakurikuler belum dimasukkan di database.
        </div>
      )}
    </main>
  );
}
