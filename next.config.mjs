/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig = {
  // Set custom port
  env: {
    PORT: process.env.PORT || '3011',
  },
  experimental: {
    // Enable React Server Components
    serverComponentsExternalPackages: [],
  },
  // Enable image optimization
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // Webpack configuration for optimal bundle size
  webpack: (config) => {
    config.externals.push({
      'utf8-validate': 'commonjs utf8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    return config;
  },
};

export default withNextIntl(nextConfig);
