/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["ui", "supabase", "types"],
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
}

module.exports = nextConfig 