import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';
import { Sentry } from './sentry';
import { env } from './env';

export function reportWebVitals() {
  if (env.VITE_ENVIRONMENT === 'test') return;

  const sendToSentry = (name: string, value: number) => {
    Sentry.captureMessage(`Web Vitals: ${name}`, {
      level: 'info',
      extra: {
        value,
        unit: 'ms',
      },
    });
  };

  onCLS((metric) => sendToSentry('CLS', metric.value));
  onFID((metric) => sendToSentry('FID', metric.value));
  onFCP((metric) => sendToSentry('FCP', metric.value));
  onLCP((metric) => sendToSentry('LCP', metric.value));
  onTTFB((metric) => sendToSentry('TTFB', metric.value));
}
