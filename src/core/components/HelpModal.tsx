import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button } from '@/components/ui';
import {
  HelpCircle,
  LayoutDashboard,
  Search,
  Upload,
  User,
  ChevronRight,
  Activity,
  FileSpreadsheet,
  Filter,
  Sparkles,
} from 'lucide-react';
import { parseRedcapCSV } from '@shared/utils';
import { Patient } from '@/types';
import toast from 'react-hot-toast';
import { useLocalStorage } from '@shared/hooks/useLocalStorage';

interface HelpSection {
  icon: React.ReactNode;
  title: string;
  steps: string[];
}

const HELP_SECTIONS: HelpSection[] = [
  {
    icon: <LayoutDashboard className="w-5 h-5 text-slate-900" />,
    title: "Dashboard",
    steps: [
      "View key stats: total patients, severe reactions, abandoned procedures.",
      "Click any patient row to view full clinical details."
    ]
  },
  {
    icon: <Search className="w-5 h-5 text-slate-900" />,
    title: "Search & Filter",
    steps: [
      "Search by name, MRN, or suspected agent.",
      "Use filters for grade, date range, hospital, outcome, or agents."
    ]
  },
  {
    icon: <User className="w-5 h-5 text-slate-900" />,
    title: "Patient Details",
    steps: [
      "Review clinical history, suspected agents, and test results.",
      "View reaction timeline and navigate back via breadcrumbs."
    ]
  },
  {
    icon: <Activity className="w-5 h-5 text-slate-900" />,
    title: "Testing",
    steps: [
      "Record SPT, IDT results and drug challenge outcomes.",
      "Generate testing plans for upcoming appointments."
    ]
  },
  {
    icon: <FileSpreadsheet className="w-5 h-5 text-slate-900" />,
    title: "Database",
    steps: [
      "Upload CSV exports from REDCap to update patient data.",
      "View detailed reaction timelines and severity grades."
    ]
  }
];

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
        <DialogContent className="max-w-full sm:!max-w-3xl md:!max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-slate-900" />
              Quick Start Guide
            </DialogTitle>
          </DialogHeader>

          {/* Welcome Message */}
          <div className="p-4 bg-gradient-to-r from-slate-900/10 to-primary/10 dark:from-slate-900/30 dark:to-slate-800/20 rounded-none border border-slate-900/20 dark:border-primary/30 mb-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-none bg-slate-900 shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  Welcome to the RPAH Anaesthetic Allergy Clinic Tool
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Browse patient data, record test results, and manage clinical records from REDCap.
                </p>
              </div>
            </div>
          </div>

          {/* Two-column grid on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {HELP_SECTIONS.map((section) => (
              <div
                key={section.title}
                className="p-3 bg-slate-50 dark:bg-slate-900 rounded-none border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center justify-center w-7 h-7 rounded-none bg-slate-900/10 dark:bg-slate-900/30">
                    {section.icon}
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    {section.title}
                  </h3>
                </div>
                <ul className="space-y-1.5 ml-9">
                  {section.steps.map((step, stepIndex) => (
                    <li
                      key={stepIndex}
                      className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-slate-900 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Quick Tips - Full Width */}
          <div className="p-3 bg-nsw-info-bg dark:bg-nsw-info/10 rounded-none border border-nsw-info/20 dark:border-nsw-info/30 mt-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Filter className="w-4 h-4 text-nsw-info dark:text-nsw-blue" />
              <span className="font-medium text-nsw-info dark:text-nsw-blue text-sm">
                Quick Tips
              </span>
            </div>
            <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <FileSpreadsheet className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Export from REDCap using "CSV / Microsoft Excel (labels)" format.</span>
              </li>
              <li className="flex items-start gap-2">
                <Filter className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>The filter badge shows the number of active filter criteria.</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            {onUploadPatients && (
              <Button
                size="lg"
                variant="outline"
                className="flex-1 w-full h-14 sm:h-11 text-base border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white dark:border-primary dark:text-primary dark:hover:bg-primary dark:hover:text-white"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload CSV
              </Button>
            )}
            <Button
              onClick={() => setIsOpen(false)}
              size="lg"
              className="flex-1 w-full h-14 sm:h-11 text-base bg-nsw-blue hover:bg-nsw-blue/85 text-white"
            >
              Get Started
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
