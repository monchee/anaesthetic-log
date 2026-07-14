import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TestingPlanGenerator from './TestingPlanGenerator';
import { createMockPatient } from '@/src/test/factories/patientFactory';
import { TESTING_PLAN_BUILDER_DRAFTS_KEY } from '@shared/utils/ttlStorage';

const drugCategories = {
  'Muscle Relaxants': ['Cis-atracurium'],
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

function renderGenerator(onPreview = vi.fn(), targetPatient = patient) {
  render(
    <TestingPlanGenerator
      patient={targetPatient}
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

  it('shows when its plan-builder draft was saved', async () => {
    renderGenerator();

    const indicator = await screen.findByText(/Draft saved · \d{2}:\d{2}/);
    expect(indicator).toHaveAttribute('aria-live', 'polite');
  });

  it('passes the selected protocol index to preview', async () => {
    const { onPreview } = renderGenerator();

    fireEvent.click(screen.getByRole('button', { name: 'Ketamine' }));
    expect(screen.getByText('Protocol Choices')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('combobox', { name: 'Ketamine' }));
    fireEvent.click(await screen.findByRole('option', { name: /1:100 start/i }));

    fireEvent.click(screen.getByRole('button', { name: /Preview & Print Request Form/i }));

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

    fireEvent.click(screen.getByRole('button', { name: /Preview & Print Request Form/i }));
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
    expect(screen.queryByText('(not listed)')).not.toBeInTheDocument();
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

  it('preselects Cis-atracurium when reaction history uses the unhyphenated REDCap spelling', () => {
    // REDCap's reaction form stores "Cisatracurium" (no hyphen) while the
    // masterlist canonical name is "Cis-atracurium" — the matcher must bridge them.
    const patientWithReactionDrug = createMockPatient({
      id: 'PLAN-CISATRA',
      history: {
        ...patient.history,
        testingPlan: [],
        medications: ['Cisatracurium'],
      },
    });

    renderGenerator(vi.fn(), patientWithReactionDrug);

    expect(screen.getByRole('button', { name: /Cis-atracurium/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('surfaces REDCap Others text and adds it as a selected custom item', async () => {
    const patientWithRedcapOther = createMockPatient({
      id: 'PLAN-REDCAP-OTHER',
      history: {
        ...patient.history,
        testingPlanCustom: 'Sodium citrate flush',
      },
    });

    renderGenerator(vi.fn(), patientWithRedcapOther);

    expect(screen.getByText('From REDCap — Others (not listed)')).toBeInTheDocument();
    expect(screen.getByText('Sodium citrate flush')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Add as custom item/i }));

    await waitFor(() => {
      expect(screen.queryByText('From REDCap — Others (not listed)')).not.toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Sodium citrate flush.*not listed/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('(not listed)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove custom drug Sodium citrate flush' })).toBeInTheDocument();
  });
});
