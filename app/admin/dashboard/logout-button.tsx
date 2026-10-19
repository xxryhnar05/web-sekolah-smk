'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseBrowserClient'
import { LogOut } from 'lucide-react'

export default function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      const { error } = await supabaseBrowser.auth.signOut()
      if (error) {
        console.error('Gagal mengakhiri sesi admin:', error.message)
        setErrorMessage('Sesi belum berhasil diakhiri. Silakan coba lagi.')
        setLoading(false)
        return
      }

      router.replace('/admin/login')
    } catch (error) {
      console.error('Gagal mengakhiri sesi admin:', error)
      setErrorMessage('Sesi belum berhasil diakhiri. Silakan coba lagi.')
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleLogout}
        disabled={loading}
        className={`${compact ? 'shrink-0 rounded-lg px-3 py-2' : 'w-full rounded-lg px-3 py-2.5'} flex items-center justify-center gap-2 border border-slate-200 bg-white text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-wait disabled:opacity-60`}
      >
        <LogOut className="h-4 w-4" />
        <span>{loading ? 'Keluar...' : 'Keluar'}</span>
      </button>
      {errorMessage && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
