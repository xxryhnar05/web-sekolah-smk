import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import Link from "next/link";
import { Users, Building2, Images, ArrowUpRight, Activity, BookOpen, GraduationCap } from "lucide-react";
export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const [{ count: staffCount }, { count: facilitiesCount }, { count: galleriesCount }] =
    await Promise.all([
      supabase.from("staff").select("*", { count: "exact", head: true }),
      supabase.from("facilities").select("*", { count: "exact", head: true }),
      supabase.from("galleries").select("*", { count: "exact", head: true }),
    ]);

  const { data: logs } = await supabase
    .from("admin_logs")
    .select("id, action, admin_email, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = [
    {
      label: "Guru & staf",
      value: staffCount ?? 0,
      helper: "Data tenaga sekolah",
      icon: Users,
      tone: "bg-[#e9f0eb] text-[#365c48]",
    },
    {
      label: "Fasilitas",
      value: facilitiesCount ?? 0,
      helper: "Sarana dan prasarana",
      icon: Building2,
      tone: "bg-[#f5ecda] text-[#8c6726]",
    },
    {
      label: "Galeri foto",
      value: galleriesCount ?? 0,
      helper: "Koleksi media sekolah",
      icon: Images,
      tone: "bg-[#e9edf1] text-[#435d74]",
    },
  ];

  const quickLinks = [
    { label: "Guru & staf", href: "/staff/guru", icon: Users },
    { label: "Kurikulum", href: "/manajemen/kurikulum", icon: BookOpen },
    { label: "Kesiswaan", href: "/manajemen/kesiswaan", icon: GraduationCap },
    { label: "Sarana & prasarana", href: "/manajemen/sarana-dan-prasarana", icon: Building2 },
  ];

  return (
    <div className="space-y-7">
      <section className="relative isolate grid overflow-hidden rounded-2xl bg-[#17231f] px-6 py-8 text-white shadow-[0_16px_36px_rgba(23,35,31,0.16)] sm:px-9 sm:py-9 lg:grid-cols-[1fr_300px] lg:items-center lg:gap-8">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[url('/batik2.png')] bg-[length:420px_auto] bg-right-top bg-no-repeat opacity-35 mix-blend-screen" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#17231f] via-[#17231f]/95 to-[#17231f]/35" />
        <div className="max-w-xl">
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300"><span className="h-px w-6 bg-amber-300" /> Pusat kendali sekolah</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Dashboard admin</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/65">Ringkasan konten dan aktivitas SMA Muhammadiyah 1 Koto Mojokerto. Pilih bagian yang ingin Anda kelola.</p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[11px] text-white/75 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Panel administrasi
          </div>
        </div>
        <div className="mt-7 border-t border-white/10 pt-5 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Akses cepat</p>
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href} className="group flex min-h-12 items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-[11px] font-medium text-white/75 transition hover:border-amber-300/40 hover:bg-white/10 hover:text-white">
                <span className="flex min-w-0 items-center gap-2"><Icon className="h-3.5 w-3.5 shrink-0 text-amber-300/80" /><span className="leading-snug">{label}</span></span>
                <ArrowUpRight className="h-3 w-3 shrink-0 text-white/30 transition group-hover:text-amber-200" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3 pt-1">
        <span className="h-5 w-1 rounded-full bg-[#bd9142]" />
        <h3 className="text-sm font-semibold text-[#28332e]">Ikhtisar data</h3>
        <span className="text-xs text-slate-400">/ Statistik website</span>
      </div>
      <section aria-label="Ringkasan data" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article
              key={stat.label}
              className="group rounded-xl border border-[#e3e0d8] bg-white p-5 shadow-[0_3px_12px_rgba(40,51,46,0.035)] transition-all hover:-translate-y-0.5 hover:border-[#cbb783] hover:shadow-[0_10px_24px_rgba(40,51,46,0.08)] sm:p-6"
            >
              <div className="flex items-start justify-between">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.tone}`}><Icon className="h-[18px] w-[18px]" strokeWidth={1.8} /></span>
              </div>
              <p className="mt-5 text-3xl font-semibold tracking-tight text-[#1d2924]">{new Intl.NumberFormat("id-ID").format(stat.value)}</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{stat.label}</p>
              <p className="mt-1 text-xs text-slate-400">{stat.helper}</p>
            </article>
          );
        })}
      </section>

      <section className="overflow-hidden rounded-xl border border-[#e3e0d8] bg-white shadow-[0_3px_12px_rgba(40,51,46,0.035)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eeece6] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f2efe7] text-[#967538]"><Activity className="h-4 w-4" /></span>
            <div><h3 className="text-sm font-semibold text-[#25312b]">Aktivitas terbaru</h3><p className="mt-1 text-xs text-slate-500">Lima perubahan terakhir di panel admin</p></div>
          </div>
          <span className="rounded-full border border-[#e6dcc4] bg-[#faf7ef] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8a6c32]">Riwayat</span>
        </div>

        {logs && logs.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {logs.map((log) => (
              <li key={log.id} className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-[#faf9f6] sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#c29a4c] ring-4 ring-[#f8f4e9]" />
                  <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{log.action}</p><p className="mt-1 truncate text-xs text-slate-500">{log.admin_email}</p></div>
                </div>
                <time className="shrink-0 text-xs text-slate-500">
                  {new Date(log.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-700">Belum ada aktivitas</p>
            <p className="mt-1 text-xs text-slate-500">Aktivitas admin akan muncul di sini.</p>
          </div>
        )}
      </section>
    </div>
  );
}
