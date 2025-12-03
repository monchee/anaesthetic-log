import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DisclaimerBannerProps {
  onClose: () => void;
}

const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ onClose }) => {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-4xl px-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 border border-slate-800 shadow-2xl rounded-lg p-3 flex items-center gap-3">
        <div className="text-amber-400 shrink-0">
            <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs">
            <h4 className="text-slate-50 font-semibold whitespace-nowrap">Demo Mode:</h4>
            <p className="text-slate-400 leading-tight">
                Patient records are fictional placeholders. This form is for demonstration purposes only.
            </p>
        </div>
        <button 
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors shrink-0 p-1 rounded-md hover:bg-slate-800 ml-2"
            aria-label="Dismiss"
        >
            <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default DisclaimerBanner;