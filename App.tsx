
import React, { useEffect } from 'react';
import { LayoutDashboard, Stethoscope, FileText, User, Printer, Plus, ArrowLeft, ChevronRight, TestTube2, ClipboardList, Pencil, Shield, ShieldCheck, FileCheck, Cpu, AlertTriangle } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Toaster } from './components/ui';
import PatientSelector from './components/PatientSelector';
import PatientHistory from './components/PatientHistory';
import TestingLogForm from './components/TestingLogForm';
import ClinicalReport from './components/ClinicalReport';
import PatientHandout from './components/PatientHandout';
import Dashboard from './components/Dashboard';
const Changelog = React.lazy(() => import('./components/Changelog'));
import TestingPlanGenerator from './components/TestingPlanGenerator';
import TestingPlanPrintView from './components/TestingPlanPrintView';
const AboutPage = React.lazy(() => import('./components/AboutPage'));
const FAQPage = React.lazy(() => import('./components/FAQPage'));
const DrugReferencePage = React.lazy(() => import('./components/DrugReferencePage'));
const ContactPage = React.lazy(() => import('./components/ContactPage'));
const ResourcesPage = React.lazy(() => import('./components/ResourcesPage'));
const PrivacyPolicyPage = React.lazy(() => import('./components/PrivacyPolicyPage'));
const ClinicalGovernancePage = React.lazy(() => import('./components/ClinicalGovernancePage'));
const TermsOfUsePage = React.lazy(() => import('./components/TermsOfUsePage'));
const TechnicalDocumentationPage = React.lazy(() => import('./components/TechnicalDocumentationPage'));
const DisclaimerPage = React.lazy(() => import('./components/DisclaimerPage'));
import { ScreenLayout } from './components/ScreenLayout';
import { ThemeProvider } from './components/ThemeProvider';
import { FontSizeProvider } from './components/FontSizeProvider';
import ErrorBoundary from './components/ErrorBoundary';
import { Screen } from './types';
import { DRUG_CATEGORIES, FLAT_DRUG_OPTIONS, APP_CONFIG } from './lib/constants';
import { useAnaestheticApp } from './hooks/useAnaestheticApp';
import { reportWebVitals } from './src/lib/analytics';

const APP_SUBTITLE = APP_CONFIG.APP_SUBTITLE;

function AnaestheticLogApp() {
  // Initialize performance monitoring
  useEffect(() => {
    reportWebVitals();
  }, []);

  const {
    screen,
    setScreen,
    formData,
    setFormData,
    selectedPatient,
    lastSavedRecord,
    setLastSavedRecord,
    testingPlanData,
    setTestingPlanData,
    isPatientDialogOpen,
    setIsPatientDialogOpen,
    patients,
    databaseDate,
    hasUploadedData,
    recentLogs,
    showDisclaimer,
    handleDismissDisclaimer,
    handlePatientSelect,
    handleManualDetailChange,
    handleSubmit,
    handleUploadPatients,
    handleDashboardPatientSelect,
    resetForm,
  } = useAnaestheticApp();

  const handlePrint = () => {
    window.print();
  };

  // Render content based on screen state
  const renderScreenContent = () => {
    if (screen === Screen.CHANGELOG) {
        return (
            <ScreenLayout
                title="Application Changelog"
                subtitle={APP_SUBTITLE}
                icon={<User className="w-5 h-5" />}
                setScreen={setScreen}
                databaseDate={databaseDate}
                showDisclaimer={showDisclaimer}
                isCustomData={hasUploadedData}
                onDismissDisclaimer={handleDismissDisclaimer}
                onUploadPatients={handleUploadPatients}
                actions={
                    <Button onClick={() => setScreen(Screen.LOG)} variant="ghost" className="h-9 px-4 bg-white/10 hover:bg-white/30 text-white hover:text-white border border-white/20 shadow-sm transition-all duration-200 group rounded-none">
                        <ArrowLeft className="w-4 h-4 mr-1 opacity-90 group-hover:opacity-100 transition-opacity" /> Back to Log
                    </Button>
                }
            >
                <Changelog setScreen={setScreen} databaseDate={databaseDate} />
            </ScreenLayout>
        );
    }

    if (screen === Screen.ABOUT) {
        return (
            <ScreenLayout
                title="About"
                subtitle={APP_SUBTITLE}
                icon={<User className="w-5 h-5" />}
                setScreen={setScreen}
                databaseDate={databaseDate}
                showDisclaimer={showDisclaimer}
                isCustomData={hasUploadedData}
                onDismissDisclaimer={handleDismissDisclaimer}
                onUploadPatients={handleUploadPatients}
                actions={
                    <Button onClick={() => setScreen(Screen.LOG)} variant="ghost" className="h-9 px-4 bg-white/10 hover:bg-white/30 text-white hover:text-white border border-white/20 shadow-sm transition-all duration-200 group rounded-none">
                        <ArrowLeft className="w-4 h-4 mr-1 opacity-90 group-hover:opacity-100 transition-opacity" /> Back
                    </Button>
                }
            >
                <AboutPage setScreen={setScreen} />
            </ScreenLayout>
        );
    }

    if (screen === Screen.FAQ) {
        return (
            <ScreenLayout
                title="FAQ"
                subtitle={APP_SUBTITLE}
                icon={<User className="w-5 h-5" />}
                setScreen={setScreen}
                databaseDate={databaseDate}
                showDisclaimer={showDisclaimer}
                isCustomData={hasUploadedData}
                onDismissDisclaimer={handleDismissDisclaimer}
                onUploadPatients={handleUploadPatients}
                actions={
                    <Button onClick={() => setScreen(Screen.LOG)} variant="ghost" className="h-9 px-4 bg-white/10 hover:bg-white/30 text-white hover:text-white border border-white/20 shadow-sm transition-all duration-200 group rounded-none">
                        <ArrowLeft className="w-4 h-4 mr-1 opacity-90 group-hover:opacity-100 transition-opacity" /> Back
                    </Button>
                }
            >
                <FAQPage setScreen={setScreen} />
            </ScreenLayout>
        );
    }

    if (screen === Screen.DRUG_REFERENCE) {
        return (
            <ScreenLayout
                title="Drug Reference"
                subtitle={APP_SUBTITLE}
                icon={<User className="w-5 h-5" />}
                setScreen={setScreen}
                databaseDate={databaseDate}
                showDisclaimer={showDisclaimer}
                isCustomData={hasUploadedData}
                onDismissDisclaimer={handleDismissDisclaimer}
                onUploadPatients={handleUploadPatients}
                actions={
                    <Button onClick={() => setScreen(Screen.LOG)} variant="ghost" className="h-9 px-4 bg-white/10 hover:bg-white/30 text-white hover:text-white border border-white/20 shadow-sm transition-all duration-200 group rounded-none">
                        <ArrowLeft className="w-4 h-4 mr-1 opacity-90 group-hover:opacity-100 transition-opacity" /> Back
                    </Button>
                }
            >
                <DrugReferencePage setScreen={setScreen} />
            </ScreenLayout>
        );
    }

    if (screen === Screen.CONTACT) {
        return (
            <ScreenLayout
                title="Contact"
                subtitle={APP_SUBTITLE}
                icon={<User className="w-5 h-5" />}
                setScreen={setScreen}
                databaseDate={databaseDate}
                showDisclaimer={showDisclaimer}
                isCustomData={hasUploadedData}
                onDismissDisclaimer={handleDismissDisclaimer}
                onUploadPatients={handleUploadPatients}
                actions={
                    <Button onClick={() => setScreen(Screen.LOG)} variant="ghost" className="h-9 px-4 bg-white/10 hover:bg-white/30 text-white hover:text-white border border-white/20 shadow-sm transition-all duration-200 group rounded-none">
                        <ArrowLeft className="w-4 h-4 mr-1 opacity-90 group-hover:opacity-100 transition-opacity" /> Back
                    </Button>
                }
            >
                <ContactPage setScreen={setScreen} />
            </ScreenLayout>
        );
    }

    if (screen === Screen.RESOURCES) {
        return (
            <ScreenLayout
                title="Resources"
                subtitle={APP_SUBTITLE}
                icon={<User className="w-5 h-5" />}
                setScreen={setScreen}
                databaseDate={databaseDate}
                showDisclaimer={showDisclaimer}
                isCustomData={hasUploadedData}
                onDismissDisclaimer={handleDismissDisclaimer}
                onUploadPatients={handleUploadPatients}
                actions={
                    <Button onClick={() => setScreen(Screen.LOG)} variant="ghost" className="h-9 px-4 bg-white/10 hover:bg-white/30 text-white hover:text-white border border-white/20 shadow-sm transition-all duration-200 group rounded-none">
                        <ArrowLeft className="w-4 h-4 mr-1 opacity-90 group-hover:opacity-100 transition-opacity" /> Back
                    </Button>
                }
            >
                <ResourcesPage setScreen={setScreen} />
            </ScreenLayout>
        );
    }

    if (screen === Screen.PRIVACY_POLICY) {
        return (
            <ScreenLayout
                title="Privacy Policy"
                subtitle="How we protect your health information"
                icon={<Shield className="w-5 h-5" />}
                setScreen={setScreen}
                databaseDate={databaseDate}
                showDisclaimer={showDisclaimer}
                isCustomData={hasUploadedData}
                onDismissDisclaimer={handleDismissDisclaimer}
                onUploadPatients={handleUploadPatients}
                actions={
                    <Button onClick={() => setScreen(Screen.LOG)} variant="ghost" className="h-9 px-4 bg-white/10 hover:bg-white/30 text-white hover:text-white border border-white/20 shadow-sm transition-all duration-200 group rounded-none">
                        <ArrowLeft className="w-4 h-4 mr-1 opacity-90 group-hover:opacity-100 transition-opacity" /> Back
                    </Button>
                }
            >
                <PrivacyPolicyPage setScreen={setScreen} />
            </ScreenLayout>
        );
    }

    if (screen === Screen.CLINICAL_GOVERNANCE) {
        return (
            <ScreenLayout
                title="Clinical Governance"
                subtitle="Our commitment to clinical safety and quality"
                icon={<ShieldCheck className="w-5 h-5" />}
                setScreen={setScreen}
                databaseDate={databaseDate}
                showDisclaimer={showDisclaimer}
                isCustomData={hasUploadedData}
                onDismissDisclaimer={handleDismissDisclaimer}
                onUploadPatients={handleUploadPatients}
                actions={
                    <Button onClick={() => setScreen(Screen.LOG)} variant="ghost" className="h-9 px-4 bg-white/10 hover:bg-white/30 text-white hover:text-white border border-white/20 shadow-sm transition-all duration-200 group rounded-none">
                        <ArrowLeft className="w-4 h-4 mr-1 opacity-90 group-hover:opacity-100 transition-opacity" /> Back
                    </Button>
                }
            >
                <ClinicalGovernancePage setScreen={setScreen} />
            </ScreenLayout>
        );
    }

    if (screen === Screen.TERMS_OF_USE) {
        return (
            <ScreenLayout
                title="Terms of Use"
                subtitle="Legal terms for using this application"
                icon={<FileCheck className="w-5 h-5" />}
                setScreen={setScreen}
                databaseDate={databaseDate}
                showDisclaimer={showDisclaimer}
                isCustomData={hasUploadedData}
                onDismissDisclaimer={handleDismissDisclaimer}
                onUploadPatients={handleUploadPatients}
                actions={
                    <Button onClick={() => setScreen(Screen.LOG)} variant="ghost" className="h-9 px-4 bg-white/10 hover:bg-white/30 text-white hover:text-white border border-white/20 shadow-sm transition-all duration-200 group rounded-none">
                        <ArrowLeft className="w-4 h-4 mr-1 opacity-90 group-hover:opacity-100 transition-opacity" /> Back
                    </Button>
                }
            >
                <TermsOfUsePage setScreen={setScreen} />
            </ScreenLayout>
        );
    }

    if (screen === Screen.TECHNICAL_DOCUMENTATION) {
        return (
            <ScreenLayout
                title="Technical Documentation"
                subtitle="Architecture, security, and technical specifications"
                icon={<Cpu className="w-5 h-5" />}
                setScreen={setScreen}
                databaseDate={databaseDate}
                showDisclaimer={showDisclaimer}
                isCustomData={hasUploadedData}
                onDismissDisclaimer={handleDismissDisclaimer}
                onUploadPatients={handleUploadPatients}
                actions={
                    <Button onClick={() => setScreen(Screen.LOG)} variant="ghost" className="h-9 px-4 bg-white/10 hover:bg-white/30 text-white hover:text-white border border-white/20 shadow-sm transition-all duration-200 group rounded-none">
                        <ArrowLeft className="w-4 h-4 mr-1 opacity-90 group-hover:opacity-100 transition-opacity" /> Back
                    </Button>
                }
            >
                <TechnicalDocumentationPage setScreen={setScreen} />
            </ScreenLayout>
        );
    }

    if (screen === Screen.DISCLAIMER) {
        return (
            <ScreenLayout
                title="Disclaimer"
                subtitle="Important medical and legal information"
                icon={<AlertTriangle className="w-5 h-5" />}
                setScreen={setScreen}
                databaseDate={databaseDate}
                showDisclaimer={showDisclaimer}
                isCustomData={hasUploadedData}
                onDismissDisclaimer={handleDismissDisclaimer}
                onUploadPatients={handleUploadPatients}
                actions={
                    <Button onClick={() => setScreen(Screen.LOG)} variant="ghost" className="h-9 px-4 bg-white/10 hover:bg-white/30 text-white hover:text-white border border-white/20 shadow-sm transition-all duration-200 group rounded-none">
                        <ArrowLeft className="w-4 h-4 mr-1 opacity-90 group-hover:opacity-100 transition-opacity" /> Back
                    </Button>
                }
            >
                <DisclaimerPage setScreen={setScreen} />
            </ScreenLayout>
        );
    }

    if (screen === Screen.DASHBOARD) {
        return (
            <ScreenLayout
                title="Clinical Dashboard"
                subtitle={APP_SUBTITLE}
                icon={<LayoutDashboard className="w-5 h-5" />}
                setScreen={setScreen}
                databaseDate={databaseDate}
                showDisclaimer={showDisclaimer}
                isCustomData={hasUploadedData}
                onDismissDisclaimer={handleDismissDisclaimer}
                onUploadPatients={handleUploadPatients}
                actions={
                    <Button onClick={() => setScreen(Screen.LOG)} variant="ghost" className="h-9 px-4 bg-white/10 hover:bg-white/30 text-white hover:text-white border border-white/20 shadow-sm transition-all duration-200 group rounded-none">
                        <ArrowLeft className="w-4 h-4 mr-1 opacity-90 group-hover:opacity-100 transition-opacity" /> Back to Log
                    </Button>
                }
            >
                <Dashboard 
                    setScreen={setScreen} 
                    existingPatients={patients}
                    recentLogs={recentLogs}
                    drugOptions={FLAT_DRUG_OPTIONS}
                    drugCategories={DRUG_CATEGORIES}
                    onViewLog={(log) => {
                        setLastSavedRecord(log);
                        setScreen(Screen.SUMMARY);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onSelectPatient={handleDashboardPatientSelect}
                    onUploadPatients={handleUploadPatients}
                    databaseDate={databaseDate}
                />
            </ScreenLayout>
        );
    }

    if (screen === Screen.SUMMARY && lastSavedRecord) {
        return (
            <ScreenLayout
                title="Clinical Report"
                subtitle={APP_SUBTITLE}
                icon={<FileText className="w-5 h-5" />}
                setScreen={setScreen}
                databaseDate={databaseDate}
                showDisclaimer={showDisclaimer}
                isCustomData={hasUploadedData}
                onDismissDisclaimer={handleDismissDisclaimer}
                onUploadPatients={handleUploadPatients}
                actions={
                    <Button onClick={() => setScreen(Screen.DASHBOARD)} variant="ghost" className="h-9 px-4 bg-white/10 hover:bg-white/30 text-white hover:text-white border border-white/20 shadow-sm transition-all duration-200 group rounded-none">
                        <LayoutDashboard className="w-4 h-4 mr-1 opacity-90 group-hover:opacity-100 transition-opacity" /> Dashboard
                    </Button>
                }
                contentClassName="p-4 space-y-4"
            >
                <ClinicalReport data={lastSavedRecord} />
                <div className="flex flex-col sm:flex-row gap-4 no-print mt-6">
                    <Button onClick={handlePrint} size="lg" variant="outline" className="flex-1 py-6 h-auto text-base rounded-none">
                        <Printer className="w-5 h-5 mr-2" /> Print Clinical Report
                    </Button>
                    <Button onClick={() => setScreen(Screen.PATIENT_SUMMARY)} size="lg" variant="secondary" className="flex-1 py-6 h-auto text-base rounded-none">
                        <User className="w-5 h-5 mr-2" /> View Patient Handout
                    </Button>
                </div>
                <div className="no-print border-t border-slate-200 dark:border-slate-800 pt-6 mt-4">
                    <Button onClick={resetForm} size="lg" className="w-full py-6 text-lg rounded-none bg-primary hover:bg-primary/90 text-white font-semibold transition-colors">
                        <Plus className="w-5 h-5 mr-2" /> Start New Log
                    </Button>
                </div>
            </ScreenLayout>
        );
    }

    if (screen === Screen.PATIENT_SUMMARY && lastSavedRecord) {
        return (
             <ScreenLayout
                title="Patient Handout"
                subtitle={APP_SUBTITLE}
                icon={<User className="w-5 h-5" />}
                setScreen={setScreen}
                databaseDate={databaseDate}
                showDisclaimer={showDisclaimer}
                isCustomData={hasUploadedData}
                onDismissDisclaimer={handleDismissDisclaimer}
                onUploadPatients={handleUploadPatients}
                actions={
                    <Button onClick={() => setScreen(Screen.DASHBOARD)} variant="ghost" className="h-9 px-4 bg-white/10 hover:bg-white/30 text-white hover:text-white border border-white/20 shadow-sm transition-all duration-200 group rounded-none">
                        <LayoutDashboard className="w-4 h-4 mr-1 opacity-90 group-hover:opacity-100 transition-opacity" /> Dashboard
                    </Button>
                }
                contentClassName="p-4 space-y-4"
            >
                <PatientHandout data={lastSavedRecord} />
                <div className="flex flex-col sm:flex-row gap-4 no-print mt-6">
                    <Button onClick={() => setScreen(Screen.SUMMARY)} size="lg" variant="ghost" className="flex-1 py-6 h-auto text-base rounded-none">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Clinical Report
                    </Button>
                    <Button onClick={handlePrint} size="lg" variant="outline" className="flex-1 py-6 h-auto text-base rounded-none border-slate-300">
                        <Printer className="w-4 h-4 mr-2" /> Print Handout
                    </Button>
                </div>
                <div className="no-print border-t border-slate-200 dark:border-slate-800 pt-6 mt-4">
                    <Button onClick={resetForm} size="lg" className="w-full py-6 text-lg bg-primary hover:bg-primary/90 text-white rounded-none font-semibold transition-colors">
                        <Plus className="w-5 h-5 mr-2" /> Start New Log
                    </Button>
                </div>
            </ScreenLayout>
        );
    }

    if (screen === Screen.PRINT_PLAN && selectedPatient && testingPlanData) {
        return (
            <ScreenLayout
                title="Testing Plan Preview"
                subtitle={APP_SUBTITLE}
                icon={<ClipboardList className="w-5 h-5" />}
                setScreen={setScreen}
                databaseDate={databaseDate}
                showFooter={false}
                showDisclaimer={showDisclaimer}
                isCustomData={hasUploadedData}
                onDismissDisclaimer={handleDismissDisclaimer}
                onUploadPatients={handleUploadPatients}
                actions={
                    <Button onClick={() => setScreen(Screen.LOG)} variant="ghost" className="h-9 px-4 bg-white/10 hover:bg-white/30 text-white hover:text-white border border-white/20 shadow-sm transition-all duration-200 group rounded-none">
                        <ArrowLeft className="w-4 h-4 mr-1 opacity-90 group-hover:opacity-100 transition-opacity" /> Back
                    </Button>
                }
            >
                <TestingPlanPrintView 
                    patient={selectedPatient}
                    data={testingPlanData}
                    drugCategories={DRUG_CATEGORIES}
                    onProceed={() => setScreen(Screen.TESTING)}
                />
            </ScreenLayout>
        );
    }

    if (screen === Screen.TESTING) {
        return (
            <ScreenLayout
                title="Testing Session"
                icon={<TestTube2 className="w-5 h-5" />}
                subtitle={selectedPatient ? `Patient: ${selectedPatient.lastName}, ${selectedPatient.firstName} (ID: ${selectedPatient.id === 'manual' ? 'New' : selectedPatient.id})` : APP_SUBTITLE}
                setScreen={setScreen}
                databaseDate={databaseDate}
                showDisclaimer={showDisclaimer}
                isCustomData={hasUploadedData}
                onDismissDisclaimer={handleDismissDisclaimer}
                onUploadPatients={handleUploadPatients}
                actions={
                    <Button onClick={() => setScreen(Screen.LOG)} variant="ghost" className="h-9 px-4 bg-white/10 hover:bg-white/30 text-white hover:text-white border border-white/20 shadow-sm transition-all duration-200 group rounded-none">
                        <ArrowLeft className="w-4 h-4 mr-1 opacity-90 group-hover:opacity-100 transition-opacity" /> Back
                    </Button>
                }
                contentClassName="p-4"
                className="pb-32"
            >
                <TestingLogForm 
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleSubmit}
                    drugCategories={DRUG_CATEGORIES}
                    symptomOptions={APP_CONFIG.SYMPTOM_OPTIONS}
                    interventionOptions={APP_CONFIG.INTERVENTION_OPTIONS}
                />
            </ScreenLayout>
        );
    }

    // Default: 'log' screen (Patient Selection & History)
    return (
        <ScreenLayout
            title="Anaesthetic Allergy Clinic"
            subtitle={APP_SUBTITLE}
            icon={<Stethoscope className="w-5 h-5" />}
            setScreen={setScreen}
            databaseDate={databaseDate}
            showDisclaimer={showDisclaimer}
            isCustomData={hasUploadedData}
            onDismissDisclaimer={handleDismissDisclaimer}
            onUploadPatients={handleUploadPatients}
            actions={
                <Button onClick={() => setScreen(Screen.DASHBOARD)}variant="ghost" className="h-9 px-4 bg-white/10 hover:bg-white/30 text-white hover:text-white border border-white/20 shadow-sm transition-all duration-200 group rounded-none">
                    <LayoutDashboard className="w-4 h-4 mr-1 opacity-90 group-hover:opacity-100 transition-opacity" /> Dashboard
                </Button>
            }
            contentClassName="p-3 space-y-4"
            className="pb-10"
        >
            <Card className="border-t-4 border-primary shadow-sm rounded-none">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="bg-primary/10 dark:bg-primary/20 p-1.5 rounded-none">
                            <User className="w-4 h-4 text-primary" />
                        </div>
                        Patient Selection
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-end gap-2 w-full">
                            <PatientSelector 
                                onSelectPatient={handlePatientSelect} 
                                selectedPatientId={selectedPatient?.id}
                                patients={patients} 
                            />
                            {selectedPatient?.id === 'manual' && (
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    onClick={() => setIsPatientDialogOpen(true)}
                                    className="mb-[1px] shrink-0 h-10 w-10"
                                    title="Edit Details"
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                        
                        {/* REMOVED: Name, city, dob box */}
                    </div>
                </CardContent>
            </Card>

            {/* Manual Patient Entry Dialog */}
            {selectedPatient?.id === 'manual' && (
                <Dialog open={isPatientDialogOpen} onOpenChange={setIsPatientDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>New Patient Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs uppercase mb-1.5 block text-slate-500">First Name</Label>
                                    <Input 
                                        value={selectedPatient.firstName} 
                                        onChange={(e) => handleManualDetailChange('firstName', e.target.value)}
                                        placeholder="Enter first name"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs uppercase mb-1.5 block text-slate-500">Last Name</Label>
                                    <Input 
                                        value={selectedPatient.lastName} 
                                        onChange={(e) => handleManualDetailChange('lastName', e.target.value)}
                                        placeholder="Enter last name"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <Label className="text-xs uppercase mb-1.5 block text-slate-500">MRN / ID</Label>
                                    <Input 
                                        value={selectedPatient.mrn} 
                                        onChange={(e) => handleManualDetailChange('mrn', e.target.value)}
                                        placeholder="MRN..."
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs uppercase mb-1.5 block text-slate-500">Date of Birth</Label>
                                    <Input 
                                        type="date"
                                        value={selectedPatient.dob} 
                                        onChange={(e) => handleManualDetailChange('dob', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs uppercase mb-1.5 block text-slate-500">City / Suburb</Label>
                                    <Input 
                                        value={selectedPatient.city} 
                                        onChange={(e) => handleManualDetailChange('city', e.target.value)}
                                        placeholder="City..."
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setIsPatientDialogOpen(false)}>Save & Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {selectedPatient && (
                <div key={selectedPatient.id} className="animate-enter space-y-8">
                    {/* Only show History for existing DB patients */}
                    {selectedPatient.id !== 'manual' && (
                        <PatientHistory patient={selectedPatient} />
                    )}
                    
                    <TestingPlanGenerator 
                        patient={selectedPatient} 
                        drugCategories={DRUG_CATEGORIES}
                        onPreview={(data) => {
                            setTestingPlanData(data);
                            setScreen(Screen.PRINT_PLAN);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }} 
                    />
                    <div className="flex justify-end pt-4">
                        <Button 
                            size="lg" 
                            className="w-full sm:w-auto text-base py-6 rounded-none bg-primary hover:bg-primary/90 text-white font-semibold transition-colors"
                            onClick={() => setScreen(Screen.TESTING)}
                        >
                            Proceed to Testing Panel <ChevronRight className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                </div>
            )}
        </ScreenLayout>
    );
  };

  return (
    <>
      {renderScreenContent()}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey={APP_CONFIG.LOCAL_STORAGE_KEYS.THEME}>
        <FontSizeProvider>
            <AnaestheticLogApp />
            <Toaster
              position="top-center"
              expand={false}
              richColors
              closeButton
              duration={5000}
              toastOptions={{
                classNames: {
                  toast: 'border border-slate-200 dark:border-slate-800 rounded-none shadow-sm',
                  actionButton: 'bg-primary text-white hover:bg-primary/90 transition-colors',
                  description: 'text-slate-600 dark:text-slate-300',
                }
              }}
            />
        </FontSizeProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
