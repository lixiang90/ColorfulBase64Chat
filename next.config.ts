import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: process.env.NODE_ENV === 'production' ? '/ColorfulBase64Chat' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/ColorfulBase64Chat/' : ''
};

export default nextConfig;
