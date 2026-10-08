import { supabase } from "@/lib/supabaseClient";

interface ProductionUnitItem {
  id: string;
  title: string;
  image_url: string | null;
  created_at?: string;
}

export default async function UnitProduksiPage() {
  const { data: units } = await supabase
    .from("production_units")
    .select("id, title, image_url, created_at")
    .order("created_at", { ascending: false });

  const unitList: ProductionUnitItem[] = units || [];

  return (
    <main className="mx-auto max-w-screen-2xl px-6 pt-0 pb-8 lg:px-8 font-sans text-slate-300 antialiased">
      {/* Header Elegan dengan Aksen Emas */}
      <div className="mb-7 text-center">
        <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/80">
          <span className="h-px w-8 bg-amber-400/50"></span>
          Tentang Kami
          <span className="h-px w-8 bg-amber-400/50"></span>
        </p>
      </div>

      <div className="mb-4 flex justify-center">
        <div className="w-full max-w-4xl rounded-2xl border border-amber-400/25 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 p-5 shadow-[0_24px_50px_rgba(0,0,0,0.18)] ring-1 ring-white/5 md:p-7">
          <h1 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-5xl" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
            Unit Produksi &amp; Teaching Factory
          </h1>
        </div>
      </div>

      <p className="mx-auto mt-6 mb-2 max-w-2xl text-center text-sm leading-relaxed text-slate-400 sm:text-base">
        Wadah kewirausahaan dan layanan jasa/produk berbasis kompetensi
        keahlian siswa yang dikelola secara profesional.
      </p>

      {/* Grid Layout Unit Produksi */}
      {unitList.length > 0 ? (
        <div className="mt-13 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3">
          {unitList.map((unit: ProductionUnitItem) => (
            <article key={unit.id} className="group flex flex-col">
              <div className="aspect-4/3 w-full overflow-hidden rounded-xl bg-slate-900/40 border border-amber-400/20 shadow-xl transition-all duration-300 hover:border-amber-400/50">
                {unit.image_url ? (
                  <a
                    href={`https://wa.me/6287710335352?text=${encodeURIComponent(
                      `Saya tertarik dengan ${unit.title} tolong berikan informasi tersebut ya kak. Terima kasih!`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Hubungi WhatsApp untuk ${unit.title}`}
                    className="block h-full w-full cursor-pointer focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-400"
                  >
                    <img
                      src={unit.image_url}
                      alt={unit.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </a>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center p-6 text-slate-500">
                    <svg
                      className="h-12 w-12 stroke-1 text-slate-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                    <span className="mt-2 text-xs font-medium">
                      Gambar Belum Tersedia
                    </span>
                  </div>
                )}
              </div>
              <h3 className="mt-3 text-base font-semibold leading-snug text-white transition-colors group-hover:text-amber-300">
                {unit.title}
              </h3>
            </article>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-slate-500 italic">
          Data unit produksi sekolah belum dimasukkan di database.
        </div>
      )}
    </main>
  );
}
