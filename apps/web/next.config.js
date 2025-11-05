/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@monorepo/shared'],
  output: 'standalone',
};

module.exports = nextConfig;
