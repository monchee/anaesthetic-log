import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button } from '@/components/ui';
import {
  HelpCircle,
  Upload,
  FileSpreadsheet,
  LayoutDashboard,
  Activity,
} from 'lucide-react';
import { parseRedcapCSV } from '@shared/utils';
import { Patient, Screen } from '@/types';
import toast from 'react-hot-toast';

interface HelpModalProps {
  onUploadPatients?: (patients: Patient[]) => void;
  hideTrigger?: boolean;
  hasData?: boolean;
  setScreen?: (screen: Screen) => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onUploadPatients, hideTrigger = false, hasData = false, setScreen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-open whenever no CSV data has been loaded; navigate home so the
  // correct screen is shown when the modal is dismissed
  useEffect(() => {
    if (!hasData) {
      setIsOpen(true);
      setScreen?.(Screen.LOG);
    }
  }, [hasData]);

  const handleClose = (open: boolean) => {
    setIsOpen(open);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file && onUploadPatients) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const result = parseRedcapCSV(text);

          if (result.success) {
            onUploadPatients(result.data);
            toast.success(
              <div className="flex flex-col gap-1">
                <span className="font-bold">Database updated</span>
                <span className="text-sm font-normal">Successfully loaded {result.data.length} records from CSV.</span>
              </div>
            );
            setIsOpen(false);
          } else {
            toast.error(
              <div className="flex flex-col gap-1">
                <span className="font-bold">Failed to parse CSV</span>
                <span className="text-sm font-normal">{result.error || "Please check the file format."}</span>
              </div>
            );
          }
        } catch {
          toast.error("Error reading file");
        }
      };
      reader.readAsText(file);
    }

    if (e.target) {
      e.target.value = '';
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={hideTrigger ? "hidden" : "w-full justify-start px-4 py-3 h-auto rounded-none hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"}
        onClick={() => setIsOpen(true)}
        data-help-modal-trigger
      >
        <HelpCircle className="w-5 h-5 mr-2" />
        Quick Start Guide
      </Button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        aria-label="Upload CSV file"
        onChange={handleFileUpload}
        className="hidden"
      />

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-full sm:!max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FileSpreadsheet className="w-5 h-5 text-foreground" />
              Quick Start
            </DialogTitle>
          </DialogHeader>

          {/* Greeting */}
          <div className="border-l-4 border-primary pl-4 mb-5">
            <h2 className="font-semibold text-slate-900 dark:text-white text-base mb-1">
              Welcome to The DREAM App
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage patient records, test results, and allergy workups from your REDCap database.
            </p>
          </div>

          {/* Feature summary */}
          <div className="space-y-2 mb-5">
            {[
              { icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard', desc: 'Patient stats, search, and filter' },
              { icon: <Activity className="w-4 h-4" />, label: 'Testing', desc: 'Record SPT, IDT, and drug challenge results' },
              { icon: <FileSpreadsheet className="w-4 h-4" />, label: 'Database', desc: 'Full reaction timelines and severity grades' },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 text-sm">
                <span className="bg-primary/10 dark:bg-primary/20 text-primary p-1.5 rounded-sm shrink-0">{icon}</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 w-20 shrink-0">{label}</span>
                <span className="text-slate-500 dark:text-slate-400">{desc}</span>
              </div>
            ))}
          </div>

          <hr className="border-slate-200 dark:border-slate-700 mb-5" />

          {/* CSV Upload Hero */}
          {onUploadPatients && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-red-600 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-red-600">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-900 dark:text-white text-sm">Upload REDCap CSV</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Export using "CSV / Microsoft Excel (labels)" format
                </p>
              </div>
            </button>
          )}

          {/* Skip link */}
          <div className="mt-4 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-xs"
            >
              Skip for now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
