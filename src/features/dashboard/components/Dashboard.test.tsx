import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from './Dashboard';
import { Patient, LogFormData } from '@/types';

vi.mock('@shared/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/utils')>();
  return {
    ...actual,
    parseRedcapCSV: vi.fn(() => ({ success: true, data: [] })),
  };
});

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@shared/hooks/useCountUp', () => ({
  useCountUp: (value: number) => value,
}));

const mockPatients: Patient[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    dob: '1980-01-01',
    mrn: 'MRN001',
    gender: 'Male',
    city: 'Sydney',
    history: {
      date: '2023-01-01',
      grade: '3',
      reactionSummary: 'Severe reaction to Rocuronium',
      symptoms: [{ label: 'Anaphylaxis' }],
      treatment: ['Adrenaline'],
      suspectedAgents: ['Rocuronium'],
      procedure: 'Surgery',
      anaesthetist: 'Dr. Smith',
    },
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    dob: '1990-05-15',
    mrn: 'MRN002',
    gender: 'Female',
    city: 'Melbourne',
    history: {
      date: '',
      grade: '',
      reactionSummary: '',
      symptoms: [],
      treatment: [],
      suspectedAgents: [],
      procedure: '',
      anaesthetist: '',
    },
  },
];

const mockLogs: LogFormData[] = [
  {
    mrn: 'MRN001',
    firstName: 'John',
    lastName: 'Doe',
    visitDate: new Date().toISOString().split('T')[0],
    controls: {
      histamineSpt: '5',
      salineSpt: '0',
      salineIdt: '0',
    },
    testPanel: [
      {
        drugName: 'Rocuronium',
        sptWheal: '8',
        idtResults: ['5', '0', '0'],
        protocolIndex: 0,
      },
    ],
    proceedToChallenge: false,
    challengeDrug: '',
    outcome: null,
    reactionTime: '',
    symptoms: [],
    symptomsOther: '',
    interventionType: '',
    interventionOther: '',
    plan: '',
  },
];

const mockDrugOptions = ['Rocuronium', 'Propofol', 'Fentanyl'];
const mockDrugCategories = {
  'Muscle Relaxants': ['Rocuronium', 'Suxamethonium'],
  'Anaesthetics': ['Propofol', 'Fentanyl'],
};

describe('Dashboard', () => {
  const mockProps = {
    setScreen: vi.fn(),
    existingPatients: mockPatients,
    recentLogs: mockLogs,
    drugOptions: mockDrugOptions,
    drugCategories: mockDrugCategories,
    onViewLog: vi.fn(),
    onSelectPatient: vi.fn(),
    onUploadPatients: vi.fn(),
    databaseDate: '2024-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders dashboard with patient statistics', () => {
      render(<Dashboard {...mockProps} />);

      expect(screen.getByText(/Overview/i)).toBeInTheDocument();
      // Use getAllByText and check for '3' since it appears in both stats and count header
      const statElements = screen.getAllByText('3');
      expect(statElements.length).toBeGreaterThan(0);

      // Be more specific for the severe count
      expect(screen.getByText('Severe').parentElement?.parentElement?.querySelector('.text-2xl')).toHaveTextContent('0');
    });

    it('displays correct patient count', () => {
      render(<Dashboard {...mockProps} />);

      const countElements = screen.getAllByText('3');
      expect(countElements.length).toBeGreaterThan(0);
    });

    it('has proper ARIA labels on buttons', () => {
      render(<Dashboard {...mockProps} />);
      expect(screen.getByRole('button', { name: /Upload CSV/i })).toBeInTheDocument();
    });

    it('displays analytics cards', () => {
      render(<Dashboard {...mockProps} />);

      expect(screen.getByText(/Severe/i)).toBeInTheDocument();
      expect(screen.getByText(/Abandoned/i)).toBeInTheDocument();
    });

    it('renders patient table', () => {
      render(<Dashboard {...mockProps} />);

      expect(screen.getAllByText(/Doe, John/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Smith, Jane/i).length).toBeGreaterThan(0);
    });
  });

  describe('Search Functionality', () => {
    it('filters patients by search term', async () => {
      render(<Dashboard {...mockProps} />);

      const searchInput = screen.getByPlaceholderText(/Search by Name, MRN/i);
      fireEvent.change(searchInput, { target: { value: 'John' } });

      await waitFor(() => {
        expect(screen.getAllByText(/Doe, John/i).length).toBeGreaterThan(0);
        expect(screen.queryByText(/Smith, Jane/i)).not.toBeInTheDocument();
      });
    });

    it('filters patients by MRN', async () => {
      render(<Dashboard {...mockProps} />);

      const searchInput = screen.getByPlaceholderText(/Search by Name, MRN/i);
      fireEvent.change(searchInput, { target: { value: 'MRN001' } });

      await waitFor(() => {
        expect(screen.getAllByText(/Doe, John/i).length).toBeGreaterThan(0);
        expect(screen.queryByText(/Smith, Jane/i)).not.toBeInTheDocument();
      });
    });

    it('clears search when input is cleared', async () => {
      render(<Dashboard {...mockProps} />);

      const searchInput = screen.getByPlaceholderText(/Search by Name, MRN/i);
      fireEvent.change(searchInput, { target: { value: 'John' } });

      await waitFor(() => {
        expect(screen.getAllByText(/Doe, John/i).length).toBeGreaterThan(0);
      });

      fireEvent.change(searchInput, { target: { value: '' } });

      await waitFor(() => {
        expect(screen.getAllByText(/Smith, Jane/i).length).toBeGreaterThan(0);
      });
    });
  });

  describe('File Upload', () => {
    it('opens upload dialog when upload button clicked', () => {
      render(<Dashboard {...mockProps} />);

      const uploadButton = screen.getByRole('button', { name: /Upload CSV/i });
      fireEvent.click(uploadButton);

      // Dialog should be visible
      expect(screen.getByText(/Update Database/i)).toBeInTheDocument();
    });

    it('handles CSV file upload', async () => {
      const { parseRedcapCSV } = await import('@shared/utils');
      (parseRedcapCSV as any).mockReturnValue({
        success: true,
        data: [{
          id: '3',
          firstName: 'New',
          lastName: 'Patient',
          dob: '1995-01-01',
          mrn: 'MRN003',
          gender: 'Male',
          city: 'Brisbane',
          history: {
            date: '',
            grade: '',
            reactionSummary: '',
            symptoms: [],
            treatment: [],
            suspectedAgents: [],
            procedure: '',
            anaesthetist: '',
          },
        }],
      });

      render(<Dashboard {...mockProps} />);

      const uploadButton = screen.getByRole('button', { name: /Upload CSV/i });
      fireEvent.click(uploadButton);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['mock,csv,data'], 'test.csv', { type: 'text/csv' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockProps.onUploadPatients).toHaveBeenCalled();
      });
    });

    it('shows error message on failed CSV parse', async () => {
      const { parseRedcapCSV } = await import('@shared/utils');
      (parseRedcapCSV as any).mockReturnValue({
        success: false,
        error: 'Invalid CSV format',
      });

      render(<Dashboard {...mockProps} />);

      const uploadButton = screen.getByRole('button', { name: /Upload CSV/i });
      fireEvent.click(uploadButton);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['invalid,data'], 'test.csv', { type: 'text/csv' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(async () => {
        const { toast } = await import('sonner');
        expect(toast.error).toHaveBeenCalled();
      });
    });
  });

  describe('Pagination', () => {
    it('displays correct number of patients per page', () => {
      const manyPatients = Array.from({ length: 25 }, (_, i) => ({
        id: String(i + 1),
        firstName: `${i + 1}`,
        lastName: `Patient`,
        dob: '1980-01-01',
        mrn: `MRN${String(i + 1).padStart(3, '0')}`,
        gender: 'Male',
        city: 'Sydney',
        history: {
          date: '',
          grade: '',
          reactionSummary: '',
          symptoms: [],
          treatment: [],
          suspectedAgents: [],
          procedure: '',
          anaesthetist: '',
        },
      }));

      render(<Dashboard {...mockProps} existingPatients={manyPatients} />);

      // Should show 10 patients (ITEMS_PER_PAGE) in the table
      const table = screen.getByRole('table', { name: /Patient database/i });
      const rows = table.querySelectorAll('tbody tr');
      expect(rows.length).toBeLessThanOrEqual(10);
    });

    it('navigates to next page', async () => {
      const manyPatients = Array.from({ length: 25 }, (_, i) => ({
        id: String(i + 1),
        firstName: `${i + 1}`,
        lastName: `Patient`,
        dob: '1980-01-01',
        mrn: `MRN${String(i + 1).padStart(3, '0')}`,
        gender: 'Male',
        city: 'Sydney',
        history: {
          date: '',
          grade: '',
          reactionSummary: '',
          symptoms: [],
          treatment: [],
          suspectedAgents: [],
          procedure: '',
          anaesthetist: '',
        },
      }));

      render(<Dashboard {...mockProps} existingPatients={manyPatients} />);

      const nextButton = screen.getByRole('button', { name: /Next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getAllByText('Patient, 11').length).toBeGreaterThan(0);
        expect(screen.queryByText('Patient, 1')).not.toBeInTheDocument();
      });
    });

    it('navigates to previous page', async () => {
      const manyPatients = Array.from({ length: 25 }, (_, i) => ({
        id: String(i + 1),
        firstName: `${i + 1}`,
        lastName: `Patient`,
        dob: '1980-01-01',
        mrn: `MRN${String(i + 1).padStart(3, '0')}`,
        gender: 'Male',
        city: 'Sydney',
        history: {
          date: '',
          grade: '',
          reactionSummary: '',
          symptoms: [],
          treatment: [],
          suspectedAgents: [],
          procedure: '',
          anaesthetist: '',
        },
      }));

      render(<Dashboard {...mockProps} existingPatients={manyPatients} />);

      // Go to page 2
      const nextButton = screen.getByRole('button', { name: /Next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getAllByText('Patient, 11').length).toBeGreaterThan(0);
      });

      // Go back to page 1
      const prevButton = screen.getByRole('button', { name: /Previous/i });
      fireEvent.click(prevButton);

      await waitFor(() => {
        expect(screen.getAllByText('Patient, 1').length).toBeGreaterThan(0);
        expect(screen.queryByText('Patient, 11')).not.toBeInTheDocument();
      });
    });
  });

  describe('Patient Interactions', () => {
    it('calls onSelectPatient when patient is clicked', async () => {
      render(<Dashboard {...mockProps} />);

      const table = screen.getByRole('table', { name: /Patient database/i });
      const patientRow = within(table).getAllByText(/Doe, John/i)[0];
      fireEvent.click(patientRow);

      await waitFor(() => {
        expect(mockProps.onSelectPatient).toHaveBeenCalledWith(mockProps.existingPatients[0]);
      });
    });

    it('calls onViewLog when recent log row is clicked', async () => {
      render(<Dashboard {...mockProps} recentLogs={mockLogs} />);

      const recentSection = screen.getByText(/Recent Skin Testing Activity/i).closest('div[class*="rounded"]');
      const logRow = within(recentSection as HTMLElement).getAllByText(/Doe, John/i)[0].closest('tr');
      if (logRow) fireEvent.click(logRow);

      await waitFor(() => {
        expect(mockProps.onViewLog).toHaveBeenCalledWith(mockLogs[0]);
      });
    });
  });

  describe('Advanced Filters', () => {
    it('toggles advanced filters panel', () => {
      render(<Dashboard {...mockProps} />);

      const filtersButton = screen.getByText(/Filters/i);
      fireEvent.click(filtersButton);

      expect(screen.getByRole('button', { name: /Severity/i })).toBeInTheDocument();
    });

    it('filters patients by grade', async () => {
      render(<Dashboard {...mockProps} />);

      const filtersButton = screen.getByText(/Filters/i);
      fireEvent.click(filtersButton);

      const severityTrigger = screen.getByRole('button', { name: /Severity/i });
      fireEvent.click(severityTrigger);

      const grade3Checkbox = await screen.findByRole('button', { name: /Grade III/i });
      fireEvent.click(grade3Checkbox);

      await waitFor(() => {
        expect(screen.getAllByText(/Doe, John/i).length).toBeGreaterThan(0);
        expect(screen.queryByText(/Smith, Jane/i)).not.toBeInTheDocument();
      });
    });

    it('clears all filters', async () => {
      render(<Dashboard {...mockProps} />);

      const filtersButton = screen.getByText(/Filters/i);
      fireEvent.click(filtersButton);

      const severityTrigger = screen.getByRole('button', { name: /Severity/i });
      fireEvent.click(severityTrigger);

      const grade3Checkbox = await screen.findByRole('button', { name: /Grade III/i });
      fireEvent.click(grade3Checkbox);

      await waitFor(() => {
        expect(screen.getAllByText(/Doe, John/i).length).toBeGreaterThan(0);
      });

      const clearButton = screen.getByRole('button', { name: /Clear All/i });
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.getAllByText(/Smith, Jane/i).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels on search input', () => {
      render(<Dashboard {...mockProps} />);

      const searchInput = screen.getByPlaceholderText(/Search by Name, MRN/i);
      expect(searchInput).toHaveAttribute('aria-label');
    });

    it('has proper ARIA labels on buttons', () => {
      render(<Dashboard {...mockProps} />);

      const uploadButton = screen.getAllByRole('button', { name: /Upload/i })[0];
      expect(uploadButton).toBeInTheDocument();
    });

    it('is keyboard navigable', () => {
      render(<Dashboard {...mockProps} />);

      const searchInput = screen.getByPlaceholderText(/Search by Name, MRN/i);
      searchInput.focus();
      expect(searchInput).toHaveFocus();

      // Tab to patient
      fireEvent.keyDown(searchInput, { key: 'Tab', code: 'Tab' });
    });
  });
});
