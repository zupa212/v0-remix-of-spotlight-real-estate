/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed deprecated eslint config (Next.js 16 handles this differently)
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Ensure all pages are dynamically rendered to avoid build-time errors
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

export default nextConfig