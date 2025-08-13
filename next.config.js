/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is now stable, no experimental flag needed
  webpack: (config, { isServer }) => {
    // Fix for Monaco Editor SSR issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
