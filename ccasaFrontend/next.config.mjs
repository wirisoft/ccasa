/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['html5-qrcode', 'qz-tray'],
  basePath: process.env.BASEPATH,
  experimental: {
    workerThreads: false,
    cpus: 1
  },

  // swcMinify: true es el default en Next 14. Con false, Terser minifica el bundle y en App Router
  // ha provocado en producción: TypeError ... reading 'clientModules' (RSC manifest roto).
}

export default nextConfig
