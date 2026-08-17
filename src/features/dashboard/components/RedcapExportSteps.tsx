import React from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';

export interface RedcapExportStepsProps {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  className?: string;
}

export const RedcapExportSteps: React.FC<RedcapExportStepsProps> = ({
  onUpload,
  isUploading,
  className = '',
}) => {
  return (
    <div className={`space-y-6 ${className}`.trim()}>
      <div className="bg-card p-4 rounded-none border border-border">
        <h4 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
          <ExternalLink className="w-4 h-4 text-primary" /> Step 1: Login
        </h4>
        <p className="text-sm text-muted-foreground mb-2">
          Go to{' '}
          <a
            href="https://redcap.slhd.nsw.gov.au/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            redcap.slhd.nsw.gov.au
          </a>{' '}
          and log in with your credentials.
        </p>
        <p className="text-xs text-muted-foreground italic">(You must have data export rights)</p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-none bg-primary/10 text-xs font-bold text-primary dark:bg-primary/20">
            2
          </div>
          <div className="text-sm text-muted-foreground">
            Click on <span className="font-semibold text-foreground">Data Exports, Reports, and Stats</span> on the sidebar.
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-none bg-primary/10 text-xs font-bold text-primary dark:bg-primary/20">
            3
          </div>
          <div className="text-sm text-muted-foreground">
            Find the <span className="font-semibold text-foreground">All data (all records and fields)</span> row.
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-none bg-primary/10 text-xs font-bold text-primary dark:bg-primary/20">
            4
          </div>
          <div className="text-sm text-muted-foreground">
            Choose <span className="font-semibold text-foreground">CSV / Microsoft Excel (labels)</span> as the export format.
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-none bg-primary/10 text-xs font-bold text-primary dark:bg-primary/20">
            5
          </div>
          <div className="text-sm text-muted-foreground">
            Click <span className="font-semibold text-foreground">Export Data</span> and download the file.
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-none bg-status-grade1/15 text-xs font-bold text-status-grade1 dark:bg-status-grade1/20">
            6
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Ready!</span> Upload the downloaded CSV file using the button below.
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        {isUploading ? (
          <div
            role="status"
            aria-live="polite"
            className="flex w-full items-center justify-center gap-2 border border-border bg-muted/40 px-4 py-3 text-sm font-medium text-foreground"
          >
            <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
            <span>Parsing…</span>
          </div>
        ) : (
          <input
            type="file"
            accept=".csv"
            onChange={onUpload}
            disabled={isUploading}
            className="block w-full text-sm text-muted-foreground
              file:mr-4 file:py-2 file:px-4
              rounded-none
              file:rounded-none
              file:border-0
              file:text-sm
              file:font-semibold
              file:bg-primary
              file:text-primary-foreground
              hover:file:bg-primary/90
              focus:outline-none
              focus:ring-2 focus:ring-ring
              focus:ring-offset-2
              disabled:opacity-50
              disabled:cursor-not-allowed"
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(RedcapExportSteps);
