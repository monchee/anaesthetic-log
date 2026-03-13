import { useState, useEffect, useCallback } from 'react';
import { Screen } from '../../shared/types';

const SCREEN_URL_MAP: Record<string, Screen> = {
  '/': Screen.LOG,
  '/log': Screen.LOG, // Support both
  '/dashboard': Screen.DASHBOARD,
  '/summary': Screen.SUMMARY,
  '/patient-summary': Screen.PATIENT_SUMMARY,
  '/changelog': Screen.CHANGELOG,
  '/testing': Screen.TESTING,
  '/print-plan': Screen.PRINT_PLAN,
  '/about': Screen.ABOUT,
  '/faq': Screen.FAQ,
  '/drug-reference': Screen.DRUG_REFERENCE,
  '/contact': Screen.CONTACT,
  '/resources': Screen.RESOURCES,
  '/privacy-policy': Screen.PRIVACY_POLICY,
  '/clinical-governance': Screen.CLINICAL_GOVERNANCE,
  '/terms-of-use': Screen.TERMS_OF_USE,
  '/technical-documentation': Screen.TECHNICAL_DOCUMENTATION,
  '/disclaimer': Screen.DISCLAIMER,
};

const getScreenFromPath = (path: string): Screen => {
  // Handle root or prefixed paths if needed
  const normalizedPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
  return SCREEN_URL_MAP[normalizedPath] || Screen.LOG;
};

const getPathFromScreen = (screen: Screen): string => {
  if (screen === Screen.LOG) return '/';
  return `/${screen}`;
};

export function useAppNavigation() {
  // Initialize from URL
  const [screen, setScreenInternal] = useState<Screen>(() => 
    getScreenFromPath(window.location.pathname)
  );

  // Custom setScreen that updates URL
  const setScreen = useCallback((newScreen: Screen | ((prev: Screen) => Screen)) => {
    setScreenInternal(prev => {
      const next = typeof newScreen === 'function' ? newScreen(prev) : newScreen;
      const path = getPathFromScreen(next);
      
      // Update URL if it changed
      if (window.location.pathname !== path) {
        window.history.pushState({ screen: next }, '', path);
      }
      
      return next;
    });
  }, []);

  // Sync state when browser navigation occurs (Back/Forward)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setScreenInternal(getScreenFromPath(path));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
