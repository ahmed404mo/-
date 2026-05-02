/** @type {import('next').NextConfig} */
const nextConfig = {
  // إزالة swcMinify (غير مدعوم في Next.js 16)
  turbopack: {},
  serverExternalPackages: ['xlsx'],
  // swcMinify محذوف لأنه غير ضروري
}

export default nextConfig