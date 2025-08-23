/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  // Removed output: 'export' for Vercel deployment
  eslint: {
    // Disable ESLint during builds (but keep it for development)
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    formats: ["image/webp", "image/avif"],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  // Webpack configuration for path aliases
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname),
    };
    return config;
  },
  // SEO optimizations
  async headers() {
    return [
      {
        // Allow iframe embedding for login/portal pages (for cross-app login)
        source: "/(portal|auth/login|login)(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          // Remove X-Frame-Options to allow iframe embedding from any origin
          // {
          //   key: "X-Frame-Options",
          //   value: "SAMEORIGIN",
          // },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *; default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http://localhost:8005 https://*.stream-lineai.com ws://localhost:3000;",
          },
        ],
      },
      {
        // Keep security headers for all other pages
        source: "/((?!portal|auth/login|login).*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
  // Better caching and API routing
  async rewrites() {
    return [
      {
        source: "/sitemap.xml",
        destination: "/sitemap.xml",
      },
      {
        source: "/robots.txt",
        destination: "/robots.txt",
      },
    ];
  },
};

module.exports = nextConfig;
