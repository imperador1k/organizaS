import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // Required for Tauri — generates static HTML/JS/CSS in the 'out/' directory
  output: 'export',

  typescript: {
    ignoreBuildErrors: true,
  },

  // SSG does not support server-side image optimization, so we disable it
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
