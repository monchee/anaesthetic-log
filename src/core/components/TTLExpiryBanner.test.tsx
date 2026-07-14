import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TTLExpiryBanner from './TTLExpiryBanner';
import { formatTime } from '@shared/utils';

describe('TTLExpiryBanner', () => {
  it('shows the expiry time and invokes the explicit keep-working action', () => {
    const expiresAt = new Date('2026-07-14T16:29:00+10:00').getTime();
    const onKeepWorking = vi.fn();

    render(
      <TTLExpiryBanner
        expiresAt={expiresAt}
        onKeepWorking={onKeepWorking}
        onDismiss={vi.fn()}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      `Local clinical data expires at ${formatTime(expiresAt)}`,
    );

    fireEvent.click(screen.getByRole('button', {
      name: 'Keep working (resets 6-hour timer)',
    }));
    expect(onKeepWorking).toHaveBeenCalledOnce();
  });
});
