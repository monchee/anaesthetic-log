import { useEffect } from 'react';
import { toast } from 'sonner';
import { usePatientState } from '@features/patients/hooks/usePatientState';
import { useTestingState } from '@features/testing/hooks/useTestingState';
import { useAppNavigation } from './useAppNavigation';
import { useDisclaimer } from '@shared/hooks/useDisclaimer';
import { Patient, Screen } from '@/types';

export function useAnaestheticApp() {
  const patientState = usePatientState();
  const { selectedPatient, handlePatientSelect, handleManualDetailChange: originalHandleManualDetailChange } = patientState;
  const testingState = useTestingState();
  const { setFormData, handleSubmit: originalHandleSubmit, resetForm: originalResetForm, clearActiveReport: originalClearActiveReport } = testingState;
  const navigation = useAppNavigation();
  const disclaimer = useDisclaimer();

  // Compose handlers that need cross-concern coordination
  const handleDashboardPatientSelect = (patient: Patient) => {
    handlePatientSelect(patient);
    navigation.setScreen(Screen.LOG);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedPatient) {
      setFormData(prev => ({
        ...prev,
        firstName: selectedPatient?.firstName || '',
        lastName: selectedPatient?.lastName || '',
        mrn: selectedPatient?.mrn || ''
      }));
    }
  }, [selectedPatient, setFormData]);

  const handleManualDetailChange = (field: keyof Patient, value: string) => {
    originalHandleManualDetailChange(field, value);
    if (field === 'firstName' || field === 'lastName' || field === 'mrn') {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = () => {
    const savedRecord = originalHandleSubmit();
    toast.success(`Record saved for ${savedRecord.lastName}, ${savedRecord.firstName}`, { duration: 4000 });
    navigation.setScreen(Screen.SUMMARY);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return savedRecord;
  };

  const resetForm = () => {
    originalResetForm();
    patientState.setSelectedPatient(null);
    navigation.setScreen(Screen.LOG);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearActiveReport = () => {
    originalClearActiveReport();
    patientState.setSelectedPatient(null);
    originalResetForm();
    navigation.setScreen(Screen.LOG);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    // Navigation
    screen: navigation.screen,
    setScreen: navigation.setScreen,

    // Testing state
    formData: testingState.formData,
    setFormData: testingState.setFormData,
    lastSavedRecord: testingState.lastSavedRecord,
    setLastSavedRecord: testingState.setLastSavedRecord,
    activeReportSavedAt: testingState.activeReportSavedAt,
    testingPlanData: testingState.testingPlanData,
    setTestingPlanData: testingState.setTestingPlanData,
    recentLogs: testingState.recentLogs,
    INITIAL_FORM_STATE: testingState.INITIAL_FORM_STATE,

    // Patient state
    selectedPatient: patientState.selectedPatient,
    setSelectedPatient: patientState.setSelectedPatient,
    isPatientDialogOpen: patientState.isPatientDialogOpen,
    setIsPatientDialogOpen: patientState.setIsPatientDialogOpen,
    patients: patientState.patients,
    databaseDate: patientState.databaseDate,
    hasUploadedData: patientState.hasUploadedData,
    isLoadingPatients: patientState.isLoadingPatients,

    // Disclaimer
    showDisclaimer: disclaimer.showDisclaimer,

    // Handlers
    handleDismissDisclaimer: disclaimer.handleDismissDisclaimer,
    handlePatientSelect,
    handleManualDetailChange,
    handleSubmit,
    handleUploadPatients: patientState.handleUploadPatients,
    handleDashboardPatientSelect,
    resetForm,
    clearActiveReport,
  };
}
