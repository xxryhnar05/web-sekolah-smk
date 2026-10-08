import { supabase } from "@/lib/supabaseClient";
import StaffDirectory, { type StaffDirectoryItem } from "@/component/staff-directory";

export default async function GuruPage() {
  const { data } = await supabase
    .from("staff")
    .select("id, name, nip, position, subject, education, address, photo_url")
    .eq("category", "guru")
    .order("order_index", { ascending: true });

  const staff: StaffDirectoryItem[] = (data || []).map((person) => ({
    id: person.id,
    name: person.name,
    position: person.position,
    photo_url: person.photo_url,
    details: [
      ...(person.subject && person.subject !== "-" ? [{ label: "Mata Pelajaran", value: person.subject }] : []),
      ...(person.nip && person.nip !== "-" ? [{ label: "NIP", value: person.nip }] : []),
      ...(person.education ? [{ label: "Pendidikan", value: person.education }] : []),
      ...(person.address ? [{ label: "Alamat", value: person.address }] : []),
    ],
  }));

  return (
    <div className="mx-auto w-full px-4 py-2 font-sans text-slate-300 antialiased sm:px-6 lg:px-8">
      <header className="mb-9 text-center">
        <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/80">
          <span className="h-px w-8 bg-amber-400/50" /> Tenaga Pendidik <span className="h-px w-8 bg-amber-400/50" />
        </p>
        <div className="mx-auto mt-5 w-full max-w-4xl rounded-2xl border border-amber-400/25 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 px-5 py-6 shadow-[0_24px_50px_rgba(0,0,0,0.18)] ring-1 ring-white/5 sm:py-7">
          <h1 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-5xl" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>Daftar Guru</h1>
        </div>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
          Mengenal tim tenaga pendidik profesional dan berdedikasi dalam mendidik serta membimbing siswa-siswi.
        </p>
      </header>
      <StaffDirectory staff={staff} emptyMessage="Data guru belum tersedia di database." />
    </div>
  );
}
