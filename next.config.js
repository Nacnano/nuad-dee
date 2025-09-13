/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ["localhost"],
  },
  // Enable static exports if needed
  // output: 'export',
  // trailingSlash: true,
};

module.exports = nextConfig;
