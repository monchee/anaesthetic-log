import { describe, expect, it } from 'vitest';
import { scrubPhiFromEvent } from './sentry';

type SentryEvent = Parameters<typeof scrubPhiFromEvent>[0];

describe('scrubPhiFromEvent', () => {
  it('scrubs MRNs from exception messages', () => {
    const event = {
      type: undefined,
      exception: {
        values: [{ value: 'Failed to save MRN: 12345 for patient' }],
      },
    } as SentryEvent;

    const result = scrubPhiFromEvent(event);

    expect(result.exception?.values?.[0].value).toContain('MRN: [REDACTED]');
    expect(result.exception?.values?.[0].value).not.toContain('12345');
  });

  it('scrubs REDCap IDs and REDCap Record IDs from exception messages', () => {
    const event1 = {
      type: undefined,
      exception: {
        values: [{ value: 'Failed to save REDCap ID: 12345 for patient' }],
      },
    } as SentryEvent;
    const result1 = scrubPhiFromEvent(event1);
    expect(result1.exception?.values?.[0].value).toContain('REDCap ID: [REDACTED]');
    expect(result1.exception?.values?.[0].value).not.toContain('12345');

    const event2 = {
      type: undefined,
      exception: {
        values: [{ value: 'Failed to save REDCap Record ID: 67890 for patient' }],
      },
    } as SentryEvent;
    const result2 = scrubPhiFromEvent(event2);
    expect(result2.exception?.values?.[0].value).toContain('REDCap Record ID: [REDACTED]');
    expect(result2.exception?.values?.[0].value).not.toContain('67890');

    const event3 = {
      type: undefined,
      exception: {
        values: [{ value: 'Failed to save REDCap Record ID (secondary): 99999 for patient' }],
      },
    } as SentryEvent;
    const result3 = scrubPhiFromEvent(event3);
    expect(result3.exception?.values?.[0].value).toContain('REDCap Record ID: [REDACTED]');
    expect(result3.exception?.values?.[0].value).not.toContain('99999');
  });

  it('scrubs record IDs from event messages', () => {
    const event = { type: undefined, message: 'lookup failed for REC-441' } as SentryEvent;

    const result = scrubPhiFromEvent(event);

    expect(result.message).toContain('[RECORD-ID]');
    expect(result.message).not.toContain('REC-441');
  });

  it('scrubs DOB-shaped dates from event messages', () => {
    const event = { type: undefined, message: 'invalid DOB 04/03/1980' } as SentryEvent;

    const result = scrubPhiFromEvent(event);

    expect(result.message).toContain('[DATE]');
    expect(result.message).not.toContain('04/03/1980');
  });

  it('scrubs string values from extras', () => {
    const event = {
      type: undefined,
      extra: {
        note: 'MRN: 99',
        redcapNote: 'REDCap ID: 101',
        recordNote: 'REDCap Record ID: 202',
        componentStack: 'at Foo',
      },
    } as SentryEvent;

    const result = scrubPhiFromEvent(event);

    expect(result.extra?.note).toBe('MRN: [REDACTED]');
    expect(result.extra?.redcapNote).toBe('REDCap ID: [REDACTED]');
    expect(result.extra?.recordNote).toBe('REDCap Record ID: [REDACTED]');
    expect(result.extra?.componentStack).toBe('at Foo');
  });

  it('anonymizes user identity fields', () => {
    const event = {
      type: undefined,
      user: { id: 'u1', email: 'a@b.c' },
    } as SentryEvent;

    const result = scrubPhiFromEvent(event);

    expect(result.user?.id).toBe('anonymized');
    expect(result.user).not.toHaveProperty('email');
  });

  it('scrubs MRNs from breadcrumb messages', () => {
    const event = {
      type: undefined,
      breadcrumbs: [{ message: 'MRN: 7' }, { message: 'REDCap ID: 8' }, { message: 'REDCap Record ID: 9' }],
    } as SentryEvent;

    const result = scrubPhiFromEvent(event);

    expect(result.breadcrumbs?.[0].message).toBe('MRN: [REDACTED]');
    expect(result.breadcrumbs?.[1].message).toBe('REDCap ID: [REDACTED]');
    expect(result.breadcrumbs?.[2].message).toBe('REDCap Record ID: [REDACTED]');
  });

  it('passes through events without scrubbed fields', () => {
    const event = { type: undefined, level: 'error' } as SentryEvent;

    const result = scrubPhiFromEvent(event);

    expect(result).toBe(event);
    expect(result).toEqual({ type: undefined, level: 'error' });
  });
});
