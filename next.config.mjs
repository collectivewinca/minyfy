/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        hostname: 'firebasestorage.googleapis.com'
      },
    ],
  },
};

export default nextConfig;