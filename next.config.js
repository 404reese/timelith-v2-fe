/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Commented out to disable static export and resolve generateStaticParams error
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
