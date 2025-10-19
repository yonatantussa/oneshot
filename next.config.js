/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Fix for esbuild .d.ts files being parsed
    config.module.rules.push({
      test: /\.d\.ts$/,
      use: 'ignore-loader',
    });

    return config;
  },
}

module.exports = nextConfig
