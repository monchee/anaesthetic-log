import React from 'react';
import {
  Stethoscope,
  Upload,
  HelpCircle,
  Sun,
  Moon,
} from 'lucide-react';
import { Screen } from '@/types';
import {
  PRIMARY_NAV_ITEMS,
  getContextualNavItems,
  UTILITY_NAV_ITEMS,
  NavigationItem,
} from '@core/navigation/navigationConfig';
import { useTheme } from '@core/components/ThemeProvider';

export function shouldHandleNavigation(event: React.MouseEvent<HTMLAnchorElement>): boolean {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    event.shiftKey
  ) {
    return false;
  }
  return true;
}

interface AppSidebarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  hrefFor: (screen: Screen) => string;
  isTestingDraftDirty: boolean;
  hasActiveReport: boolean;
  onOpenUploadCSV: () => void;
  onOpenQuickStart: () => void;
  databaseDate: string;
  isCustomData?: boolean;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentScreen,
  onNavigate,
  hrefFor,
  isTestingDraftDirty,
  hasActiveReport,
  onOpenUploadCSV,
  onOpenQuickStart,
  databaseDate,
  isCustomData = false,
}) => {
  const { theme, toggleTheme } = useTheme();

  const contextualItems = getContextualNavItems({
    currentScreen,
    isTestingDraftDirty,
    hasActiveReport,
  });

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>, screen: Screen) => {
    if (shouldHandleNavigation(event)) {
      event.preventDefault();
      onNavigate(screen);
    }
  };

  const renderNavLink = (item: NavigationItem, isContextual = false) => {
    const isActive = currentScreen === item.screen;
    const Icon = item.icon;
    const href = hrefFor(item.screen);

    return (
      <a
        key={item.screen}
        href={href}
        aria-current={isActive ? 'page' : undefined}
        onClick={(e) => handleLinkClick(e, item.screen)}
        className={`min-h-[44px] px-3.5 py-2.5 rounded-none flex items-center justify-between gap-3 text-sm font-semibold transition-all border border-transparent btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
          isActive
            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
            : isContextual
            ? 'bg-amber-500/10 dark:bg-amber-500/15 text-foreground hover:bg-amber-500/20 border-amber-500/30'
            : 'text-foreground/90 hover:text-foreground hover:bg-muted/70'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} aria-hidden="true" />
          <span className="truncate">{item.label}</span>
        </div>
        {item.badge && (
          <span
            className={`px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-none ${
              isActive
                ? 'bg-white/20 text-white'
                : 'bg-primary/15 text-primary dark:bg-primary/30'
            }`}
          >
            {item.badge}
          </span>
        )}
      </a>
    );
  };

  return (
    <aside
      aria-label="Desktop application sidebar"
      className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border bg-card/60 dark:bg-card/40 min-h-screen sticky top-0 h-screen select-none overflow-y-auto no-print"
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-border bg-primary text-primary-foreground">
        <a
          href={hrefFor(Screen.LOG)}
          onClick={(e) => handleLinkClick(e, Screen.LOG)}
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <div className="p-2 bg-white/10 border border-white/20 rounded-none shrink-0 group-hover:bg-white/20 transition-colors">
            <Stethoscope className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold tracking-tight text-white leading-none">
              DREAM
            </div>
            <div className="text-[11px] text-white/80 font-normal mt-1 truncate">
              Anaesthetic Allergy Workbench
            </div>
          </div>
        </a>
      </div>

      {/* Main Content Area in Sidebar */}
      <div className="p-3.5 space-y-5 flex-1">

        {/* Primary Navigation */}
        <nav aria-label="Primary sidebar navigation" className="space-y-1">
          <div className="px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            Primary Navigation
          </div>
          {PRIMARY_NAV_ITEMS.map((item) => renderNavLink(item))}
        </nav>

        {/* Contextual Current Work */}
        {contextualItems.length > 0 && (
          <nav aria-label="Current work navigation" className="space-y-1">
            <div className="px-1 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1.5 flex items-center justify-between">
              <span>Current Work</span>
              <span className="text-[10px] lowercase font-normal opacity-80">contextual</span>
            </div>
            {contextualItems.map((item) => renderNavLink(item, true))}
          </nav>
        )}

        {/* Utility Menu */}
        <div className="space-y-1 pt-2 border-t border-border">
          <div className="px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            Utility Menu
          </div>

          <button
            type="button"
            onClick={onOpenUploadCSV}
            className="w-full min-h-[44px] px-3.5 py-2 text-left rounded-none flex items-center gap-2.5 text-sm font-medium text-foreground/90 hover:text-foreground hover:bg-muted/70 transition-colors border border-transparent btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            <Upload className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
            <span>Upload CSV</span>
          </button>

          <button
            type="button"
            onClick={onOpenQuickStart}
            className="w-full min-h-[44px] px-3.5 py-2 text-left rounded-none flex items-center gap-2.5 text-sm font-medium text-foreground/90 hover:text-foreground hover:bg-muted/70 transition-colors border border-transparent btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            <HelpCircle className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
            <span>Quick Start Guide</span>
          </button>

          {UTILITY_NAV_ITEMS.map((item) => {
            const isActive = currentScreen === item.screen;
            const Icon = item.icon;
            const href = hrefFor(item.screen);
            return (
              <a
                key={item.screen}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                onClick={(e) => handleLinkClick(e, item.screen)}
                className={`min-h-[44px] px-3.5 py-2 rounded-none flex items-center gap-2.5 text-sm font-medium transition-colors border border-transparent btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                  isActive
                    ? 'bg-primary/15 text-primary font-semibold border-primary/30 dark:bg-primary/25'
                    : 'text-foreground/80 hover:text-foreground hover:bg-muted/70'
                }`}
              >
                <Icon className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3.5 border-t border-border bg-card/80 space-y-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="w-full min-h-[44px] px-3 py-2 text-xs font-medium border border-border rounded-none flex items-center justify-between text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex items-center gap-2">
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
          </span>
          <span className="text-[10px] uppercase font-mono">{theme}</span>
        </button>

        <div className="text-[11px] text-muted-foreground flex items-center justify-between px-1">
          <span className="truncate">NSW Health RPAH</span>
          <span className="font-mono text-[10px]">
            {isCustomData ? databaseDate : 'Demo'}
          </span>
        </div>
      </div>
    </aside>
  );
};
