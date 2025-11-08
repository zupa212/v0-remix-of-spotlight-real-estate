/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed deprecated eslint config (Next.js 16 handles this differently)
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig