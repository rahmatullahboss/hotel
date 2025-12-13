// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.SENTRY_DSN,

    // Adjust sample rate in production
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Enable debug in development
    debug: process.env.NODE_ENV === "development",

    // Capture unhandled exceptions
    integrations: [
        Sentry.captureConsoleIntegration({
            levels: ["error", "warn"],
        }),
    ],

    // Filter out known errors that aren't actionable
    beforeSend(event) {
        // Ignore specific errors if needed
        return event;
    },
});
