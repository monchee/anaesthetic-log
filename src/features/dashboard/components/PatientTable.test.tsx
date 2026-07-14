import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Patient } from '@/types';
import { INITIAL_FILTERS } from '../hooks/useAdvancedSearch';
import PatientTable from './PatientTable';

const ttlStorageMocks = vi.hoisted(() => ({
  getIfFresh: vi.fn(),
}));

vi.mock('@shared/utils/ttlStorage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/utils/ttlStorage')>();
  return {
    ...actual,
    getIfFresh: ttlStorageMocks.getIfFresh,
  };
});

interface StoredWorkflowData {
  planDrafts?: Record<string, unknown> | null;
  testingDraft?: { mrn?: string } | null;
  activeReport?: { mrn?: string } | null;
}

function makePatient(
  id: string,
  firstName: string,
  documentsToChase?: Patient['history']['documentsToChase'],
): Patient {
  return {
    id,
    firstName,
    lastName: 'Worklist',
    dob: '1980-01-01',
    mrn: `MRN-${id}`,
    gender: 'Female',
    city: 'Sydney',
    history: {
      date: '2026-07-14',
      grade: '2',
      reactionSummary: 'Reaction summary',
      symptoms: [],
      treatment: [],
      suspectedAgents: [],
      procedure: 'Procedure',
      anaesthetist: 'Anaesthetist',
      documentsToChase,
    },
  };
}

const referralPatient = makePatient('referral', 'Referral');
const planPatient = makePatient('plan', 'Plan');
const testingPatient = makePatient('testing', 'Testing');
const reportedPatient = makePatient('reported', 'Reported');

function renderTable(
  patients: Patient[],
  storedData: StoredWorkflowData = {},
) {
  ttlStorageMocks.getIfFresh.mockImplementation((key: string) => {
    if (key === 'dream:testing_plan_builder_drafts') return storedData.planDrafts ?? null;
    if (key === 'dream:testing_draft') return storedData.testingDraft ?? null;
    if (key === 'dream:active_report') return storedData.activeReport ?? null;
    return null;
  });

  return render(
    <PatientTable
      filteredPatients={patients}
      currentPage={1}
      ITEMS_PER_PAGE={10}
      filters={INITIAL_FILTERS}
      updateFilter={vi.fn()}
      clearFilters={vi.fn()}
      activeFilterCount={0}
      suggestions={{ procedures: [], hospitals: [], agents: [] }}
      isFiltersExpanded={false}
      setIsFiltersExpanded={vi.fn()}
      databaseDate="2026-07-14"
      onSelectPatient={vi.fn()}
      handleFileUpload={vi.fn()}
      isSheetOpen={false}
      setIsSheetOpen={vi.fn()}
      isUploading={false}
      fileInputRef={React.createRef<HTMLInputElement>()}
      handleNextPage={vi.fn()}
      handlePrevPage={vi.fn()}
      resetPage={vi.fn()}
      allPatients={patients}
    />,
  );
}

function patientTable() {
  return within(screen.getByRole('table', { name: 'Patient database' }));
}

function expectPatientVisible(firstName: string) {
  expect(patientTable().getByRole('button', {
    name: `View details for patient: ${firstName} Worklist`,
  })).toBeInTheDocument();
}

function expectPatientHidden(firstName: string) {
  expect(patientTable().queryByRole('button', {
    name: `View details for patient: ${firstName} Worklist`,
  })).not.toBeInTheDocument();
}

describe('PatientTable worklist', () => {
  beforeEach(() => {
    ttlStorageMocks.getIfFresh.mockReset();
  });

  it('renders the four workflow status labels from the stored workflow snapshot', () => {
    renderTable(
      [referralPatient, planPatient, testingPatient, reportedPatient],
      {
        planDrafts: { [planPatient.id]: {} },
        testingDraft: { mrn: testingPatient.mrn },
        activeReport: { mrn: reportedPatient.mrn },
      },
    );

    const table = patientTable();
    expect(table.getByText('Referral')).toBeInTheDocument();
    expect(table.getByText('Plan drafted')).toBeInTheDocument();
    expect(table.getByText('Testing')).toBeInTheDocument();
    expect(table.getByText('Reported')).toBeInTheDocument();
    expect(ttlStorageMocks.getIfFresh).toHaveBeenCalledTimes(3);
  });

  it('shows not-yet-reported patients and excludes a fully reported patient in Needs action', () => {
    renderTable(
      [referralPatient, planPatient, reportedPatient],
      {
        planDrafts: { [planPatient.id]: {} },
        activeReport: { mrn: reportedPatient.mrn },
      },
    );

    fireEvent.click(screen.getByRole('button', { name: 'Needs action' }));

    expectPatientVisible('Referral');
    expectPatientVisible('Plan');
    expectPatientHidden('Reported');
  });

  it('keeps a reported patient with outstanding documents in Needs action', () => {
    const reportedWithDocs = makePatient('reported-docs', 'ReportedDocs', { tryptases: true });
    renderTable(
      [reportedWithDocs],
      { activeReport: { mrn: reportedWithDocs.mrn } },
    );

    fireEvent.click(screen.getByRole('button', { name: 'Needs action' }));

    expectPatientVisible('ReportedDocs');
    expect(patientTable().getByText('Docs outstanding')).toBeInTheDocument();
  });

  it('shows only reported patients in Reported and restores everyone in All', () => {
    renderTable(
      [referralPatient, reportedPatient],
      { activeReport: { mrn: reportedPatient.mrn } },
    );

    fireEvent.click(screen.getByRole('button', { name: 'Reported' }));
    expectPatientHidden('Referral');
    expectPatientVisible('Reported');

    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    expectPatientVisible('Referral');
    expectPatientVisible('Reported');
  });

  it('renders a quick-filter empty state when no patients are reported', () => {
    renderTable([referralPatient]);

    fireEvent.click(screen.getByRole('button', { name: 'Reported' }));

    expect(patientTable().getByText('No patients match this filter.')).toBeInTheDocument();
  });
});
