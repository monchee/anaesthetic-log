import * as Sentry from '@sentry/react';
import { env } from './env';

if (env.VITE_SENTRY_DSN && env.VITE_ENVIRONMENT !== 'test') {
  Sentry.init({
    dsn: env.VITE_SENTRY_DSN,
    environment: env.VITE_ENVIRONMENT,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event) {
      // Remove any potential PHI (Protected Health Information)
      if (event.request) {
        delete event.request.cookies;
      }
      if (event.user) {
        // Anonymize user data
        event.user.id = 'anonymized';
        delete event.user.email;
        delete event.user.username;
        delete event.user.ip_address;
      }
      // Scrub PHI from breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => ({
          ...breadcrumb,
          message: breadcrumb.message?.replace(/MRN:\s*\w+/gi, 'MRN: [REDACTED]'),
        }));
      }
      return event;
    },
  });
}

export { Sentry };
