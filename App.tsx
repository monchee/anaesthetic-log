import React, { useEffect, useMemo, useState } from 'react';
import { AppProviders } from '@core/components/AppProviders';
import { Screen } from '@shared/types';
import { ScreenChrome } from '@core/components/ScreenLayout';
import { APP_CONFIG } from '@shared/utils/constants';
import { purgeStale } from '@shared/utils/ttlStorage';
import { getSkinProtocolsForDrug } from '@shared/data/drugMasterlist';
import { useAnaestheticApp } from '@core/hooks/useAnaestheticApp';
import { isReportActive } from '@core/navigation/navigationConfig';
import { reportWebVitals } from './src/lib/analytics';
import { initSentry } from './src/lib/sentry';
import { findInfoPageRoute } from '@core/routes/infoPageConfig';
import { GetStartedModal } from '@core/components/GetStartedModal';
import { useResearchSubmit } from '@features/research/hooks/useResearchSubmit';
import { DashboardScreen } from '@core/screens/DashboardScreen';
import { InfoPageScreen } from '@core/screens/InfoPageScreen';
import { LogScreen } from '@core/screens/LogScreen';
import { ResearchScreen } from '@core/screens/ResearchScreen';
import { SummaryScreen } from '@core/screens/SummaryScreen';
import { PrintPlanScreen, TestingScreen } from '@core/screens/TestingScreens';
import { ScreenUnavailable } from '@core/components/ScreenUnavailable';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const APP_SUBTITLE = APP_CONFIG.APP_SUBTITLE;
const GET_STARTED_SEEN_KEY = 'dream:get_started_seen';

type ReportTab = 'report' | 'handout' | 'letter';

export function AnaestheticLogApp() {
  useEffect(() => {
    purgeStale();

    const runPostPaintSetup = () => {
      void initSentry();
      reportWebVitals();
    };

    let timeoutId: number | undefined;
    const frameId = window.requestAnimationFrame(() => {
      timeoutId = window.setTimeout(runPostPaintSetup, 0);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  const {
    screen, setScreen, navigate, hrefFor, pendingNavigation, confirmNavigation, cancelNavigation,
    formData, setFormData,
    workContext, activeReportContext,
    selectedPatient, lastSavedRecord, setLastSavedRecord, activeReportSavedAt,
    lastDraftSavedAt, isSavingDraft,
    testingPlanData, setTestingPlanData,
    isPatientDialogOpen, setIsPatientDialogOpen,
    patients, databaseDate, hasUploadedData, patientDbSavedAt, isLoadingPatients, recentLogs,
    showDisclaimer, handleDismissDisclaimer,
    pendingPatientSelection, confirmPatientSelect, cancelPatientSelect,
    handlePatientSelect, handleConfirmedPatientSelect, handleManualDetailChange,
    handleSubmit, handleStartDirectTesting, isTestingDraftDirty, handleUploadPatients,
    toggleSuspectedAgent, handleDashboardPatientSelect, resetForm, clearActiveReport,
  } = useAnaestheticApp();

  const [activeReportTab, setActiveReportTab] = useState<ReportTab>('report');
  const [csvUploadSheetOpen, setCsvUploadSheetOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [getStartedOpen, setGetStartedOpen] = useState(false);
  const research = useResearchSubmit();

  const hasCheckedGetStartedRef = React.useRef(false);
  useEffect(() => {
    if (hasCheckedGetStartedRef.current) return;
    hasCheckedGetStartedRef.current = true;
    if (screen !== Screen.LOG) return; // never interrupt a /testing or /dashboard deep link
    try {
      if (localStorage.getItem(GET_STARTED_SEEN_KEY)) return;
    } catch {
      return;
    } // storage unavailable: stay closed
    setGetStartedOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount only - do not add screen to the deps array

  const handleNavigate = navigate || setScreen;
  const hasActiveReport = isReportActive(lastSavedRecord, activeReportSavedAt);

  const handleProceedToTesting = () => {
    if (testingPlanData?.selectedDrugs?.length || testingPlanData?.customDrugs?.length) {
      const { selectedDrugs = [], selectedProtocols, customDrugs = [] } = testingPlanData;
      const standardRows = selectedDrugs.map(drug => {
        const protocolIndex = selectedProtocols?.[drug] ?? 0;
        const protocols = getSkinProtocolsForDrug(drug);
        const protocol = protocols[protocolIndex];
        return {
          drugName: drug,
          sptWheal: '',
          idtResults: Array(protocol?.idtSteps.length ?? 0).fill(''),
          protocolIndex,
          customName: '',
        };
      });
      const customRows = customDrugs.map(c => ({
        drugName: 'Other',
        customName: c.name,
        sptWheal: '',
        idtResults: Array(c.idtSteps?.length ?? 0).fill(''),
        protocolIndex: 0,
        customSptConcentration: c.sptConcentration,
        customIdtSteps: c.idtSteps,
        includeInChallenge: c.includeInChallenge,
      }));
      const challengeDrugCustom = customDrugs.find(c => c.includeInChallenge)?.name;
      setFormData(prev => ({
        ...prev,
        testPanel: [...standardRows, ...customRows],
        ...(challengeDrugCustom ? { proceedToChallenge: true, challengeDrug: 'Other', challengeDrugCustom } : {}),
      }));
    }
    handleNavigate(Screen.TESTING);
  };

  const resetToLog = () => {
    research.reset();
    resetForm();
    handleNavigate(Screen.LOG);
  };

  const handleHomeUploadComplete = React.useCallback(() => {
    handleNavigate(Screen.DASHBOARD);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [handleNavigate]);

  const chrome: ScreenChrome = useMemo(() => ({
    setScreen: handleNavigate,
    navigate: handleNavigate,
    hrefFor,
    pendingNavigation,
    confirmNavigation,
    cancelNavigation,
    onDeleteTestingDraft: resetForm,
    isTestingDraftDirty,
    hasActiveReport,
    currentScreen: screen,
    databaseDate,
    showDisclaimer,
    isCustomData: hasUploadedData,
    onDismissDisclaimer: handleDismissDisclaimer,
    onUploadPatients: handleUploadPatients,
    onUploadComplete: screen === Screen.LOG ? handleHomeUploadComplete : undefined,
    csvUploadSheetOpen,
    onCSVUploadSheetOpenChange: setCsvUploadSheetOpen,
    onOpenGetStarted: () => setGetStartedOpen(true),
  }), [
    handleNavigate,
    hrefFor,
    pendingNavigation,
    confirmNavigation,
    cancelNavigation,
    resetForm,
    isTestingDraftDirty,
    hasActiveReport,
    screen,
    databaseDate,
    showDisclaimer,
    hasUploadedData,
    handleDismissDisclaimer,
    handleUploadPatients,
    handleHomeUploadComplete,
    csvUploadSheetOpen,
    setCsvUploadSheetOpen,
  ]);

  const renderScreenContent = () => {
    const infoRoute = findInfoPageRoute(screen);
    if (infoRoute) {
      return (
        <InfoPageScreen
          route={infoRoute}
          chrome={chrome}
          onBack={() => handleNavigate(Screen.LOG)}
        />
      );
    }

    if (screen === Screen.DASHBOARD) {
      return (
        <DashboardScreen
          chrome={chrome}
          patients={patients}
          recentLogs={recentLogs}
          isLoadingPatients={isLoadingPatients}
          patientDbSavedAt={patientDbSavedAt}
          onSetScreen={handleNavigate}
          onViewLog={(log) => {
            setLastSavedRecord(log);
            handleNavigate(Screen.SUMMARY);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSelectPatient={handleDashboardPatientSelect}
          onUploadPatients={handleUploadPatients}
        />
      );
    }

    if (screen === Screen.SUMMARY) {
      if (lastSavedRecord && hasActiveReport) {
        return (
          <SummaryScreen
            chrome={chrome}
            lastSavedRecord={lastSavedRecord}
            workContext={activeReportContext}
            selectedPatient={selectedPatient}
            activeReportSavedAt={activeReportSavedAt}
            activeReportTab={activeReportTab}
            setActiveReportTab={setActiveReportTab}
            research={research}
            onExit={resetToLog}
            onStartNewLog={resetToLog}
          />
        );
      }

      return (
        <ScreenUnavailable
          title="No active report"
          message="Reports are available after a testing session has been saved. The active report may also have expired on this device."
          onGoHome={() => handleNavigate(Screen.LOG)}
          onGoDashboard={() => handleNavigate(Screen.DASHBOARD)}
        />
      );
    }

    if (screen === Screen.PRINT_PLAN) {
      if (selectedPatient && testingPlanData) {
        return (
          <PrintPlanScreen
            chrome={chrome}
            selectedPatient={selectedPatient}
            testingPlanData={testingPlanData}
            workContext={workContext}
            onBack={() => handleNavigate(Screen.LOG)}
            onProceed={handleProceedToTesting}
          />
        );
      }

      return (
        <ScreenUnavailable
          title="No active testing plan"
          message="This screen needs an active testing plan. Local data may have expired, or the page was reloaded."
          onGoHome={() => handleNavigate(Screen.LOG)}
          onGoDashboard={() => handleNavigate(Screen.DASHBOARD)}
        />
      );
    }

    if (screen === Screen.TESTING) {
      return (
        <TestingScreen
          chrome={chrome}
          selectedPatient={selectedPatient}
          workContext={workContext}
          formData={formData}
          setFormData={setFormData}
          lastDraftSavedAt={lastDraftSavedAt}
          isSavingDraft={isSavingDraft}
          isDirty={isTestingDraftDirty}
          onBack={() => handleNavigate(Screen.LOG)}
          onSubmit={handleSubmit}
        />
      );
    }

    if (screen === Screen.RESEARCH) {
      return <ResearchScreen chrome={chrome} />;
    }

    return (
      <LogScreen
        chrome={chrome}
        appSubtitle={APP_SUBTITLE}
        selectedPatient={selectedPatient}
        lastSavedRecord={lastSavedRecord}
        activeReportSavedAt={activeReportSavedAt}
        isPatientDialogOpen={isPatientDialogOpen}
        setIsPatientDialogOpen={setIsPatientDialogOpen}
        confirmClearOpen={confirmClearOpen}
        setConfirmClearOpen={setConfirmClearOpen}
        patients={patients}
        onPatientSelect={handlePatientSelect}
        onConfirmedPatientSelect={handleConfirmedPatientSelect}
        onManualDetailChange={handleManualDetailChange}
        onToggleSuspectedAgent={toggleSuspectedAgent}
        onSetTestingPlanData={setTestingPlanData}
        onProceedToTesting={handleProceedToTesting}
        onStartDirectTesting={handleStartDirectTesting}
        onClearActiveReport={clearActiveReport}
        isTestingDraftDirty={isTestingDraftDirty}
        onResetForm={resetForm}
      />
    );
  };

  return (
    <React.Suspense fallback={<div className="min-h-svh bg-background" />}>
      {renderScreenContent()}
      <GetStartedModal
        isOpen={getStartedOpen}
        onOpenChange={setGetStartedOpen}
        onUploadPatients={handleUploadPatients}
        onUploadComplete={screen === Screen.LOG ? handleHomeUploadComplete : undefined}
        setScreen={handleNavigate}
        onStartDirectTesting={handleStartDirectTesting}
        isTestingDraftDirty={isTestingDraftDirty}
      />
      <ConfirmDialog
        open={Boolean(pendingPatientSelection)}
        onOpenChange={(open) => {
          if (!open) cancelPatientSelect();
        }}
        title="Switch patient?"
        message={`You have unsaved changes in your current testing session.${selectedPatient ? ` Current: ${selectedPatient.lastName ? `${selectedPatient.lastName.toUpperCase()}, ${selectedPatient.firstName}` : selectedPatient.firstName} (MRN: ${selectedPatient.mrn || '—'}, DOB: ${selectedPatient.dob || 'not recorded'}).` : ''}${pendingPatientSelection ? ` Target: ${pendingPatientSelection.patient.lastName ? `${pendingPatientSelection.patient.lastName.toUpperCase()}, ${pendingPatientSelection.patient.firstName}` : pendingPatientSelection.patient.firstName} (MRN: ${pendingPatientSelection.patient.mrn || '—'}, DOB: ${pendingPatientSelection.patient.dob || 'not recorded'}).` : ''} Switching patients will discard these changes. This cannot be undone.`}
        confirmLabel="Switch patient"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmPatientSelect}
      />
    </React.Suspense>
  );
}

function App() {
  return (
    <AppProviders>
      <AnaestheticLogApp />
    </AppProviders>
  );
}

export default App;
