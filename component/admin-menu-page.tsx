import Link from "next/link";
import { ArrowLeft, FilePenLine } from "lucide-react";

export default function AdminMenuPage({
  section,
  title,
}: {
  section: string;
  title: string;
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <div>
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-[#26352e]">
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke dashboard
        </Link>
        <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#967538]">{section}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#17231f] sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">Halaman pengelolaan konten {title.toLowerCase()}.</p>
      </div>

      <section className="rounded-2xl border border-[#e3e0d8] bg-white p-6 shadow-[0_3px_12px_rgba(40,51,46,0.035)] sm:p-8">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f5ecda] text-[#8c6726]">
            <FilePenLine className="h-5 w-5" strokeWidth={1.7} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-[#25312b]">{title}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              Menu ini sudah terhubung ke halaman pengelolaannya. Form dan data untuk bagian ini dapat ditambahkan di halaman ini.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
