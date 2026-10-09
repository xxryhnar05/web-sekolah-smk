import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import SiteFrame from "@/component/site-frame";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: "SMA MUHAMMADIYAH 1 KOTA MOJOKERTO | Profil Sekolah",
  description:
    "Profil resmi SMA Muhammadiyah 1 Kota Mojokerto: pendidikan, karakter, prestasi, dan komunitas sekolah.",
  icons: {
    icon: "/logoo.png",
  },
};

// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) { 
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${montserrat.variable} min-h-full flex flex-col`} suppressHydrationWarning>
        <SiteFrame>{children}</SiteFrame>
      </body>
    </html>
  )
}
