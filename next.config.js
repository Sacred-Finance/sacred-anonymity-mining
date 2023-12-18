/** @type {import('next').NextConfig} */
const webpack = require('webpack')
module.exports = {
  eslint: {
    // Dangerously allow production builds to successfully complete even if your project has eslint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ipfs.io',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
      },
      {
        protocol: 'https',
        hostname: 'cloudflare-ipfs.com',
      },
      {
        protocol: 'https',
        hostname: 'arweave.net',
      },
    ],
    minimumCacheTTL: 60,
  },
  typescript: {
    // Dangerously allow production builds to successfully complete even if your project has type errors.
    ignoreBuildErrors: true,
  },

  reactStrictMode: false,
  i18n: {
    locales: ['en-US', 'es', 'fr'],
    defaultLocale: 'en-US',
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...(config?.resolve?.fallback || {}),
        'crypto': require.resolve('crypto-browserify'),
        'stream': require.resolve('stream-browserify'),
        'assert': require.resolve('assert'),
        'http': require.resolve('stream-http'),
        'https': require.resolve('https-browserify'),
        'os': require.resolve('os-browserify'),
        'url': require.resolve('url'),
        'process/browser': require.resolve('process/browser'),
        'path': require.resolve('path-browserify'),
        'fetch.node': require.resolve('node-fetch'),
        'fs': false,
        'constants': false,
        'readline': false,
      }

      // const experiments = config.experiments || {};
      // config.experiments = {
      //   ...experiments,
      //   asyncWebAssembly: true,
      // };
    }
    return config
  },
  /*  AssetPrefix
    --------------------------------------------------------------------------------
    AssetPrefix is used to determine where the "app" folder is located.
    Use "/" to have it at the root.
    Use "./" to have it at the root of the current directory.
    Learn more at https://nextjs.org/docs/api-reference/next.config.js/cdn-support-with-asset-prefix
  */
  // assetPrefix: './',

  /* exportTrailingSlash
    --------------------------------------------------------------------------------
    exportTrailingSlash is used to determine whether to export a trailing slash
    on the generated URL.
    Learn more at https://nextjs.org/docs/api-reference/next.config.js/export-trailing-slash
  */
  // exportTrailingSlash: true,
}
