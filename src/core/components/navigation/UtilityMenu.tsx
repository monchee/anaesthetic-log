import React from 'react';
import { MoreHorizontal, Upload, PlayCircle } from 'lucide-react';
import { Screen } from '@/types';
import { UTILITY_NAV_ITEMS } from '@core/navigation/navigationConfig';
import { shouldHandleNavigation } from '@core/navigation/shouldHandleNavigation';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui';
import { cn } from '@/lib/utils';

export interface UtilityMenuProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  hrefFor: (screen: Screen) => string;
  onOpenUploadCSV: () => void;
  onOpenGetStarted: () => void;
}

export const UtilityMenu: React.FC<UtilityMenuProps> = ({
  currentScreen,
  onNavigate,
  hrefFor,
  onOpenUploadCSV,
  onOpenGetStarted,
}) => {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="More navigation and reference links"
              className={cn(
                "flex items-center justify-center min-h-[44px] min-w-[44px] p-2 rounded-none transition-colors",
                "text-masthead-foreground/80 hover:text-masthead-foreground hover:bg-white/10",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-masthead-accent focus-visible:ring-offset-2 focus-visible:ring-offset-masthead"
              )}
            >
              <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>More navigation and reference links</TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" className="w-56 rounded-none p-1">
        {UTILITY_NAV_ITEMS.map((item) => {
          const isActive = currentScreen === item.screen;
          const Icon = item.icon;
          return (
            <DropdownMenuItem key={item.screen} asChild className="rounded-none cursor-pointer">
              <a
                href={hrefFor(item.screen)}
                aria-current={isActive ? 'page' : undefined}
                onClick={(e) => {
                  if (shouldHandleNavigation(e)) {
                    e.preventDefault();
                    onNavigate(item.screen);
                  }
                }}
                className={cn(
                  "flex items-center gap-2.5 px-3 min-h-[44px] text-sm rounded-none w-full",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive && "bg-accent font-semibold text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="break-words">{item.label}</span>
              </a>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem
          onClick={onOpenUploadCSV}
          className="flex items-center gap-2.5 px-3 min-h-[44px] text-sm rounded-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Upload className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="break-words">Upload CSV</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onOpenGetStarted}
          className="flex items-center gap-2.5 px-3 min-h-[44px] text-sm rounded-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <PlayCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="break-words">Get Started</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
