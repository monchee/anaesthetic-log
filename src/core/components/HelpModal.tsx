import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Button } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  HelpCircle,
  Upload,
  FileSpreadsheet,
  Loader2,
  Sparkles,
  TestTube2,
  ChevronRight,
} from 'lucide-react';
import { parseRedcapCSV, decodeCsvBytes } from '@shared/utils';
import { Patient, Screen } from '@/types';
import { toast } from 'sonner';
import changelogData from '@shared/data/changelog.json';

const _changelog = changelogData as Array<{
  version: string;
  codename: string;
  date?: string;
  summary?: string;
  highlight: boolean;
  skipBanner?: boolean;
  changes: string[];
}>;
const CURRENT_VERSION = _changelog[0].version;
// skipBanner allows a meta/tooling patch to be skipped in the "What's New" banner
// so the banner highlights the most recent substantive release instead.
const DISPLAY_ENTRY = _changelog.find((e) => !e.skipBanner) ?? _changelog[0];
const CURRENT_CODENAME = DISPLAY_ENTRY.codename;
const CURRENT_DATE = DISPLAY_ENTRY.date ?? '';
const CURRENT_SUMMARY = DISPLAY_ENTRY.summary ?? '';
const LAST_SEEN_KEY = 'dream:last_seen_version';

export interface HelpModalProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onUploadPatients?: (patients: Patient[]) => void;
  onUploadComplete?: () => void;
  hideTrigger?: boolean;
  hasData?: boolean;
  setScreen?: (screen: Screen) => void;
  onStartDirectTesting?: () => void;
  isTestingDraftDirty?: boolean;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen: controlledIsOpen,
  onOpenChange,
  onUploadPatients,
  onUploadComplete,
  hideTrigger = false,
  hasData = false,
  setScreen,
  onStartDirectTesting,
  isTestingDraftDirty = false,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = typeof controlledIsOpen === 'boolean';
  const open = isControlled ? controlledIsOpen : internalIsOpen;

  const setOpen = (nextOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(nextOpen);
    } else {
      setInternalIsOpen(nextOpen);
    }
  };

  const [isUploading, setIsUploading] = useState(false);
  const [confirmDiscardDraftOpen, setConfirmDiscardDraftOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isNewVersion, setIsNewVersion] = useState(() => {
    try {
      return localStorage.getItem(LAST_SEEN_KEY) !== CURRENT_VERSION;
    } catch {
      return false;
    }
  });

  const markSeen = () => {
    try {
      localStorage.setItem(LAST_SEEN_KEY, CURRENT_VERSION);
    } catch {
      // storage not available
    }
    setIsNewVersion(false);
  };

  const handleClose = (newOpen: boolean) => {
    if (!newOpen) markSeen();
    setOpen(newOpen);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file && onUploadPatients) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = decodeCsvBytes(event.target?.result as ArrayBuffer);
          const result = parseRedcapCSV(text);

          if (result.success) {
            markSeen();
            onUploadPatients(result.data);
            toast.success('Database updated', {
              description: `Imported ${result.data.length} record(s).${result.details ? ` ${result.details.join(' ')}` : ''}`,
            });
            setOpen(false);
            onUploadComplete?.();
          } else {
            toast.error('Failed to parse CSV', {
              description: result.error || 'Please check the file format.',
              duration: 8000,
            });
          }
        } catch {
          toast.error('Error reading file', { duration: 8000 });
        } finally {
          setIsUploading(false);
        }
      };
      reader.onerror = () => {
        toast.error('Error reading file', { duration: 8000 });
        setIsUploading(false);
      };
      reader.readAsArrayBuffer(file);
    }

    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDirectTestingClick = () => {
    if (isTestingDraftDirty) {
      setConfirmDiscardDraftOpen(true);
    } else {
      markSeen();
      setOpen(false);
      onStartDirectTesting?.();
    }
  };

  const handleConfirmDirectTesting = () => {
    setConfirmDiscardDraftOpen(false);
    markSeen();
    setOpen(false);
    onStartDirectTesting?.();
  };

  const versionLabel = CURRENT_CODENAME
    ? `Updated ${CURRENT_DATE} · ${DISPLAY_ENTRY.version} (${CURRENT_CODENAME})`
    : `Updated ${CURRENT_DATE} · ${DISPLAY_ENTRY.version}`;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={
          hideTrigger
            ? 'hidden'
            : 'w-full justify-start px-4 py-3 h-auto rounded-none hover:bg-muted dark:hover:bg-card text-foreground/80 dark:text-foreground/80 font-medium'
        }
        onClick={() => setOpen(true)}
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
        disabled={isUploading}
        className="hidden"
      />

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-full sm:!max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-none">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <FileSpreadsheet className="w-5 h-5 text-primary" aria-hidden="true" />
              Quick Start
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              New patient workflow shortcuts and recent changelog.
            </DialogDescription>
          </DialogHeader>

          {/* Clinical Guidance */}
          <div className="p-4 bg-muted/40 border border-border rounded-none mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground mb-0.5">Patient-linked path</p>
                <p>Home → select patient → review history → generate plan → proceed to testing.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-0.5">Direct path</p>
                <p>Open Allergy Testing for rapid bedside data entry without preloaded records.</p>
              </div>
            </div>
          </div>

          {/* Primary Action Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Action 1: Upload REDCap export & review records */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              aria-label="Upload REDCap export & review records"
              className="flex flex-col text-left p-4 sm:p-5 bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/15 border border-primary/30 hover:border-primary transition-all duration-150 rounded-none group cursor-pointer disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[44px] justify-between"
            >
              <div className="w-full">
                <div className="flex items-center justify-between gap-3 mb-2 w-full">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2.5 bg-primary text-primary-foreground shrink-0 rounded-none">
                      {isUploading ? (
                        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      ) : (
                        <Upload className="w-5 h-5" aria-hidden="true" />
                      )}
                    </div>
                    <span className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors leading-snug">
                      Upload REDCap export & review records
                    </span>
                  </div>
                  <ChevronRight
                    className="w-4 h-4 text-primary/70 group-hover:text-primary shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isUploading
                    ? 'Reading and validating patient records…'
                    : 'Import patient records from a REDCap CSV export and review clinic analytics in the Dashboard.'}
                </p>
              </div>
            </button>

            {/* Action 2: Open Allergy Testing */}
            <button
              type="button"
              onClick={handleDirectTestingClick}
              aria-label="Open Allergy Testing"
              className="flex flex-col text-left p-4 sm:p-5 bg-status-info/5 hover:bg-status-info/10 dark:bg-status-info/10 dark:hover:bg-status-info/15 border border-status-info/30 hover:border-status-info transition-all duration-150 rounded-none group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-info focus-visible:ring-offset-2 min-h-[44px] justify-between"
            >
              <div className="w-full">
                <div className="flex items-center justify-between gap-3 mb-2 w-full">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2.5 bg-status-info text-status-info-foreground shrink-0 rounded-none">
                      <TestTube2 className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <span className="font-bold text-sm sm:text-base text-foreground group-hover:text-status-info transition-colors leading-snug">
                      Open Allergy Testing
                    </span>
                  </div>
                  <ChevronRight
                    className="w-4 h-4 text-status-info/70 group-hover:text-status-info shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Start a fresh testing session directly without selecting a patient or creating a testing plan.
                </p>
              </div>
            </button>
          </div>

          {/* What's New */}
          {isNewVersion && (
            <div className="bg-status-warning/10 border border-status-warning/30 rounded-none p-3 mt-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Sparkles className="w-3.5 h-3.5 text-status-warning shrink-0" />
                  <span className="text-xs font-semibold text-status-warning">
                    {versionLabel}
                  </span>
                </div>
              </div>
              {CURRENT_SUMMARY && (
                <p className="text-xs text-foreground/80 mt-1.5 leading-relaxed">
                  {CURRENT_SUMMARY}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs mt-2">
                <button
                  type="button"
                  onClick={() => {
                    markSeen();
                    if (hasData) setOpen(false);
                  }}
                  className="text-status-warning font-medium hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  Got it
                </button>
                <span className="text-status-warning/40">·</span>
                <button
                  type="button"
                  onClick={() => {
                    markSeen();
                    setOpen(false);
                    setScreen?.(Screen.CHANGELOG);
                  }}
                  className="text-status-warning hover:text-foreground hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  View full changelog →
                </button>
              </div>
            </div>
          )}

          {/* Skip for now */}
          <div className="mt-4 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                markSeen();
                setOpen(false);
              }}
              className="text-muted-foreground hover:text-foreground text-xs rounded-none min-h-[44px]"
            >
              Skip for now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDiscardDraftOpen}
        onOpenChange={setConfirmDiscardDraftOpen}
        title="Start fresh testing session?"
        message="You have unsaved changes in your current testing session. Starting a fresh session will discard these changes. This cannot be undone."
        confirmLabel="Start fresh session"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDirectTesting}
      />
    </>
  );
};
