import React from 'react';
import { Type, RotateCcw } from 'lucide-react';
import { useFontSize } from '@core/components/FontSizeProvider';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui';
import { cn } from '@/lib/utils';

export const DisplaySettingsMenu: React.FC = () => {
  const {
    fontSizePercent,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    canIncrease,
    canDecrease,
  } = useFontSize();

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Display settings"
              className={cn(
                "flex items-center justify-center min-h-[44px] min-w-[44px] p-2 rounded-none transition-colors",
                "text-masthead-foreground/80 hover:text-masthead-foreground hover:bg-white/10",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-masthead-accent focus-visible:ring-offset-2 focus-visible:ring-offset-masthead"
              )}
            >
              <Type className="h-5 w-5" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Display settings</TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" className="w-56 rounded-none p-2">
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 py-1">
          Text Size
        </DropdownMenuLabel>

        <div className="flex items-center justify-between gap-2 py-1.5">
          <button
            type="button"
            onClick={decreaseFontSize}
            disabled={!canDecrease}
            aria-label="Decrease text size"
            className={cn(
              "flex items-center justify-center min-h-[44px] min-w-[44px] font-semibold border border-input rounded-none transition-colors",
              "hover:bg-accent hover:text-accent-foreground active:scale-95",
              "disabled:opacity-40 disabled:pointer-events-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            A−
          </button>

          <span className="font-mono text-sm font-semibold text-center min-w-[3.5rem]" aria-live="polite">
            {fontSizePercent}%
          </span>

          <button
            type="button"
            onClick={increaseFontSize}
            disabled={!canIncrease}
            aria-label="Increase text size"
            className={cn(
              "flex items-center justify-center min-h-[44px] min-w-[44px] font-semibold border border-input rounded-none transition-colors",
              "hover:bg-accent hover:text-accent-foreground active:scale-95",
              "disabled:opacity-40 disabled:pointer-events-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            A+
          </button>
        </div>

        <DropdownMenuSeparator className="my-1.5" />

        <DropdownMenuItem
          onClick={resetFontSize}
          disabled={fontSizePercent === 100}
          className="flex items-center justify-center gap-2 px-3 min-h-[44px] text-sm rounded-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCcw className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="break-words font-medium">Reset (100%)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
