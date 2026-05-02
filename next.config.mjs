/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,  // تجاهل أخطاء TypeScript مؤقتاً
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig