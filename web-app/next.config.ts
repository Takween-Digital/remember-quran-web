import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  turbopack: false,
  allowedDevOrigins: [
    "ais-dev-uqgyw5ngganzv2yxq6svjn-67937599322.asia-southeast1.run.app",
    "ais-pre-uqgyw5ngganzv2yxq6svjn-67937599322.asia-southeast1.run.app",
    "*.run.app",
    "**.run.app",
    "localhost",
  ],
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/data/morphology/v1/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      },
    ]
  },
}

export default nextConfig
