import { useState } from 'react';
import { Screen } from '../../shared/types';

export function useAppNavigation() {
  const [screen, setScreen] = useState<Screen>(Screen.LOG);

  const navigateTo = (newScreen: Screen) => {
    setScreen(newScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToLog = () => navigateTo(Screen.LOG);
  const navigateToDashboard = () => navigateTo(Screen.DASHBOARD);
  const navigateToSummary = () => navigateTo(Screen.SUMMARY);
  const navigateToPatientSummary = () => navigateTo(Screen.PATIENT_SUMMARY);
  const navigateToTesting = () => navigateTo(Screen.TESTING);
  const navigateToPrintPlan = () => navigateTo(Screen.PRINT_PLAN);
  const navigateToChangelog = () => navigateTo(Screen.CHANGELOG);

  return {
    screen,
    setScreen,
    navigateTo,
    navigateToLog,
    navigateToDashboard,
    navigateToSummary,
    navigateToPatientSummary,
    navigateToTesting,
    navigateToPrintPlan,
    navigateToChangelog,
  };
}
