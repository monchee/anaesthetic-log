import React, { useState } from 'react';
import { LayoutDashboard, Stethoscope, FileText, User, Printer, Plus, ArrowLeft, ChevronRight, TestTube2 } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from './components/ui';
import PatientSelector from './components/PatientSelector';
import PatientHistory from './components/PatientHistory';
import TestingLogForm from './components/TestingLogForm';
import ClinicalReport from './components/ClinicalReport';
import PatientHandout from './components/PatientHandout';
import Dashboard from './components/Dashboard';
import Changelog from './components/Changelog';
import DisclaimerBanner from './components/DisclaimerBanner';
import TestingPlanGenerator from './components/TestingPlanGenerator';
import { ScreenLayout } from './components/ScreenLayout';
import { ThemeProvider } from './components/ThemeProvider';
import { LogFormData, Patient, Screen } from './types';
import { formatDate } from './lib/utils';
import { MOCK_PATIENTS } from './data/mockPatients';

const APP_SUBTITLE = "RPAH Immunology & Allergy";

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

// Categorised Drug Options based on user request
const DRUG_CATEGORIES: Record<string, string[]> = {
  "Muscle Relaxants": [
    "Cis-atracurium", "Rocuronium", "Pancuronium", "Vecuronium", "Suxamethonium"
  ],
  "Penicillins": [
    "Major/Minor Determinants", "Ampicillin", "Amoxicillin"
  ],
  "Cephalosporins": [
    "Cefotaxime", "Cefazolin", "Ceftazidime", "Ceftriaxone", "Cefepime"
  ],
  "Hypnotics": [
    "Midazolam", "Propofol"
  ],
  "Local Anaesthetics": [
    "Lignocaine", "Mepivacaine", "Bupivacaine", "Ropivacaine"
  ],
  "Opioids": [
    "Alfentanil", "Fentanyl", "Morphine", "Remifentanil", "Oxycodone"
  ],
  "Antiseptics": [
    "Chlorhexidine", "Povidone Iodine"
  ],
  "Others": [
    "Latex", "Paracetamol", "Patent Blue", "Methylene Blue", "Atropine", "Neostigmine"
  ]
};

// Flattened list for Dashboard filters and dropdowns
const FLAT_DRUG_OPTIONS = Object.values(DRUG_CATEGORIES).flat();

function AnaestheticLogApp() {
  const [screen, setScreen] = useState<Screen>('log');
  const [formData, setFormData] = useState<LogFormData>(INITIAL_FORM_STATE);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [lastSavedRecord, setLastSavedRecord] = useState<LogFormData | null>(null);
  
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
                actions={
                    <Button onClick={() => setScreen('dashboard')} variant="headerAction" size="sm">
                        <LayoutDashboard className="w-4 h-4 mr-1" /> Dashboard
                    </Button>
                }
                contentClassName="p-6 space-y-6"
            >
                <PatientHandout data={lastSavedRecord} />
                <div className="flex flex-col sm:flex-row gap-4 no-print mt-8">
                    <Button onClick={() => setScreen('summary')} size="lg" variant="ghost" className="flex-1">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Clinical Report
                    </Button>
                    <Button onClick={handlePrint} size="lg" variant="outline" className="flex-1">
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

    if (screen === 'testing') {
        return (
            <ScreenLayout
                title="Testing Session"
                icon={<TestTube2 className="w-5 h-5" />}
                subtitle={selectedPatient ? `Patient: ${selectedPatient.lastName}, ${selectedPatient.firstName} (ID: ${selectedPatient.id})` : APP_SUBTITLE}
                setScreen={setScreen}
                databaseDate={databaseDate}
                actions={
                    <Button onClick={() => setScreen('log')} variant="headerAction" size="sm" className="mr-2">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                }
                contentClassName="p-4"
                className="pb-10"
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
            title="Anaesthetic Allergy Challenge Log"
            subtitle={APP_SUBTITLE}
            icon={<Stethoscope className="w-5 h-5" />}
            setScreen={setScreen}
            databaseDate={databaseDate}
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
                        <div className="grid grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-md border border-slate-100 dark:border-slate-800">
                            <div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Name</span>
                                <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                                    {selectedPatient ? <span className="text-slate-400 dark:text-slate-500 mr-1 font-mono text-xs">[{selectedPatient.id}]</span> : ''}
                                    {formData.firstName} {formData.lastName || '-'}
                                </p>
                            </div>
                            <div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">City</span>
                                <p className="text-slate-900 dark:text-slate-100 text-sm truncate" title={selectedPatient?.city}>{selectedPatient?.city || '-'}</p>
                            </div>
                            <div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">DOB</span>
                                <p className="text-slate-900 dark:text-slate-100">{selectedPatient ? formatDate(selectedPatient.dob) : '-'}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {selectedPatient && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-8">
                    <PatientHistory patient={selectedPatient} />
                    <TestingPlanGenerator 
                        patient={selectedPatient} 
                        drugCategories={DRUG_CATEGORIES} 
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
            
            {showDisclaimer && <DisclaimerBanner onClose={handleDismissDisclaimer} />}
        </ScreenLayout>
    );
  };
  
  return renderScreenContent();
}

export default function App() {
    return (
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <AnaestheticLogApp />
        </ThemeProvider>
    );
}