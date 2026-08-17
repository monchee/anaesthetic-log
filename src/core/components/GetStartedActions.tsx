import React from 'react';
import { Upload, Loader2, TestTube2, ChevronRight } from 'lucide-react';

const StepTrail: React.FC<{ steps: string[] }> = ({ steps }) => (
  <div
    aria-hidden="true"
    className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs font-bold uppercase tracking-[0.05em] text-muted-foreground/80 mt-3"
  >
    {steps.map((step, idx) => (
      <React.Fragment key={step}>
        {idx > 0 && (
          <ChevronRight className="w-2.5 h-2.5 text-muted-foreground/50 shrink-0" aria-hidden="true" />
        )}
        <span>{step}</span>
      </React.Fragment>
    ))}
  </div>
);

export interface GetStartedActionsProps {
  variant?: 'modal' | 'page'; // 'page' = larger padding and type for the home screen
  isUploading?: boolean;
  onUpload: () => void;
  onStartTesting: () => void;
  className?: string;
}

const UPLOAD_STEPS = ['UPLOAD', 'DASHBOARD', 'PATIENT', 'PLAN', 'TESTING'];
const TESTING_STEPS = ['TESTING', 'REPORT'];

export const GetStartedActions: React.FC<GetStartedActionsProps> = ({
  variant = 'modal',
  isUploading = false,
  onUpload,
  onStartTesting,
  className = '',
}) => {
  const isPageVariant = variant === 'page';

  const cardPadding = isPageVariant ? 'p-5' : 'p-4 sm:p-5';
  const labelSize = isPageVariant ? 'text-base' : 'text-sm sm:text-base';
  const descSize = isPageVariant ? 'text-sm' : 'text-xs';

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
      {/* CARD 1 - Upload REDCap export */}
      <button
        type="button"
        onClick={onUpload}
        disabled={isUploading}
        aria-label="Upload REDCap export & review cases"
        className={`flex flex-col text-left min-w-0 ${cardPadding} bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/15 border border-primary/30 hover:border-primary transition-all duration-150 rounded-none group cursor-pointer disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[44px] justify-between`}
      >
        <div className="w-full min-w-0">
          <div className="flex items-center justify-between gap-3 mb-2 w-full min-w-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2.5 bg-primary text-primary-foreground shrink-0 rounded-none">
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                ) : (
                  <Upload className="w-5 h-5" aria-hidden="true" />
                )}
              </div>
              <span className={`font-bold ${labelSize} text-foreground group-hover:text-primary transition-colors leading-snug min-w-0 break-words`}>
                Upload REDCap export & review cases
              </span>
            </div>
            <ChevronRight
              className="w-4 h-4 text-primary/70 group-hover:text-primary shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </div>
          <p className={`${descSize} text-muted-foreground leading-relaxed`}>
            {isUploading
              ? 'Reading and validating patient records…'
              : 'Import patient records from a REDCap CSV export, then review the clinic worklist and analytics in the Dashboard.'}
          </p>
          <StepTrail steps={UPLOAD_STEPS} />
        </div>
      </button>

      {/* CARD 2 - Direct testing */}
      <button
        type="button"
        onClick={onStartTesting}
        aria-label="Go straight to allergy testing"
        className={`flex flex-col text-left min-w-0 ${cardPadding} bg-card hover:bg-muted/50 dark:bg-card dark:hover:bg-muted/30 border border-border hover:border-status-info transition-all duration-150 rounded-none group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-info focus-visible:ring-offset-2 min-h-[44px] justify-between`}
      >
        <div className="w-full min-w-0">
          <div className="flex items-center justify-between gap-3 mb-2 w-full min-w-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2.5 bg-status-info text-status-info-foreground shrink-0 rounded-none">
                <TestTube2 className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className={`font-bold ${labelSize} text-foreground group-hover:text-status-info transition-colors leading-snug min-w-0 break-words`}>
                Go straight to allergy testing
              </span>
            </div>
            <ChevronRight
              className="w-4 h-4 text-muted-foreground group-hover:text-status-info shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </div>
          <p className={`${descSize} text-muted-foreground leading-relaxed`}>
            Open a fresh testing session for bedside entry — no patient record or testing plan required.
          </p>
          <StepTrail steps={TESTING_STEPS} />
        </div>
      </button>
    </div>
  );
};
