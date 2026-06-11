import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Button } from '@/components/ui';
import {
  HelpCircle,
  Upload,
  FileSpreadsheet,
  Sparkles,
} from 'lucide-react';
import { parseRedcapCSV, decodeCsvBytes } from '@shared/utils';
import { Patient, Screen } from '@/types';
import { toast } from 'sonner';
import changelogData from '@shared/data/changelog.json';

const _changelog = changelogData as Array<{ version: string; codename: string; date?: string; summary?: string; highlight: boolean; skipBanner?: boolean; changes: string[] }>;
const CURRENT_VERSION = _changelog[0].version;
// skipBanner allows a meta/tooling patch to be skipped in the "What's New" banner
// so the banner highlights the most recent substantive release instead.
const DISPLAY_ENTRY = _changelog.find(e => !e.skipBanner) ?? _changelog[0];
const CURRENT_CODENAME = DISPLAY_ENTRY.codename;
const CURRENT_DATE = DISPLAY_ENTRY.date ?? '';
const CURRENT_SUMMARY = DISPLAY_ENTRY.summary ?? '';
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
    try {
      localStorage.setItem(LAST_SEEN_KEY, CURRENT_VERSION);
    } catch {
      // storage not available
    }
    setIsNewVersion(false);
  };

  // Auto-open when no CSV loaded, or when a new version hasn't been acknowledged.
  useEffect(() => {
    if (!hasData || isNewVersion) {
      setIsOpen(true);
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
          const text = decodeCsvBytes(event.target?.result as ArrayBuffer);
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
      reader.readAsArrayBuffer(file);
    }

    if (e.target) {
      e.target.value = '';
    }
  };

  const versionLabel = CURRENT_CODENAME
    ? `Updated ${CURRENT_DATE} · ${DISPLAY_ENTRY.version} (${CURRENT_CODENAME})`
    : `Updated ${CURRENT_DATE} · ${DISPLAY_ENTRY.version}`;

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
            <DialogDescription>
              New patient workflow shortcuts and recent changelog.
            </DialogDescription>
          </DialogHeader>

          {/* What's New */}
          {isNewVersion && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-sm p-3 mb-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                    {versionLabel}
                  </span>
                </div>
              </div>
              {CURRENT_SUMMARY && (
                <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-1.5 leading-relaxed">{CURRENT_SUMMARY}</p>
              )}
              <div className="flex items-center gap-3 text-xs mt-2">
                <button
                  onClick={() => { markSeen(); if (hasData) setIsOpen(false); }}
                  className="text-amber-800 dark:text-amber-300 font-medium hover:underline underline-offset-2"
                >
                  Got it
                </button>
                <span className="text-amber-300 dark:text-amber-700">·</span>
                <button
                  onClick={() => { markSeen(); setIsOpen(false); setScreen?.(Screen.CHANGELOG); }}
                  className="text-amber-700 dark:text-amber-500 hover:text-amber-900 dark:hover:text-amber-300 hover:underline underline-offset-2"
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
              onClick={() => { markSeen(); setIsOpen(false); }}
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
