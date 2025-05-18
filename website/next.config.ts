import { NextConfig } from "next";

const config: NextConfig = {
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
  async rewrites() {
    return [
      {
        source: "/videos/:path*",
        destination: "http://localhost:3001/videos/:path*",
      },
    ];
  },
  // Allow connections from any host
  hostname: "0.0.0.0",
  port: 3000,
};

export default config;
