import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from './Dashboard';
import { Patient, LogFormData } from '../types';

// Mock dependencies
vi.mock('../lib/utils', () => ({
  formatDate: (date: Date) => date.toLocaleDateString(),
  parseRedcapCSV: vi.fn(() => ({ success: true, data: [] })),
  getGradeVariant: (grade: string) => 'default',
  parsePatientTimeline: vi.fn(() => []),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../hooks/useCountUp', () => ({
  useCountUp: (value: number) => value,
}));

const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'John Doe',
    dob: '1980-01-01',
    mrn: 'MRN001',
    gender: 'Male',
    city: 'Sydney',
    reaction_history: [
      {
        drug: 'Rocuronium',
        grade: '3',
        outcome: 'Abandoned',
      },
    ],
  },
  {
    id: '2',
    name: 'Jane Smith',
    dob: '1990-05-15',
    mrn: 'MRN002',
    gender: 'Female',
    city: 'Melbourne',
    reaction_history: [],
  },
];

const mockLogs: LogFormData[] = [
  {
    patient: mockPatients[0],
    testingDate: new Date().toISOString(),
    drugs: ['Rocuronium'],
    testTypes: {
      Rocuronium: ['SPT', 'IDT'],
    },
    testResults: {},
    symptoms: [],
    challenge: null,
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

      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Patients/i)).toBeInTheDocument();
    });

    it('displays correct patient count', () => {
      render(<Dashboard {...mockProps} />);

      expect(screen.getByText('2')).toBeInTheDocument(); // Total patients
    });

    it('displays analytics cards', () => {
      render(<Dashboard {...mockProps} />);

      expect(screen.getByText(/Grade 3\+ Reactions/i)).toBeInTheDocument();
      expect(screen.getByText(/Abandoned/i)).toBeInTheDocument();
    });

    it('renders patient table', () => {
      render(<Dashboard {...mockProps} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('filters patients by search term', async () => {
      render(<Dashboard {...mockProps} />);

      const searchInput = screen.getByPlaceholderText(/Search patients/i);
      fireEvent.change(searchInput, { target: { value: 'John' } });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });

    it('filters patients by MRN', async () => {
      render(<Dashboard {...mockProps} />);

      const searchInput = screen.getByPlaceholderText(/Search patients/i);
      fireEvent.change(searchInput, { target: { value: 'MRN001' } });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });

    it('clears search when input is cleared', async () => {
      render(<Dashboard {...mockProps} />);

      const searchInput = screen.getByPlaceholderText(/Search patients/i);
      fireEvent.change(searchInput, { target: { value: 'John' } });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      fireEvent.change(searchInput, { target: { value: '' } });

      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });
  });

  describe('File Upload', () => {
    it('opens upload dialog when upload button clicked', () => {
      render(<Dashboard {...mockProps} />);

      const uploadButton = screen.getByText(/Upload Database/i);
      fireEvent.click(uploadButton);

      // Dialog should be visible
      expect(screen.getByText(/Upload Patient Database/i)).toBeInTheDocument();
    });

    it('handles CSV file upload', async () => {
      const { parseRedcapCSV } = await import('../lib/utils');
      (parseRedcapCSV as any).mockReturnValue({
        success: true,
        data: [...mockPatients, { id: '3', name: 'New Patient', dob: '1995-01-01', mrn: 'MRN003', gender: 'Male', city: 'Brisbane', reaction_history: [] }],
      });

      render(<Dashboard {...mockProps} />);

      const uploadButton = screen.getByText(/Upload Database/i);
      fireEvent.click(uploadButton);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['mock,csv,data'], 'test.csv', { type: 'text/csv' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockProps.onUploadPatients).toHaveBeenCalled();
      });
    });

    it('shows error message on failed CSV parse', async () => {
      const { parseRedcapCSV } = await import('../lib/utils');
      (parseRedcapCSV as any).mockReturnValue({
        success: false,
        error: 'Invalid CSV format',
      });

      render(<Dashboard {...mockProps} />);

      const uploadButton = screen.getByText(/Upload Database/i);
      fireEvent.click(uploadButton);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['invalid,data'], 'test.csv', { type: 'text/csv' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        const toast = await import('react-hot-toast');
        expect(toast.default.error).toHaveBeenCalled();
      });
    });
  });

  describe('Pagination', () => {
    it('displays correct number of patients per page', () => {
      const manyPatients = Array.from({ length: 25 }, (_, i) => ({
        id: String(i + 1),
        name: `Patient ${i + 1}`,
        dob: '1980-01-01',
        mrn: `MRN${String(i + 1).padStart(3, '0')}`,
        gender: 'Male',
        city: 'Sydney',
        reaction_history: [],
      }));

      render(<Dashboard {...mockProps} existingPatients={manyPatients} />);

      // Should show 10 patients (ITEMS_PER_PAGE)
      const patientRows = screen.getAllByText(/Patient \d+/);
      expect(patientRows.length).toBeLessThanOrEqual(10);
    });

    it('navigates to next page', async () => {
      const manyPatients = Array.from({ length: 25 }, (_, i) => ({
        id: String(i + 1),
        name: `Patient ${i + 1}`,
        dob: '1980-01-01',
        mrn: `MRN${String(i + 1).padStart(3, '0')}`,
        gender: 'Male',
        city: 'Sydney',
        reaction_history: [],
      }));

      render(<Dashboard {...mockProps} existingPatients={manyPatients} />);

      const nextButton = screen.getByRole('button', { name: /Next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Patient 11')).toBeInTheDocument();
        expect(screen.queryByText('Patient 1')).not.toBeInTheDocument();
      });
    });

    it('navigates to previous page', async () => {
      const manyPatients = Array.from({ length: 25 }, (_, i) => ({
        id: String(i + 1),
        name: `Patient ${i + 1}`,
        dob: '1980-01-01',
        mrn: `MRN${String(i + 1).padStart(3, '0')}`,
        gender: 'Male',
        city: 'Sydney',
        reaction_history: [],
      }));

      render(<Dashboard {...mockProps} existingPatients={manyPatients} />);

      // Go to page 2
      const nextButton = screen.getByRole('button', { name: /Next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Patient 11')).toBeInTheDocument();
      });

      // Go back to page 1
      const prevButton = screen.getByRole('button', { name: /Previous/i });
      fireEvent.click(prevButton);

      await waitFor(() => {
        expect(screen.getByText('Patient 1')).toBeInTheDocument();
        expect(screen.queryByText('Patient 11')).not.toBeInTheDocument();
      });
    });
  });

  describe('Patient Interactions', () => {
    it('calls onSelectPatient when patient is clicked', async () => {
      render(<Dashboard {...mockProps} />);

      const patientRow = screen.getByText('John Doe');
      fireEvent.click(patientRow);

      await waitFor(() => {
        expect(mockProps.onSelectPatient).toHaveBeenCalledWith(mockPatients[0]);
      });
    });

    it('calls onViewLog when view log button is clicked', async () => {
      render(<Dashboard {...mockProps} recentLogs={mockLogs} />);

      const viewLogButton = screen.getByRole('button', { name: /View Log/i });
      fireEvent.click(viewLogButton);

      await waitFor(() => {
        expect(mockProps.onViewLog).toHaveBeenCalledWith(mockLogs[0]);
      });
    });
  });

  describe('Advanced Filters', () => {
    it('toggles advanced filters panel', () => {
      render(<Dashboard {...mockProps} />);

      const filtersButton = screen.getByText(/Advanced Filters/i);
      fireEvent.click(filtersButton);

      expect(screen.getByText(/Filter by reaction grade/i)).toBeInTheDocument();
    });

    it('filters patients by grade', async () => {
      render(<Dashboard {...mockProps} />);

      const filtersButton = screen.getByText(/Advanced Filters/i);
      fireEvent.click(filtersButton);

      const grade3Checkbox = screen.getByLabelText(/Grade 3/i);
      fireEvent.click(grade3Checkbox);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });

    it('clears all filters', async () => {
      render(<Dashboard {...mockProps} />);

      const filtersButton = screen.getByText(/Advanced Filters/i);
      fireEvent.click(filtersButton);

      const grade3Checkbox = screen.getByLabelText(/Grade 3/i);
      fireEvent.click(grade3Checkbox);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const clearButton = screen.getByRole('button', { name: /Clear Filters/i });
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels on search input', () => {
      render(<Dashboard {...mockProps} />);

      const searchInput = screen.getByPlaceholderText(/Search patients/i);
      expect(searchInput).toHaveAttribute('aria-label');
    });

    it('has proper ARIA labels on buttons', () => {
      render(<Dashboard {...mockProps} />);

      const uploadButton = screen.getByRole('button', { name: /Upload Database/i });
      expect(uploadButton).toBeInTheDocument();
    });

    it('is keyboard navigable', () => {
      render(<Dashboard {...mockProps} />);

      const searchInput = screen.getByPlaceholderText(/Search patients/i);
      searchInput.focus();
      expect(searchInput).toHaveFocus();

      // Tab to patient
      fireEvent.keyDown(searchInput, { key: 'Tab', code: 'Tab' });
    });
  });
});
