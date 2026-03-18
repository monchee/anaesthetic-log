import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui';
import { ExternalLink, FileUp } from 'lucide-react';

interface CSVUploadInstructionsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

export const CSVUploadInstructions: React.FC<CSVUploadInstructionsProps> = ({
  isOpen,
  onOpenChange,
  onUpload,
  isUploading
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="rounded-none border-l border-slate-200 dark:border-slate-800">
        <SheetHeader className="mb-6 pt-12">
          <SheetTitle className="flex items-center gap-2">
            <FileUp className="w-5 h-5 text-red-600" />
            Update Database
          </SheetTitle>
          <SheetDescription>
            Instructions for exporting patient data from REDCap and importing it here.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-none border border-slate-100 dark:border-slate-800">
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-slate-900 dark:text-slate-100">
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
                Choose <span className="font-semibold text-slate-900 dark:text-slate-100">CSV / Microsoft Excel (labels)</span> as the export format.
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 text-xs font-bold text-red-600 dark:text-red-300">
                5
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Click <span className="font-semibold text-slate-900 dark:text-slate-100">Export Data</span> and download the file.
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40 text-xs font-bold text-green-600 dark:text-green-300">
                6
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Ready!</span> Upload the downloaded CSV file using the button below.
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <input
              type="file"
              accept=".csv"
              onChange={onUpload}
              disabled={isUploading}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                rounded-full
                file:border-0
                file:text-sm
                file:font-semibold
                file:bg-primary
                file:text-white
                hover:file:bg-primary/90
                focus:outline-none
                focus:ring-2 focus:ring-primary
                focus:ring-offset-2
                disabled:opacity-50
                disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default React.memo(CSVUploadInstructions);
