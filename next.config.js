/** @type {import('next').NextConfig} */
const webpack = require('webpack')
module.exports = {
  reactStrictMode: true,
  i18n: {
    locales: ['en-US', 'es', 'fr'],
    defaultLocale: 'en-US',

    domains: [
      {
        // Note: subdomains must be included in the domain value to be matched
        // e.g. www.example.com should be used if that is the expected hostname
        domain: 'example.com',
        defaultLocale: 'en-US',
      },
      {
        domain: 'example.fr',
        defaultLocale: 'fr',
      },
      {
        domain: 'example.es',
        defaultLocale: 'es',
      },
    ],
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
