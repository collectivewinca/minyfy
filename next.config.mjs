import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // This allows images from any HTTPS domain
      },
    ],
  },
  // You can add other configurations here if needed
};

// PWA configuration
const pwaConfig = {
  dest: 'public', // Output directory for service worker and PWA files
  register: true,
  skipWaiting: true,
};

// Export the combined configuration
export default withPWA(pwaConfig)(nextConfig);
