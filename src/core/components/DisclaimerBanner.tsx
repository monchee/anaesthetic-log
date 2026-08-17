import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DisclaimerBannerProps {
  onClose: () => void;
  onUploadClick?: () => void;
}

const DisclaimerBanner = ({ onClose, onUploadClick }: DisclaimerBannerProps) => {
  return (
    <div className="w-full bg-status-warning/15 border-b border-status-warning/30 animate-in slide-in-from-top-2 duration-150">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 md:px-6 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 justify-center sm:justify-start">
             <AlertTriangle className="w-4 h-4 text-status-warning shrink-0" />
            <div className="text-xs text-foreground leading-tight text-center sm:text-left">
                 <span className="font-semibold text-status-warning">Demo System:</span> Sample data is currently used.{' '}
                 {onUploadClick ? (
                   <button onClick={onUploadClick} className="underline underline-offset-2 hover:text-primary transition-colors inline-flex items-center min-h-[24px]">Upload a REDCap CSV export</button>
                 ) : (
                   'Upload a REDCap CSV export'
                 )}{' '}to use real patient data.
            </div>
        </div>
        <button 
            onClick={onClose}
            className="text-status-warning hover:text-foreground transition-colors shrink-0 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-none hover:bg-status-warning/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Dismiss"
        >
            <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DisclaimerBanner;