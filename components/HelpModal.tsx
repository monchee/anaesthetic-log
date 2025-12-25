import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button } from './ui';
import { 
  HelpCircle, 
  LayoutDashboard, 
  Search, 
  Upload, 
  User, 
  MousePointer,
  ChevronRight,
  Activity,
  FileSpreadsheet,
  Filter,
  Sparkles
} from 'lucide-react';
import { parseRedcapCSV } from '../lib/utils';
import { Patient } from '../types';
import toast from 'react-hot-toast';

interface HelpSection {
  icon: React.ReactNode;
  title: string;
  steps: string[];
  hasButton?: boolean;
}

const HELP_SECTIONS: HelpSection[] = [
  {
    icon: <LayoutDashboard className="w-5 h-5 text-[#441170]" />,
    title: "Dashboard Overview",
    steps: [
      "View key statistics at the top: total patients, severe reactions, abandoned procedures, and average reaction time.",
      "The patient list shows all records with date, name, procedure, timeline, and reaction grade.",
      "Click any patient row to view their full clinical details."
    ]
  },
  {
    icon: <Search className="w-5 h-5 text-[#441170]" />,
    title: "Search & Filters",
    steps: [
      "Use the search box to find patients by name, MRN, or suspected agent.",
      "Click the 'Filters' button to open advanced filtering options.",
      "Filter by reaction grade, date range, hospital, outcome, or suspected agents.",
      "Selecting multiple agents will show only patients with ALL selected agents."
    ]
  },
  {
    icon: <Upload className="w-5 h-5 text-[#441170]" />,
    title: "Update Database",
    steps: [
      "Click the 'Upload CSV' button at the bottom of this guide.",
      "Export data from REDCap using 'CSV / Microsoft Excel (labels)' format.",
      "Select the exported CSV file to update the patient database.",
      "The dashboard will refresh with the new data automatically."
    ]
  },
  {
    icon: <User className="w-5 h-5 text-[#441170]" />,
    title: "Patient Details",
    steps: [
      "Click on any patient row in the table to view their full record.",
      "Review clinical history, suspected agents, and test results.",
      "View the timeline of the patient's reaction and testing.",
      "Navigate back to the dashboard using the breadcrumb or back button."
    ]
  },
  {
    icon: <Activity className="w-5 h-5 text-[#441170]" />,
    title: "Allergy Testing",
    steps: [
      "Record skin prick test (SPT) and intradermal test (IDT) results.",
      "Document drug challenge outcomes and observations.",
      "Track positive and negative reactions to various agents.",
      "Generate testing plans for upcoming clinic appointments."
    ]
  },
  {
    icon: <FileSpreadsheet className="w-5 h-5 text-[#441170]" />,
    title: "Reaction History",
    steps: [
      "View detailed timelines of perioperative reactions.",
      "Review suspected agents and medications administered.",
      "Check reaction severity grading (Ring & Messmer classification).",
      "Access procedure outcomes and follow-up information."
    ]
  }
];

interface HelpModalProps {
  onUploadPatients?: (patients: Patient[]) => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onUploadPatients }) => {
  const [isOpen, setIsOpen] = useState(false);
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
    
    // Reset file input
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

      <Dialog open={isOpen} onOpenChange={handleClose} className="!max-w-6xl max-h-[90vh] overflow-y-auto">
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
                  This application helps you manage and explore patient data from the REDCap database. 
                  Browse the guide below to get started, or click anywhere outside to begin.
                </p>
              </div>
            </div>
          </div>

          {/* Two-column grid on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {HELP_SECTIONS.map((section) => (
              <div 
                key={section.title}
                className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#441170]/10 dark:bg-purple-900/30">
                    {section.icon}
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    {section.title}
                  </h3>
                </div>
                <ul className="space-y-2 ml-11">
                  {section.steps.map((step, stepIndex) => (
                    <li 
                      key={stepIndex}
                      className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
                    >
                      <ChevronRight className="w-4 h-4 text-[#441170] shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Quick Tips - Full Width */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/40 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <MousePointer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-blue-700 dark:text-blue-300 text-sm">
                Quick Tips
              </span>
            </div>
            <ul className="space-y-1.5 text-sm text-blue-700 dark:text-blue-300">
              <li className="flex items-start gap-2">
                <FileSpreadsheet className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Export from REDCap using "CSV / Microsoft Excel (labels)" format.</span>
              </li>
              <li className="flex items-start gap-2">
                <Filter className="w-4 h-4 shrink-0 mt-0.5" />
                <span>The filter badge shows the number of active filter criteria.</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            {onUploadPatients && (
              <Button
                onClick={() => {
                  setIsOpen(false);
                  fileInputRef.current?.click();
                }}
                size="lg"
                variant="outline"
                className="flex-1 border-2 border-[#441170] text-[#441170] hover:bg-[#441170] hover:text-white dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-400 dark:hover:text-white"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload CSV
              </Button>
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
