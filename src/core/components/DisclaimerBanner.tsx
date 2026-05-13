import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DisclaimerBannerProps {
  onClose: () => void;
  onUploadClick?: () => void;
}

const DisclaimerBanner = ({ onClose, onUploadClick }: DisclaimerBannerProps) => {
  return (
    <div className="w-full bg-amber-100 dark:bg-amber-900/40 border-b border-amber-200 dark:border-amber-800 animate-in slide-in-from-top-2 duration-150">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 justify-center sm:justify-start">
             <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="text-xs text-amber-900 dark:text-amber-100 leading-tight text-center sm:text-left">
                 <span className="font-semibold">Demo System:</span> Sample data is currently used.{' '}
                 {onUploadClick ? (
                   <button onClick={onUploadClick} className="underline underline-offset-2 hover:text-amber-700 dark:hover:text-amber-200 transition-colors inline-flex items-center min-h-[24px]">Upload a REDCap CSV export</button>
                 ) : (
                   'Upload a REDCap CSV export'
                 )}{' '}to use real patient data.
            </div>
        </div>
        <button 
            onClick={onClose}
            className="text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200 transition-colors shrink-0 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-none hover:bg-amber-200/50 dark:hover:bg-amber-800/50"
            aria-label="Dismiss"
        >
            <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DisclaimerBanner;