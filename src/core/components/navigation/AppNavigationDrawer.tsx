import React, { useEffect, useRef } from 'react';
import { Menu, X, Stethoscope } from 'lucide-react';
import { Screen } from '@shared/types';
import { AppNavigationSections } from './AppNavigationSections';
import { cn } from '@/lib/utils';

export interface AppNavigationDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  hrefFor: (screen: Screen) => string;
  isTestingDraftDirty: boolean;
  hasActiveReport: boolean;
  onOpenUploadCSV: () => void;
  onOpenGetStarted: () => void;
  databaseDate: string;
  isCustomData?: boolean;
  onDeleteTestingDraft?: () => void;
}

export const AppNavigationDrawer: React.FC<AppNavigationDrawerProps> = ({
  isOpen,
  onOpenChange,
  currentScreen,
  onNavigate,
  hrefFor,
  isTestingDraftDirty,
  hasActiveReport,
  onOpenUploadCSV,
  onOpenGetStarted,
  databaseDate,
  isCustomData = false,
  onDeleteTestingDraft,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Handle ESC key and focus trapping (Tab / Shift+Tab)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = drawerRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onOpenChange]);

  // Lock body scroll and focus initial element when open, restore focus when closed
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const timer = window.setTimeout(() => {
        const firstFocusable = drawerRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }, 50);
      return () => {
        window.clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
      triggerRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Menu Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => onOpenChange(true)}
        aria-expanded={isOpen}
        aria-controls="app-navigation-drawer"
        aria-label="Open navigation menu"
        className={cn(
          'min-h-[44px] min-w-[44px] px-3 sm:px-3.5 rounded-none flex items-center justify-center gap-2',
          'bg-white/10 hover:bg-white/20 text-white font-medium border border-white/20 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-masthead-accent focus-visible:ring-offset-2 focus-visible:ring-offset-masthead'
        )}
      >
        <Menu className="w-5 h-5 text-white shrink-0" aria-hidden="true" />
        <span className="text-sm font-semibold hidden sm:inline">Menu</span>
      </button>

      {/* Backdrop & Drawer Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[90] bg-black/60 transition-opacity no-print"
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
          />
          <div
            id="app-navigation-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Drawer"
            className={cn(
              'fixed inset-y-0 left-0 w-[88vw] max-w-[360px] bg-card text-card-foreground border-r border-border shadow-2xl flex flex-col z-[100]',
              'animate-in slide-in-from-left duration-200 no-print',
              'pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]'
            )}
          >
            {/* Drawer Header */}
            <div className="p-4 bg-masthead text-masthead-foreground flex items-center justify-between border-b border-masthead-border shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 bg-white/10 border border-white/20 rounded-none shrink-0">
                  <Stethoscope className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="text-base font-bold text-white leading-none break-words">DREAM</div>
                  <div className="text-xs text-white/80 mt-1 break-words">Navigation Menu</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Close navigation menu"
                className={cn(
                  'min-h-[44px] min-w-[44px] p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-none transition-colors flex items-center justify-center shrink-0',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-masthead-accent'
                )}
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Scrollable Navigation Content */}
            <div className="p-4 flex-1 overflow-y-auto min-h-0 space-y-6">
              <AppNavigationSections
                variant="drawer"
                currentScreen={currentScreen}
                onNavigate={onNavigate}
                hrefFor={hrefFor}
                isTestingDraftDirty={isTestingDraftDirty}
                hasActiveReport={hasActiveReport}
                onOpenUploadCSV={onOpenUploadCSV}
                onOpenGetStarted={onOpenGetStarted}
                databaseDate={databaseDate}
                isCustomData={isCustomData}
                onItemClick={() => onOpenChange(false)}
                onDeleteTestingDraft={onDeleteTestingDraft}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};
