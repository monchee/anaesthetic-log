import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TestingLogForm from './TestingLogForm';
import { LogFormData, Patient } from '../types';

const mockPatient: Patient = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  dob: '1980-01-01',
  mrn: 'MRN001',
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
};

const mockFormData: LogFormData = {
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
      sptWheal: '3',
      idt100: '5',
      idt10: '8',
      idtNeat: '10',
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
};

const mockDrugCategories = {
  'Muscle Relaxants': ['Rocuronium', 'Suxamethonium'],
  'Anaesthetics': ['Propofol', 'Fentanyl'],
};

const mockSymptomOptions = ['Rash', 'Urticaria', 'Bronchospasm', 'Hypotension'];
const mockInterventionOptions = ['Adrenaline', 'Antihistamine', 'Corticosteroid', 'Fluids'];

describe('TestingLogForm', () => {
  const mockProps = {
    formData: mockFormData,
    setFormData: vi.fn(),
    onSubmit: vi.fn(),
    drugCategories: mockDrugCategories,
    symptomOptions: mockSymptomOptions,
    interventionOptions: mockInterventionOptions,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders form with patient information', () => {
      render(<TestingLogForm {...mockProps} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText(/MRN001/)).toBeInTheDocument();
    });

    it('renders drug test rows', () => {
      render(<TestingLogForm {...mockProps} />);

      expect(screen.getByText('Rocuronium')).toBeInTheDocument();
    });

    it('renders test type checkboxes', () => {
      render(<TestingLogForm {...mockProps} />);

      expect(screen.getByLabelText(/SPT/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/IDT/i)).toBeInTheDocument();
    });

    it('renders symptom selection', () => {
      render(<TestingLogForm {...mockProps} />);

      expect(screen.getByText(/Symptoms/i)).toBeInTheDocument();
    });

    it('renders intervention selection', () => {
      render(<TestingLogForm {...mockProps} />);

      expect(screen.getByText(/Interventions/i)).toBeInTheDocument();
    });

    it('renders save button', () => {
      render(<TestingLogForm {...mockProps} />);

      expect(screen.getByRole('button', { name: /Save Testing Log/i })).toBeInTheDocument();
    });
  });

  describe('Drug Selection', () => {
    it('allows adding drugs from categories', async () => {
      render(<TestingLogForm {...mockProps} />);

      const categoryButton = screen.getByText(/Muscle Relaxants/i);
      fireEvent.click(categoryButton);

      await waitFor(() => {
        expect(screen.getByText('Suxamethonium')).toBeInTheDocument();
      });
    });

    it('allows adding "Other" drug', async () => {
      render(<TestingLogForm {...mockProps} />);

      const otherButton = screen.getByText(/Other/i);
      fireEvent.click(otherButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Specify name/i)).toBeInTheDocument();
      });
    });

    it('removes drug row when remove button clicked', async () => {
      const formDataWithMultipleDrugs = {
        ...mockFormData,
        drugs: ['Rocuronium', 'Propofol'],
        testTypes: {
          Rocuronium: ['SPT'],
          Propofol: ['IDT'],
        },
        testResults: {
          Rocuronium: { sptWheal: '3' },
          Propofol: { idt10: '5' },
        },
      };

      render(<TestingLogForm {...mockProps} formData={formDataWithMultipleDrugs} />);

      const removeButtons = screen.getAllByTitle(/Remove drug/i);
      fireEvent.click(removeButtons[0]);

      await waitFor(() => {
        expect(mockProps.setFormData).toHaveBeenCalled();
      });
    });
  });

  describe('Test Results', () => {
    it('allows entering SPT wheal size', async () => {
      render(<TestingLogForm {...mockProps} />);

      const sptInput = screen.getByPlaceholderText('-');
      fireEvent.change(sptInput, { target: { value: '5' } });

      await waitFor(() => {
        expect(mockProps.setFormData).toHaveBeenCalled();
      });
    });

    it('allows entering IDT test results', async () => {
      render(<TestingLogForm {...mockProps} />);

      const idtInputs = screen.getAllByPlaceholderText('-');
      fireEvent.change(idtInputs[1], { target: { value: '8' } });

      await waitFor(() => {
        expect(mockProps.setFormData).toHaveBeenCalled();
      });
    });

    it('highlights positive tests (≥3mm) in red', () => {
      render(<TestingLogForm {...mockProps} />);

      const positiveInputs = screen.getAllByDisplayValue('3');
      expect(positiveInputs[0]).toHaveClass('text-red-600');
    });

    it('prevents negative input in test results', () => {
      render(<TestingLogForm {...mockProps} />);

      const input = screen.getAllByPlaceholderText('-')[0];
      fireEvent.keyDown(input, { key: '-', code: 'Minus' });

      // Negative input should be prevented
      expect(input).toHaveValue('');
    });
  });

  describe('Symptoms and Interventions', () => {
    it('allows adding symptoms', async () => {
      render(<TestingLogForm {...mockProps} />);

      const symptomButton = screen.getByText('Rash');
      fireEvent.click(symptomButton);

      await waitFor(() => {
        expect(mockProps.setFormData).toHaveBeenCalled();
      });
    });

    it('allows adding interventions', async () => {
      render(<TestingLogForm {...mockProps} />);

      const interventionButton = screen.getByText('Adrenaline');
      fireEvent.click(interventionButton);

      await waitFor(() => {
        expect(mockProps.setFormData).toHaveBeenCalled();
      });
    });

    it('removes symptoms when clicked again', async () => {
      const formDataWithSymptoms = {
        ...mockFormData,
        symptoms: ['Rash', 'Urticaria'],
      };

      render(<TestingLogForm {...mockProps} formData={formDataWithSymptoms} />);

      const rashButton = screen.getByText('Rash');
      fireEvent.click(rashButton);

      await waitFor(() => {
        expect(mockProps.setFormData).toHaveBeenCalled();
      });
    });
  });

  describe('Challenge Section', () => {
    it('renders challenge toggle', () => {
      render(<TestingLogForm {...mockProps} />);

      expect(screen.getByText(/Challenge/i)).toBeInTheDocument();
    });

    it('shows challenge fields when enabled', async () => {
      render(<TestingLogForm {...mockProps} />);

      const challengeToggle = screen.getByRole('checkbox', { name: /Challenge/i });
      fireEvent.click(challengeToggle);

      await waitFor(() => {
        expect(screen.getByText(/Challenge Drug/i)).toBeInTheDocument();
      });
    });

    it('allows entering challenge details', async () => {
      render(<TestingLogForm {...mockProps} />);

      const challengeToggle = screen.getByRole('checkbox', { name: /Challenge/i });
      fireEvent.click(challengeToggle);

      await waitFor(() => {
        const drugSelect = screen.getByText(/Select drug/i);
        expect(drugSelect).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('calls onSubmit when save button clicked', async () => {
      render(<TestingLogForm {...mockProps} />);

      const saveButton = screen.getByRole('button', { name: /Save Testing Log/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockProps.onSubmit).toHaveBeenCalled();
      });
    });

    it('validates required fields before submission', async () => {
      const emptyFormData: LogFormData = {
        mrn: '',
        firstName: '',
        lastName: '',
        visitDate: '',
        controls: {
          histamineSpt: '',
          salineSpt: '',
          salineIdt: '',
        },
        testPanel: [],
        proceedToChallenge: false,
        challengeDrug: '',
        outcome: null,
        reactionTime: '',
        symptoms: [],
        symptomsOther: '',
        interventionType: '',
        interventionOther: '',
        plan: '',
      };

      render(<TestingLogForm {...mockProps} formData={emptyFormData} />);

      const saveButton = screen.getByRole('button', { name: /Save Testing Log/i });
      fireEvent.click(saveButton);

      // Should show validation error
      await waitFor(() => {
        const error = screen.getByText(/Please select at least one drug/i);
        expect(error).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels on form inputs', () => {
      render(<TestingLogForm {...mockProps} />);

      const dateInput = screen.getByLabelText(/Testing Date/i);
      expect(dateInput).toBeInTheDocument();
    });

    it('announces form errors to screen readers', async () => {
      const emptyFormData: LogFormData = {
        mrn: '',
        firstName: '',
        lastName: '',
        visitDate: '',
        controls: {
          histamineSpt: '',
          salineSpt: '',
          salineIdt: '',
        },
        testPanel: [],
        proceedToChallenge: false,
        challengeDrug: '',
        outcome: null,
        reactionTime: '',
        symptoms: [],
        symptomsOther: '',
        interventionType: '',
        interventionOther: '',
        plan: '',
      };

      render(<TestingLogForm {...mockProps} formData={emptyFormData} />);

      const saveButton = screen.getByRole('button', { name: /Save Testing Log/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('is keyboard navigable', () => {
      render(<TestingLogForm {...mockProps} />);

      const saveButton = screen.getByRole('button', { name: /Save Testing Log/i });
      saveButton.focus();

      expect(saveButton).toHaveFocus();
    });
  });

  describe('Data Persistence', () => {
    it('preserves form data when drugs are added', async () => {
      render(<TestingLogForm {...mockProps} />);

      const addButton = screen.getByText('Propofol');
      fireEvent.click(addButton);

      await waitFor(() => {
        const calls = mockProps.setFormData.mock.calls;
        expect(calls.length).toBeGreaterThan(0);

        // Verify that previous data is preserved
        const updatedData = calls[calls.length - 1][0];
        expect(updatedData.drugs).toContain('Rocuronium');
        expect(updatedData.drugs).toContain('Propofol');
      });
    });

    it('updates test results correctly', async () => {
      render(<TestingLogForm {...mockProps} />);

      const sptInput = screen.getAllByPlaceholderText('-')[0];
      fireEvent.change(sptInput, { target: { value: '7' } });

      await waitFor(() => {
        const calls = mockProps.setFormData.mock.calls;
        const updatedData = calls[calls.length - 1][0];

        expect(updatedData.testResults.Rocuronium.sptWheal).toBe('7');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty drug categories', () => {
      const propsWithEmptyCategories = {
        ...mockProps,
        drugCategories: {},
      };

      render(<TestingLogForm {...propsWithEmptyCategories} />);

      // Should still render without errors
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('handles patient without reaction history', () => {
      const patientWithoutHistory = {
        ...mockPatient,
        reaction_history: [],
      };

      const propsWithCleanPatient = {
        ...mockProps,
        formData: {
          ...mockFormData,
          patient: patientWithoutHistory,
        },
      };

      render(<TestingLogForm {...propsWithCleanPatient} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('handles large test values', async () => {
      render(<TestingLogForm {...mockProps} />);

      const sptInput = screen.getAllByPlaceholderText('-')[0];
      fireEvent.change(sptInput, { target: { value: '999' } });

      await waitFor(() => {
        expect(mockProps.setFormData).toHaveBeenCalled();
      });
    });
  });
});
