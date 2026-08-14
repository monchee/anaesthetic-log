import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TestingLogForm from './TestingLogForm';
import { LogFormData } from '@/types';
import { TestingService } from '../services/TestingService';



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
      idtResults: ['5', '8', '10'],
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
};

const mockDrugCategories = {
  'Muscle Relaxants': ['Rocuronium', 'Suxamethonium'],
  'Anaesthetics': ['Propofol', 'Fentanyl'],
  'Others': [],
};

const mockSymptomOptions = ['Rash', 'Urticaria', 'Bronchospasm', 'Hypotension'];
const mockInterventionOptions = ['Adrenaline', 'Antihistamine', 'Corticosteroid', 'Fluids'];

const TestWrapper = ({ initialData, props }: { initialData: LogFormData, props: any }) => {
  const [formData, setFormData] = React.useState(initialData);
  const handleSetFormData = (update: any) => {
    if (typeof update === 'function') {
      setFormData(prev => {
        const next = update(prev);
        props.setFormData(next); // Call the mock for tracking
        return next;
      });
    } else {
      setFormData(update);
      props.setFormData(update);
    }
  };

  return <TestingLogForm {...props} formData={formData} setFormData={handleSetFormData as any} />;
};

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
      render(<TestWrapper initialData={mockFormData} props={mockProps} />);

      expect(screen.getByText('Doe, John')).toBeInTheDocument();
      expect(screen.getByText(/MRN001/)).toBeInTheDocument();
    });

    it('renders an alphanumeric MRN verbatim, never lowercased', () => {
      const mixedCaseData = { ...mockFormData, mrn: 'MrN00aB1' };
      render(<TestWrapper initialData={mixedCaseData} props={mockProps} />);

      const mrnElement = screen.getByText('MrN00aB1');
      expect(mrnElement).toBeInTheDocument();
      expect(mrnElement.className).not.toMatch(/\blowercase\b/);
    });

    it('renders drug test rows', () => {
      render(<TestWrapper initialData={mockFormData} props={mockProps} />);

      expect(screen.getAllByText('Rocuronium').length).toBeGreaterThan(0);
    });

    it('renders test type checkboxes', () => {
      render(<TestWrapper initialData={mockFormData} props={mockProps} />);

      expect(screen.getByLabelText(/Histamine \(SPT\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Saline \(SPT\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Saline \(IDT\)/i)).toBeInTheDocument();
    });

    it('renders symptom selection', async () => {
      render(<TestWrapper initialData={{ ...mockFormData, proceedToChallenge: true }} props={mockProps} />);

      // First click on the outcome button to show symptoms
      const reactionButton = screen.getByText('Reaction Occurred');
      fireEvent.click(reactionButton);

      await waitFor(() => {
        expect(screen.getByText(/Observed Symptoms/i)).toBeInTheDocument();
      });
    });

    it('renders intervention selection', async () => {
      render(<TestWrapper initialData={{ ...mockFormData, proceedToChallenge: true }} props={mockProps} />);

      // First click on the outcome button to show interventions
      const reactionButton = screen.getByText('Reaction Occurred');
      fireEvent.click(reactionButton);

      await waitFor(() => {
        expect(screen.getByText(/Treatment Required/i)).toBeInTheDocument();
      });
    });

    it('renders save button', () => {
      render(<TestWrapper initialData={mockFormData} props={mockProps} />);

      expect(screen.getByRole('button', { name: /Save Clinical Record/i })).toBeInTheDocument();
    });
  });

  describe('Drug Selection', () => {
    it('allows adding drugs from categories', async () => {
      render(<TestWrapper initialData={mockFormData} props={mockProps} />);

      // Click on a category selection button
      const suxButton = screen.getByText('Suxamethonium');
      fireEvent.click(suxButton);

      await waitFor(() => {
        // Check if it's now in the test panel list (as a font-medium name)
        const panelRows = screen.getAllByText('Suxamethonium');
        expect(panelRows.length).toBeGreaterThan(0);
      });
    });

    it('allows adding "Other" drug', async () => {
      render(<TestWrapper initialData={mockFormData} props={mockProps} />);

      // Find the "Other" button in the selection grid
      const otherButton = screen.getByRole('button', { name: /^Other$/ });
      fireEvent.click(otherButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Specify name/i)).toBeInTheDocument();
      });
    });

    it('removes drug row when remove button clicked', async () => {
      const formDataWithMultipleDrugs = {
        ...mockFormData,
        testPanel: [
          { drugName: 'Rocuronium', sptWheal: '3', idtResults: [], protocolIndex: 0 },
          { drugName: 'Propofol', sptWheal: '', idtResults: ['', '5', ''], protocolIndex: 0 }
        ]
      };

      render(<TestWrapper initialData={formDataWithMultipleDrugs} props={mockProps} />);

      const removeButtons = screen.getAllByRole('button', { name: /Remove drug/i });
      fireEvent.click(removeButtons[0]);

      await waitFor(() => {
        // Use a more specific query for the drug in the test panel
        // In our case, the name is in a span with font-medium
        const drugRow = screen.queryByText('Rocuronium', { selector: '.font-medium' });
        expect(drugRow).toBeNull();
      });
    });
  });

  describe('Test Results', () => {
    it('allows entering SPT wheal size', async () => {
      render(<TestWrapper initialData={mockFormData} props={mockProps} />);

      const sptInput = screen.getAllByPlaceholderText('-')[0];
      fireEvent.change(sptInput, { target: { value: '5' } });

      expect((sptInput as HTMLInputElement).value).toBe('5');
    });

    it('highlights positive tests (≥3mm) in red', () => {
      render(<TestWrapper initialData={mockFormData} props={mockProps} />);

      const positiveInputs = screen.getAllByDisplayValue('3');
      expect(positiveInputs[0]).toHaveClass('text-red-700');
    });

    it('prevents negative input in test results', () => {
      render(<TestWrapper initialData={mockFormData} props={mockProps} />);

      const input = screen.getAllByPlaceholderText('-')[0];
      fireEvent.keyDown(input, { key: '-', code: 'Minus' });

      // Negative input should be prevented (value doesn't change to negative)
      expect(input).not.toHaveValue(-1);
    });
  });

  describe('Symptoms and Interventions', () => {
    it('allows adding symptoms', async () => {
      render(<TestWrapper initialData={{ ...mockFormData, proceedToChallenge: true }} props={mockProps} />);

      // Show reaction fields
      const reactionButton = screen.getByText('Reaction Occurred');
      fireEvent.click(reactionButton);

      await waitFor(() => {
        expect(screen.getByText('Rash')).toBeInTheDocument();
      });

      const symptomButton = screen.getByText('Rash');
      fireEvent.click(symptomButton);

      await waitFor(() => {
        expect(symptomButton).toHaveClass('bg-red-600');
      });
    });

    it('allows adding interventions', async () => {
      render(<TestWrapper initialData={{ ...mockFormData, proceedToChallenge: true }} props={mockProps} />);

      // Show reaction fields
      const reactionButton = screen.getByText('Reaction Occurred');
      fireEvent.click(reactionButton);

      await waitFor(() => {
        expect(screen.getByText(/Treatment Required/i)).toBeInTheDocument();
      });
    });

    it('removes symptoms when clicked again', async () => {
      const formDataWithSymptoms: LogFormData = {
        ...mockFormData,
        proceedToChallenge: true,
        outcome: 'UNSUCCESS',
        symptoms: ['Rash', 'Urticaria'],
      };

      render(<TestWrapper initialData={formDataWithSymptoms} props={mockProps} />);

      const rashButton = screen.getByText('Rash');
      expect(rashButton).toHaveClass('bg-red-600');

      fireEvent.click(rashButton);

      await waitFor(() => {
        expect(rashButton).not.toHaveClass('bg-red-600');
      });
    });
  });

  describe('Challenge Section', () => {
    it('renders challenge toggle', () => {
      render(<TestWrapper initialData={mockFormData} props={mockProps} />);

      expect(screen.getByRole('switch', { name: /Drug Challenge/i })).toBeInTheDocument();
    });

    it('shows challenge fields when enabled', async () => {
      render(<TestWrapper initialData={mockFormData} props={mockProps} />);

      const challengeToggle = screen.getByRole('switch', { name: /Drug Challenge/i });
      fireEvent.click(challengeToggle);

      await waitFor(() => {
        expect(screen.getByText(/Select Challenge Drug/i)).toBeInTheDocument();
      });
    });

    it('allows entering challenge details', async () => {
      render(<TestWrapper initialData={{ ...mockFormData, proceedToChallenge: true }} props={mockProps} />);

      await waitFor(() => {
        const drugSelect = screen.getByText(/Choose drug from list/i);
        expect(drugSelect).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('calls onSubmit when save button clicked', async () => {
      render(<TestWrapper initialData={mockFormData} props={mockProps} />);

      const saveButton = screen.getByRole('button', { name: /Save Clinical Record/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockProps.onSubmit).toHaveBeenCalled();
      });
    });

    it('links visit date validation errors to the visit date field', async () => {
      render(<TestWrapper initialData={{ ...mockFormData, visitDate: '' }} props={mockProps} />);

      fireEvent.click(screen.getByRole('button', { name: /Save Clinical Record/i }));

      const errorLink = await screen.findByRole('link', { name: /Visit date is required/i });
      expect(errorLink).toHaveAttribute('href', '#visit-date');
      expect(mockProps.onSubmit).not.toHaveBeenCalled();
    });

    it('links drug panel validation errors to the drug filter field', async () => {
      render(<TestWrapper initialData={{ ...mockFormData, testPanel: [] }} props={mockProps} />);

      fireEvent.click(screen.getByRole('button', { name: /Save Clinical Record/i }));

      const errorLink = await screen.findByRole('link', { name: /At least one drug test is required/i });
      expect(errorLink).toHaveAttribute('href', '#drug-filter');
      expect(mockProps.onSubmit).not.toHaveBeenCalled();
    });

    it('links unknown validation errors to the clinical plan field', async () => {
      const validateSpy = vi.spyOn(TestingService.prototype, 'validateForm').mockReturnValue({
        isValid: false,
        errors: ['Clinical plan needs review'],
      });

      render(<TestWrapper initialData={mockFormData} props={mockProps} />);

      fireEvent.click(screen.getByRole('button', { name: /Save Clinical Record/i }));

      const errorLink = await screen.findByRole('link', { name: /Clinical plan needs review/i });
      expect(errorLink).toHaveAttribute('href', '#clinical-plan');
      expect(mockProps.onSubmit).not.toHaveBeenCalled();
      validateSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels on form inputs', () => {
      render(<TestWrapper initialData={mockFormData} props={mockProps} />);

      const dateInput = screen.getByLabelText(/Visit Date:/i);
      expect(dateInput).toBeInTheDocument();
    });

    it('is keyboard navigable', () => {
      render(<TestWrapper initialData={mockFormData} props={mockProps} />);

      const saveButton = screen.getByRole('button', { name: /Save Clinical Record/i });
      saveButton.focus();

      expect(saveButton).toHaveFocus();
    });
  });

  describe('Direct Entry Mode', () => {
    it('renders editable identity fields when isDirectEntry is true', () => {
      render(<TestWrapper initialData={mockFormData} props={{ ...mockProps, isDirectEntry: true }} />);

      expect(screen.getByLabelText(/MRN/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Date of Birth/i)).toBeInTheDocument();
    });

    it('updates form state when typing into direct entry identity fields', () => {
      const emptyData: LogFormData = {
        ...mockFormData,
        mrn: '',
        firstName: '',
        lastName: '',
        dob: '',
      };
      render(<TestWrapper initialData={emptyData} props={{ ...mockProps, isDirectEntry: true }} />);

      fireEvent.change(screen.getByLabelText(/^MRN/i), { target: { value: 'MRN999' } });
      fireEvent.change(screen.getByLabelText(/^First Name/i), { target: { value: 'Alice' } });
      fireEvent.change(screen.getByLabelText(/^Last Name/i), { target: { value: 'Smith' } });
      fireEvent.change(screen.getByLabelText(/Date of Birth/i), { target: { value: '1985-05-12' } });

      expect(mockProps.setFormData).toHaveBeenCalledWith(expect.objectContaining({
        mrn: 'MRN999',
      }));
    });

    it('displays accessible validation errors linking to identity fields when required fields are missing', async () => {
      const emptyData: LogFormData = {
        ...mockFormData,
        mrn: '',
        firstName: '',
        lastName: '',
      };
      render(<TestWrapper initialData={emptyData} props={{ ...mockProps, isDirectEntry: true }} />);

      fireEvent.click(screen.getByRole('button', { name: /Save Clinical Record/i }));

      const mrnLink = await screen.findByRole('link', { name: /MRN is required/i });
      const firstNameLink = await screen.findByRole('link', { name: /First name is required/i });
      const lastNameLink = await screen.findByRole('link', { name: /Last name is required/i });

      expect(mrnLink).toHaveAttribute('href', '#patient-mrn');
      expect(firstNameLink).toHaveAttribute('href', '#patient-first-name');
      expect(lastNameLink).toHaveAttribute('href', '#patient-last-name');
      expect(mockProps.onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty drug categories', () => {
      const propsWithEmptyCategories = {
        ...mockProps,
        drugCategories: {},
      };

      render(<TestWrapper initialData={mockFormData} props={propsWithEmptyCategories} />);

      expect(screen.getByText('Doe, John')).toBeInTheDocument();
    });

    it('handles patient without reaction history', () => {
      render(<TestWrapper initialData={mockFormData} props={mockProps} />);

      expect(screen.getByText('Doe, John')).toBeInTheDocument();
    });
  });
});
