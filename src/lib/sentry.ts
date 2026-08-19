import { env } from './env';
import type { ErrorEvent as SentryErrorEvent } from '@sentry/react';

type SentryModule = typeof import('@sentry/react');

const sentryEnabled = Boolean(env.VITE_SENTRY_DSN) && env.VITE_ENVIRONMENT !== 'test';
let sentryModulePromise: Promise<SentryModule | null> | null = null;
let initPromise: Promise<void> | null = null;

async function loadSentry(): Promise<SentryModule | null> {
  if (!sentryEnabled) return null;
  sentryModulePromise ??= import('@sentry/react');
  return sentryModulePromise;
}

/**
 * Patterns that may identify a patient if interpolated into an error or
 * log message. Names cannot be pattern-matched; this is defence-in-depth
 * for structured identifiers, not a substitute for never logging PHI.
 */
const PHI_PATTERNS: Array<[RegExp, string]> = [
  [/MRN:?\s*[\w-]+/gi, 'MRN: [REDACTED]'],
  [/\bREC-\d+\b/g, '[RECORD-ID]'],
  [/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g, '[DATE]'], // DOB-shaped dates
];

const scrubText = (text: string): string =>
  PHI_PATTERNS.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), text);

/**
 * Scrubs potential PHI from every text surface of an outgoing Sentry event.
 * Pure and exported so it is unit-testable without initializing Sentry.
 */
export function scrubPhiFromEvent(event: SentryErrorEvent): SentryErrorEvent {
  if (event.request) {
    delete event.request.cookies;
  }
  if (event.user) {
    event.user.id = 'anonymized';
    delete event.user.email;
    delete event.user.username;
    delete event.user.ip_address;
  }
  if (event.message) {
    event.message = scrubText(event.message);
  }
  if (event.exception?.values) {
    for (const value of event.exception.values) {
      if (value.value) value.value = scrubText(value.value);
    }
  }
  // Free-form context attached at capture sites can carry anything; scrub
  // string values rather than trusting each future call site.
  if (event.extra) {
    for (const key of Object.keys(event.extra)) {
      const v = event.extra[key];
      if (typeof v === 'string') event.extra[key] = scrubText(v);
    }
  }
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => ({
      ...breadcrumb,
      message: breadcrumb.message ? scrubText(breadcrumb.message) : breadcrumb.message,
    }));
  }
  return event;
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
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      sendDefaultPii: false,
      beforeSend(event) {
        return scrubPhiFromEvent(event);
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
