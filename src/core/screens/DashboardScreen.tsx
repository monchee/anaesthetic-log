import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import { ScreenLayout } from '@core/components/ScreenLayout';
import { DRUG_CATEGORIES, FLAT_DRUG_OPTIONS } from '@shared/utils/constants';
import { LogFormData, Patient, Screen } from '@/types';
import { CommonScreenLayoutProps } from './types';

const Dashboard = React.lazy(() => import('@features/dashboard/components/Dashboard'));

interface DashboardScreenProps {
  layoutProps: CommonScreenLayoutProps;
  patients: Patient[];
  recentLogs: LogFormData[];
  isLoadingPatients: boolean;
  patientDbSavedAt: number | null;
  onSetScreen: (screen: Screen) => void;
  onViewLog: (log: LogFormData) => void;
  onSelectPatient: (patient: Patient) => void;
  onUploadPatients: (newPatients: Patient[], fileLastModified?: number) => void;
}

export function DashboardScreen({
  layoutProps,
  patients,
  recentLogs,
  isLoadingPatients,
  patientDbSavedAt,
  onSetScreen,
  onViewLog,
  onSelectPatient,
  onUploadPatients,
}: DashboardScreenProps) {
  return (
    <ScreenLayout title="Clinical Dashboard" icon={<LayoutDashboard className="w-5 h-5" />} {...layoutProps}>
      <h2 className="sr-only">Dashboard analytics and patient records</h2>
      <Dashboard
        setScreen={onSetScreen}
        existingPatients={patients}
        recentLogs={recentLogs}
        drugOptions={FLAT_DRUG_OPTIONS}
        drugCategories={DRUG_CATEGORIES}
        onViewLog={onViewLog}
        onSelectPatient={onSelectPatient}
        onUploadPatients={onUploadPatients}
        databaseDate={layoutProps.databaseDate}
        isCustomData={layoutProps.isCustomData}
        isLoadingPatients={isLoadingPatients}
        patientDbSavedAt={patientDbSavedAt}
      />
    </ScreenLayout>
  );
}
