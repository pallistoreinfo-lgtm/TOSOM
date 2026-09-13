/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Server routes power the self-contained admin panel on Vercel. Public content
  // pages remain statically generated for speed and SEO.
  // Match the WordPress permalink scheme (flat `/slug/` with trailing slash) for SEO parity.
  trailingSlash: true,
  images: {
    // Source images are already optimized by the migration tooling.
    unoptimized: true,
  },
  pageExtensions: ["ts", "tsx", "mdx"],
  // Repo is self-contained; pin the tracing root to silence the multi-lockfile warning.
  outputFileTracingRoot: import.meta.dirname,
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
      {
        source: "/api/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
