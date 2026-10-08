import { supabase } from '@/lib/supabaseClient';

interface CurriculumItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  order_index: number;
}

export default async function KurikulumPage() {
  const { data: items } = await supabase
    .from('curriculums')
    .select('id, title, slug, content, order_index')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  const curriculumList: CurriculumItem[] = items || [];

  // Pencarian slug dengan mencakup variasi penulisan (case-insensitive & underscore/dash)
  const findItemBySlug = (targetSlug: string) =>
    curriculumList.find(
      (item) =>
        item.slug?.toLowerCase().replace(/_/g, '-') ===
        targetSlug.toLowerCase().replace(/_/g, '-')
    );

  const pengantar =
    findItemBySlug('pengantar') ||
    curriculumList.find((i) => i.order_index === 1);

  const systemContent =
    findItemBySlug('kurikulum-diterapkan') ||
    findItemBySlug('kurikulum-yang-diterapkan') ||
    curriculumList.find((i) => i.order_index === 2);

  const sinkronisasi =
    findItemBySlug('sinkronisasi-industri') ||
    findItemBySlug('sinkronisasi-dengan-dunia-industri') ||
    curriculumList.find((i) => i.order_index === 3);

  const programKeahlian =
    findItemBySlug('program-keahlian') ||
    curriculumList.find((i) => i.order_index === 4);

  // Parser handal untuk memisah daftar jurusan/program keahlian dari teks paragraf Supabase
  const parseProgramList = (rawContent?: string) => {
    if (!rawContent) return [];

    return rawContent
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      // Membersihkan semua jenis simbol bullet point (•, â€¢, -, *, 1., dst)
      .map((line) => line.replace(/^([•â€¢\-*]|\d+\.)\s*/, '').trim())
      // Memastikan baris berisi format "Nama Jurusan : Deskripsi"
      .filter((line) => line.includes(':'));
  };

  const programList = parseProgramList(programKeahlian?.content);

  return (
    <div className="mx-auto max-w-5xl px-4 py-2 font-sans text-slate-300 antialiased sm:px-6 lg:px-8">
      <header className="mb-9 text-center">
        <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/80">
          <span className="h-px w-8 bg-amber-400/50" /> Akademik &amp; Pembelajaran <span className="h-px w-8 bg-amber-400/50" />
        </p>
        <div className="mx-auto mt-5 w-full max-w-4xl rounded-2xl border border-amber-400/25 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 px-5 py-6 shadow-[0_24px_50px_rgba(0,0,0,0.18)] ring-1 ring-white/5 sm:py-7">
          <h1 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-5xl" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
            Bidang Kurikulum
          </h1>
        </div>
        <p className="mx-auto mt-5 max-w-2xl whitespace-pre-line text-sm leading-7 text-slate-400 sm:text-base">
          {pengantar?.content || 'Mewujudkan proses pembelajaran yang inovatif, berstandar tinggi, dan berfokus pada pengembangan potensi siswa secara utuh.'}
        </p>
      </header>

      <div className="mx-auto max-w-3xl">
        <section className="border-y border-white/10 py-8 sm:py-10">
          <div className="max-w-2xl">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-400/80">Arah Pembelajaran</p>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {systemContent?.title || 'Sistem & Penerapan Kurikulum'}
            </h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
              {systemContent?.content}
            </p>
          </div>

          {sinkronisasi && (
            <div className="mt-7 max-w-2xl border-l border-amber-400/40 pl-5 sm:ml-2 sm:pl-6">
              <h3 className="text-sm font-semibold text-white sm:text-base">{sinkronisasi.title}</h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-400">{sinkronisasi.content}</p>
            </div>
          )}
        </section>

        <section className="py-8 sm:py-10">
          <div className="mb-6">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-400/80">Program Keahlian</p>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Kompetensi &amp; Keahlian Vokasi</h2>
          </div>

          {programList.length > 0 ? (
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {programList.map((item, idx) => {
                const [title, ...descParts] = item.split(':');
                const description = descParts.join(':');

                return (
                  <li key={`${idx}-${title}`} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 py-5 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-4">
                    <span className="pt-1 font-mono text-xs tracking-widest text-amber-400/75">{String(idx + 1).padStart(2, '0')}</span>
                    <div className="text-sm leading-7 text-slate-400 sm:text-base">
                      <strong className="font-semibold text-white">{title.trim()}</strong>
                      {description && <span>: {description.trim()}</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="border-y border-white/10 py-6 text-sm text-slate-500">Program keahlian belum dikonfigurasi di database.</p>
          )}
        </section>
      </div>
    </div>
  );
}
