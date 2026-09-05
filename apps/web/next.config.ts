import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@xterm/xterm', '@xterm/addon-fit'],
};

export default nextConfig;
