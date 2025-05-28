import { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: [],
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/images/**",
      },
    ],
  },
  env: {
    HOSTNAME: "127.0.0.1",
  },
};

export default config;
