import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {};

// Wrap with next-intl first, then with Sentry
const configWithIntl = withNextIntl(nextConfig);

export default withSentryConfig(configWithIntl, {
    // Sentry organization and project
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // Upload source maps for better error traces
    widenClientFileUpload: true,

    // Hide source maps from client bundles
    hideSourceMaps: true,

    // Webpack options
    webpack: {
        // Automatically tree-shake Sentry debug logging
        treeshake: {
            removeDebugLogging: true,
        },
        // Monitor Vercel cron jobs
        automaticVercelMonitors: true,
    },
});
