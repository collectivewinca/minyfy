import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
};

// PWA configuration
const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
};

export default withPWA(pwaConfig)(nextConfig);
