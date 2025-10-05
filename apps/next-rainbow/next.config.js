/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/ui', '@repo/api', '@repo/markets'],
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    // Simply mock problematic dependencies
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
    }

    // For server-side rendering, handle React Native dependencies
    if (isServer) {
      // Set up the externals
      const originalExternals = config.externals || []
      config.externals = [
        ...(Array.isArray(originalExternals)
          ? originalExternals
          : [originalExternals]),
        'react-native',
        '@react-native-async-storage/async-storage',
      ]

      // Mock indexedDB during runtime
      if (typeof global !== 'undefined') {
        global.indexedDB = {
          open: () => ({
            onupgradeneeded: null,
            onsuccess: null,
            onerror: null,
          }),
        }
      }
    }

    return config
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
