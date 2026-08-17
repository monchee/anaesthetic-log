import React from 'react';
import { Stethoscope, Sun, Moon } from 'lucide-react';
import { Screen } from '@/types';
import {
  PRIMARY_NAV_ITEMS,
  getContextualNavItems,
} from '@core/navigation/navigationConfig';
import { useTheme } from '@core/components/ThemeProvider';
import { shouldHandleNavigation } from '@core/navigation/shouldHandleNavigation';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui';
import { UtilityMenu } from './UtilityMenu';
import { DisplaySettingsMenu } from './DisplaySettingsMenu';
import { cn } from '@/lib/utils';

export interface AppMastheadProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  hrefFor: (screen: Screen) => string;
  isTestingDraftDirty: boolean;
  hasActiveReport: boolean;
  onOpenUploadCSV: () => void;
  onOpenGetStarted: () => void;
  databaseDate: string;
  isCustomData?: boolean;
  // Page bar props (job 3 wires these; accept and render them now):
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
  // Mobile trigger slot for responsive layouts
  mobileMenuTrigger?: React.ReactNode;
}

export const AppMasthead: React.FC<AppMastheadProps> = ({
  currentScreen,
  onNavigate,
  hrefFor,
  isTestingDraftDirty,
  hasActiveReport,
  onOpenUploadCSV,
  onOpenGetStarted,
  title,
  subtitle,
  icon,
  actions,
  mobileMenuTrigger,
}) => {
  const { theme, toggleTheme } = useTheme();

  const contextualItems = getContextualNavItems({
    currentScreen,
    isTestingDraftDirty,
    hasActiveReport,
  });

  return (
    <header
      role="banner"
      aria-label="Application header"
      className="bg-masthead text-masthead-foreground no-print"
    >
      <div className="pt-[env(safe-area-inset-top)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 md:px-6 flex items-center gap-4 min-w-0">
          {/* Brand lockup */}
          <a
            href={hrefFor(Screen.LOG)}
            onClick={(e) => {
              if (shouldHandleNavigation(e)) {
                e.preventDefault();
                onNavigate(Screen.LOG);
              }
            }}
            aria-label="DREAM Home"
            className={cn(
              "flex items-center gap-2.5 min-h-[44px] py-1 rounded-none shrink-0 transition-opacity",
              "text-masthead-foreground hover:opacity-90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-masthead-accent focus-visible:ring-offset-2 focus-visible:ring-offset-masthead"
            )}
          >
            <div className="p-1.5 bg-white/10 border border-white/20 rounded-none flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-lg leading-tight text-white break-words">
                DREAM
              </span>
              <span className="text-xs text-white/70 tracking-normal hidden xl:inline-block leading-none break-words">
                Anaesthetic Allergy Workbench
              </span>
            </div>
          </a>

          {/* Primary navigation */}
          <nav aria-label="Primary navigation" className="flex items-center gap-1 min-w-0 overflow-x-auto">
            {PRIMARY_NAV_ITEMS.map((item) => {
              const isActive = currentScreen === item.screen;
              const Icon = item.icon;
              return (
                <a
                  key={item.screen}
                  href={hrefFor(item.screen)}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.ariaLabel || item.label}
                  onClick={(e) => {
                    if (shouldHandleNavigation(e)) {
                      e.preventDefault();
                      onNavigate(item.screen);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 min-h-[44px] text-sm rounded-none transition-colors shrink-0",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-masthead-accent focus-visible:ring-offset-2 focus-visible:ring-offset-masthead",
                    isActive
                      ? "text-masthead-foreground font-semibold border-b-2 border-masthead-accent"
                      : "text-masthead-foreground/70 hover:text-masthead-foreground hover:bg-white/10 border-b-2 border-transparent"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="break-words">{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Divider: rendered ONLY when contextualItems.length > 0 */}
          {contextualItems.length > 0 && (
            <div className="w-px h-6 bg-masthead-border shrink-0" aria-hidden="true" />
          )}

          {/* Contextual / Current work navigation */}
          {contextualItems.length > 0 && (
            <nav aria-label="Current work navigation" className="flex items-center gap-1 min-w-0 overflow-x-auto">
              {contextualItems.map((item) => {
                const isActive = currentScreen === item.screen;
                const Icon = item.icon;
                return (
                  <a
                    key={item.screen}
                    href={hrefFor(item.screen)}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={item.ariaLabel || item.label}
                    onClick={(e) => {
                      if (shouldHandleNavigation(e)) {
                        e.preventDefault();
                        onNavigate(item.screen);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-2 px-3 min-h-[44px] text-sm rounded-none transition-colors shrink-0",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-masthead-accent focus-visible:ring-offset-2 focus-visible:ring-offset-masthead",
                      isActive
                        ? "text-masthead-foreground font-semibold border-b-2 border-masthead-accent"
                        : "text-masthead-foreground/70 hover:text-masthead-foreground hover:bg-white/10 border-b-2 border-transparent"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="hidden lg:inline break-words">{item.label}</span>
                    {item.badge && (
                      <span className="bg-white/20 text-white border border-white/30 rounded-none px-1.5 py-0.5 text-xs font-medium shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </a>
                );
              })}
            </nav>
          )}

          {/* Right cluster */}
          <div className="ml-auto flex items-center gap-1 shrink-0">
            <DisplaySettingsMenu />

            {/* Dedicated Theme Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                  className={cn(
                    "flex items-center justify-center min-h-[44px] min-w-[44px] p-2 rounded-none transition-colors",
                    "text-masthead-foreground/80 hover:text-masthead-foreground hover:bg-white/10",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-masthead-accent focus-visible:ring-offset-2 focus-visible:ring-offset-masthead"
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

            <UtilityMenu
              currentScreen={currentScreen}
              onNavigate={onNavigate}
              hrefFor={hrefFor}
              onOpenUploadCSV={onOpenUploadCSV}
              onOpenGetStarted={onOpenGetStarted}
            />

            {/* Slot for the mobile Menu trigger */}
            {mobileMenuTrigger}
          </div>
        </div>
      </div>

      {/* Page bar (Tier 2) if title/actions provided */}
      {(title || subtitle || icon || actions) && (
        <div className="bg-card text-card-foreground border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-5 md:px-6 py-3 flex items-center justify-between gap-4 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              {icon && (
                <div className="bg-muted p-2 rounded-none border border-border shrink-0 text-foreground">
                  {React.isValidElement(icon)
                    ? icon
                    : typeof icon === 'function' || (typeof icon === 'object' && icon !== null)
                    ? React.createElement(icon as React.ComponentType<{ className?: string }>, {
                        className: 'h-5 w-5 text-foreground',
                      })
                    : null}
                </div>
              )}
              <div className="min-w-0">
                {title && (
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight leading-none truncate m-0 text-foreground">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <div className="text-xs text-muted-foreground truncate font-normal mt-1">
                    {subtitle}
                  </div>
                )}
              </div>
            </div>
            {actions && (
              <div className="flex items-center gap-2 shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
