import type { NextConfig } from "next";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  outputFileTracingRoot: join(currentDir, "../.."),
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
