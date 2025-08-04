/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed output: 'export' for Vercel deployment
  // trailingSlash: true, // Not needed for Vercel
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
