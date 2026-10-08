import SaranaPrasaranaGalleries from './FacilityPhotoSections'

export default function SaranaPrasaranaPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-2 font-sans text-slate-300 antialiased sm:px-6 lg:px-8">
      <header className="mb-9 text-center">
        <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/80">
          <span className="h-px w-8 bg-amber-400/50" /> Fasilitas Sekolah <span className="h-px w-8 bg-amber-400/50" />
        </p>
        <div className="mx-auto mt-5 w-full max-w-4xl rounded-2xl border border-amber-400/25 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 px-5 py-6 shadow-[0_24px_50px_rgba(0,0,0,0.18)] ring-1 ring-white/5 sm:py-7">
          <h1 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-5xl" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
            Sarana &amp; Prasarana
          </h1>
        </div>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
          Kenali fasilitas dan layanan pendukung kegiatan sekolah melalui dokumentasi foto.
        </p>
      </header>

      <div className="mx-auto max-w-3xl">
        <SaranaPrasaranaGalleries />
      </div>
    </div>
  )
}
