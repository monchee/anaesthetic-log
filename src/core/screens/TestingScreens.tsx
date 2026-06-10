import React from 'react';
import { ArrowLeft, ClipboardList, TestTube2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { ScreenLayout } from '@core/components/ScreenLayout';
import { APP_CONFIG, DRUG_CATEGORIES } from '@shared/utils/constants';
import { LogFormData, Patient, TestingPlanData } from '@/types';
import { CommonScreenLayoutProps } from './types';

const TestingLogForm = React.lazy(() => import('@features/testing/components/TestingLogForm'));
const TestingPlanPrintView = React.lazy(() => import('@features/testing/components/TestingPlanPrintView'));

const BACK_BTN = "h-11 min-w-11 px-4 bg-white/10 hover:bg-white/30 text-white hover:text-white border border-white/20 shadow-sm transition-[color,background-color,border-color,transform,box-shadow] duration-200 group rounded-none btn-press";
const BACK_ICON = "w-4 h-4 opacity-90 group-hover:opacity-100 transition-opacity";

interface PrintPlanScreenProps {
  layoutProps: CommonScreenLayoutProps;
  selectedPatient: Patient;
  testingPlanData: TestingPlanData;
  onBack: () => void;
  onProceed: () => void;
}

export function PrintPlanScreen({
  layoutProps,
  selectedPatient,
  testingPlanData,
  onBack,
  onProceed,
}: PrintPlanScreenProps) {
  return (
    <ScreenLayout title="Testing Plan Preview" icon={<ClipboardList className="w-5 h-5" />} {...layoutProps} showFooter={false}
      actions={<Button onClick={onBack} variant="ghost" className={BACK_BTN}><ArrowLeft className={BACK_ICON} /> Back</Button>}
    >
      <TestingPlanPrintView patient={selectedPatient} data={testingPlanData} drugCategories={DRUG_CATEGORIES} onProceed={onProceed} />
    </ScreenLayout>
  );
}

interface TestingScreenProps {
  layoutProps: CommonScreenLayoutProps;
  formData: LogFormData;
  setFormData: React.Dispatch<React.SetStateAction<LogFormData>>;
  onBack: () => void;
  onSubmit: () => LogFormData;
}

export function TestingScreen({
  layoutProps,
  formData,
  setFormData,
  onBack,
  onSubmit,
}: TestingScreenProps) {
  return (
    <ScreenLayout
      title="Testing Session" icon={<TestTube2 className="w-5 h-5" />}
      {...layoutProps}
      actions={<Button onClick={onBack} variant="ghost" className={BACK_BTN}><ArrowLeft className={BACK_ICON} /> Back</Button>}
      contentClassName="py-4" className="pb-32"
    >
      <TestingLogForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        drugCategories={DRUG_CATEGORIES}
        symptomOptions={APP_CONFIG.SYMPTOM_OPTIONS}
        interventionOptions={APP_CONFIG.INTERVENTION_OPTIONS}
      />
    </ScreenLayout>
  );
}
