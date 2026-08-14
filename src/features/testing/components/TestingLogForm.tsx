import React, { useRef, useState } from 'react';
import { LogFormData } from '@/types';
import { useTestingLogLogic } from '../hooks/useTestingLogLogic';
import { TestingService } from '../services/TestingService';
import {
  AssessmentPlanSection,
  DrugChallengeSection,
  DrugTestPanelSection,
  NurseNotesSection,
  SaveActionSection,
  TryptaseSection,
  VisitDetailsSection,
} from './TestingLogFormSections';
import { ValidationErrorLink } from './SaveActionSection';

interface TestingLogFormProps {
  formData: LogFormData;
  setFormData: React.Dispatch<React.SetStateAction<LogFormData>>;
  onSubmit: () => void;
  drugCategories: Record<string, string[]>;
  symptomOptions: readonly string[] | string[];
  interventionOptions: readonly string[] | string[];
  isDirectEntry?: boolean;
}

const TestingLogForm: React.FC<TestingLogFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  drugCategories,
  symptomOptions,
  interventionOptions,
  isDirectEntry = false,
}) => {
  const {
    drugToCategoryMap,
    handleInputChange,
    handleControlChange,
    toggleDrug,
    toggleCategory,
    selectProtocol,
    addCustomDrug,
    addCustomIdtStep,
    removeCustomIdtStep,
    removeRow,
    updateDrugData,
    toggleSymptom,
    challengeOptions,
  } = useTestingLogLogic({ formData, setFormData, drugCategories });

  const [validationErrors, setValidationErrors] = useState<ValidationErrorLink[]>([]);
  const [drugFilter, setDrugFilter] = useState('');
  const [nurseNotesOpen, setNurseNotesOpen] = useState(false);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const testingService = new TestingService();
  const toValidationLink = (message: string): ValidationErrorLink => {
    const lower = message.toLowerCase();
    if (lower.includes('mrn')) return { message, fieldId: 'patient-mrn' };
    if (lower.includes('first name')) return { message, fieldId: 'patient-first-name' };
    if (lower.includes('last name')) return { message, fieldId: 'patient-last-name' };
    if (lower.includes('visit date')) return { message, fieldId: 'visit-date' };
    if (lower.includes('drug') || lower.includes('test panel')) return { message, fieldId: 'drug-filter' };
    return { message, fieldId: 'clinical-plan' };
  };

  const handleSave = () => {
    const { isValid, errors } = testingService.validateForm(formData);
    if (!isValid) {
      setValidationErrors(errors.map(toValidationLink));
      requestAnimationFrame(() => {
        errorSummaryRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
        errorSummaryRef.current?.focus();
      });
      return;
    }
    setValidationErrors([]);
    onSubmit();
  };

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 mt-4 sm:mt-6 md:mt-8">
      <VisitDetailsSection
        formData={formData}
        onInputChange={handleInputChange}
        isDirectEntry={isDirectEntry}
        validationErrors={validationErrors}
      />
      <DrugTestPanelSection
        formData={formData}
        setFormData={setFormData}
        drugCategories={drugCategories}
        drugFilter={drugFilter}
        setDrugFilter={setDrugFilter}
        drugToCategoryMap={drugToCategoryMap}
        onToggleDrug={toggleDrug}
        onToggleCategory={toggleCategory}
        onAddCustomDrug={addCustomDrug}
        onControlChange={handleControlChange}
        onUpdateDrugData={updateDrugData}
        onSelectProtocol={selectProtocol}
        onRemoveRow={removeRow}
        onAddCustomIdtStep={addCustomIdtStep}
        onRemoveCustomIdtStep={removeCustomIdtStep}
      />
      <DrugChallengeSection
        formData={formData}
        challengeOptions={challengeOptions}
        symptomOptions={symptomOptions}
        interventionOptions={interventionOptions}
        onInputChange={handleInputChange}
        onToggleSymptom={toggleSymptom}
      />
      <TryptaseSection formData={formData} setFormData={setFormData} />
      <AssessmentPlanSection plan={formData.plan} onInputChange={handleInputChange} />
      <NurseNotesSection
        formData={formData}
        setFormData={setFormData}
        isOpen={nurseNotesOpen}
        setIsOpen={setNurseNotesOpen}
      />
      <SaveActionSection
        validationErrors={validationErrors}
        errorSummaryRef={errorSummaryRef}
        onSave={handleSave}
      />
    </div>
  );
};

export default TestingLogForm;
