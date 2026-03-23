
import React, { useEffect } from 'react';
import { LayoutDashboard, Stethoscope, FileText, User, Printer, ArrowLeft, ChevronRight, TestTube2, ClipboardList, Pencil, ClipboardCopy, Copy, Mail, Database, CheckCircle2, Loader2, LogOut, Info, Target, Shield, Users } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Toaster } from './components/ui';
import PatientSelector from '@features/patients/components/PatientSelector';
import PatientHistory from '@features/patients/components/PatientHistory';
import TestingPlanGenerator from '@features/testing/components/TestingPlanGenerator';
const TestingLogForm = React.lazy(() => import('@features/testing/components/TestingLogForm'));
const ClinicalReport = React.lazy(() => import('@features/reports/components/ClinicalReport'));
const PatientHandout = React.lazy(() => import('@features/reports/components/PatientHandout'));
const PowerchartLetter = React.lazy(() => import('@features/reports/components/PowerchartLetter'));
const Dashboard = React.lazy(() => import('@features/dashboard/components/Dashboard'));
const TestingPlanPrintView = React.lazy(() => import('@features/testing/components/TestingPlanPrintView'));
const ResearchDashboard = React.lazy(() => import('@features/research/components/ResearchDashboard'));
import { ScreenLayout } from '@core/components/ScreenLayout';
import { ThemeProvider } from '@core/components/ThemeProvider';
import { FontSizeProvider } from '@core/components/FontSizeProvider';
import ErrorBoundary from '@core/components/ErrorBoundary';
import PasswordGate from '@core/components/PasswordGate';
import { Screen } from '@shared/types';
import { DRUG_CATEGORIES, FLAT_DRUG_OPTIONS, APP_CONFIG } from '@shared/utils/constants';
import { showToast } from '@shared/utils';
import { useAnaestheticApp } from '@core/hooks/useAnaestheticApp';
import { formatClinicalReportAsText, formatPatientHandoutAsText } from '@shared/utils/reportExporter';
import { generateLetterText } from '@shared/utils/reportExporter';
import { reportWebVitals } from './src/lib/analytics';
import { findInfoPageRoute } from '@core/routes/infoPageConfig';
import { useResearchSubmit } from '@features/research/hooks/useResearchSubmit';

const APP_SUBTITLE = APP_CONFIG.APP_SUBTITLE;

const BACK_BTN = "h-9 px-4 bg-white/10 hover:bg-white/30 text-white hover:text-white border border-white/20 shadow-sm transition-all duration-200 group rounded-none btn-press";
const BACK_ICON = "w-4 h-4 mr-1 opacity-90 group-hover:opacity-100 transition-opacity";

function AnaestheticLogApp() {
  useEffect(() => { reportWebVitals(); }, []);

  const {
    screen, setScreen, formData, setFormData,
    selectedPatient, lastSavedRecord, setLastSavedRecord,
    testingPlanData, setTestingPlanData,
    isPatientDialogOpen, setIsPatientDialogOpen,
    patients, databaseDate, hasUploadedData, recentLogs,
    showDisclaimer, handleDismissDisclaimer,
    handlePatientSelect, handleManualDetailChange,
    handleSubmit, handleUploadPatients, handleDashboardPatientSelect, resetForm,
  } = useAnaestheticApp();

  const [activeReportTab, setActiveReportTab] = React.useState<'report' | 'handout' | 'letter'>('report');
  const [csvUploadSheetOpen, setCsvUploadSheetOpen] = React.useState(false);
  const research = useResearchSubmit();

  const layoutProps = {
    setScreen, currentScreen: screen, databaseDate, showDisclaimer,
    isCustomData: hasUploadedData,
    onDismissDisclaimer: handleDismissDisclaimer,
    onUploadPatients: handleUploadPatients,
    csvUploadSheetOpen,
    onCSVUploadSheetOpenChange: setCsvUploadSheetOpen,
  };

  const renderScreenContent = () => {
    // Info pages (11 screens collapsed into config lookup)
    const infoRoute = findInfoPageRoute(screen);
    if (infoRoute) {
      const PageComponent = infoRoute.component;
      return (
        <ScreenLayout
          title={infoRoute.title}
          subtitle={infoRoute.subtitle}
          icon={infoRoute.icon}
          {...layoutProps}
          actions={
            <Button onClick={() => setScreen(Screen.LOG)} variant="ghost" className={BACK_BTN}>
              <ArrowLeft className={BACK_ICON} /> Back
            </Button>
          }
        >
          <PageComponent setScreen={setScreen} />
        </ScreenLayout>
      );
    }

    if (screen === Screen.DASHBOARD) {
      return (
        <ScreenLayout title="Clinical Dashboard" icon={<LayoutDashboard className="w-5 h-5" />} {...layoutProps}
        >
          <Dashboard
            setScreen={setScreen} existingPatients={patients} recentLogs={recentLogs}
            drugOptions={FLAT_DRUG_OPTIONS} drugCategories={DRUG_CATEGORIES}
            onViewLog={(log) => { setLastSavedRecord(log); setScreen(Screen.SUMMARY); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            onSelectPatient={handleDashboardPatientSelect} onUploadPatients={handleUploadPatients} databaseDate={databaseDate} isCustomData={hasUploadedData}
          />
        </ScreenLayout>
      );
    }

    if (screen === Screen.SUMMARY && lastSavedRecord) {
      const tabLabel = ({ report: 'Clinical Report', handout: 'Patient Handout', letter: 'Powerchart Letter' } as const)[activeReportTab];
      const patientName = `${lastSavedRecord.firstName} ${lastSavedRecord.lastName}`;
      const visitDate = lastSavedRecord.visitDate ? new Date(lastSavedRecord.visitDate).toLocaleDateString('en-AU') : '';

      const getCopyText = () => {
        if (activeReportTab === 'report') return formatClinicalReportAsText(lastSavedRecord);
        if (activeReportTab === 'handout') return formatPatientHandoutAsText(lastSavedRecord);
        return generateLetterText(lastSavedRecord, selectedPatient);
      };

      const handleCopyTab = () => {
        navigator.clipboard.writeText(getCopyText());
        showToast.success(`${tabLabel} copied to clipboard`);
      };

      const handleEmailTab = () => {
        const subject = `${tabLabel}: ${patientName}${visitDate ? ` - ${visitDate}` : ''}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(getCopyText())}`;
      };

      return (
        <ScreenLayout title="Reports" icon={<FileText className="w-5 h-5" />} {...layoutProps}
          showNav={false} showFooter={false}
          actions={<Button onClick={() => { research.reset(); resetForm(); }} variant="ghost" className={BACK_BTN}><LogOut className={BACK_ICON} /> Exit</Button>}
          contentClassName="py-4 space-y-4"
        >
          {/* Tab bar */}
          <div className="flex overflow-x-auto border-b border-border no-print -mx-1 px-1">
            {([
              { key: 'report', label: 'Clinical Report', icon: <FileText className="w-4 h-4" /> },
              { key: 'handout', label: 'Patient Handout', icon: <User className="w-4 h-4" /> },
              { key: 'letter', label: 'Powerchart Letter', icon: <ClipboardCopy className="w-4 h-4" /> },
            ] as const).map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveReportTab(key)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors rounded-none whitespace-nowrap shrink-0
                  ${activeReportTab === key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-muted-foreground dark:hover:text-foreground/90'
                  }`}
              >
                {icon}{label}
              </button>
            ))}
          </div>

          {/* Document */}
          {activeReportTab === 'report' && <ClinicalReport data={lastSavedRecord} />}
          {activeReportTab === 'handout' && <PatientHandout data={lastSavedRecord} />}
          {activeReportTab === 'letter' && <PowerchartLetter data={lastSavedRecord} patient={selectedPatient} />}

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-3 no-print mt-4">
            <Button onClick={() => window.print()} size="lg" variant="outline" className="py-5 h-auto text-sm rounded-none">
              <Printer className="w-4 h-4 mr-2" /> Print
            </Button>
            <Button onClick={handleCopyTab} size="lg" variant="outline" className="py-5 h-auto text-sm rounded-none">
              <Copy className="w-4 h-4 mr-2" /> Copy as Text
            </Button>
            <Button onClick={handleEmailTab} size="lg" variant="outline" className="py-5 h-auto text-sm rounded-none">
              <Mail className="w-4 h-4 mr-2" /> Email
            </Button>
          </div>

          {/* Research DB submission */}
          {research.isAvailable && (
            <div className="no-print">
              {research.isSubmitted ? (
                <div className="flex items-center justify-center gap-2 py-5 text-sm text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30">
                  <CheckCircle2 className="w-4 h-4" /> Saved to Research Database
                </div>
              ) : (
                <Button
                  onClick={() => research.submit(lastSavedRecord, selectedPatient?.redcapId)}
                  disabled={research.isSubmitting}
                  size="lg"
                  variant="outline"
                  className="w-full py-5 h-auto text-sm rounded-none border-dashed"
                >
                  {research.isSubmitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving to Research Database…</>
                  ) : (
                    <><Database className="w-4 h-4 mr-2" /> Save to Research Database</>
                  )}
                </Button>
              )}
              {research.error && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400 text-center">{research.error}</p>
              )}
            </div>
          )}

          {/* Start New Log */}
          <div className="no-print border-t border-border pt-6 mt-4">
            <Button onClick={() => { research.reset(); resetForm(); }} size="lg" className="w-full py-6 text-lg rounded-none bg-primary hover:bg-primary/90 text-white font-semibold transition-colors">
              <LogOut className="w-5 h-5 mr-2" /> Exit
            </Button>
          </div>
        </ScreenLayout>
      );
    }

    if (screen === Screen.PRINT_PLAN && selectedPatient && testingPlanData) {
      return (
        <ScreenLayout title="Testing Plan Preview" icon={<ClipboardList className="w-5 h-5" />} {...layoutProps} showFooter={false}
          actions={<Button onClick={() => setScreen(Screen.LOG)} variant="ghost" className={BACK_BTN}><ArrowLeft className={BACK_ICON} /> Back</Button>}
        >
          <TestingPlanPrintView patient={selectedPatient} data={testingPlanData} drugCategories={DRUG_CATEGORIES} onProceed={() => setScreen(Screen.TESTING)} />
        </ScreenLayout>
      );
    }

    if (screen === Screen.TESTING) {
      return (
        <ScreenLayout
          title="Testing Session" icon={<TestTube2 className="w-5 h-5" />}
          {...layoutProps}
          actions={<Button onClick={() => setScreen(Screen.LOG)} variant="ghost" className={BACK_BTN}><ArrowLeft className={BACK_ICON} /> Back</Button>}
          contentClassName="py-4" className="pb-32"
        >
          <TestingLogForm formData={formData} setFormData={setFormData} onSubmit={handleSubmit}
            drugCategories={DRUG_CATEGORIES} symptomOptions={APP_CONFIG.SYMPTOM_OPTIONS} interventionOptions={APP_CONFIG.INTERVENTION_OPTIONS}
          />
        </ScreenLayout>
      );
    }

    if (screen === Screen.RESEARCH) {
      return (
        <ScreenLayout title="Research Database" icon={<Database className="w-5 h-5" />} {...layoutProps}
          contentClassName="py-4"
        >
          <ResearchDashboard />
        </ScreenLayout>
      );
    }

    // Default: LOG screen
    return (
      <ScreenLayout title="DREAM" subtitle={APP_SUBTITLE} icon={<Stethoscope className="w-5 h-5" />} {...layoutProps}
        contentClassName="py-3 space-y-4" className="pb-10"
      >
        <Card className="shadow-sm rounded-none">
          <CardHeader className="pb-3 border-b border-border bg-card">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="bg-primary/10 dark:bg-primary/20 p-1.5 rounded-none"><User className="w-4 h-4 text-primary" /></div>
              Patient Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-end gap-2 w-full">
                <PatientSelector onSelectPatient={handlePatientSelect} selectedPatientId={selectedPatient?.id} patients={patients} />
                {selectedPatient?.id === 'manual' && (
                  <Button variant="outline" size="icon" onClick={() => setIsPatientDialogOpen(true)} className="mb-[1px] shrink-0 h-10 w-10" title="Edit Details">
                    <Pencil className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {!selectedPatient && (
          <Card className="shadow-sm rounded-none border-blue-100 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/20">
            <CardContent className="pt-5 pb-5">
              <div className="flex gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/40 p-1.5 rounded-none h-fit mt-0.5">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-3">
                  <p className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
                    Welcome — here's how to get started
                  </p>
                  <ol className="space-y-1.5 text-sm text-slate-700 dark:text-foreground/80">
                    <li className="flex gap-2">
                      <span className="font-semibold text-blue-700 dark:text-blue-400 shrink-0">1.</span>
                      <span>Select a patient from the dropdown above — search by name, ID, or date of birth. Choose <strong>New Patient (Manual Entry)</strong> if the patient is not in the database.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold text-blue-700 dark:text-blue-400 shrink-0">2.</span>
                      <span>If your patient database isn't loaded yet, <button onClick={() => setCsvUploadSheetOpen(true)} className="underline text-blue-700 dark:text-blue-400 hover:text-primary dark:hover:text-primary transition-colors">upload a patient CSV</button>.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold text-blue-700 dark:text-blue-400 shrink-0">3.</span>
                      <span>Once a patient is selected, review their allergy history and generate a personalised drug testing plan.</span>
                    </li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!selectedPatient && (
          <div className="space-y-4">
            {/* Clinic intro */}
            <div className="bg-gradient-to-r from-slate-900/5 to-primary/5 dark:from-slate-900/20 dark:to-slate-800/10 p-5 border border-slate-900/10 dark:border-primary/30 shadow-sm rounded-none">
              <div className="flex items-start gap-3">
                <Stethoscope className="w-6 h-6 text-slate-900 dark:text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm mb-1">The DREAM App</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    A specialist service for patients who have experienced a suspected allergic reaction
                    during an anaesthetic. Our team investigates these reactions to identify the drug
                    responsible and help plan safe anaesthesia for future procedures.
                  </p>
                </div>
              </div>
            </div>

            {/* Purpose + Privacy */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-card border border-border p-4 shadow-sm rounded-none">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Purpose</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Helps clinicians prepare for allergy clinic appointments — reviewing patient histories,
                  recording test results, and generating reports and testing plans.
                </p>
              </div>
              <div className="bg-card border border-border p-4 shadow-sm rounded-none">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Data Privacy</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  All patient data is stored and processed on your own device. Nothing is sent to
                  external servers. Your data stays with you.
                </p>
              </div>
            </div>

            {/* Key Features */}
            <div className="bg-card border border-border p-4 shadow-sm rounded-none">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Key Features</span>
              </div>
              <ul className="grid sm:grid-cols-2 gap-2">
                {[
                  "Dashboard showing patient statistics at a glance",
                  "Search and filter patients by name, reaction grade, and date",
                  "Detailed patient history and timeline views",
                  "Skin test and drug challenge result recording",
                  "Three report types: clinical report, patient handout, and clinical letter",
                  "Create and print testing plan request forms for nursing staff",
                  "Import patient records from your clinic database",
                  "Works offline — use the app without internet access",
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-0.5 shrink-0">•</span>{f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {selectedPatient?.id === 'manual' && (
          <Dialog open={isPatientDialogOpen} onOpenChange={setIsPatientDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>New Patient Details</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs uppercase mb-1.5 block text-muted-foreground">First Name</Label>
                    <Input value={selectedPatient.firstName} onChange={(e) => handleManualDetailChange('firstName', e.target.value)} placeholder="Enter first name" />
                  </div>
                  <div>
                    <Label className="text-xs uppercase mb-1.5 block text-muted-foreground">Last Name</Label>
                    <Input value={selectedPatient.lastName} onChange={(e) => handleManualDetailChange('lastName', e.target.value)} placeholder="Enter last name" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs uppercase mb-1.5 block text-muted-foreground">MRN</Label>
                    <Input value={selectedPatient.mrn} onChange={(e) => handleManualDetailChange('mrn', e.target.value)} placeholder="Medical Record Number..." />
                  </div>
                  <div>
                    <Label className="text-xs uppercase mb-1.5 block text-muted-foreground">REDCap Record ID</Label>
                    <Input value={selectedPatient.redcapId || ''} onChange={(e) => handleManualDetailChange('redcapId', e.target.value)} placeholder="REDCap ID..." />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs uppercase mb-1.5 block text-muted-foreground">Date of Birth</Label>
                    <Input type="date" value={selectedPatient.dob} onChange={(e) => handleManualDetailChange('dob', e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs uppercase mb-1.5 block text-muted-foreground">Gender</Label>
                    <Input value={selectedPatient.gender} onChange={(e) => handleManualDetailChange('gender', e.target.value)} placeholder="Gender..." />
                  </div>
                  <div>
                    <Label className="text-xs uppercase mb-1.5 block text-muted-foreground">City / Suburb</Label>
                    <Input value={selectedPatient.city} onChange={(e) => handleManualDetailChange('city', e.target.value)} placeholder="City..." />
                  </div>
                </div>
              </div>
              <DialogFooter><Button onClick={() => setIsPatientDialogOpen(false)}>Save & Close</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {selectedPatient && (
          <div key={selectedPatient.id} className="space-y-8">
            {selectedPatient.id !== 'manual' && (
              <div style={{ '--section-index': 0 } as React.CSSProperties} className="animate-section-reveal">
                <PatientHistory patient={selectedPatient} />
              </div>
            )}
            <div style={{ '--section-index': selectedPatient.id !== 'manual' ? 1 : 0 } as React.CSSProperties} className="animate-section-reveal">
              <TestingPlanGenerator patient={selectedPatient} drugCategories={DRUG_CATEGORIES}
                onPreview={(data) => { setTestingPlanData(data); setScreen(Screen.PRINT_PLAN); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              />
            </div>
            <div style={{ '--section-index': selectedPatient.id !== 'manual' ? 2 : 1 } as React.CSSProperties} className="animate-section-reveal">
              <div className="flex justify-end pt-4">
                <Button size="lg" className="w-full sm:w-auto text-base py-6 rounded-none bg-primary hover:bg-primary/90 text-white font-semibold transition-colors btn-press" onClick={() => setScreen(Screen.TESTING)}>
                  Proceed to Testing Panel <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </ScreenLayout>
    );
  };

  return (
    <React.Suspense fallback={<div className="min-h-svh bg-background" />}>
      {renderScreenContent()}
    </React.Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey={APP_CONFIG.LOCAL_STORAGE_KEYS.THEME}>
        <FontSizeProvider>
          <PasswordGate>
            <AnaestheticLogApp />
          </PasswordGate>
          <Toaster position="top-center" expand={false} richColors closeButton duration={5000}
            toastOptions={{ classNames: {
              toast: 'border border-border rounded-none shadow-sm',
              actionButton: 'bg-primary text-white hover:bg-primary/90 transition-colors',
              description: 'text-muted-foreground',
            }}}
          />
        </FontSizeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
