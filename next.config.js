/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  images: {
    domains: ['localhost'],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable webpack filesystem cache in dev to avoid corrupted chunk/manifest files on Windows.
      config.cache = false;
    }
    return config;
  },
  async redirects() {
    return [
      { source: '/client/dashboard', destination: '/dashboard', permanent: true },
      { source: '/client/requests', destination: '/dashboard/requests', permanent: true },
      { source: '/client/offers', destination: '/dashboard/offers-received', permanent: true },
      { source: '/client/create-request', destination: '/dashboard/create-request', permanent: true },
      { source: '/agent-buyer/dashboard', destination: '/dashboard', permanent: true },
      { source: '/agent-buyer/requests', destination: '/dashboard/requests-market', permanent: true },
      { source: '/agent-buyer/offers', destination: '/dashboard/offers-submitted', permanent: true },
      { source: '/agent-buyer/shipments', destination: '/dashboard/deliveries', permanent: true },
      { source: '/intermediary/dashboard', destination: '/dashboard', permanent: true },
      { source: '/intermediary/requests', destination: '/dashboard/requests-market', permanent: true },
      { source: '/intermediary/offers', destination: '/dashboard/offers-submitted', permanent: true },
      { source: '/intermediary/shipments', destination: '/dashboard/deliveries', permanent: true },
    ];
  },
};

module.exports = nextConfig;
