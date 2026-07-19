const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * Medusa Cloud-related environment variables
 */
const S3_HOSTNAME = process.env.MEDUSA_CLOUD_S3_HOSTNAME
const S3_PATHNAME = process.env.MEDUSA_CLOUD_S3_PATHNAME

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // STABILITY: `next build` and `next dev` share .next by default and corrupt
  // each other when run at the same time (ENOENT _buildManifest.js.tmp → 500s).
  // Verification/CI builds should set NEXT_DIST_DIR=.next-build so the dev
  // server is never clobbered. Deploys (Vercel/Docker) leave this unset.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Optimized (WebP/AVIF, responsive sizes) — big LCP/bandwidth win.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      // DigitalOcean droplet / stage CMS API serving /static product images
      {
        protocol: "http",
        hostname: "**.digitalocean.com",
      },
      {
        protocol: "http",
        hostname: "**.onecurve.in",
      },
      {
        protocol: "https",
        hostname: "**.onecurve.in",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
      {
        // GitHub Codespaces forwarded ports (product images from backend /static)
        protocol: "https",
        hostname: "*.app.github.dev",
      },
      ...(S3_HOSTNAME && S3_PATHNAME
        ? [
            {
              protocol: "https",
              hostname: S3_HOSTNAME,
              pathname: S3_PATHNAME,
            },
          ]
        : []),
      // Allow explicit droplet IPv4 via env (set NEXT_IMAGE_HOSTS=159.89.173.5)
      ...String(process.env.NEXT_IMAGE_HOSTS || "")
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean)
        .flatMap((hostname) => [
          { protocol: "http", hostname },
          { protocol: "https", hostname },
        ]),
    ],
  },
  // Slightly leaner production output
  poweredByHeader: false,
  compress: true,
}

module.exports = nextConfig
