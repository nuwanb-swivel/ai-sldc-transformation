import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Required for `forbidden()` (used by `requireAdmin()` in the DAL) --
    // see `src/app/forbidden.tsx`.
    authInterrupts: true,
  },
};

export default nextConfig;
