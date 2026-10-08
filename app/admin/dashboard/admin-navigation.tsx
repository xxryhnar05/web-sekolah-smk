"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LayoutDashboard, Menu, X } from "lucide-react";

type MenuSection = { title: string; items: [string, string][] };
type MenuGroup = { title: string; href?: string; sections?: MenuSection[]; items?: [string, string][] };

const aboutGroups: MenuGroup[] = [
  {
    title: "Beranda",
    href: "/admin/dashboard/beranda",
  },
  {
    title: "Tentang Kami",
    sections: [
      {
        title: "Tentang Kami",
        items: [
          ["Sambutan Kepala Sekolah", "/admin/dashboard/tentang-kami/sambutan-kepala"],
          ["Visi & Misi", "/admin/dashboard/tentang-kami/visi-misi"],
          ["Kepala Sekolah & Wakil", "/admin/dashboard/tentang-kami/kepala-dan-wakil"],
          ["Data Sekolah", "/admin/dashboard/tentang-kami/data-sekolah"],
          ["Unit Produksi", "/admin/dashboard/tentang-kami/unit-produksi"],
          ["Ekstrakurikuler", "/admin/dashboard/tentang-kami/ekstrakurikuler"],
        ],
      },
      {
        title: "Manajemen",
        items: [
          ["Kurikulum", "/admin/dashboard/manajemen/kurikulum"],
          ["Kesiswaan", "/admin/dashboard/manajemen/kesiswaan"],
          ["Humas", "/admin/dashboard/manajemen/humas"],
          ["Sarana dan Prasarana", "/admin/dashboard/manajemen/sarana-prasarana"],
        ],
      },
      {
        title: "Guru, Tata Usaha dan Karyawan",
        items: [
          ["Guru", "/admin/dashboard/gtuk/guru"],
          ["Tata Usaha", "/admin/dashboard/gtuk/tata-usaha"],
          ["Toolman", "/admin/dashboard/gtuk/toolman"],
        ],
      },
    ],
  },
  {
    title: "Konsentrasi Keahlian",
    items: [
      ["DKF", "/admin/dashboard/konsentrasi-keahlian/dkf"],
      ["TKR", "/admin/dashboard/konsentrasi-keahlian/tkr"],
      ["DKV", "/admin/dashboard/konsentrasi-keahlian/dkv"],
    ],
  },
  {
    title: "Kuliah",
    items: [
      ["SNBP", "/admin/dashboard/kuliah/snbp"],
      ["SNBT", "/admin/dashboard/kuliah/snbt"],
      ["Beasiswa Luar Negeri", "/admin/dashboard/kuliah/beasiswa-luar-negeri"],
      ["Beasiswa Dalam Negeri", "/admin/dashboard/kuliah/beasiswa-dalam-negeri"],
    ],
  },
  {
    title: "PPDB",
    href: "/admin/dashboard/ppdb",
  },
  {
    title: "Informasi",
    items: [
      ["Warta Mutu", "/admin/dashboard/prestasi-mulia/warta-mulia"],
      ["Berita", "/admin/dashboard/prestasi-mulia/berita"],
      ["Event", "/admin/dashboard/prestasi-mulia/event"],
      ["Agenda", "/admin/dashboard/prestasi-mulia/agenda"],
      ["Pengumuman", "/admin/dashboard/prestasi-mulia/pengumuman"],
    ],
  },
];

export default function AdminNavigation() {
  const pathname = usePathname();
  const activeGroup = aboutGroups.find((group) =>
    group.title === "Tentang Kami"
      ? group.sections?.some((section) => section.items.some(([, href]) => pathname === href))
    : group.href
      ? pathname === group.href
      : group.items?.some(([, href]) => pathname === href),
  )?.title;
  const [openGroup, setOpenGroup] = useState<string | null>(activeGroup ?? null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = (
    <>
      <Link href="/admin/dashboard" aria-current={pathname === "/admin/dashboard" ? "page" : undefined}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition ${pathname === "/admin/dashboard" ? "bg-[#c99a42] text-[#17231f]" : "text-white/65 hover:bg-white/[0.07] hover:text-white"}`}>
        <LayoutDashboard className={`h-4 w-4 ${pathname === "/admin/dashboard" ? "text-[#17231f]" : "text-white/40"}`} /> Dashboard
      </Link>
      <p className="mb-2 mt-7 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">Navigasi website</p>
      {aboutGroups.map((group) => {
        const expanded = openGroup === group.title;
        const groupActive = activeGroup === group.title;
        const groupItems = group.title === "Tentang Kami" ? group.sections : [{ title: group.title, items: group.items }];
        if (group.href) {
          return (
            <Link
              key={group.title}
              href={group.href}
              aria-current={groupActive ? "page" : undefined}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center rounded-lg px-3 py-2.5 text-[13px] font-medium transition ${groupActive ? "text-amber-200" : "text-white/65 hover:bg-white/[0.07] hover:text-white"}`}
            >
              {group.title}
            </Link>
          );
        }
        return (
          <section key={group.title} className="mb-1">
            <button type="button" aria-expanded={expanded} onClick={() => setOpenGroup(expanded ? null : group.title)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition active:scale-[0.99] ${groupActive ? "text-amber-200" : "text-white/65 hover:bg-white/[0.07] hover:text-white"}`}>
              <span>{group.title}</span>
              <ChevronDown className={`h-4 w-4 text-white/35 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
            </button>
            <div
              aria-hidden={!expanded}
              inert={!expanded}
              className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${expanded ? "max-h-[1200px] opacity-100" : "pointer-events-none max-h-0 opacity-0"}`}
            >
              {groupItems?.map((section) => (
                <div key={section.title} className="pb-2 pl-3">
                  {group.title === "Tentang Kami" && <p className="mb-1 mt-2 border-l border-amber-400/50 pl-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-200/65">{section.title}</p>}
                  <ul className="ml-1.5 space-y-0.5 border-l border-white/10">
                    {section.items?.map(([label, href]) => {
                      const active = pathname === href;
                      return <li key={href}><Link href={href} aria-current={active ? "page" : undefined} onClick={() => setMobileOpen(false)}
                        className={`block rounded-r-md py-2 pl-4 pr-2 text-xs leading-snug transition ${active ? "bg-white/[0.09] font-semibold text-amber-200" : "text-white/55 hover:bg-white/[0.05] hover:text-white"}`}>{label}</Link></li>;
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );

  return <>
    <nav aria-label="Navigasi admin dan website" className="hidden flex-1 space-y-1 overflow-y-auto px-3 py-6 md:block">{links}</nav>
    <div className="sticky top-[65px] z-20 border-b border-[#dedbd2] bg-[#f8f7f3]/95 px-4 py-2 backdrop-blur sm:px-8 md:hidden">
      <button type="button" onClick={() => setMobileOpen(!mobileOpen)} aria-expanded={mobileOpen} aria-controls="admin-mobile-navigation" className="flex min-h-11 w-full items-center justify-between rounded-xl border border-[#e5e1d7] bg-white px-3.5 py-2 text-left text-[#26352e] shadow-sm transition active:scale-[0.99]">
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#17231f] text-amber-300">{mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</span>
          <span className="min-w-0">
            <span className="block text-xs font-semibold">Menu admin</span>
            <span className="block truncate text-[10px] text-slate-500">{activeGroup ?? (pathname === "/admin/dashboard" ? "Dashboard" : "Navigasi website")}</span>
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${mobileOpen ? "rotate-180" : ""}`} />
      </button>
      <nav
        id="admin-mobile-navigation"
        aria-label="Navigasi admin dan website"
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
        className={`space-y-1 overflow-x-hidden rounded-xl bg-[#17231f] px-3 transition-[max-height,opacity,padding] duration-300 ease-in-out ${mobileOpen ? "max-h-[65vh] overflow-y-auto py-3 pb-4 opacity-100" : "pointer-events-none max-h-0 overflow-hidden py-0 opacity-0"}`}
      >
        {links}
      </nav>
    </div>
  </>;
}
