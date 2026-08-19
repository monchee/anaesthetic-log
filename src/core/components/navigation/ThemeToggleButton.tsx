import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@core/components/ThemeProvider';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface ThemeToggleButtonProps {
  variant?: 'masthead' | 'card';
  className?: string;
}

export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({
  variant = 'masthead',
  className,
}) => {
  const { theme, toggleTheme } = useTheme();
  const isCard = variant === 'card';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          className={cn(
            'flex items-center justify-center min-h-[44px] min-w-[44px] p-2 rounded-none transition-colors',
            isCard
              ? 'text-foreground/80 hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
              : 'text-masthead-foreground/80 hover:text-masthead-foreground hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-masthead-accent focus-visible:ring-offset-2 focus-visible:ring-offset-masthead',
            className
          )}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Moon className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        {theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      </TooltipContent>
    </Tooltip>
  );
};
