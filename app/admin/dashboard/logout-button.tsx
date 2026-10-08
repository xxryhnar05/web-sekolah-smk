'use client'

import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseBrowserClient'
import { LogOut } from 'lucide-react'

export default function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter()

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut()
    router.replace('/admin/login')
  }

  return (
    <button
      onClick={handleLogout}
      className={`${compact ? 'shrink-0 rounded-lg px-3 py-2' : 'w-full rounded-lg px-3 py-2.5'} flex items-center justify-center gap-2 border border-slate-200 bg-white text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900`}
    >
      <LogOut className="h-4 w-4" />
      <span>Keluar</span>
    </button>
  )
}
