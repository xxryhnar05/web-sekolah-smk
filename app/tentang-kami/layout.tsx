import type { ReactNode } from "react";

export default function TentangKamiLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#070d1c] font-sans text-slate-300 antialiased selection:bg-cyan-400/20 selection:text-cyan-100">
      {/* Latar Belakang Gradient Dasar */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-20 bg-gradient-to-b from-[#0a1429] via-[#0b1322] to-[#05080f]"
      />

      {/* Efek Cahaya Ambient (Glow) untuk kesan modern */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-1/2 top-[-20%] -z-10 h-[500px] w-[80%] -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-[-10%] right-[-10%] -z-10 h-[400px] w-[50%] rounded-full bg-indigo-700/5 blur-[120px]"
      />

      {/* Pola Batik yang dilembutkan */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-repeat opacity-[0.04]"
        style={{
          backgroundImage: "url('/batik.png')",
          backgroundSize: "600px auto",
          maskImage:
            "radial-gradient(ellipse 100% 80% at 50% 30%, black 20%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 100% 80% at 50% 30%, black 20%, transparent 80%)",
        }}
      />

      {/* Konten Utama dengan layout minimalis */}
      <main className="relative z-10 mx-auto w-full max-w-5xl px-6 py-16 md:px-10 md:py-24">
        {children}
      </main>
    </div>
  );
}