import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DisclaimerBannerProps {
  onClose: () => void;
  onUploadClick?: () => void;
}

const DisclaimerBanner = ({ onClose, onUploadClick }: DisclaimerBannerProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPaused = isHovered || isFocused;
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (isPaused) {
      return;
    }
    const timer = setTimeout(() => {
      onCloseRef.current();
    }, 10000);

    return () => {
      clearTimeout(timer);
    };
  }, [isPaused]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setIsFocused(false);
        }
      }}
      className="w-full bg-status-warning border-b border-status-warning-foreground/10 animate-in slide-in-from-top-2 duration-150"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-5 md:px-6 py-1.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 justify-center sm:justify-start">
          <AlertTriangle className="w-4 h-4 text-status-warning-foreground shrink-0" />
          <div className="text-xs text-status-warning-foreground leading-tight text-center sm:text-left">
            <span className="font-semibold text-status-warning-foreground">Demo System:</span> Sample data is currently used.{' '}
            {onUploadClick ? (
              <button
                onClick={onUploadClick}
                className="underline underline-offset-2 hover:opacity-80 transition-opacity inline-flex items-center min-h-[24px]"
              >
                Upload a REDCap CSV export
              </button>
            ) : (
              'Upload a REDCap CSV export'
            )}{' '}
            to use real patient data.
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-status-warning-foreground hover:bg-black/10 transition-colors shrink-0 p-1 min-h-[44px] min-w-[44px] xl:min-h-[28px] xl:min-w-[28px] flex items-center justify-center rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DisclaimerBanner;