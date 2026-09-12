import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.resolve(__dirname),
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    if (process.env.BACKEND_API_URL) {
      return [
        {
          source: "/api/:path*",
          destination: `${process.env.BACKEND_API_URL}/api/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;

