/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export — no server-side logic. The team deploys the `out/` directory anywhere.
  output: "export",
  // Match the WordPress permalink scheme (flat `/slug/` with trailing slash) for SEO parity.
  trailingSlash: true,
  images: {
    // Static export has no Next image optimization server; we pre-optimize at extraction time
    // (sharp in migration/media.ts) and serve the resulting files directly.
    unoptimized: true,
  },
  pageExtensions: ["ts", "tsx", "mdx"],
  // Repo is self-contained; pin the tracing root to silence the multi-lockfile warning.
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;
