import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Izinkan host IP network dan localhost/127.0.0.1
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.100.99",
  ],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yciffanlfowldbvieewj.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;