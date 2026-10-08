import { supabase } from "@/lib/supabaseClient";

export const revalidate = 0;

export default async function SambutanPage() {
  const { data: profile, error } = await supabase
    .from("school_profiles")
    .select(
      "welcome_speech, headmaster_name, headmaster_photo_url, school_data",
    )
    .order("updated_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("Gagal memuat sambutan kepala sekolah.", { cause: error });
  }

  // Ambil nama sekolah dari JSON school_data (jika ada)
  const schoolData = (profile?.school_data as Record<string, any>) || {};
  const schoolName = schoolData.nama_sekolah || schoolData.name || "Sekolah";

  // Pisahkan teks sambutan berdasarkan baris baru/paragraf
  const rawSpeech = profile?.welcome_speech || "";
  const paragraphs = rawSpeech
    ? rawSpeech.split("\n").filter((p: string) => p.trim() !== "")
    : [];

  // Ambil paragraf pertama sebagai quote/kutipan pembuka jika ada, sisa paragraf menjadi isi
  const quoteText = paragraphs.length > 0 ? paragraphs[0] : null;
  const mainParagraphs =
    paragraphs.length > 1 ? paragraphs.slice(1) : paragraphs;

  return (
  <div className="min-h-screen font-sans text-slate-300 antialiased">
    <main className="w-full px-6 pt-0 pb-8 lg:px-8">
      {/* Header Elegan dengan Nama Sekolah & Aksen Emas */}
      <div className="mb-7 text-center">
        <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/80">
          <span className="h-px w-8 bg-amber-400/50"></span>
          Profil Pimpinan &bull; {schoolName}
          <span className="h-px w-8 bg-amber-400/50"></span>
        </p>
      </div>

      <div className="mb-4 flex justify-center">
        <div className="w-full max-w-4xl rounded-2xl border border-amber-400/25 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 p-5 shadow-[0_24px_50px_rgba(0,0,0,0.18)] ring-1 ring-white/5 md:p-7">
          <h1 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-5xl" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
            Sambutan Kepala Sekolah
          </h1>
        </div>
      </div>

      {/* =====================================================
          GRID UTAMA
          Foto tetap di kiri, teks sambutan di kanan
          ===================================================== */}
      <div className="mt-12 grid grid-cols-5 items-start gap-12 lg:grid-cols-14 lg:translate-x-6 lg:gap-11">

        {/* =====================================================
            KOLOM KIRI: FOTO & IDENTITAS
            Posisi foto TIDAK diubah
            ===================================================== */}
        <div className="flex flex-col items-center lg:col-span-5 lg:items-start">
          <div className="flex w-full max-w-150 flex-col items-center lg:sticky lg:top-24 lg:items-start">

            {/* Foto Transparan */}
            <div className="relative mt-4 w-full overflow-hidden lg:-ml-30 lg:w-[calc(100%+3rem)]">
              {profile?.headmaster_photo_url ? (
                <>
                  <img
                    src={profile.headmaster_photo_url}
                    alt={
                      profile.headmaster_name || "Kepala Sekolah"
                    }
                    className="h-auto max-h-170 w-full object-contain object-bottom drop-shadow-[0_20px_30px_rgba(0,0,0,0.28)]"
                  />

                  {/* Gradien bawah foto */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-[#0a1429] to-transparent"></div>
                </>
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
            </div>

            {/* Identitas Kepala Sekolah */}
            <div className="mt-6 w-full text-center lg:-ml-30 lg:w-[calc(100%+3rem)] lg:text-left">
              <h2 className="text-lg font-bold leading-snug text-white">
                {profile?.headmaster_name || "Nama Kepala Sekolah"}
              </h2>

              <p className="mt-1 text-sm font-medium uppercase tracking-wider text-amber-400/80">
                Kepala {schoolName}
              </p>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: TEKS SAMBUTAN */}
       <div className="lg:col-span-8 lg:-mr-28">
          <div className="pt-8 lg:pt-14">
            <div className="text-justify text-base leading-relaxed text-slate-300 sm:text-lg">
              {paragraphs.length > 0 ? (
                <div className="space-y-6">

                  {/* Kutipan Pembuka */}
                  {quoteText && (
                    <blockquote className="border-l-2 border-amber-400/50 pl-6 font-serif text-xl italic text-amber-100/90 sm:text-2xl">
                      "{quoteText}"
                    </blockquote>
                  )}

                  {/* Paragraf-paragraf Utama */}
                  {mainParagraphs.map((para: string, idx: number) => {
                    if (idx === 0) {
                      return (
                        <p
                          key={idx}
                          className="first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-5xl first-letter:font-bold first-letter:leading-[0.9] first-letter:text-amber-400"
                        >
                          {para}
                        </p>
                      );
                    }

                    const isClosing = para
                      .toLowerCase()
                      .includes("wassalamu");

                    return (
                      <p
                        key={idx}
                        className={
                          isClosing
                            ? "pt-2 font-semibold text-white"
                            : ""
                        }
                      >
                        {para}
                      </p>
                    );
                  })}
                </div>
              ) : (
                /* Tampilan Jika Database Masih Kosong */
                <div className="py-12 text-center italic text-slate-500 lg:text-left">
                  Teks sambutan kepala sekolah belum diisi.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
);
}