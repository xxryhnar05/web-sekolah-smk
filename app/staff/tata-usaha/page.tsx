import { supabase } from "@/lib/supabaseClient";
import StaffDirectory, { type StaffDirectoryItem } from "@/component/staff-directory";

export default async function TataUsahaPage() {
  const { data } = await supabase
    .from("staff")
    .select("id, name, nip, position, education, address, photo_url")
    .or("category.eq.tenaga_kependidikan,category.eq.tata_usaha,category.eq.tu")
    .order("order_index", { ascending: true });

  const staff: StaffDirectoryItem[] = (data || []).map((person) => {
    const details = [];

    if (person.nip && person.nip.trim() !== "" && person.nip !== "-") {
      details.push({ label: "NIP", value: person.nip });
    }

    if (person.education && person.education.trim() !== "") {
      details.push({ label: "Pendidikan", value: person.education });
    }

    if (person.address && person.address.trim() !== "") {
      details.push({ label: "Alamat", value: person.address });
    }

    return {
      id: person.id,
      name: person.name,
      position: person.position,
      photo_url: person.photo_url || null,
      details,
    };
  });

  return (
    <div className="mx-auto w-full px-4 py-2 font-sans text-slate-300 antialiased sm:px-6 lg:px-8">
      <header className="mb-9 text-center">
        <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/80">
          <span className="h-px w-8 bg-amber-400/50" /> Tenaga Kependidikan <span className="h-px w-8 bg-amber-400/50" />
        </p>
        <div className="mx-auto mt-5 w-full max-w-4xl rounded-2xl border border-amber-400/25 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 px-5 py-6 shadow-[0_24px_50px_rgba(0,0,0,0.18)] ring-1 ring-white/5 sm:py-7">
          <h1 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-5xl" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>Tata Usaha</h1>
        </div>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
          Tim staf administrasi dan pelayanan yang mendukung kelancaran administrasi akademik sekolah.
        </p>
      </header>
      <StaffDirectory staff={staff} emptyMessage="Data tata usaha belum tersedia di database." />
    </div>
  );
}