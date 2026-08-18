import React from 'react';
import { Stethoscope } from 'lucide-react';
import { Screen } from '@shared/types';
import { shouldHandleNavigation } from '@core/navigation/shouldHandleNavigation';
import { AppNavigationSections } from './AppNavigationSections';
import { cn } from '@/lib/utils';

export interface AppSidebarProps {
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

export const AppSidebar: React.FC<AppSidebarProps> = ({
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
  return (
    <aside
      aria-label="Application sidebar"
      className={cn(
        'hidden xl:flex fixed inset-y-0 left-0 w-64 h-screen z-30 flex-col',
        'bg-masthead text-masthead-foreground border-r border-masthead-border',
        'no-print select-none'
      )}
    >
      {/* Brand lockup */}
      <div className="p-4 border-b border-masthead-border shrink-0">
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
            'flex items-center gap-3 min-h-[44px] p-1.5 rounded-none transition-opacity',
            'text-masthead-foreground hover:opacity-90',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-masthead-accent focus-visible:ring-offset-2 focus-visible:ring-offset-masthead'
          )}
        >
          <div className="p-2 bg-white/10 border border-white/20 rounded-none flex items-center justify-center shrink-0">
            <Stethoscope className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold tracking-tight text-lg leading-tight text-white break-words">
              DREAM
            </span>
            <span className="text-xs text-white/70 tracking-normal leading-tight break-words">
              Anaesthetic Allergy Workbench
            </span>
          </div>
        </a>
      </div>

      {/* Independent scrollable navigation area */}
      <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-6">
        <AppNavigationSections
          variant="sidebar"
          currentScreen={currentScreen}
          onNavigate={onNavigate}
          hrefFor={hrefFor}
          isTestingDraftDirty={isTestingDraftDirty}
          hasActiveReport={hasActiveReport}
          onOpenUploadCSV={onOpenUploadCSV}
          onOpenGetStarted={onOpenGetStarted}
          databaseDate={databaseDate}
          isCustomData={isCustomData}
          onDeleteTestingDraft={onDeleteTestingDraft}
        />
      </div>
    </aside>
  );
};
