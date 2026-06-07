import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TestingPlanGenerator from './TestingPlanGenerator';
import { createMockPatient } from '@/src/test/factories/patientFactory';
import { TESTING_PLAN_BUILDER_DRAFTS_KEY } from '@shared/utils/ttlStorage';

const drugCategories = {
  Hypnotics: ['Ketamine'],
  Others: ['Chlorhexidine', 'Latex'],
};

const patient = createMockPatient({
  id: 'PLAN-001',
  history: {
    ...createMockPatient().history,
    date: '2024-03-15',
    testingPlan: [],
    medications: [],
  },
});

function renderGenerator(onPreview = vi.fn()) {
  render(
    <TestingPlanGenerator
      patient={patient}
      drugCategories={drugCategories}
      onPreview={onPreview}
    />
  );
  return { onPreview };
}

describe('TestingPlanGenerator', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('opens by default, summarizes selected drugs, and exposes pressed state', () => {
    renderGenerator();

    expect(screen.getByText('Select Drugs for Testing')).toBeInTheDocument();
    expect(screen.getByText('2 drugs selected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Chlorhexidine/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Date of Reaction')).toHaveAttribute('max');
  });

  it('passes the selected protocol index to preview', async () => {
    const { onPreview } = renderGenerator();

    fireEvent.click(screen.getByRole('button', { name: 'Ketamine' }));
    expect(screen.getByText('Protocol Choices')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('combobox', { name: 'Ketamine' }));
    fireEvent.click(await screen.findByRole('option', { name: /1:100 start/i }));

    fireEvent.click(screen.getByRole('button', { name: /Preview & Print Plan/i }));

    expect(onPreview).toHaveBeenCalledWith(expect.objectContaining({
      selectedProtocols: expect.objectContaining({ Ketamine: 1 }),
    }));
  });

  it('restores a per-patient builder draft from TTL storage', async () => {
    localStorage.setItem(TESTING_PLAN_BUILDER_DRAFTS_KEY, JSON.stringify({
      savedAt: Date.now(),
      value: {
        [patient.id]: {
          selectedDrugs: ['Ketamine'],
          selectedProtocols: { Ketamine: 1 },
          customDrugs: [],
          notes: 'Restore this plan',
          urgent: true,
          reactionDate: '2024-02-10',
          documentsToChase: {
            tryptases: true,
            anaestheticChart: false,
            other: false,
            otherText: '',
          },
        },
      },
    }));

    const { onPreview } = renderGenerator();

    await waitFor(() => expect(screen.getByDisplayValue('Restore this plan')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Ketamine' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: /Preview & Print Plan/i }));
    expect(onPreview).toHaveBeenCalledWith(expect.objectContaining({
      selectedDrugs: ['Ketamine'],
      selectedProtocols: { Ketamine: 1 },
      urgent: true,
      reactionDate: '2024-02-10',
    }));
  });

  it('keeps custom drug toggle and remove as separate accessible buttons', () => {
    renderGenerator();

    fireEvent.change(screen.getByPlaceholderText('Add custom drug...'), { target: { value: 'Test Custom' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add custom drug' }));

    expect(screen.getByRole('button', { name: 'Test Custom' })).toHaveAttribute('aria-pressed', 'true');
    const removeButton = screen.getByRole('button', { name: 'Remove custom drug Test Custom' });
    expect(removeButton).toBeInTheDocument();

    fireEvent.click(removeButton);
    expect(screen.queryByRole('button', { name: 'Test Custom' })).not.toBeInTheDocument();
  });

  it('deduplicates known drugs entered as custom drugs', () => {
    renderGenerator();

    fireEvent.change(screen.getByPlaceholderText('Add custom drug...'), { target: { value: 'ketamine' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add custom drug' }));

    expect(screen.getByText('Ketamine is already in the master list and has been selected from its category.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ketamine' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', { name: 'Remove custom drug ketamine' })).not.toBeInTheDocument();
  });
});
