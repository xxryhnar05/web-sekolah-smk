const services = [
  { title: 'Kemitraan Perguruan Tinggi & Industri', desc: 'Menjalin kerja sama kampus, beasiswa, serta pengenalan dunia kerja.' },
  { title: 'Komunikasi Wali Murid', desc: 'Menyampaikan informasi sekolah dan menyalurkan aspirasi orang tua.' },
  { title: 'Publikasi & Branding', desc: 'Mengelola media sosial, berita sekolah, dan dokumentasi kegiatan.' },
]

export default function HumasPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-2 font-sans text-slate-300 antialiased sm:px-6 lg:px-8">
      <header className="mb-9 text-center">
        <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/80">
          <span className="h-px w-8 bg-amber-400/50" /> Kemitraan &amp; Informasi <span className="h-px w-8 bg-amber-400/50" />
        </p>
        <div className="mx-auto mt-5 w-full max-w-4xl rounded-2xl border border-amber-400/25 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 px-5 py-6 shadow-[0_24px_50px_rgba(0,0,0,0.18)] ring-1 ring-white/5 sm:py-7">
          <h1 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-5xl" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
            Bidang Hubungan Masyarakat (Humas)
          </h1>
        </div>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
          Menghubungkan sekolah dengan keluarga, mitra pendidikan, instansi, dan dunia industri.
        </p>
      </header>

      <div className="mx-auto max-w-3xl">
        <section className="border-y border-white/10 py-8 sm:py-10">
          <div className="max-w-2xl">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-400/80">Membangun Kepercayaan</p>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Peran &amp; Fungsi Humas</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
              Humas menjaga komunikasi yang terbuka, menyebarkan informasi secara akurat, dan membangun kerja sama untuk mendukung kemajuan sekolah.
            </p>
          </div>
        </section>

        <section className="py-8 sm:py-10">
          <div className="mb-6">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-400/80">Kolaborasi Sekolah</p>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Fokus Kerja Sama &amp; Layanan</h2>
          </div>
          <ul className="divide-y divide-white/10 border-y border-white/10">
            {services.map((item, idx) => (
              <li key={item.title} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 py-5 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-4">
                <span className="pt-1 font-mono text-xs tracking-widest text-amber-400/75">{String(idx + 1).padStart(2, '0')}</span>
                <div className="text-sm leading-7 text-slate-400 sm:text-base">
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="mt-1">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
