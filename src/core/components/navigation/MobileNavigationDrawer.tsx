import React, { useEffect, useRef } from 'react';
import {
  Menu,
  X,
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
import { shouldHandleNavigation } from './AppSidebar';

interface MobileNavigationDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
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

export const MobileNavigationDrawer: React.FC<MobileNavigationDrawerProps> = ({
  isOpen,
  onOpenChange,
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
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const contextualItems = getContextualNavItems({
    currentScreen,
    isTestingDraftDirty,
    hasActiveReport,
  });

  // Handle ESC key to close drawer
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onOpenChange]);

  // Lock body scroll and trap focus when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const firstFocusable = drawerRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    } else {
      document.body.style.overflow = '';
      triggerRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>, screen: Screen) => {
    if (shouldHandleNavigation(event)) {
      event.preventDefault();
      onOpenChange(false);
      onNavigate(screen);
    }
  };

  const handleActionClick = (action: () => void) => {
    onOpenChange(false);
    action();
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
    <>
      {/* Mobile Menu Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => onOpenChange(true)}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-drawer"
        aria-label="Open Navigation Menu"
        className="min-h-[44px] px-3.5 rounded-none bg-white/10 hover:bg-white/25 text-white font-medium flex items-center gap-2 border border-white/20 transition-all duration-150 btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
      >
        <Menu className="w-4 h-4 text-white" aria-hidden="true" />
        <span className="text-sm font-semibold">Menu</span>
      </button>

      {/* Backdrop & Drawer Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm transition-opacity no-print"
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-navigation-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Drawer"
            className="fixed inset-y-0 left-0 w-[85vw] max-w-sm bg-card text-card-foreground border-r border-border shadow-2xl flex flex-col z-[100] animate-in slide-in-from-left duration-200 no-print"
          >
            {/* Drawer Header */}
            <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between border-b border-primary/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 border border-white/20 rounded-none">
                  <Stethoscope className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-base font-bold text-white leading-none">DREAM</div>
                  <div className="text-xs text-white/80 mt-0.5">Navigation Menu</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Close navigation menu"
                className="min-h-[44px] min-w-[44px] p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-none transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Scrollable Navigation Content */}
            <div className="p-4 space-y-5 flex-1 overflow-y-auto">

              {/* Primary Navigation */}
              <nav aria-label="Primary mobile navigation" className="space-y-1">
                <div className="px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Primary Navigation
                </div>
                {PRIMARY_NAV_ITEMS.map((item) => renderNavLink(item))}
              </nav>

              {/* Contextual Current Work */}
              {contextualItems.length > 0 && (
                <nav aria-label="Current work mobile navigation" className="space-y-1">
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
                  onClick={() => handleActionClick(onOpenUploadCSV)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 text-left rounded-none flex items-center gap-2.5 text-sm font-medium text-foreground/90 hover:text-foreground hover:bg-muted/70 transition-colors border border-transparent btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                >
                  <Upload className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                  <span>Upload CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleActionClick(onOpenQuickStart)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 text-left rounded-none flex items-center gap-2.5 text-sm font-medium text-foreground/90 hover:text-foreground hover:bg-muted/70 transition-colors border border-transparent btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
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
                      className={`min-h-[44px] px-3.5 py-2.5 rounded-none flex items-center gap-2.5 text-sm font-medium transition-colors border border-transparent btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
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

            {/* Drawer Footer */}
            <div className="p-4 border-t border-border bg-card/90 space-y-3">
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
                <span className="truncate">RPAH Anaesthetic Allergy</span>
                <span className="font-mono text-[10px]">
                  {isCustomData ? databaseDate : 'Demo'}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
