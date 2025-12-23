// Backward compatibility - re-export new hooks with old interface
import { usePatientState } from '../src/features/patients/hooks/usePatientState';
import { useTestingState } from '../src/features/testing/hooks/useTestingState';
import { useAppNavigation } from '../src/core/hooks/useAppNavigation';
import { useDisclaimer } from '../src/shared/hooks/useDisclaimer';
import { Patient, Screen } from '../types';

export function useAnaestheticApp() {
  const patientState = usePatientState();
  const testingState = useTestingState();
  const navigation = useAppNavigation();
  const disclaimer = useDisclaimer();

  // Compose handlers that need cross-concern coordination
  const handleDashboardPatientSelect = (patient: Patient) => {
    patientState.handlePatientSelect(patient);
    navigation.setScreen(Screen.LOG);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = () => {
    const savedRecord = testingState.handleSubmit();
    navigation.setScreen(Screen.SUMMARY);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return savedRecord;
  };

  const resetForm = () => {
    testingState.resetForm();
    patientState.setSelectedPatient(null);
    testingState.setLastSavedRecord(null);
    navigation.setScreen(Screen.LOG);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Maintain backward compatibility by returning the same interface
  return {
    // Navigation
    screen: navigation.screen,
    setScreen: navigation.setScreen,
    
    // Testing state
    formData: testingState.formData,
    setFormData: testingState.setFormData,
    lastSavedRecord: testingState.lastSavedRecord,
    setLastSavedRecord: testingState.setLastSavedRecord,
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
    
    // Disclaimer
    showDisclaimer: disclaimer.showDisclaimer,
    
    // Handlers
    handleDismissDisclaimer: disclaimer.handleDismissDisclaimer,
    handlePatientSelect: patientState.handlePatientSelect,
    handleManualDetailChange: patientState.handleManualDetailChange,
    handleSubmit,
    handleUploadPatients: patientState.handleUploadPatients,
    handleDashboardPatientSelect,
    resetForm,
  };
}
