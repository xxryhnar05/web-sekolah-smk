import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,

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

  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), geolocation=(), microphone=()",
      },
    ];

    if (process.env.NODE_ENV === "production") {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000",
      });
    }

    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;