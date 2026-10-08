import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabaseServerClient'
import LogoutButton from './logout-button'
import AdminNavigation from './admin-navigation'

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-[#f3f2ee] font-sans text-slate-800 antialiased">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[258px] flex-col border-r border-white/10 bg-[#17231f] text-white md:flex">
        <Link href="/admin/dashboard" className="relative flex h-[82px] items-center gap-3 overflow-hidden border-b border-white/10 px-6">
          <span aria-hidden="true" className="absolute inset-0 bg-[url('/batik2.png')] bg-[length:230px_auto] opacity-[0.12]" />
          <Image src="/logoo.png" width={40} height={40} alt="" className="relative h-10 w-10 rounded-full bg-white p-0.5 object-contain" />
          <span className="min-w-0">
            <span className="relative block truncate text-[11px] font-bold tracking-[0.08em] text-white">SMA MUTU</span>
            <span className="relative mt-1 block text-[10px] font-medium text-amber-300/80">PORTAL PENGELOLAAN</span>
          </span>
        </Link>

        <AdminNavigation />

        <div className="border-t border-white/10 p-4">
          <div className="mb-4 flex items-center gap-3 px-1">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-amber-200">
              {(user.email?.[0] ?? 'A').toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-white/90">{user.email}</span>
              <span className="mt-0.5 block text-[10px] text-white/40">Administrator</span>
            </span>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <div className="md:pl-[258px]">
        <header className="sticky top-0 z-30 flex h-[65px] items-center justify-between border-b border-[#dedbd2] bg-[#f8f7f3]/95 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="hidden sm:inline">Ruang administrasi</span>
            <span className="hidden text-slate-300 sm:inline">/</span>
            <span className="font-semibold text-[#17231f]">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 transition hover:text-slate-950">
              Lihat website <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <span className="hidden h-5 w-px bg-slate-200 sm:block" />
            <span className="hidden items-center gap-1.5 text-[11px] font-semibold text-[#7a602e] sm:inline-flex"><Sparkles className="h-3.5 w-3.5 text-amber-600" />Admin</span>
            <div className="md:hidden"><LogoutButton compact /></div>
          </div>
        </header>
        <div className="md:hidden">
          <AdminNavigation />
        </div>
        <main className="mx-auto w-full max-w-[1440px] p-5 sm:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  )
}
