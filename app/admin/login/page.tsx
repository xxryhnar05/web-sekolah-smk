"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabaseBrowser } from "@/lib/supabaseBrowserClient";
import { ShieldAlert } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabaseBrowser.auth.signInWithPassword({ email, password });

      if (error) {
        setErrorMessage(error.message || "Email atau password yang Anda masukkan salah.");
        setLoading(false);
        return;
      }

      if (data.session) {
        router.replace("/admin/dashboard");
      } else {
        setErrorMessage("Login belum berhasil. Silakan coba kembali.");
        setLoading(false);
      }
    } catch {
      setErrorMessage("Terjadi kesalahan sistem. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen flex-1 bg-white lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative min-h-[240px] overflow-hidden bg-slate-900 sm:min-h-[300px] lg:min-h-screen">
        <Image
          src="/login.png"
          alt="Guru dan siswa sedang membuat konten pembelajaran di sekolah"
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 55vw"
          className="object-cover object-center"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-slate-950/35" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-[#477f9b]/35 via-transparent to-[#df8a35]/20 mix-blend-screen" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-slate-950/20" />
        <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/25 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-md sm:left-9 sm:top-9 lg:left-12 lg:top-12">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber-300" />
          Portal administrator
        </div>
        <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-9 lg:p-12">
          <div className="mb-5 h-px w-12 bg-amber-300/90" />
          <div className="flex items-center gap-3">
            <Image
              src="/logoo.png"
              width={48}
              height={48}
              alt=""
              className="h-10 w-10 shrink-0 rounded-full bg-white/95 object-contain p-1"
            />
            <div>
              <p className="text-sm font-extrabold tracking-wide">SMA MUHAMMADIYAH 1 KOTA MOJOKERTO</p>
            </div>
          </div>
          <p className="mt-5 max-w-lg text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            Cerita dan informasi sekolah, terkelola dalam satu ruang.
          </p>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/75">
            Perbarui konten sekolah melalui panel admin yang praktis dan terpusat.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-10 lg:px-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#477f9b]">
              Panel administrator
            </p>
            <h1
              className="mt-2 text-3xl font-bold tracking-tight text-slate-900"
              style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              Masuk ke akun
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Masukkan email dan password untuk melanjutkan.
            </p>
          </div>

          {errorMessage && (
            <div
              aria-live="polite"
              className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
            >
              <ShieldAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email administrator
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@sekolah.sch.id"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#477f9b] focus:ring-4 focus:ring-[#477f9b]/10"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Masukkan password"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#477f9b] focus:ring-4 focus:ring-[#477f9b]/10"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-[#477f9b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#396b85] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#477f9b] disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? "Memproses..." : "Masuk ke dashboard"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            Akses khusus untuk administrator sekolah
          </p>
        </div>
      </section>
    </main>
  );
}
