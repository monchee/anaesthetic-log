import React, { useState } from 'react';
import { LayoutDashboard, Stethoscope, FileText, User, Printer, Plus, ArrowLeft, Database } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Label, Input } from './components/ui';
import PatientSelector from './components/PatientSelector';
import PatientHistory from './components/PatientHistory';
import TestingLogForm from './components/TestingLogForm';
import ClinicalReport from './components/ClinicalReport';
import PatientHandout from './components/PatientHandout';
import Dashboard from './components/Dashboard';
import Changelog from './components/Changelog'; // Import Changelog
import { LogFormData, Patient, Screen } from './types';
import { formatDate } from './lib/utils';
import { MOCK_PATIENTS } from './data/mockPatients';

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
    outcome: null,
    reactionTime: '',
    symptoms: [],
    symptomsOther: '',
    interventionType: '',
    interventionOther: '',
    plan: ''
};

const DRUG_OPTIONS = [
  'Rocuronium', 'Vecuronium', 'Atracurium', 'Cisatracurium', 
  'Suxamethonium', 'Mivacurium', 'Pancuronium',
  'Propofol', 'Midazolam', 'Fentanyl', 
  'Cefazolin', 'Latex', 'Chlorhexidine', 'Lidocaine'
];

// Extend Screen type locally to include 'changelog' without breaking strict typing elsewhere if possible, 
// or cast it. For cleaner code, I will just use string comparison in the render logic.
// However, to be type safe, I should update types.ts, but I am instructed to only update files I provide.
// I will cast screen to string for the check or just use 'changelog' as a valid state value even if TS complains lightly 
// (though best practice is to update types.ts). 
// Let's update types.ts as well to be correct.

export default function AnaestheticLogApp() {
  // Adding 'changelog' to the state type implicitly by usage
  const [screen, setScreen] = useState<Screen | 'changelog'>('log');
  const [formData, setFormData] = useState<LogFormData>(INITIAL_FORM_STATE);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [lastSavedRecord, setLastSavedRecord] = useState<LogFormData | null>(null);
  
  // State for NEWLY added logs (separate from the static database)
  const [recentLogs, setRecentLogs] = useState<LogFormData[]>([]);

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

  // --- CHANGELOG VIEW ---
  if (screen === 'changelog') {
      return <Changelog setScreen={setScreen} />;
  }

  // --- DASHBOARD VIEW ---
  if (screen === 'dashboard') {
    return (
        <Dashboard 
            setScreen={setScreen} 
            existingPatients={MOCK_PATIENTS} 
            recentLogs={recentLogs}
            drugOptions={DRUG_OPTIONS}
            onViewLog={(log) => {
                setLastSavedRecord(log);
                setScreen('summary');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
        />
    );
  }

  // --- REPORT VIEW ---
  if (screen === 'summary' && lastSavedRecord) {
    return (
        <div className="max-w-4xl mx-auto min-h-screen bg-[#fbfaff] pb-10">
            {/* Header (No Print) */}
            <div className="sticky top-0 z-50 bg-[#441170] text-white p-4 shadow-md flex justify-between items-center no-print">
                <h1 className="font-bold text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" /> Clinical Report
                </h1>
                <Button onClick={() => setScreen('dashboard')} variant="headerAction" size="sm">
                    <LayoutDashboard className="w-4 h-4 mr-1" /> Dashboard
                </Button>
            </div>

            <div className="p-6 space-y-6">
                <ClinicalReport data={lastSavedRecord} />

                {/* Actions (No Print) */}
                <div className="flex flex-col sm:flex-row gap-4 no-print mt-8">
                    <Button onClick={handlePrint} size="lg" variant="outline" className="flex-1">
                        <Printer className="w-4 h-4 mr-2" /> Print Clinical Report
                    </Button>
                    <Button onClick={() => setScreen('patient-summary')} size="lg" variant="secondary" className="flex-1">
                        <User className="w-4 h-4 mr-2" /> View Patient Handout
                    </Button>
                </div>

                 {/* Bottom Navigation */}
                 <div className="no-print border-t border-slate-200 pt-6 mt-6">
                    <Button onClick={resetForm} size="lg" className="w-full py-6 text-lg shadow-md">
                        <Plus className="w-5 h-5 mr-2" /> Start New Log
                    </Button>
                </div>
            </div>
        </div>
    );
  }

  // --- PATIENT HANDOUT VIEW ---
  if (screen === 'patient-summary' && lastSavedRecord) {
    return (
        <div className="max-w-3xl mx-auto min-h-screen bg-[#fbfaff] pb-10">
             {/* Header (No Print) */}
             <div className="sticky top-0 z-50 bg-[#441170] text-white p-4 shadow-md flex justify-between items-center no-print">
                <h1 className="font-bold text-lg flex items-center gap-2">
                    <User className="w-5 h-5" /> Patient Handout
                </h1>
                <Button onClick={() => setScreen('dashboard')} variant="headerAction" size="sm">
                    <LayoutDashboard className="w-4 h-4 mr-1" /> Dashboard
                </Button>
            </div>

            <div className="p-6 space-y-6">
                <PatientHandout data={lastSavedRecord} />

                {/* Actions (No Print) */}
                <div className="flex flex-col sm:flex-row gap-4 no-print mt-8">
                    <Button onClick={() => setScreen('summary')} size="lg" variant="ghost" className="flex-1">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Clinical Report
                    </Button>
                    <Button onClick={handlePrint} size="lg" variant="outline" className="flex-1">
                        <Printer className="w-4 h-4 mr-2" /> Print Handout
                    </Button>
                </div>

                {/* Bottom Navigation */}
                <div className="no-print border-t border-slate-200 pt-6 mt-6">
                    <Button onClick={resetForm} size="lg" className="w-full py-6 text-lg shadow-md">
                        <Plus className="w-5 h-5 mr-2" /> Start New Log
                    </Button>
                </div>
            </div>
        </div>
    );
  }

  // --- LOG VIEW ---
  return (
    <div className="max-w-3xl mx-auto min-h-screen pb-10 flex flex-col">
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#441170] text-white p-4 shadow-md flex justify-between items-center rounded-b-lg mb-6">
        <div>
          <h1 className="font-bold text-lg flex items-center gap-2">
             <Stethoscope className="w-5 h-5" /> Anaesthetic Allergy Challenge Log
          </h1>
          <p className="text-xs text-[#cebfff]">RPAH Immunology & Allergy</p>
        </div>
        <Button onClick={() => setScreen('dashboard')} variant="headerAction" size="sm">
            <LayoutDashboard className="w-4 h-4 mr-1" /> Dashboard
        </Button>
      </div>

      <div className="p-4 space-y-6 flex-1">
        
        {/* 1. Patient Selection */}
        <Card className="border-t-4 border-[#8055f1] shadow-md">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-[#441170] flex items-center gap-2">
                    <div className="bg-[#e6e1fd] p-1.5 rounded-md">
                        <User className="w-4 h-4 text-[#8055f1]" />
                    </div>
                    Patient Selection
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="flex flex-col gap-6">
                    <PatientSelector 
                        onSelectPatient={handlePatientSelect} 
                        selectedPatientId={selectedPatient?.id}
                        patients={MOCK_PATIENTS}
                    />
                    
                    {/* Read-only Demographics View */}
                    <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-md border border-slate-100">
                        <div>
                            <span className="text-xs text-slate-500 uppercase font-bold">Name</span>
                            <p className="font-medium text-slate-900 truncate">
                                {selectedPatient ? <span className="text-slate-400 mr-1 font-mono text-xs">[{selectedPatient.id}]</span> : ''}
                                {formData.firstName} {formData.lastName || '-'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 uppercase font-bold">City</span>
                            <p className="text-slate-900 text-sm truncate" title={selectedPatient?.city}>{selectedPatient?.city || '-'}</p>
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 uppercase font-bold">DOB</span>
                            <p className="text-slate-900">{selectedPatient ? formatDate(selectedPatient.dob) : '-'}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* 2. Patient History (Accordion) */}
        {selectedPatient && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <PatientHistory patient={selectedPatient} />
            </div>
        )}

        {/* 3. Testing Log Form */}
        <div className={!selectedPatient ? "opacity-50 pointer-events-none grayscale transition-all duration-300" : "transition-all duration-300"}>
            <TestingLogForm 
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                drugOptions={[...DRUG_OPTIONS, 'Other']}
                symptomOptions={symptomOptions}
                interventionOptions={interventionOptions}
            />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-400 pb-6">
          <p className="font-medium text-[#441170] mb-1">RPAH Clinical Immunology & Allergy</p>
          <button 
             onClick={() => setScreen('changelog')} 
             className="hover:text-[#8055f1] hover:underline transition-colors focus:outline-none"
          >
            Anaesthetic Allergy Testing Log v4.8
          </button>
      </div>
    </div>
  );
}