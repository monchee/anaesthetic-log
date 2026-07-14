import { AlertTriangle, X } from 'lucide-react';
import { formatTime } from '@shared/utils';

interface TTLExpiryBannerProps {
  expiresAt: number;
  onKeepWorking: () => void;
  onDismiss: () => void;
}

const TTLExpiryBanner = ({ expiresAt, onKeepWorking, onDismiss }: TTLExpiryBannerProps) => (
  <div
    role="alert"
    className="w-full bg-amber-100 dark:bg-amber-900/40 border-b border-amber-200 dark:border-amber-800 animate-in slide-in-from-top-2 duration-150"
  >
    <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 flex-1 justify-center sm:justify-start flex-wrap">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <p className="text-xs text-amber-900 dark:text-amber-100 leading-tight text-center sm:text-left">
          Local clinical data expires at {formatTime(expiresAt)}
        </p>
        <button
          type="button"
          onClick={onKeepWorking}
          className="text-xs font-semibold text-amber-900 dark:text-amber-100 underline underline-offset-2 hover:text-amber-700 dark:hover:text-amber-200 transition-colors min-h-[44px] px-2"
        >
          Keep working (resets 6-hour timer)
        </button>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200 transition-colors shrink-0 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-none hover:bg-amber-200/50 dark:hover:bg-amber-800/50"
        aria-label="Dismiss expiry warning"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export default TTLExpiryBanner;
