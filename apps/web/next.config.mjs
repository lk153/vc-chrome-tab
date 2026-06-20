/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Compile the workspace package (it ships TS source, not a build).
  transpilePackages: ["@vctabs/shared"],
  experimental: {
    // argon2 is a native (.node) addon — keep it as a runtime require()
    // instead of letting webpack try (and fail) to bundle the binary.
    serverComponentsExternalPackages: ["@node-rs/argon2"],
    // Enable instrumentation.ts (server-boot hook that caps Atlas TLS at 1.2).
    instrumentationHook: true,
  },
};

export default nextConfig;
