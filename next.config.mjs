/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed deprecated eslint config (Next.js 16 handles this differently)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  // Removed invalid experimental key - Next.js 16 doesn't support missingSuspenseWithCSRBailout
}

export default nextConfig