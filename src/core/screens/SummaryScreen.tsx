import React from 'react';
import {
  CheckCircle2,
  ClipboardCopy,
  Copy,
  Database,
  EyeOff,
  FileText,
  Loader2,
  LogOut,
  Mail,
  Plus,
  Printer,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { ScreenLayout } from '@core/components/ScreenLayout';
import { Patient, LogFormData } from '@/types';
import { showToast } from '@shared/utils';
import { formatClinicalReportAsText, formatPatientHandoutAsText, generateLetterText } from '@shared/utils/reportExporter';
import { RedactProvider, useRedact } from '@features/reports/hooks/useRedact';
import { CommonScreenLayoutProps } from './types';
import { useResearchSubmit } from '@features/research/hooks/useResearchSubmit';

const ClinicalReport = React.lazy(() => import('@features/reports/components/ClinicalReport'));
const PatientHandout = React.lazy(() => import('@features/reports/components/PatientHandout'));
const PowerchartLetter = React.lazy(() => import('@features/reports/components/PowerchartLetter'));

const BACK_BTN = "h-11 min-w-11 px-4 bg-white/10 hover:bg-white/30 text-white hover:text-white border border-white/20 shadow-sm transition-[color,background-color,border-color,transform,box-shadow] duration-200 group rounded-none btn-press";
const BACK_ICON = "w-4 h-4 opacity-90 group-hover:opacity-100 transition-opacity";

type ReportTab = 'report' | 'handout' | 'letter';

function RedactToggle() {
  const { isRedacted, toggleRedact } = useRedact();
  return (
    <div className="flex justify-end mb-2 no-print">
      <button
        onClick={toggleRedact}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-none transition-colors ${
          isRedacted
            ? 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
            : 'border-border bg-card text-muted-foreground hover:text-foreground'
        }`}
        title={isRedacted ? 'Show identifying data' : 'Hide identifying data'}
      >
        <EyeOff className="w-3 h-3" />
        {isRedacted ? 'Show' : 'Redact'}
      </button>
    </div>
  );
}

interface SummaryScreenProps {
  layoutProps: CommonScreenLayoutProps;
  lastSavedRecord: LogFormData;
  selectedPatient: Patient | null;
  activeReportSavedAt: number | null;
  activeReportTab: ReportTab;
  setActiveReportTab: (tab: ReportTab) => void;
  research: ReturnType<typeof useResearchSubmit>;
  onExit: () => void;
  onStartNewLog: () => void;
}

export function SummaryScreen({
  layoutProps,
  lastSavedRecord,
  selectedPatient,
  activeReportSavedAt,
  activeReportTab,
  setActiveReportTab,
  research,
  onExit,
  onStartNewLog,
}: SummaryScreenProps) {
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
      actions={<Button onClick={onExit} variant="ghost" className={BACK_BTN}><LogOut className={BACK_ICON} /> Exit</Button>}
      contentClassName="py-4 space-y-4"
    >
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

      <RedactProvider>
        <RedactToggle />
        {activeReportTab === 'report' && <ClinicalReport data={lastSavedRecord} activeReportSavedAt={activeReportSavedAt} />}
        {activeReportTab === 'handout' && <PatientHandout data={lastSavedRecord} activeReportSavedAt={activeReportSavedAt} />}
        {activeReportTab === 'letter' && <PowerchartLetter data={lastSavedRecord} patient={selectedPatient} activeReportSavedAt={activeReportSavedAt} />}
      </RedactProvider>

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

      <div className="no-print border-t border-border pt-6 mt-4">
        <Button onClick={onStartNewLog} size="lg" className="w-full py-6 text-lg rounded-none bg-primary hover:bg-primary/90 text-white font-semibold transition-colors">
          <Plus className="w-5 h-5 mr-2" /> Start New Log
        </Button>
      </div>
    </ScreenLayout>
  );
}
