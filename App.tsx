import React, { useState } from 'react';
import { LayoutDashboard, Stethoscope, FileText, User, Printer, Plus, ArrowLeft, ChevronRight, TestTube2, ClipboardList } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from './components/ui';
import PatientSelector from './components/PatientSelector';
import PatientHistory from './components/PatientHistory';
import TestingLogForm from './components/TestingLogForm';
import ClinicalReport from './components/ClinicalReport';
import PatientHandout from './components/PatientHandout';
import Dashboard from './components/Dashboard';
import Changelog from './components/Changelog';
import TestingPlanGenerator from './components/TestingPlanGenerator';
import TestingPlanPrintView from './components/TestingPlanPrintView';
import { ScreenLayout } from './components/ScreenLayout';
import { ThemeProvider } from './components/ThemeProvider';
import { FontSizeProvider } from './components/FontSizeProvider';
import { LogFormData, Patient, Screen, TestingPlanData } from './types';
import { formatDate } from './lib/utils';
import { MOCK_PATIENTS } from './data/mockPatients';
import { DRUG_CATEGORIES, FLAT_DRUG_OPTIONS } from './lib/constants';

const APP_SUBTITLE = "RPAH Department of Clinical Immunology & Allergy";

const INITIAL_FORM_STATE: LogFormData = {
    mrn: '',
    firstName: '',
    lastName: '',
    visitDate: new Date().toISOString().split('T')[0],
    controls: {
      histamineSpt: '',
      salineSpt: '',
      salineIdt: '',
    },
    testPanel: [],
    proceedToChallenge: false,
    challengeDrug: '',
    challengeDrugCustom: '',
    outcome: null,
    reactionTime: '',
    symptoms: [],
    symptomsOther: '',
    interventionType: '',
    interventionOther: '',
    plan: ''
};

function AnaestheticLogApp() {
  const [screen, setScreen] = useState<Screen>('log');
  const [formData, setFormData] = useState<LogFormData>(INITIAL_FORM_STATE);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [lastSavedRecord, setLastSavedRecord] = useState<LogFormData | null>(null);
  const [testingPlanData, setTestingPlanData] = useState<TestingPlanData | null>(null);
  
  // State for Patients Database (Initialized with Mock, can be updated via CSV)
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [databaseDate, setDatabaseDate] = useState<string>("03/12/2025");

  // State for NEWLY added logs (separate from the static database)
  const [recentLogs, setRecentLogs] = useState<LogFormData[]>([]);

  // Disclaimer Visibility State - Check localStorage first
  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    // Only access localStorage in browser environment
    if (typeof window !== 'undefined') {
        return localStorage.getItem('disclaimerDismissed') !== 'true';
    }
    return true;
  });

  const handleDismissDisclaimer = () => {
    setShowDisclaimer(false);
    if (typeof window !== 'undefined') {
        localStorage.setItem('disclaimerDismissed', 'true');
    }
  };

  const symptomOptions = ['Urticaria', 'Angioedema', 'Bronchospasm', 'Hypotension', 'Flushing', 'Desaturation', 'Other'];
  const interventionOptions = ['None (Observation)', 'Adrenaline', 'Antihistamine', 'Other'];

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    
    // If manual, clear form but keep structure. If existing, pre-fill.
    if (patient.id === 'manual') {
        setFormData(prev => ({
            ...INITIAL_FORM_STATE,
            visitDate: prev.visitDate // Keep current date if set
        }));
    } else {
        setFormData(prev => ({
            ...prev,
            firstName: patient.firstName,
            lastName: patient.lastName,
            mrn: patient.mrn,
            testPanel: [],
            proceedToChallenge: false,
            outcome: null,
            plan: ''
        }));
    }
  };

  const handleManualDetailChange = (field: keyof Patient | 'dob', value: string) => {
    if (!selectedPatient) return;

    // Update local patient object state (for UI display and Testing Plan)
    setSelectedPatient(prev => {
        if (!prev) return null;
        return { ...prev, [field]: value };
    });

    // Update form data state (for Report)
    if (field === 'firstName' || field === 'lastName' || field === 'mrn') {
        setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = () => {
    const recordToSave = { ...formData };
    setLastSavedRecord(recordToSave);
    setRecentLogs(prev => [recordToSave, ...prev]);
    setScreen('summary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUploadPatients = (newPatients: Patient[]) => {
    setPatients(newPatients);
    setDatabaseDate(new Date().toLocaleDateString('en-GB'));
    alert(`Successfully updated database with ${newPatients.length} records.`);
  };

  // Handler for clicking a patient in the Dashboard
  const handleDashboardPatientSelect = (patient: Patient) => {
    handlePatientSelect(patient);
    setScreen('log');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrint = () => {
    window.print();
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setSelectedPatient(null);
    setLastSavedRecord(null);
    setScreen('log');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render content based on screen state
  const renderScreenContent = () => {
    if (screen === 'changelog') {
        return (
            <ScreenLayout
                title="Application Changelog"
                subtitle={APP_SUBTITLE}
                icon={<User className="w-5 h-5" />}
                setScreen={setScreen}
                databaseDate={databaseDate}
                showDisclaimer={showDisclaimer}
                onDismissDisclaimer={handleDismissDisclaimer}
                onUploadPatients={handleUploadPatients}
                actions={
                    <Button onClick={() => setScreen('log')} variant="headerAction" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Log
                    </Button>
                }
            >
                <Changelog setScreen={setScreen} databaseDate={databaseDate} />
            </ScreenLayout>
        );
    }

    if (screen === 'dashboard') {
        return (
            <ScreenLayout
                title="Clinical Dashboard"
                subtitle={APP_SUBTITLE}
                icon={<LayoutDashboard className="w-5 h-5" />}
                setScreen={setScreen}
                databaseDate={databaseDate}
                showDisclaimer={showDisclaimer}
                onDismissDisclaimer={handleDismissDisclaimer}
                onUploadPatients={handleUploadPatients}
                actions={
                    <Button onClick={() => setScreen('log')} variant="headerAction" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Log
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
                        setScreen('summary');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onSelectPatient={handleDashboardPatientSelect}
                    onUploadPatients={handleUploadPatients}
                    databaseDate={databaseDate}
                />
            </ScreenLayout>
        );
    }

    if (screen === 'summary' && lastSavedRecord) {
        return (
            <ScreenLayout
                title="Clinical Report"
                subtitle={APP_SUBTITLE}
                icon={<FileText className="w-5 h-5" />}
                setScreen={setScreen}
                databaseDate={databaseDate}
                showDisclaimer={showDisclaimer}
                onDismissDisclaimer={handleDismissDisclaimer}
                onUploadPatients={handleUploadPatients}
                actions={
                    <Button onClick={() => setScreen('dashboard')} variant="headerAction" size="sm">
                        <LayoutDashboard className="w-4 h-4 mr-1" /> Dashboard
                    </Button>
                }
                contentClassName="p-6 space-y-6"
            >
                <ClinicalReport data={lastSavedRecord} />
                <div className="flex flex-col sm:flex-row gap-4 no-print mt-8">
                    <Button onClick={handlePrint} size="lg" variant="outline" className="flex-1 py-6 h-auto text-base border-2">
                        <Printer className="w-5 h-5 mr-2" /> Print Clinical Report
                    </Button>
                    <Button onClick={() => setScreen('patient-summary')} size="lg" variant="secondary" className="flex-1 py-6 h-auto text-base border-2 border-[#e6e1fd] dark:border-[#441170]">
                        <User className="w-5 h-5 mr-2" /> View Patient Handout
                    </Button>
                </div>
                <div className="no-print border-t border-slate-200 dark:border-slate-800 pt-6 mt-6">
                    <Button onClick={resetForm} size="lg" className="w-full py-6 text-lg shadow-md">
                        <Plus className="w-5 h-5 mr-2" /> Start New Log
                    </Button>
                </div>
            </ScreenLayout>
        );
    }

    if (screen === 'patient-summary' && lastSavedRecord) {
        return (
             <ScreenLayout
                title="Patient Handout"
                subtitle={APP_SUBTITLE}
                icon={<User className="w-5 h-5" />}
                setScreen={setScreen}
                databaseDate={databaseDate}
                showDisclaimer={showDisclaimer}
                onDismissDisclaimer={handleDismissDisclaimer}
                onUploadPatients={handleUploadPatients}
                actions={
                    <Button onClick={() => setScreen('dashboard')} variant="headerAction" size="sm">
                        <LayoutDashboard className="w-4 h-4 mr-1" /> Dashboard
                    </Button>
                }
                contentClassName="p-6 space-y-6"
            >
                <PatientHandout data={lastSavedRecord} />
                <div className="flex flex-col sm:flex-row gap-4 no-print mt-8">
                    <Button onClick={() => setScreen('summary')} size="lg" variant="ghost" className="flex-1 py-6 h-auto text-base">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Clinical Report
                    </Button>
                    <Button onClick={handlePrint} size="lg" variant="outline" className="flex-1 py-6 h-auto text-base border-2">
                        <Printer className="w-4 h-4 mr-2" /> Print Handout
                    </Button>
                </div>
                <div className="no-print border-t border-slate-200 dark:border-slate-800 pt-6 mt-6">
                    <Button onClick={resetForm} size="lg" className="w-full py-6 text-lg shadow-md">
                        <Plus className="w-5 h-5 mr-2" /> Start New Log
                    </Button>
                </div>
            </ScreenLayout>
        );
    }

    if (screen === 'print-plan' && selectedPatient && testingPlanData) {
        return (
            <ScreenLayout
                title="Testing Plan Preview"
                subtitle={APP_SUBTITLE}
                icon={<ClipboardList className="w-5 h-5" />}
                setScreen={setScreen}
                databaseDate={databaseDate}
                showFooter={false}
                showDisclaimer={showDisclaimer}
                onDismissDisclaimer={handleDismissDisclaimer}
                onUploadPatients={handleUploadPatients}
                actions={
                    <Button onClick={() => setScreen('log')} variant="headerAction" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                }
            >
                <TestingPlanPrintView 
                    patient={selectedPatient}
                    data={testingPlanData}
                    drugCategories={DRUG_CATEGORIES}
                    onProceed={() => setScreen('testing')}
                />
            </ScreenLayout>
        );
    }

    if (screen === 'testing') {
        return (
            <ScreenLayout
                title="Testing Session"
                icon={<TestTube2 className="w-5 h-5" />}
                subtitle={selectedPatient ? `Patient: ${selectedPatient.lastName}, ${selectedPatient.firstName} (ID: ${selectedPatient.id === 'manual' ? 'New' : selectedPatient.id})` : APP_SUBTITLE}
                setScreen={setScreen}
                databaseDate={databaseDate}
                showDisclaimer={showDisclaimer}
                onDismissDisclaimer={handleDismissDisclaimer}
                onUploadPatients={handleUploadPatients}
                actions={
                    <Button onClick={() => setScreen('log')} variant="headerAction" size="sm" className="mr-2">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back
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
                    symptomOptions={symptomOptions}
                    interventionOptions={interventionOptions}
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
            onDismissDisclaimer={handleDismissDisclaimer}
            onUploadPatients={handleUploadPatients}
            actions={
                <Button onClick={() => setScreen('dashboard')} variant="headerAction" size="sm">
                    <LayoutDashboard className="w-4 h-4 mr-1" /> Dashboard
                </Button>
            }
            contentClassName="p-4 space-y-6"
            className="pb-10"
        >
            <Card className="border-t-4 border-[#8055f1] shadow-md dark:border-t-[#8055f1]">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <CardTitle className="text-[#441170] dark:text-purple-300 flex items-center gap-2">
                        <div className="bg-[#e6e1fd] dark:bg-[#441170] p-1.5 rounded-md">
                            <User className="w-4 h-4 text-[#8055f1] dark:text-white" />
                        </div>
                        Patient Selection
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-6">
                        <PatientSelector 
                            onSelectPatient={handlePatientSelect} 
                            selectedPatientId={selectedPatient?.id}
                            patients={patients} 
                        />
                        
                        {/* Patient Details Display (Static or Editable) */}
                        <div 
                            key={selectedPatient?.id ?? 'no-patient'}
                            className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md border border-slate-100 dark:border-slate-800 animate-fade-in"
                        >
                            {selectedPatient?.id === 'manual' ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs uppercase mb-1.5 block text-slate-500">First Name</Label>
                                            <Input 
                                                value={selectedPatient.firstName} 
                                                onChange={(e) => handleManualDetailChange('firstName', e.target.value)}
                                                placeholder="Enter first name"
                                                className="bg-white"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs uppercase mb-1.5 block text-slate-500">Last Name</Label>
                                            <Input 
                                                value={selectedPatient.lastName} 
                                                onChange={(e) => handleManualDetailChange('lastName', e.target.value)}
                                                placeholder="Enter last name"
                                                className="bg-white"
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
                                                className="bg-white"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs uppercase mb-1.5 block text-slate-500">Date of Birth</Label>
                                            <Input 
                                                type="date"
                                                value={selectedPatient.dob} 
                                                onChange={(e) => handleManualDetailChange('dob', e.target.value)}
                                                className="bg-white"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs uppercase mb-1.5 block text-slate-500">City / Suburb</Label>
                                            <Input 
                                                value={selectedPatient.city} 
                                                onChange={(e) => handleManualDetailChange('city', e.target.value)}
                                                placeholder="City..."
                                                className="bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:grid sm:grid-cols-3 gap-4">
                                    <div className="sm:col-span-1">
                                        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1">Name</span>
                                        <p className="font-medium text-slate-900 dark:text-slate-100 text-base leading-tight break-words">
                                            {selectedPatient ? <span className="text-slate-400 dark:text-slate-500 mr-1.5 font-mono text-xs">[{selectedPatient.id}]</span> : ''}
                                            {formData.firstName} {formData.lastName || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1">City</span>
                                        <p className="text-slate-900 dark:text-slate-100 text-sm break-words leading-tight" title={selectedPatient?.city}>{selectedPatient?.city || '-'}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1">DOB</span>
                                        <p className="text-slate-900 dark:text-slate-100 text-sm">{selectedPatient ? formatDate(selectedPatient.dob) : '-'}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

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
                            setScreen('print-plan');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }} 
                    />
                    <div className="flex justify-end pt-4">
                        <Button 
                            size="lg" 
                            className="w-full sm:w-auto shadow-lg shadow-purple-200 dark:shadow-purple-900/50 text-base py-6"
                            onClick={() => setScreen('testing')}
                        >
                            Proceed to Testing Panel <ChevronRight className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                </div>
            )}
        </ScreenLayout>
    );
  };
  
  return renderScreenContent();
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <FontSizeProvider>
            <AnaestheticLogApp />
        </FontSizeProvider>
    </ThemeProvider>
  );
}

export default App;