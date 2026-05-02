/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  
  serverExternalPackages: ['xlsx'],
  
  swcMinify: true,
  
  staticPageGenerationTimeout: 120,
}

export default nextConfig