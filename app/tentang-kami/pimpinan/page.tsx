import { supabase } from "@/lib/supabaseClient";

interface StaffItem {
  id: string;
  name: string;
  position: string;
  photo_url: string | null;
  nip: string | null;
  phone?: string | null;
  address?: string | null;
  education?: string | null;
  bio?: string | null;
  order_index: number;
}

export default async function PimpinanPage() {
  const { data: leaders } = await supabase
    .from("staff")
    .select(
      "id, name, position, photo_url, nip, phone, address, education, bio, order_index",
    )
    .eq("is_leadership", true)
    .order("order_index", { ascending: true });

  const staffList: StaffItem[] = leaders || [];

  return (
    <main className="mx-auto max-w-7xl px-6 py-2 lg:px-8 font-sans text-slate-300 antialiased">
      {/* Header Elegan dengan Aksen Emas */}
      <div className="mb-7 text-center">
        <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/80">
          <span className="h-px w-8 bg-amber-400/50"></span>
          Struktur Organisasi
          <span className="h-px w-8 bg-amber-400/50"></span>
        </p>
      </div>

      <div className="mb-4 flex justify-center">
        <div className="w-full max-w-4xl rounded-2xl border border-amber-400/25 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 p-5 shadow-[0_24px_50px_rgba(0,0,0,0.18)] ring-1 ring-white/5 md:p-7">
          <h1 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-5xl" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
            Kepala Sekolah &amp; Wakil
          </h1>
        </div>
      </div>

      <p className="mx-auto -mt-1 mb-4 max-w-2xl text-center text-sm leading-relaxed text-slate-400 sm:text-base">
        Jajaran pimpinan sekolah yang bertanggung jawab atas pengelolaan
        manajemen dan kemajuan kualitas pendidikan.
      </p>

      {/* Grid Layout Pimpinan */}
      {staffList.length > 0 ? (
        <div className="mx-auto grid w-full max-w-4xl grid-cols-1 items-stretch justify-items-center gap-x-18 gap-y-12 sm:grid-cols-2">
          {staffList.map((item: StaffItem) => {
            const profileFields = [
              { label: "NIP", value: item.nip },
              { label: "Pendidikan", value: item.education },
              { label: "Telepon", value: item.phone, href: item.phone ? `tel:${item.phone}` : undefined },
              { label: "Alamat", value: item.address },
            ];

            return (
            <article
              key={item.id}
              className="group flex h-full w-full max-w-md flex-col transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="relative mx-auto mt-4 h-[28rem] w-full max-w-[420px] overflow-hidden sm:h-[32rem]">
                {item.photo_url ? (
                  <img
                    src={item.photo_url}
                    alt={item.name}
                    className="mx-auto h-full w-full object-contain object-bottom drop-shadow-[0_20px_30px_rgba(0,0,0,0.28)] transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center p-6 text-slate-500">
                    <svg
                      className="h-16 w-16 stroke-1 text-slate-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                    <span className="mt-2 text-xs font-medium">
                      Foto Belum Tersedia
                    </span>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-[#0a1429] to-transparent" />
              </div>

              <div className="mt-5 flex flex-1 flex-col items-center px-2 text-center">
                <div className="flex min-h-[5.5rem] flex-col items-center">
                <h3 className="line-clamp-2 text-base font-bold leading-snug text-white transition-colors group-hover:text-amber-300 sm:text-lg">
                  {item.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-xs font-medium uppercase tracking-wider text-amber-400/80 sm:text-sm">
                  {item.position}
                </p>
                </div>

                <dl className="mt-5 w-full border-t border-slate-700/50 pt-3 text-center text-xs sm:text-sm">
                  {profileFields.map((field) => (
                    <div key={field.label} className="grid min-h-[3.5rem] grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-2 border-b border-slate-800/70 px-1 py-2 last:border-b-0">
                      <dt className="text-left text-slate-500">{field.label}</dt>
                      <dd className="line-clamp-2 break-words text-right leading-relaxed text-slate-400" title={field.value || undefined}>
                        {field.value ? (
                          field.href ? (
                            <a href={field.href} className="transition-colors hover:text-amber-300">{field.value}</a>
                          ) : field.value
                        ) : <span className="text-slate-700">—</span>}
                      </dd>
                    </div>
                  ))}
                </dl>

                <blockquote className="mt-4 min-h-[5rem] w-full border-t border-amber-400/40 pt-3 text-center text-sm italic leading-relaxed text-slate-400">
                  {item.bio && <span className="line-clamp-3">&ldquo;{item.bio}&rdquo;</span>}
                </blockquote>
              </div>
            </article>
          )})}
        </div>
      ) : (
        /* Fallback Jika Data di Supabase Masih Kosong */
        <div className="py-16 text-center text-slate-500 italic">
          Data pimpinan sekolah belum dimasukkan di database.
        </div>
      )}
    </main>
  );
}
