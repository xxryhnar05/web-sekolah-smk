import { supabase } from "@/lib/supabaseClient";

interface SchoolIdentity {
  id: string;
  name: string;
  npsn: string;
  address: string;
  village: string | null;
  district: string | null;
  city: string | null;
  province: string | null;
  status: string | null;
  education_form: string | null;
  education_level: string | null;
  fostering_ministry: string | null;
  umbrella_organization: string | null;
  npyp: string | null;
  establishment_sk_number: string | null;
  establishment_sk_date: string | null;
  operational_sk_number: string | null;
  operational_sk_date: string | null;
  operational_sk_file_url: string | null;
  operational_sk_upload_date: string | null;
  accreditation: string | null;
  land_area: string | null;
  internet_access: string | null;
  electricity_source: string | null;
}

function formatDate(dateString: string | null) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? dateString
    : date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
}

export default async function DataSekolahPage() {
  const { data: school } = await supabase
    .from("school_identities")
    .select("*")
    .limit(1)
    .single();

  const data: SchoolIdentity | null = school;

  // Pemetaan label untuk tampilan antarmuka
  const schoolFields = [
    { label: "Nama Sekolah", value: data?.name },
    { label: "NPSN", value: data?.npsn },
    { label: "Alamat", value: data?.address },
    { label: "Desa/Kelurahan", value: data?.village },
    { label: "Kecamatan/Kota (LN)", value: data?.district },
    { label: "Kab.-Kota/Negara (LN)", value: data?.city },
    { label: "Propinsi/Luar Negeri (LN)", value: data?.province },
    { label: "Status Sekolah", value: data?.status },
    { label: "Bentuk Pendidikan", value: data?.education_form },
    { label: "Jenjang Pendidikan", value: data?.education_level },
    { label: "Kementerian Pembina", value: data?.fostering_ministry },
    { label: "Naungan", value: data?.umbrella_organization },
    { label: "NPYP", value: data?.npyp },
    { label: "No. SK. Pendirian", value: data?.establishment_sk_number },
    {
      label: "Tanggal SK. Pendirian",
      value: formatDate(data?.establishment_sk_date ?? null),
    },
    { label: "Nomor SK Operasional", value: data?.operational_sk_number },
    {
      label: "Tanggal SK Operasional",
      value: formatDate(data?.operational_sk_date ?? null),
    },
    {
      label: "File SK Operasional",
      value: data?.operational_sk_file_url ? (
        <a
          href={data.operational_sk_file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 underline font-medium transition"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Unduh File SK
        </a>
      ) : (
        "-"
      ),
    },
    {
      label: "Tanggal Upload SK Op.",
      value: formatDate(data?.operational_sk_upload_date ?? null),
    },
    { label: "Akreditasi", value: data?.accreditation },
    { label: "Luas Tanah", value: data?.land_area },
    { label: "Akses Internet", value: data?.internet_access },
    { label: "Sumber Listrik", value: data?.electricity_source },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 pt-0 pb-8 font-sans text-slate-300 antialiased lg:px-8">
      <div className="mb-7 text-center">
        <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/80">
          <span className="h-px w-8 bg-amber-400/50" />
          Tentang Kami
          <span className="h-px w-8 bg-amber-400/50" />
        </p>
      </div>

      <div className="mb-4 flex justify-center">
        <div className="w-full max-w-4xl rounded-2xl border border-amber-400/25 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 p-5 shadow-[0_24px_50px_rgba(0,0,0,0.18)] ring-1 ring-white/5 md:p-7">
          <h1 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-5xl" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
            Data &amp; Identitas Sekolah
          </h1>
        </div>
      </div>

      <p className="mx-auto mb-2 max-w-2xl text-center text-sm leading-relaxed text-slate-400 sm:text-base">
        Informasi resmi mengenai identitas, perizinan, akreditasi, dan sarana
        prasarana sekolah.
      </p>

      {data ? (
        <div className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-xl border border-amber-400/20 bg-slate-900/60 shadow-2xl backdrop-blur-sm">
          <div className="divide-y divide-slate-700/50">
            {schoolFields
              .filter(
                ({ label }) =>
                  label !== "File SK Operasional" &&
                  label !== "Tanggal Upload SK Op.",
              )
              .map((field) => (
              <div
                key={field.label}
                className="grid grid-cols-1 items-start gap-2 px-5 py-4 transition-colors hover:bg-slate-800/40 sm:grid-cols-[minmax(12rem,0.9fr)_minmax(0,2fr)] sm:gap-6 sm:px-7 sm:py-5"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400/90 sm:pt-1">
                  {field.label}
                </span>
                <span className="break-words text-sm font-medium leading-relaxed text-slate-200 sm:text-base">
                  {field.value || "-"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-16 text-center text-slate-500 italic">
          Data identitas sekolah belum dimasukkan di database.
        </div>
      )}
    </section>
  );
}
