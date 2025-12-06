import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DisclaimerBannerProps {
  onClose: () => void;
}

const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ onClose }) => {
  return (
    <div className="mt-2 animate-in slide-in-from-top-2 duration-500 fade-in">
      <div className="bg-amber-50/95 dark:bg-amber-950/30 backdrop-blur-sm border border-amber-200 dark:border-amber-900/50 rounded-xl p-2.5 flex items-center justify-between gap-3 shadow-sm w-full">
        <div className="flex items-center gap-3 overflow-hidden">
             <div className="bg-amber-100 dark:bg-amber-900/40 p-1.5 rounded-full shrink-0 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs text-amber-900 dark:text-amber-200 truncate flex-1">
                 <span className="font-semibold mr-1.5">Demonstration System:</span>
                 <span className="opacity-90">Populated with de-identified, synthetic patient data for testing purposes only.</span>
            </div>
        </div>
        <button 
            onClick={onClose}
            className="text-amber-500 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-300 transition-colors shrink-0 p-1 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/50"
            aria-label="Dismiss"
        >
            <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default DisclaimerBanner;