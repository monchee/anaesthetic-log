import React, { useState, useEffect } from 'react';
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

interface HelpSection {
  icon: React.ReactNode;
  title: string;
  steps: string[];
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
      "Click the 'Update DB' button in the dashboard header.",
      "Follow the instructions to export data from REDCap.",
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
  }
];

export const HelpModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Open on every visit
  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleClose = (open: boolean) => {
    setIsOpen(open);
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-10 w-10 px-0 rounded-lg bg-white/5 hover:bg-white/20 text-white/80 hover:text-white border border-white/5" 
        title="Help"
        onClick={() => setIsOpen(true)}
      >
        <HelpCircle className="w-5 h-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose} className="max-w-5xl max-h-[90vh] overflow-y-auto">
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
        </DialogContent>
      </Dialog>
    </>
  );
};
