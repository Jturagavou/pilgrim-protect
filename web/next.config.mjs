import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  transpilePackages: ["react-map-gl", "mapbox-gl", "@vis.gl/react-mapbox"],
};

// Only wrap with Sentry's build plugin when a DSN is available. Without it,
// the plugin would still emit extra config but we don't need the build-time
// source-map upload in local/preview builds without a Sentry project.
const withSentry =
  process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
    ? (config) =>
        withSentryConfig(config, {
          silent: true,
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          authToken: process.env.SENTRY_AUTH_TOKEN,
          widenClientFileUpload: true,
          disableLogger: true,
        })
    : (config) => config;

export default withSentry(nextConfig);
