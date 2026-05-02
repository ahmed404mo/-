/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['xlsx'],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      stream: false,
      crypto: false,
    };
    return config;
  },
}

export default nextConfig