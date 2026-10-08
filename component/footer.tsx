import Link from "next/link";

const footerLinkClass =
  "inline-flex w-fit text-sm text-blue-100/80 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300";

export default function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-[#101b45] text-white">
      <div
        aria-hidden="true"
        className="h-1 w-full bg-gradient-to-r from-[#477f9b] via-sky-400 to-[#477f9b]"
      />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:gap-10 sm:px-8 sm:py-12 md:grid-cols-2 lg:grid-cols-[1.6fr_0.8fr_0.8fr] lg:gap-16 lg:py-16">
        <section>
          <h2 className="text-base font-extrabold uppercase tracking-[0.08em] text-white">
            SMK Muhammadiyah 1 kota Mojokerto
          </h2>
          <address className="mt-5 space-y-3 break-words text-sm not-italic leading-relaxed text-blue-100/80">
            <p>
              <span className="font-semibold text-white">Alamat:</span>{" "}
              Jl. Surodinawan No.110, Mergelo, Surodinawan, Kec. Prajurit Kulon, Kota Mojokerto, Jawa Timur 61328
            </p>
            <p>
              <span className="font-semibold text-white">Email:</span>{" "}
              <a className={footerLinkClass} href="mailto:mutiasmk@gmail.com">
                smkmusamojokerto.sch.id
              </a>
            </p>
            <p>
              <span className="font-semibold text-white">Hotline:</span>{" "}
              <a
                className={footerLinkClass}
                href="https://wa.me/62895320757160"
                target="_blank"
                rel="noreferrer"
              >
                0895320757160
              </a>
            </p>
          </address>
        </section>

        <nav aria-label="Sistem Informasi SMK Mutia">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300">
            Sistem Informasi SMK Mutu
          </h2>
          <ul className="mt-5 space-y-3">
            <li>
              <Link className={footerLinkClass} href="/prestasi-mulia/warta-mulia">
                Prestasi
              </Link>
            </li>
            <li>
              <Link className={footerLinkClass} href="/kuliah/snbp">
                Info Kuliah
              </Link>
            </li>
            <li>
              <Link className={footerLinkClass} href="/ppdb">
                PPDB
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Media sosial">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300">
            Media Sosial
          </h2>
          <ul className="mt-5 space-y-3">
            <li>
              <a className={footerLinkClass} href="https://www.instagram.com/smkmutukotamojokerto/" target="_blank" rel="noreferrer">
                Instagram
              </a>
            </li>
            <li>
              <a className={footerLinkClass} href="https://www.youtube.com/@officialsmkmusa" target="_blank" rel="noreferrer">
                YouTube
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-4 text-center text-xs text-blue-100/55 sm:px-8">
          © {new Date().getFullYear()} SMK Muhammadiyah 1{" "}
          <Link
            className="rounded-sm transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
            href="/admin/login"
          >
            kota
          </Link>{" "}
          Mojokerto. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
