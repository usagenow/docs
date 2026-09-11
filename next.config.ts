import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every page is generated at build time into `out/`, so the site can be
  // served by any static host.
  output: "export",
  images: { unoptimized: true },
  poweredByHeader: false,
};

export default nextConfig;
