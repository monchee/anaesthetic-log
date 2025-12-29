import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui';
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
  ExternalLink,
  FileUp
} from 'lucide-react';
import { parseRedcapCSV } from '../lib/utils';
import { Patient } from '../types';
import toast from 'react-hot-toast';

interface HelpSection {
  icon: React.ReactNode;
  title: string;
  steps: string[];
}

const HELP_SECTIONS: HelpSection[] = [
  {
    icon: <LayoutDashboard className="w-5 h-5 text-[#441170]" />,
    title: "Dashboard",
    steps: [
      "View key stats: total patients, severe reactions, abandoned procedures.",
      "Click any patient row to view full clinical details."
    ]
  },
  {
    icon: <Search className="w-5 h-5 text-[#441170]" />,
    title: "Search & Filter",
    steps: [
      "Search by name, MRN, or suspected agent.",
      "Use filters for grade, date range, hospital, outcome, or agents."
    ]
  },
  {
    icon: <User className="w-5 h-5 text-[#441170]" />,
    title: "Patient Details",
    steps: [
      "Review clinical history, suspected agents, and test results.",
      "View reaction timeline and navigate back via breadcrumbs."
    ]
  },
  {
    icon: <Activity className="w-5 h-5 text-[#441170]" />,
    title: "Testing",
    steps: [
      "Record SPT, IDT results and drug challenge outcomes.",
      "Generate testing plans for upcoming appointments."
    ]
  },
  {
    icon: <FileSpreadsheet className="w-5 h-5 text-[#441170]" />,
    title: "Database",
    steps: [
      "Upload CSV exports from REDCap to update patient data.",
      "View detailed reaction timelines and severity grades."
    ]
  }
];

interface HelpModalProps {
  onUploadPatients?: (patients: Patient[]) => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onUploadPatients }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploadSheetOpen, setIsUploadSheetOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-open on page load
  useEffect(() => {
    setIsOpen(true);
  }, []);

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
            setIsUploadSheetOpen(false);
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
        variant="ghost"
        size="sm"
        className="w-full justify-start px-4 py-3 h-auto rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
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
        onChange={handleFileUpload}
        className="hidden"
      />

      <Dialog open={isOpen} onOpenChange={handleClose} className="!max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogContent>
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-[#441170]" />
              Quick Start Guide
            </DialogTitle>
          </DialogHeader>

          {/* Welcome Message */}
          <div className="p-4 bg-gradient-to-r from-[#441170]/10 to-purple-500/10 dark:from-purple-900/30 dark:to-purple-800/20 rounded-lg border border-[#441170]/20 dark:border-purple-700/30 mb-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#441170] shrink-0">
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
                className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#441170]/10 dark:bg-purple-900/30">
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
                      <ChevronRight className="w-3.5 h-3.5 text-[#441170] shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Quick Tips - Full Width */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/40 mt-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-blue-700 dark:text-blue-300 text-sm">
                Quick Tips
              </span>
            </div>
            <ul className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
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
              <Sheet open={isUploadSheetOpen} onOpenChange={setIsUploadSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 border-2 border-[#441170] text-[#441170] hover:bg-[#441170] hover:text-white dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-400 dark:hover:text-white"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Upload CSV
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-2">
                      <FileUp className="w-5 h-5 text-red-600" />
                      Update Database
                    </SheetTitle>
                    <SheetDescription>
                      Instructions for exporting patient data from REDCap and importing it here.
                    </SheetDescription>
                  </SheetHeader>

                  <div className="space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-red-600" /> Step 1: Login
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        Go to <a href="https://redcap.slhd.nsw.gov.au/" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline font-medium">redcap.slhd.nsw.gov.au</a> and log in with your credentials.
                      </p>
                      <p className="text-xs text-slate-500 italic">(You must have data export rights)</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 text-xs font-bold text-red-600 dark:text-red-300">
                          2
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          Click on <span className="font-semibold text-slate-900 dark:text-slate-100">Data Exports, Reports, and Stats</span> on the sidebar.
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 text-xs font-bold text-red-600 dark:text-red-300">
                          3
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          Find the <span className="font-semibold text-slate-900 dark:text-slate-100">All data (all records and fields)</span> row.
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 text-xs font-bold text-red-600 dark:text-red-300">
                          4
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          Click on <span className="font-semibold text-slate-900 dark:text-slate-100">Export Data</span>.
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 text-xs font-bold text-red-600 dark:text-red-300">
                          5
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          Choose <span className="font-semibold text-slate-900 dark:text-slate-100">CSV / Microsoft Excel (labels)</span> as the export format.
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 text-xs font-bold text-red-600 dark:text-red-300">
                          6
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          Click <span className="font-semibold text-slate-900 dark:text-slate-100">Export Data</span> and download the file.
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-900/40 text-xs text-blue-700 dark:text-blue-300">
                        Filename format should resemble:<br/>
                        <span className="font-mono">AnaestheticAllergyCl_DATA_LABELS_YYYY-MM-DD_time.csv</span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                      <Button
                        className="w-full h-12 text-base shadow-lg hover:shadow-red-500/20 transition-all bg-red-600 hover:bg-red-700 text-white"
                        size="lg"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" /> Select CSV File
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
            <Button
              onClick={() => setIsOpen(false)}
              size="lg"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              Get Started
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
