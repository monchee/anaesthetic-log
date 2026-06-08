import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PatientHistory from './PatientHistory';
import { createMockPatient, createMockPatientHistory } from '@/src/test/factories/patientFactory';

function renderHistory(historyOverrides: Parameters<typeof createMockPatientHistory>[0] = {}) {
  const patient = createMockPatient({
    history: createMockPatientHistory(historyOverrides),
  });

  return render(<PatientHistory patient={patient} />);
}

describe('PatientHistory serum tryptase display', () => {
  it('renders multiple tryptase samples in order with time and result', () => {
    renderHistory({
      tryptases: [
        { time: '09:15', result: '4.2' },
        { time: '10:15', result: '19.8' },
        { time: '13:00', result: '7.1' },
      ],
    });

    const table = screen.getByRole('table', { name: /serum tryptase samples/i });
    const rows = within(table).getAllByRole('row');

    expect(rows).toHaveLength(4);
    expect(within(rows[1]).getByText('T1')).toBeInTheDocument();
    expect(within(rows[1]).getByText('09:15')).toBeInTheDocument();
    expect(within(rows[1]).getByText('4.2')).toBeInTheDocument();
    expect(within(rows[2]).getByText('T2')).toBeInTheDocument();
    expect(within(rows[2]).getByText('10:15')).toBeInTheDocument();
    expect(within(rows[2]).getByText('19.8')).toBeInTheDocument();
    expect(within(rows[3]).getByText('T3')).toBeInTheDocument();
    expect(within(rows[3]).getByText('13:00')).toBeInTheDocument();
    expect(within(rows[3]).getByText('7.1')).toBeInTheDocument();
  });

  it('highlights the numeric peak row and summarizes the peak in the header chip', () => {
    renderHistory({
      tryptases: [
        { time: '09:15', result: '4.2' },
        { time: '10:15', result: '19.8' },
        { time: '13:00', result: '7.1' },
      ],
    });

    expect(screen.getByText('peak 19.8 μg/L')).toBeInTheDocument();

    const peakTag = screen.getByText('Peak');
    const peakRow = peakTag.closest('tr');
    expect(peakRow).not.toBeNull();
    expect(within(peakRow as HTMLTableRowElement).getByText('T2')).toBeInTheDocument();
    expect(within(peakRow as HTMLTableRowElement).getByText('19.8')).toBeInTheDocument();
    expect(screen.getAllByText('Peak')).toHaveLength(1);
  });

  it('renders a single sample without a peak tag and keeps the single-value chip', () => {
    renderHistory({
      tryptases: [{ time: '09:15', result: '4.2' }],
    });

    expect(screen.getByText('T1 (09:15): 4.2')).toBeInTheDocument();
    expect(screen.getByRole('table', { name: /serum tryptase samples/i })).toBeInTheDocument();
    expect(screen.queryByText('Peak')).not.toBeInTheDocument();
  });

  it('lists non-numeric results without a peak tag or crash', () => {
    renderHistory({
      tryptases: [
        { time: '09:15', result: '<1' },
        { time: '10:15', result: 'Not elevated' },
      ],
    });

    expect(screen.getByText('2 samples')).toBeInTheDocument();
    expect(screen.getByText('<1')).toBeInTheDocument();
    expect(screen.getByText('Not elevated')).toBeInTheDocument();
    expect(screen.queryByText('Peak')).not.toBeInTheDocument();
  });

  it('shows legacy free-text tryptase in the chip without rendering a table', () => {
    renderHistory({
      tryptase: 'Borderline elevated, see scanned pathology report',
      tryptases: undefined,
    });

    expect(screen.getByText('Borderline elevated, see scanned pathology report')).toBeInTheDocument();
    expect(screen.queryByRole('table', { name: /serum tryptase samples/i })).not.toBeInTheDocument();
  });

  it('renders no tryptase chip or section when no tryptase data is present', () => {
    renderHistory({
      tryptase: undefined,
      tryptases: undefined,
    });

    expect(screen.queryByText('Tryptase:')).not.toBeInTheDocument();
    expect(screen.queryByText('Serum Tryptase')).not.toBeInTheDocument();
    expect(screen.queryByRole('table', { name: /serum tryptase samples/i })).not.toBeInTheDocument();
  });
});
