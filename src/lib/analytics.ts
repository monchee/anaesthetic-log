import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';
import { captureMessage } from './sentry';
import { env } from './env';

export function reportWebVitals() {
  if (env.VITE_ENVIRONMENT === 'test') return;

  const sendToSentry = (name: string, value: number) => {
    void captureMessage(`Web Vitals: ${name}`, {
      level: 'info',
      extra: {
        value,
        unit: 'ms',
      },
    });
  };

  onCLS((metric) => sendToSentry('CLS', metric.value));
  onINP((metric) => sendToSentry('INP', metric.value));
  onFCP((metric) => sendToSentry('FCP', metric.value));
  onLCP((metric) => sendToSentry('LCP', metric.value));
  onTTFB((metric) => sendToSentry('TTFB', metric.value));
}
