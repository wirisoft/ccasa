/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.BASEPATH,
  experimental: {
    workerThreads: false,
    cpus: 1
  },

  /** Muchos navegadores piden /favicon.ico aunque metadata.icons use /logo.png. */
  async rewrites() {
    return [{ source: '/favicon.ico', destination: '/logo.png' }]
  },

  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0, must-revalidate' }]
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }
        ]
      }
    ]
  },

  // swcMinify: true es el default en Next 14. Con false, Terser minifica el bundle y en App Router
  // ha provocado en producción: TypeError ... reading 'clientModules' (RSC manifest roto).
}

export default nextConfig
