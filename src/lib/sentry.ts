import { env } from './env';

type SentryModule = typeof import('@sentry/react');

const sentryEnabled = Boolean(env.VITE_SENTRY_DSN) && env.VITE_ENVIRONMENT !== 'test';
let sentryModulePromise: Promise<SentryModule | null> | null = null;
let initPromise: Promise<void> | null = null;

async function loadSentry(): Promise<SentryModule | null> {
  if (!sentryEnabled) return null;
  sentryModulePromise ??= import('@sentry/react');
  return sentryModulePromise;
}

export function initSentry(): Promise<void> {
  if (!sentryEnabled) return Promise.resolve();
  initPromise ??= loadSentry().then((Sentry) => {
    if (!Sentry) return;
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
  });
  return initPromise;
}

export async function captureMessage(
  message: string,
  context?: Parameters<SentryModule['captureMessage']>[1],
): Promise<void> {
  await initSentry();
  const Sentry = await loadSentry();
  if (!Sentry) return;
  Sentry.captureMessage(message, context);
}

export async function captureException(
  exception: unknown,
  context?: Parameters<SentryModule['captureException']>[1],
): Promise<void> {
  await initSentry();
  const Sentry = await loadSentry();
  if (!Sentry) return;
  Sentry.captureException(exception, context);
}
