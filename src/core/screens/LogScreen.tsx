import React from 'react';
import {
  ChevronRight,
  FileText,
  Info,
  Pencil,
  Shield,
  Stethoscope,
  Target,
  User,
  Users,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import PatientSelector from '@features/patients/components/PatientSelector';
import PatientHistory from '@features/patients/components/PatientHistory';
import TestingPlanGenerator from '@features/testing/components/TestingPlanGenerator';
import { ACTIVE_REPORT_TTL_MS } from '@shared/utils';
import { DRUG_CATEGORIES } from '@shared/utils/constants';
import { Patient, LogFormData, Screen, TestingPlanData } from '@/types';
import { CommonScreenLayoutProps } from './types';
import { ScreenLayout } from '@core/components/ScreenLayout';

interface LogScreenProps {
  layoutProps: CommonScreenLayoutProps;
  appSubtitle: string;
  selectedPatient: Patient | null;
  lastSavedRecord: LogFormData | null;
  activeReportSavedAt: number | null;
  isPatientDialogOpen: boolean;
  setIsPatientDialogOpen: (open: boolean) => void;
  confirmClearOpen: boolean;
  setConfirmClearOpen: (open: boolean) => void;
  patients: Patient[];
  onPatientSelect: (patient: Patient) => void;
  onManualDetailChange: (field: keyof Patient, value: string) => void;
  onToggleSuspectedAgent: (patientId: string, drugName: string) => void;
  onSetTestingPlanData: (data: TestingPlanData) => void;
  onProceedToTesting: () => void;
  onClearActiveReport: () => void;
}

export function LogScreen({
  layoutProps,
  appSubtitle,
  selectedPatient,
  lastSavedRecord,
  activeReportSavedAt,
  isPatientDialogOpen,
  setIsPatientDialogOpen,
  confirmClearOpen,
  setConfirmClearOpen,
  patients,
  onPatientSelect,
  onManualDetailChange,
  onToggleSuspectedAgent,
  onSetTestingPlanData,
  onProceedToTesting,
  onClearActiveReport,
}: LogScreenProps) {
  const [manualPatientErrors, setManualPatientErrors] = React.useState<Record<'firstName' | 'lastName' | 'mrn', string>>({
    firstName: '',
    lastName: '',
    mrn: '',
  });
  const activeReportExpiresIn = activeReportSavedAt
    ? (() => {
        const msLeft = ACTIVE_REPORT_TTL_MS - (Date.now() - activeReportSavedAt);
        if (msLeft <= 0) return null;
        const h = Math.floor(msLeft / 3_600_000);
        const m = Math.floor((msLeft % 3_600_000) / 60_000);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
      })()
    : null;
  const activeReportInitials = lastSavedRecord
    ? `${lastSavedRecord.firstName?.[0] ? `${lastSavedRecord.firstName[0]}. ` : ''}${lastSavedRecord.lastName || 'Active patient'}`
    : '';

  const handleManualPatientSave = () => {
    if (!selectedPatient) return;
    const errors = {
      firstName: selectedPatient.firstName.trim() ? '' : 'First name is required.',
      lastName: selectedPatient.lastName.trim() ? '' : 'Last name is required.',
      mrn: selectedPatient.mrn.trim() ? '' : 'MRN is required.',
    };
    setManualPatientErrors(errors);
    if (Object.values(errors).some(Boolean)) return;
    setIsPatientDialogOpen(false);
  };

  return (
    <ScreenLayout title="DREAM" subtitle={appSubtitle} icon={<Stethoscope className="w-5 h-5" />} {...layoutProps}
      contentClassName="py-3 space-y-4" className="pb-10"
    >
      {lastSavedRecord && activeReportExpiresIn && (
        <div className="no-print flex items-center justify-between px-4 py-2.5 bg-primary/10 border border-primary/20 rounded-none gap-3">
          <div className="flex items-center gap-2 text-sm min-w-0">
            <FileText className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">
              Active report: <strong>{activeReportInitials}</strong>
              <span className="text-muted-foreground text-xs ml-2">· expires in {activeReportExpiresIn}</span>
            </span>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="outline" onClick={() => layoutProps.setScreen(Screen.SUMMARY)} className="rounded-none h-9 text-xs">Open Report</Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmClearOpen(true)} className="rounded-none h-9 text-xs text-muted-foreground hover:text-destructive">Clear</Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmClearOpen}
        onOpenChange={setConfirmClearOpen}
        title="Clear active report?"
        message={`This permanently removes the current report${lastSavedRecord ? ` for ${lastSavedRecord.firstName} ${lastSavedRecord.lastName}` : ''} and any in-progress testing draft from this device. This cannot be undone.`}
        confirmLabel="Clear report"
        variant="danger"
        onConfirm={onClearActiveReport}
      />

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
              <PatientSelector onSelectPatient={onPatientSelect} selectedPatientId={selectedPatient?.id} patients={patients} />
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
                    <span>If your patient database isn't loaded yet, <button onClick={() => layoutProps.onCSVUploadSheetOpenChange(true)} className="underline text-blue-700 dark:text-blue-400 hover:text-primary dark:hover:text-primary transition-colors">upload a patient CSV</button>.</span>
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
                Patient data is processed on your own device and never sent to external servers.
                Anything held locally is automatically cleared after 6 hours, so nothing lingers
                on a shared workstation.
              </p>
            </div>
          </div>

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
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-0.5 shrink-0">•</span>{feature}
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
                  <Label htmlFor="manual-first-name" className="section-label mb-1.5 block">First Name<span className="text-destructive ml-0.5" aria-hidden="true">*</span></Label>
                  <Input id="manual-first-name" value={selectedPatient.firstName} onChange={(e) => { onManualDetailChange('firstName', e.target.value); setManualPatientErrors(prev => ({ ...prev, firstName: '' })); }} placeholder="Enter first name" aria-invalid={!!manualPatientErrors.firstName} aria-describedby={manualPatientErrors.firstName ? 'manual-first-name-error' : undefined} />
                  {manualPatientErrors.firstName && <p id="manual-first-name-error" className="text-destructive text-xs mt-1">{manualPatientErrors.firstName}</p>}
                </div>
                <div>
                  <Label htmlFor="manual-last-name" className="section-label mb-1.5 block">Last Name<span className="text-destructive ml-0.5" aria-hidden="true">*</span></Label>
                  <Input id="manual-last-name" value={selectedPatient.lastName} onChange={(e) => { onManualDetailChange('lastName', e.target.value); setManualPatientErrors(prev => ({ ...prev, lastName: '' })); }} placeholder="Enter last name" aria-invalid={!!manualPatientErrors.lastName} aria-describedby={manualPatientErrors.lastName ? 'manual-last-name-error' : undefined} />
                  {manualPatientErrors.lastName && <p id="manual-last-name-error" className="text-destructive text-xs mt-1">{manualPatientErrors.lastName}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="manual-mrn" className="section-label mb-1.5 block">MRN<span className="text-destructive ml-0.5" aria-hidden="true">*</span></Label>
                  <Input id="manual-mrn" value={selectedPatient.mrn} onChange={(e) => { onManualDetailChange('mrn', e.target.value); setManualPatientErrors(prev => ({ ...prev, mrn: '' })); }} placeholder="Medical Record Number..." aria-invalid={!!manualPatientErrors.mrn} aria-describedby={manualPatientErrors.mrn ? 'manual-mrn-error' : undefined} />
                  {manualPatientErrors.mrn && <p id="manual-mrn-error" className="text-destructive text-xs mt-1">{manualPatientErrors.mrn}</p>}
                </div>
                <div>
                  <Label htmlFor="manual-redcap-id" className="section-label mb-1.5 block">REDCap Record ID</Label>
                  <Input id="manual-redcap-id" value={selectedPatient.redcapId || ''} onChange={(e) => onManualDetailChange('redcapId', e.target.value)} placeholder="REDCap ID..." />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="manual-dob" className="section-label mb-1.5 block">Date of Birth</Label>
                  <Input id="manual-dob" type="date" value={selectedPatient.dob} onChange={(e) => onManualDetailChange('dob', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="manual-gender" className="section-label mb-1.5 block">Gender</Label>
                  <Input id="manual-gender" value={selectedPatient.gender} onChange={(e) => onManualDetailChange('gender', e.target.value)} placeholder="Gender..." />
                </div>
                <div>
                  <Label htmlFor="manual-city" className="section-label mb-1.5 block">City / Suburb</Label>
                  <Input id="manual-city" value={selectedPatient.city} onChange={(e) => onManualDetailChange('city', e.target.value)} placeholder="City..." />
                </div>
              </div>
            </div>
            <DialogFooter><Button onClick={handleManualPatientSave}>Save & Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {selectedPatient && (
        <div key={selectedPatient.id} className="space-y-8">
          {selectedPatient.id !== 'manual' && (
            <div style={{ '--section-index': 0 } as React.CSSProperties} className="animate-section-reveal">
              <PatientHistory
                patient={selectedPatient}
                onToggleSuspectedAgent={(drugName) => onToggleSuspectedAgent(selectedPatient.id, drugName)}
              />
            </div>
          )}
          <div style={{ '--section-index': selectedPatient.id !== 'manual' ? 1 : 0 } as React.CSSProperties} className="animate-section-reveal">
            <TestingPlanGenerator
              patient={selectedPatient}
              drugCategories={DRUG_CATEGORIES}
              onPreview={(data) => {
                onSetTestingPlanData(data);
                layoutProps.setScreen(Screen.PRINT_PLAN);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
          <div style={{ '--section-index': selectedPatient.id !== 'manual' ? 2 : 1 } as React.CSSProperties} className="animate-section-reveal">
            <div className="flex justify-end pt-4">
              <Button size="lg" className="w-full sm:w-auto text-base py-6 rounded-none bg-primary hover:bg-primary/90 text-white font-semibold transition-colors btn-press" onClick={onProceedToTesting}>
                Start Testing Session <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </ScreenLayout>
  );
}
