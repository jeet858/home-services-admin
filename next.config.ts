import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [new URL('https://homeservice27.s3.eu-west-2.amazonaws.com/**')],
  },
};

export default nextConfig;
