import React from 'react';
import { ArrowLeft, ClipboardList, TestTube2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { ScreenLayout } from '@core/components/ScreenLayout';
import { APP_CONFIG, DRUG_CATEGORIES } from '@shared/utils/constants';
import { LogFormData, Patient, TestingPlanData } from '@/types';
import { CommonScreenLayoutProps } from './types';
import { ClinicalContextBar } from '@features/patients/components/ClinicalContextBar';
import { HighRiskContextChips } from '@features/patients/components/HighRiskContextChips';
import { DraftSaveIndicator } from '@features/testing/components/DraftSaveIndicator';
import { deriveHighRiskChips } from '@shared/utils/highRiskContext';

const TestingLogForm = React.lazy(() => import('@features/testing/components/TestingLogForm'));
const TestingPlanPrintView = React.lazy(() => import('@features/testing/components/TestingPlanPrintView'));

const BACK_BTN = "h-11 min-w-11 px-4 bg-white/10 hover:bg-white/30 text-white hover:text-white border border-white/20 shadow-sm transition-[color,background-color,border-color,transform,box-shadow] duration-200 group rounded-none btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-primary";
const BACK_ICON = "w-4 h-4 opacity-90 group-hover:opacity-100 transition-opacity";

import { ClinicalWorkContext } from '@shared/types/clinicalWorkContext';

interface PrintPlanScreenProps {
  layoutProps: CommonScreenLayoutProps;
  selectedPatient: Patient;
  testingPlanData: TestingPlanData;
  workContext?: ClinicalWorkContext | null;
  onBack: () => void;
  onProceed: () => void;
}

export function PrintPlanScreen({
  layoutProps,
  selectedPatient,
  testingPlanData,
  workContext,
  onBack,
  onProceed,
}: PrintPlanScreenProps) {
  return (
    <ScreenLayout
      title="Testing Request Form"
      icon={<ClipboardList className="w-5 h-5" />}
      {...layoutProps}
      showFooter={false}
      actions={<Button onClick={onBack} variant="ghost" className={BACK_BTN}><ArrowLeft className={BACK_ICON} /> Back</Button>}
      contentClassName="py-4 space-y-4"
    >
      <ClinicalContextBar
        context={workContext}
        firstName={workContext?.firstName || selectedPatient.firstName}
        lastName={workContext?.lastName || selectedPatient.lastName}
        mrn={workContext?.mrn || selectedPatient.mrn}
        dob={workContext?.dob || selectedPatient.dob}
        reactionDate={workContext?.reactionDate || selectedPatient.history?.date}
        source={workContext?.source || (selectedPatient.id === 'manual' ? 'manual' : 'database')}
      />
      <TestingPlanPrintView patient={selectedPatient} data={testingPlanData} drugCategories={DRUG_CATEGORIES} onProceed={onProceed} />
    </ScreenLayout>
  );
}

interface TestingScreenProps {
  layoutProps: CommonScreenLayoutProps;
  selectedPatient: Patient | null;
  workContext?: ClinicalWorkContext | null;
  formData: LogFormData;
  setFormData: React.Dispatch<React.SetStateAction<LogFormData>>;
  lastDraftSavedAt: number | null;
  isSavingDraft: boolean;
  isDirty?: boolean;
  onBack: () => void;
  onSubmit: () => LogFormData;
}

export function TestingScreen({
  layoutProps,
  selectedPatient,
  workContext,
  formData,
  setFormData,
  lastDraftSavedAt,
  isSavingDraft,
  isDirty = false,
  onBack,
  onSubmit,
}: TestingScreenProps) {
  const isDirectEntry = workContext ? workContext.source === 'direct' : !selectedPatient;
  const patientHistory = workContext?.patientSnapshot?.history || selectedPatient?.history;
  const highRiskChips = patientHistory ? deriveHighRiskChips(patientHistory) : [];

  return (
    <ScreenLayout
      title={isDirectEntry ? 'Allergy Testing' : 'Testing Session'}
      icon={<TestTube2 className="w-5 h-5" />}
      {...layoutProps}
      actions={<Button onClick={onBack} variant="ghost" className={BACK_BTN}><ArrowLeft className={BACK_ICON} /> Back</Button>}
      contentClassName="py-4 space-y-3"
      className="pb-32"
    >
      <ClinicalContextBar
        context={workContext}
        firstName={workContext?.firstName ?? (selectedPatient?.firstName || formData.firstName)}
        lastName={workContext?.lastName ?? (selectedPatient?.lastName || formData.lastName)}
        mrn={workContext?.mrn ?? (selectedPatient?.mrn || formData.mrn)}
        dob={workContext?.dob ?? (selectedPatient?.dob || formData.dob)}
        reactionDate={workContext?.reactionDate ?? patientHistory?.date}
        visitDate={formData.visitDate || workContext?.testingVisitDate}
        source={workContext?.source ?? (selectedPatient ? (selectedPatient.id === 'manual' ? 'manual' : 'database') : 'direct')}
        className={highRiskChips.length > 0 ? 'mb-2' : 'mb-3'}
      />
      {highRiskChips.length > 0 && (
        <HighRiskContextChips
          chips={highRiskChips}
          className="mx-1 mb-3 border border-status-warning/30 bg-status-warning/10 px-2.5 py-2"
        />
      )}

      <div className="flex min-h-4 justify-end px-1">
        <DraftSaveIndicator
          isSaving={isSavingDraft}
          isDirty={isDirty}
          lastSavedAt={lastDraftSavedAt}
        />
      </div>

      <TestingLogForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        drugCategories={DRUG_CATEGORIES}
        symptomOptions={APP_CONFIG.SYMPTOM_OPTIONS}
        interventionOptions={APP_CONFIG.INTERVENTION_OPTIONS}
        isDirectEntry={isDirectEntry}
      />
    </ScreenLayout>
  );
}

export default TestingScreen;
