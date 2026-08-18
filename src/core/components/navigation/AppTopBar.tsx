import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Screen } from '@/types';
import { useTheme } from '@core/components/ThemeProvider';
import { shouldHandleNavigation } from '@core/navigation/shouldHandleNavigation';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui';
import { DisplaySettingsMenu } from './DisplaySettingsMenu';
import { cn } from '@/lib/utils';

export interface AppTopBarProps {
  currentScreen?: Screen;
  onNavigate?: (screen: Screen) => void;
  hrefFor?: (screen: Screen) => string;
  isTestingDraftDirty?: boolean;
  hasActiveReport?: boolean;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
  drawerTrigger?: React.ReactNode;
}

export const AppTopBar: React.FC<AppTopBarProps> = ({
  onNavigate,
  hrefFor,
  isTestingDraftDirty = false,
  hasActiveReport = false,
  title,
  subtitle,
  icon,
  actions,
  drawerTrigger,
}) => {
  const { theme, toggleTheme } = useTheme();

  const renderIcon = () => {
    if (!icon) return null;
    return (
      <div className="bg-primary/6 dark:bg-primary/15 p-2 rounded-none border border-primary/25 dark:border-primary/35 shrink-0 text-primary flex items-center justify-center">
        {React.isValidElement(icon)
          ? icon
          : typeof icon === 'function' || (typeof icon === 'object' && icon !== null)
          ? React.createElement(icon as React.ComponentType<{ className?: string }>, {
              className: 'h-5 w-5 text-primary',
            })
          : null}
      </div>
    );
  };

  return (
    <header
      role="banner"
      aria-label="Application header"
      className="bg-card text-card-foreground border-b border-border xl:border-t-[3px] xl:border-t-primary no-print"
    >
      {/* Tablet / Mobile view (<1280px, xl:hidden) */}
      <div className="xl:hidden flex flex-col">
        {/* Row 1: Mobile Identity & Chrome Row (using masthead tokens) */}
        <div className="bg-masthead text-masthead-foreground border-b border-masthead-border pt-[env(safe-area-inset-top)]">
          <div className="px-4 sm:px-5 py-1.5 flex items-center justify-between gap-3 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              {drawerTrigger}
              <a
                href={hrefFor?.(Screen.LOG) || '/'}
                onClick={(e) => {
                  if (onNavigate && shouldHandleNavigation(e)) {
                    e.preventDefault();
                    onNavigate(Screen.LOG);
                  }
                }}
                aria-label="DREAM Home"
                className={cn(
                  'flex items-center gap-2 min-h-[44px] px-1 rounded-none text-white font-bold tracking-tight text-lg leading-none transition-opacity',
                  'hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-masthead-accent focus-visible:ring-offset-2 focus-visible:ring-offset-masthead'
                )}
              >
                DREAM
              </a>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <DisplaySettingsMenu variant="masthead" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                    className={cn(
                      'flex items-center justify-center min-h-[44px] min-w-[44px] p-2 rounded-none transition-colors',
                      'text-masthead-foreground/80 hover:text-masthead-foreground hover:bg-white/10',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-masthead-accent focus-visible:ring-offset-2 focus-visible:ring-offset-masthead'
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
            </div>
          </div>
        </div>

        {/* Row 2: Page Context and Actions */}
        {(title || subtitle || icon || actions || isTestingDraftDirty || hasActiveReport) && (
          <div className="px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
            <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
              {renderIcon()}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {title && (
                    <h1 className="text-lg sm:text-xl font-bold tracking-tight leading-snug break-words m-0 text-foreground">
                      {title}
                    </h1>
                  )}
                  {isTestingDraftDirty && (
                    <span
                      role="status"
                      aria-label="Testing draft with unsaved changes"
                      className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-status-warning/15 text-status-warning border border-status-warning/30 rounded-none shrink-0"
                    >
                      Testing draft
                    </span>
                  )}
                  {hasActiveReport && (
                    <span
                      role="status"
                      aria-label="Report active"
                      className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/20 dark:bg-primary/30 dark:text-primary-foreground rounded-none shrink-0"
                    >
                      Report active
                    </span>
                  )}
                </div>
                {subtitle && (
                  <div className="text-xs text-muted-foreground break-words font-normal mt-1 leading-normal">
                    {subtitle}
                  </div>
                )}
              </div>
            </div>

            {actions && (
              <div className="flex items-center gap-2 shrink-0 flex-wrap sm:self-center">
                {actions}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop view (>=1280px, hidden xl:block) */}
      <div className="hidden xl:block">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 md:px-6 py-3 flex items-center justify-between gap-4 min-w-0">
          {/* Left: Page icon, title, subtitle */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {renderIcon()}
            <div className="min-w-0 flex-1">
              {title && (
                <h1 className="text-lg sm:text-xl font-bold tracking-tight leading-snug break-words m-0 text-foreground">
                  {title}
                </h1>
              )}
              {subtitle && (
                <div className="text-xs text-muted-foreground break-words font-normal mt-1 leading-normal">
                  {subtitle}
                </div>
              )}
            </div>
          </div>

          {/* Right: Status labels, actions, display settings, theme toggle */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {isTestingDraftDirty && (
              <span
                role="status"
                aria-label="Testing draft with unsaved changes"
                className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-status-warning/15 text-status-warning border border-status-warning/30 rounded-none shrink-0"
              >
                Testing draft
              </span>
            )}
            {hasActiveReport && (
              <span
                role="status"
                aria-label="Report active"
                className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/20 dark:bg-primary/30 dark:text-primary-foreground rounded-none shrink-0"
              >
                Report active
              </span>
            )}

            {actions && (
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {actions}
              </div>
            )}

            <div className="flex items-center gap-1 border-l border-border pl-2 shrink-0">
              <DisplaySettingsMenu variant="card" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                    className={cn(
                      'flex items-center justify-center min-h-[44px] min-w-[44px] p-2 rounded-none transition-colors',
                      'text-foreground/80 hover:text-foreground hover:bg-muted',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
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
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
