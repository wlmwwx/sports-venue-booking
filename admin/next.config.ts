import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    CLOUD_ENV_ID: process.env.CLOUD_ENV_ID || "",
  },
};

export default nextConfig;
