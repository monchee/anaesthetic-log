import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button } from '@/components/ui';
import {
  HelpCircle,
  Upload,
  FileSpreadsheet,
} from 'lucide-react';
import { parseRedcapCSV } from '@shared/utils';
import { Patient } from '@/types';
import toast from 'react-hot-toast';
import { useLocalStorage } from '@shared/hooks/useLocalStorage';

interface HelpModalProps {
  onUploadPatients?: (patients: Patient[]) => void;
  hideTrigger?: boolean;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onUploadPatients, hideTrigger = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenQuickStart, setHasSeenQuickStart] = useLocalStorage('hasSeenQuickStart', false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-open on page load for first-time users
  useEffect(() => {
    if (!hasSeenQuickStart) {
      setIsOpen(true);
      setHasSeenQuickStart(true);
    }
  }, [hasSeenQuickStart, setHasSeenQuickStart]);

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
              <FileSpreadsheet className="w-5 h-5 text-slate-900" />
              Quick Start
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Upload a REDCap CSV export to load patient data into the app.
          </p>

          {/* CSV Upload Hero */}
          {onUploadPatients && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-slate-900 dark:hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-slate-900 dark:bg-primary">
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
