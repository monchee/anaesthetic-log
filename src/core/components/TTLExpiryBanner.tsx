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
    className="w-full bg-status-warning/15 border-b border-status-warning/30 animate-in slide-in-from-top-2 duration-150"
  >
    <div className="max-w-6xl mx-auto px-4 sm:px-5 md:px-6 py-2 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 flex-1 justify-center sm:justify-start flex-wrap">
        <AlertTriangle className="w-4 h-4 text-status-warning shrink-0" />
        <p className="text-xs text-foreground leading-tight text-center sm:text-left">
          Local clinical data expires at {formatTime(expiresAt)}
        </p>
        <button
          type="button"
          onClick={onKeepWorking}
          className="text-xs font-semibold text-status-warning underline underline-offset-2 hover:text-foreground transition-colors min-h-[44px] px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Keep working (resets 6-hour timer)
        </button>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-status-warning hover:text-foreground transition-colors shrink-0 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-none hover:bg-status-warning/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Dismiss expiry warning"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export default TTLExpiryBanner;
