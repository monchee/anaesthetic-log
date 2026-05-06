import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button } from '@/components/ui';
import {
  HelpCircle,
  Upload,
  FileSpreadsheet,
  LayoutDashboard,
  Activity,
  Sparkles,
} from 'lucide-react';
import { parseRedcapCSV } from '@shared/utils';
import { Patient, Screen } from '@/types';
import { toast } from 'sonner';
import changelogData from '@shared/data/changelog.json';

const _changelog = changelogData as Array<{ version: string; codename: string; highlight: boolean; changes: string[] }>;
const CURRENT_VERSION = _changelog[0].version;
const CURRENT_CODENAME = _changelog[0].codename;
const LATEST_CHANGES = _changelog[0].changes;
const LAST_SEEN_KEY = 'dream:last_seen_version';

interface HelpModalProps {
  onUploadPatients?: (patients: Patient[]) => void;
  hideTrigger?: boolean;
  hasData?: boolean;
  setScreen?: (screen: Screen) => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onUploadPatients, hideTrigger = false, hasData = false, setScreen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isNewVersion, setIsNewVersion] = useState(() => {
    try { return localStorage.getItem(LAST_SEEN_KEY) !== CURRENT_VERSION; }
    catch { return false; }
  });

  const markSeen = () => {
    try { localStorage.setItem(LAST_SEEN_KEY, CURRENT_VERSION); } catch {}
    setIsNewVersion(false);
  };

  // Auto-open when no CSV loaded, or when a new version hasn't been acknowledged
  useEffect(() => {
    if (!hasData || isNewVersion) {
      setIsOpen(true);
      setScreen?.(Screen.LOG);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasData]);

  const handleClose = (open: boolean) => {
    if (!open) markSeen();
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
            toast.success('Database updated', {
              description: `Successfully loaded ${result.data.length} records from CSV.`,
            });
            setIsOpen(false);
          } else {
            toast.error('Failed to parse CSV', {
              description: result.error || 'Please check the file format.',
              duration: 8000,
            });
          }
        } catch {
          toast.error('Error reading file', { duration: 8000 });
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
        className={hideTrigger ? "hidden" : "w-full justify-start px-4 py-3 h-auto rounded-none hover:bg-muted dark:hover:bg-card text-foreground/80 dark:text-foreground/80 font-medium"}
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

          {/* What's New */}
          {isNewVersion && (
            <div className="bg-primary/8 border border-primary/20 rounded-sm p-4 mb-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-bold text-primary">
                  What's new · {CURRENT_VERSION} <span className="font-normal opacity-70">({CURRENT_CODENAME})</span>
                </span>
              </div>
              <ul className="space-y-1 mb-3">
                {LATEST_CHANGES.map((change, i) => (
                  <li key={i} className="text-xs text-foreground/80 flex gap-2 leading-relaxed">
                    <span className="text-primary shrink-0 mt-0.5">·</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-3 text-xs">
                <button
                  onClick={() => { markSeen(); if (hasData) setIsOpen(false); }}
                  className="text-primary font-medium hover:underline underline-offset-2"
                >
                  Got it
                </button>
                <span className="text-border">·</span>
                <button
                  onClick={() => { markSeen(); setIsOpen(false); setScreen?.(Screen.CHANGELOG); }}
                  className="text-muted-foreground hover:text-foreground hover:underline underline-offset-2"
                >
                  View full changelog →
                </button>
              </div>
            </div>
          )}

          {/* Greeting */}
          <div className="border-l-4 border-primary pl-4 mb-5">
            <h2 className="font-semibold text-foreground text-base mb-1">
              Welcome to The DREAM App
            </h2>
            <p className="text-sm text-muted-foreground">
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
                <span className="font-medium text-foreground/90 w-20 shrink-0">{label}</span>
                <span className="text-muted-foreground">{desc}</span>
              </div>
            ))}
          </div>

          <hr className="border-border mb-5" />

          {/* CSV Upload Hero */}
          {onUploadPatients && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-border hover:border-red-600 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-red-600">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground text-sm">Upload REDCap CSV</p>
                <p className="text-xs text-muted-foreground mt-1">
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
              className="text-slate-500 hover:text-muted-foreground dark:hover:text-white text-xs"
            >
              Skip for now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
