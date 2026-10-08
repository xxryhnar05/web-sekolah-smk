"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Menu, X } from "lucide-react";

const aboutMenuGroups = [
  {
    id: "tentang-kami",
    title: "Tentang Kami",
    items: [
      { label: "Sambutan Kepala Sekolah",href: "/tentang-kami/sambutan",},
      { label: "Visi & Misi", href: "/tentang-kami/visi-misi" },
      { label: "Kepala Sekolah & Wakil", href: "/tentang-kami/pimpinan" },
      { label: "Data Sekolah", href: "/tentang-kami/data-sekolah" },
      { label: "Unit Produksi", href: "/tentang-kami/unit-produksi" },
      {
        label: "Ekstrakurikuler",
        href: "/tentang-kami/ekstrakurikuler",
      },
    ],
  },
  {
    id: "manajemen",
    title: "Manajemen",
    items: [
      { label: "Kurikulum", href: "/manajemen/kurikulum" },
      { label: "Kesiswaan", href: "/manajemen/kesiswaan" },
      { label: "Humas", href: "/manajemen/humas" },
      {
        label: "Sarana dan Prasarana",
        href: "/manajemen/sarana-dan-prasarana",
      },
    ],
  },
  {
    id: "guru-staf",
    title: "Guru, Tata Usaha dan Karyawan",
    items: [
      { label: "Guru", href: "/staff/guru" },
      { label: "Tata Usaha", href: "/staff/tata-usaha" },
      { label: "Toolman", href: "/staff/toolman" },
    ],
  },
];

const konsentrasiKeahlian = [
  { label: "DKF", href: "/konsentrasi-keahlian/dkf" },
  { label: "TKR", href: "/konsentrasi-keahlian/tkr" },
  { label: "DKV", href: "/konsentrasi-keahlian/dkv" },
];

const navigationDropdowns = [
  {
    id: "kuliah",
    title: "Kuliah",
    items: [
      { label: "SNBP", href: "/kuliah/snbp" },
      { label: "SNBT", href: "/kuliah/snbt" },
      { label: "Beasiswa Luar Negeri", href: "/kuliah/beasiswa-luar-negeri" },
      { label: "Beasiswa Dalam Negeri", href: "/kuliah/beasiswa-dalam-negeri" },
    ],
  },
  {
    id: "prestasi-mulia",
    title: "Informasi",
    items: [
      { label: "Warta Mutu", href: "/prestasi-mulia/warta-mulia" },
      { label: "Berita", href: "/prestasi-mulia/berita" },
      { label: "Event", href: "/prestasi-mulia/event" },
      { label: "Agenda", href: "/prestasi-mulia/agenda" },
      { label: "Pengumuman", href: "/prestasi-mulia/pengumuman" },
    ],
  },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <header
      className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-gradient-to-r after:from-[#477f9b] after:via-blue-600 after:to-[#477f9b] after:content-['']"
      style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between sm:h-24">
          {/* Logo & Identitas */}
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <Image
              src="/logoo.png"
              width={56}
              height={56}
              alt="Logo SMA Muhammadiyah 1 Kota Mojokerto"
              className="h-11 w-11 shrink-0 object-contain sm:h-14 sm:w-14"
            />
            <div className="min-w-0">
              <span className="block text-[13px] font-extrabold leading-tight tracking-[-0.025em] text-[#477f9b] min-[400px]:text-[14px] sm:text-[17px] lg:text-[18px]">
                SMK Muhammadiyah 1
                <span className="block">Kota Mojokerto</span>
              </span>
           
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="relative hidden h-full items-center gap-4 xl:flex 2xl:gap-6">
            <Link
              href="/"
              className="whitespace-nowrap text-[13px] font-medium text-gray-700 transition hover:text-blue-600 2xl:text-sm"
            >
              Beranda
            </Link>

            {/* Tentang Kami mega menu */}
            <div
              className="flex h-full items-center"
              onMouseEnter={() => setOpenDropdown("tentang-kami")}
              onMouseLeave={() => setOpenDropdown((current) => current === "tentang-kami" ? null : current)}
            >
              <button
                onClick={() => toggleDropdown("tentang-kami")}
                aria-expanded={openDropdown === "tentang-kami"}
                className="flex items-center gap-1 whitespace-nowrap py-2 text-[13px] font-medium text-gray-700 transition hover:text-blue-600 2xl:text-sm"
              >
                Tentang Kami <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openDropdown === "tentang-kami" ? "rotate-180" : ""}`} />
              </button>
              <div className={`absolute right-0 top-full z-50 w-[min(860px,calc(100vw-2rem))] pt-2 transition-all duration-200 ease-out ${openDropdown === "tentang-kami" ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0 pointer-events-none"}`}>
                <div className="grid grid-cols-3 gap-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-900/10">
                  {aboutMenuGroups.map((group, index) => (
                    <section
                      key={group.id}
                      className={
                        index > 0 ? "border-l border-slate-100 pl-6" : ""
                      }
                    >
                      <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        {group.title}
                      </h2>
                      <ul className="space-y-2">
                        {group.items.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={() => setOpenDropdown(null)}
                              className="block rounded-lg px-3 py-2.5 text-[13px] font-medium leading-snug text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#477f9b]"
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              </div>
            </div>

            {/* Konsentrasi Keahlian */}
            <div
              className="relative flex h-full items-center"
              onMouseEnter={() => setOpenDropdown("konsentrasi-keahlian")}
              onMouseLeave={() => setOpenDropdown((current) => current === "konsentrasi-keahlian" ? null : current)}
            >
              <button
                onClick={() => toggleDropdown("konsentrasi-keahlian")}
                aria-expanded={openDropdown === "konsentrasi-keahlian"}
                className="flex items-center gap-1 whitespace-nowrap py-2 text-[13px] font-medium text-gray-700 transition hover:text-blue-600 2xl:text-sm"
              >
                Konsentrasi Keahlian <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openDropdown === "konsentrasi-keahlian" ? "rotate-180" : ""}`} />
              </button>
              <div className={`absolute left-0 top-full z-50 w-64 rounded-xl border border-slate-200/80 bg-white p-3 shadow-xl shadow-slate-900/10 transition-all duration-200 ease-out ${openDropdown === "konsentrasi-keahlian" ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0 pointer-events-none"}`}>
                <ul className="space-y-1">
                  {konsentrasiKeahlian.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpenDropdown(null)}
                        className="block rounded-lg px-3 py-2.5 text-[13px] font-medium leading-snug text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#477f9b]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {navigationDropdowns.map((group) => (
              <div
                key={group.id}
                className="relative flex h-full items-center"
                onMouseEnter={() => setOpenDropdown(group.id)}
                onMouseLeave={() => setOpenDropdown((current) => current === group.id ? null : current)}
              >
                <button
                  onClick={() => toggleDropdown(group.id)}
                  aria-expanded={openDropdown === group.id}
                  className="flex items-center gap-1 whitespace-nowrap py-2 text-[13px] font-medium text-gray-700 transition hover:text-blue-600 2xl:text-sm"
                >
                  {group.title}
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openDropdown === group.id ? "rotate-180" : ""}`} />
                </button>
                <div className={`absolute left-0 top-full z-50 w-64 rounded-xl border border-slate-200/80 bg-white p-3 shadow-xl shadow-slate-900/10 transition-all duration-200 ease-out ${openDropdown === group.id ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0 pointer-events-none"}`}>
                  <ul className="space-y-1">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpenDropdown(null)}
                          className="block rounded-lg px-3 py-2.5 text-[13px] font-medium leading-snug text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#477f9b]"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
            <Link
              href="/ppdb"
              className="whitespace-nowrap text-[13px] font-medium text-gray-700 transition hover:text-blue-600 2xl:text-sm"
            >
              PPDB
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            className="rounded-lg p-2 text-gray-600 transition hover:bg-slate-100 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#477f9b] xl:hidden"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
        <div
          id="mobile-navigation"
          aria-hidden={!isOpen}
          inert={!isOpen}
          className={`space-y-3 border-b border-gray-100 bg-white px-4 pt-2 xl:hidden sm:px-6 transition-[max-height,opacity] duration-300 ease-in-out ${isOpen ? "max-h-[calc(100svh-5rem)] overflow-y-auto pb-6 opacity-100 sm:max-h-[calc(100svh-6rem)]" : "pointer-events-none max-h-0 overflow-hidden pb-0 opacity-0"}`}
        >
          <Link href="/" className="block py-2 text-gray-700 font-medium">
            Beranda
          </Link>
          {aboutMenuGroups.map((group) => (
            <div key={group.id} className="border-b border-slate-100 pb-2">
              <button
                onClick={() => toggleDropdown(group.id)}
                aria-expanded={openDropdown === group.id}
                className="flex w-full items-center justify-between py-3 text-left font-medium text-gray-700"
              >
                {group.title}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${openDropdown === group.id ? "rotate-180" : ""}`}
                />
              </button>
                <ul
                  aria-hidden={openDropdown !== group.id}
                  inert={openDropdown !== group.id}
                  className={`space-y-1.5 overflow-hidden pl-3 transition-all duration-300 ease-in-out ${openDropdown === group.id ? "max-h-96 pb-2 opacity-100" : "max-h-0 pb-0 opacity-0"}`}
                >
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="block rounded-lg px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#477f9b]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
            </div>
          ))}
          <div>
            <button
              onClick={() => toggleDropdown("konsentrasi-keahlian")}
              aria-expanded={openDropdown === "konsentrasi-keahlian"}
              className="flex w-full items-center justify-between py-2 text-left font-medium text-gray-700"
            >
              Konsentrasi Keahlian
              <ChevronDown
                className={`h-4 w-4 transition-transform ${openDropdown === "konsentrasi-keahlian" ? "rotate-180" : ""}`}
              />
            </button>
              <ul
                aria-hidden={openDropdown !== "konsentrasi-keahlian"}
                inert={openDropdown !== "konsentrasi-keahlian"}
                className={`space-y-1 overflow-hidden pl-4 transition-all duration-300 ease-in-out ${openDropdown === "konsentrasi-keahlian" ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}
              >
                {konsentrasiKeahlian.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="block py-2 text-sm text-gray-600"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
          </div>
          {navigationDropdowns.map((group) => (
            <div key={group.id}>
              <button
                onClick={() => toggleDropdown(group.id)}
                aria-expanded={openDropdown === group.id}
                className="flex w-full items-center justify-between py-2 text-left font-medium text-gray-700"
              >
                {group.title}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${openDropdown === group.id ? "rotate-180" : ""}`}
                />
              </button>
                <ul
                  aria-hidden={openDropdown !== group.id}
                  inert={openDropdown !== group.id}
                  className={`space-y-1 overflow-hidden pl-4 transition-all duration-300 ease-in-out ${openDropdown === group.id ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="block py-2 text-sm text-gray-600"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
            </div>
          ))}
          <Link
            href="/ppdb"
            onClick={() => setIsOpen(false)}
            className="block py-2 text-gray-700 font-medium"
          >
            PPDB
          </Link>
        </div>
    </header>
  );
}
