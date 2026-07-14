import React, { useEffect } from 'react';
import { AppProviders } from '@core/components/AppProviders';
import { Screen } from '@shared/types';
import { APP_CONFIG } from '@shared/utils/constants';
import { getSkinProtocolsForDrug } from '@shared/data/drugMasterlist';
import { useAnaestheticApp } from '@core/hooks/useAnaestheticApp';
import { reportWebVitals } from './src/lib/analytics';
import { initSentry } from './src/lib/sentry';
import { findInfoPageRoute } from '@core/routes/infoPageConfig';
import { HelpModal } from '@core/components/HelpModal';
import { useResearchSubmit } from '@features/research/hooks/useResearchSubmit';
import { DashboardScreen } from '@core/screens/DashboardScreen';
import { InfoPageScreen } from '@core/screens/InfoPageScreen';
import { LogScreen } from '@core/screens/LogScreen';
import { ResearchScreen } from '@core/screens/ResearchScreen';
import { SummaryScreen } from '@core/screens/SummaryScreen';
import { PrintPlanScreen, TestingScreen } from '@core/screens/TestingScreens';

const APP_SUBTITLE = APP_CONFIG.APP_SUBTITLE;

type ReportTab = 'report' | 'handout' | 'letter';

function AnaestheticLogApp() {
  useEffect(() => {
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
    screen, setScreen, formData, setFormData,
    selectedPatient, lastSavedRecord, setLastSavedRecord, activeReportSavedAt,
    testingPlanData, setTestingPlanData,
    isPatientDialogOpen, setIsPatientDialogOpen,
    patients, databaseDate, hasUploadedData, isLoadingPatients, recentLogs,
    showDisclaimer, handleDismissDisclaimer,
    handlePatientSelect, handleManualDetailChange,
    handleSubmit, handleUploadPatients, handleDashboardPatientSelect, resetForm, clearActiveReport,
  } = useAnaestheticApp();

  const [activeReportTab, setActiveReportTab] = React.useState<ReportTab>('report');
  const [csvUploadSheetOpen, setCsvUploadSheetOpen] = React.useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = React.useState(false);
  const research = useResearchSubmit();

  const handleProceedToTesting = () => {
    if (testingPlanData?.selectedDrugs?.length) {
      const { selectedDrugs, selectedProtocols } = testingPlanData;
      const rows = selectedDrugs.map(drug => {
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
      setFormData(prev => ({ ...prev, testPanel: rows }));
    }
    setScreen(Screen.TESTING);
  };

  const resetToLog = () => {
    research.reset();
    resetForm();
    setScreen(Screen.LOG);
  };

  const layoutProps = {
    setScreen,
    currentScreen: screen,
    databaseDate,
    showDisclaimer,
    isCustomData: hasUploadedData,
    onDismissDisclaimer: handleDismissDisclaimer,
    onUploadPatients: handleUploadPatients,
    csvUploadSheetOpen,
    onCSVUploadSheetOpenChange: setCsvUploadSheetOpen,
  };

  const renderScreenContent = () => {
    const infoRoute = findInfoPageRoute(screen);
    if (infoRoute) {
      return <InfoPageScreen route={infoRoute} layoutProps={layoutProps} onBack={() => setScreen(Screen.LOG)} />;
    }

    if (screen === Screen.DASHBOARD) {
      return (
        <DashboardScreen
          layoutProps={layoutProps}
          patients={patients}
          recentLogs={recentLogs}
          isLoadingPatients={isLoadingPatients}
          onSetScreen={setScreen}
          onViewLog={(log) => {
            setLastSavedRecord(log);
            setScreen(Screen.SUMMARY);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSelectPatient={handleDashboardPatientSelect}
          onUploadPatients={handleUploadPatients}
        />
      );
    }

    if (screen === Screen.SUMMARY && lastSavedRecord) {
      return (
        <SummaryScreen
          layoutProps={layoutProps}
          lastSavedRecord={lastSavedRecord}
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

    if (screen === Screen.PRINT_PLAN && selectedPatient && testingPlanData) {
      return (
        <PrintPlanScreen
          layoutProps={layoutProps}
          selectedPatient={selectedPatient}
          testingPlanData={testingPlanData}
          onBack={() => setScreen(Screen.LOG)}
          onProceed={handleProceedToTesting}
        />
      );
    }

    if (screen === Screen.TESTING) {
      return (
        <TestingScreen
          layoutProps={layoutProps}
          selectedPatient={selectedPatient}
          formData={formData}
          setFormData={setFormData}
          onBack={() => setScreen(Screen.LOG)}
          onSubmit={handleSubmit}
        />
      );
    }

    if (screen === Screen.RESEARCH) {
      return <ResearchScreen layoutProps={layoutProps} />;
    }

    return (
      <LogScreen
        layoutProps={layoutProps}
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
        onManualDetailChange={handleManualDetailChange}
        onSetTestingPlanData={setTestingPlanData}
        onProceedToTesting={handleProceedToTesting}
        onClearActiveReport={clearActiveReport}
      />
    );
  };

  return (
    <React.Suspense fallback={<div className="min-h-svh bg-background" />}>
      {renderScreenContent()}
      <HelpModal
        onUploadPatients={handleUploadPatients}
        hideTrigger={true}
        hasData={hasUploadedData}
        setScreen={setScreen}
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
