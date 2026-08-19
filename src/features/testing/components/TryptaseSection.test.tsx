import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createMockLogFormData } from '@/src/test/factories/testingDataFactory';
import type { LogFormData } from '@shared/types';
import { TryptaseSection } from './TryptaseSection';

interface HarnessProps {
  onSave: (data: LogFormData) => void;
}

function TryptaseHarness({ onSave }: HarnessProps) {
  const [formData, setFormData] = useState<LogFormData>(() => createMockLogFormData({
    tryptase: {
      obtained: true,
      significantElevation: false,
      values: [{ time: '09:15', result: '4.2' }],
      source: 'referral',
      hadReferralData: true,
    },
  }));

  return (
    <>
      <TryptaseSection
        tryptase={formData.tryptase}
        onChange={tryptase => setFormData(prev => ({ ...prev, tryptase }))}
      />
      <button type="button" onClick={() => onSave(formData)}>Save record</button>
    </>
  );
}

describe('TryptaseSection referral provenance', () => {
  it('shows the referral tag, removes it after a value edit, and saves in both states', () => {
    const onSave = vi.fn();
    render(<TryptaseHarness onSave={onSave} />);

    expect(screen.getByText('Imported from referral — verify')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save record' }));
    expect(onSave.mock.calls[0][0].tryptase).toMatchObject({
      source: 'referral',
      hadReferralData: true,
      values: [{ time: '09:15', result: '4.2' }],
    });

    fireEvent.change(screen.getByPlaceholderText('Result'), { target: { value: '7.1' } });

    expect(screen.queryByText('Imported from referral — verify')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save record' }));
    expect(onSave.mock.calls[1][0].tryptase).toMatchObject({
      source: 'entered',
      hadReferralData: true,
      values: [{ time: '09:15', result: '7.1' }],
    });
  });

  it('marks provenance as entered after the elevation toggle', () => {
    const onSave = vi.fn();
    render(<TryptaseHarness onSave={onSave} />);

    fireEvent.click(screen.getByRole('switch', { name: 'Clinically significant dynamic elevation' }));

    expect(screen.queryByText('Imported from referral — verify')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save record' }));
    expect(onSave.mock.calls[0][0].tryptase).toMatchObject({
      significantElevation: true,
      source: 'entered',
      hadReferralData: true,
    });
  });

  it('keeps the referral-history flag when samples obtained is switched off', () => {
    const onSave = vi.fn();
    render(<TryptaseHarness onSave={onSave} />);

    fireEvent.click(screen.getByRole('switch', { name: 'Tryptase samples obtained' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save record' }));

    expect(onSave.mock.calls[0][0].tryptase).toMatchObject({
      obtained: false,
      source: 'referral',
      hadReferralData: true,
    });
  });
});
