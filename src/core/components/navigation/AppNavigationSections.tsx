import React, { useState } from 'react';
import { Upload, PlayCircle, Database, Trash2 } from 'lucide-react';
import { Screen } from '@/types';
import {
  PRIMARY_NAV_ITEMS,
  getContextualNavItems,
  UTILITY_NAV_ITEMS,
  NavigationItem,
} from '@core/navigation/navigationConfig';
import { shouldHandleNavigation } from '@core/navigation/shouldHandleNavigation';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/utils';

export interface AppNavigationSectionsProps {
  variant: 'sidebar' | 'drawer';
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  hrefFor: (screen: Screen) => string;
  isTestingDraftDirty: boolean;
  hasActiveReport: boolean;
  onOpenUploadCSV: () => void;
  onOpenGetStarted: () => void;
  databaseDate: string;
  isCustomData?: boolean;
  onItemClick?: () => void;
  onDeleteTestingDraft?: () => void;
}

export const AppNavigationSections: React.FC<AppNavigationSectionsProps> = ({
  variant,
  currentScreen,
  onNavigate,
  hrefFor,
  isTestingDraftDirty,
  hasActiveReport,
  onOpenUploadCSV,
  onOpenGetStarted,
  databaseDate,
  isCustomData = false,
  onItemClick,
  onDeleteTestingDraft,
}) => {
  const [deleteDraftConfirmOpen, setDeleteDraftConfirmOpen] = useState(false);
  const isSidebar = variant === 'sidebar';

  const contextualItems = getContextualNavItems({
    currentScreen,
    isTestingDraftDirty,
    hasActiveReport,
  });

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    screen: Screen
  ) => {
    if (shouldHandleNavigation(e)) {
      e.preventDefault();
      onItemClick?.();
      onNavigate(screen);
    }
  };

  const handleActionClick = (action: () => void) => {
    onItemClick?.();
    action();
  };

  const renderNavLink = (item: NavigationItem) => {
    const isActive = currentScreen === item.screen;
    const Icon = item.icon;
    const href = hrefFor(item.screen);

    if (isSidebar) {
      return (
        <a
          key={item.screen}
          href={href}
          aria-current={isActive ? 'page' : undefined}
          aria-label={item.ariaLabel || item.label}
          onClick={(e) => handleLinkClick(e, item.screen)}
          className={cn(
            'group flex items-center justify-between gap-3 px-3 py-2.5 min-h-[44px] text-sm rounded-none transition-colors border-l-2',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-masthead-accent focus-visible:ring-offset-2 focus-visible:ring-offset-masthead',
            isActive
              ? 'bg-white/10 text-white font-semibold border-masthead-accent'
              : 'text-masthead-foreground/75 hover:text-white hover:bg-white/5 border-transparent'
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Icon
              className={cn(
                'w-4 h-4 shrink-0 transition-colors',
                isActive ? 'text-masthead-accent' : 'text-masthead-foreground/70 group-hover:text-white'
              )}
              aria-hidden="true"
            />
            <span className="break-words leading-tight">{item.label}</span>
          </div>
          {item.badge && (
            <span
              className={cn(
                'px-1.5 py-0.5 text-xs font-semibold rounded-none border shrink-0',
                isActive
                  ? 'bg-white/20 text-white border-white/30'
                  : 'bg-white/10 text-white/90 border-white/20'
              )}
            >
              {item.badge}
            </span>
          )}
        </a>
      );
    }

    // Drawer variant
    return (
      <a
        key={item.screen}
        href={href}
        aria-current={isActive ? 'page' : undefined}
        aria-label={item.ariaLabel || item.label}
        onClick={(e) => handleLinkClick(e, item.screen)}
        className={cn(
          'group flex items-center justify-between gap-3 px-3 py-2.5 min-h-[44px] text-sm rounded-none transition-colors border-l-2',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
          isActive
            ? 'bg-accent text-accent-foreground font-semibold border-primary'
            : 'text-foreground/80 hover:text-foreground hover:bg-muted/70 border-transparent'
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon
            className={cn(
              'w-4 h-4 shrink-0 transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
            )}
            aria-hidden="true"
          />
          <span className="break-words leading-tight">{item.label}</span>
        </div>
        {item.badge && (
          <span
            className={cn(
              'px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-none border shrink-0',
              isActive
                ? 'bg-primary/15 text-primary border-primary/30 dark:bg-primary/30 dark:text-primary-foreground'
                : 'bg-muted text-muted-foreground border-border'
            )}
          >
            {item.badge}
          </span>
        )}
      </a>
    );
  };

  const sectionLabelClass = isSidebar
    ? 'px-3 text-xs font-bold uppercase tracking-wider text-masthead-foreground/60 mb-1.5'
    : 'px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5';

  const actionButtonClass = isSidebar
    ? 'w-full text-left min-h-[44px] px-3 py-2.5 text-sm font-medium text-masthead-foreground/75 hover:text-white hover:bg-white/5 border-l-2 border-transparent flex items-center gap-2.5 rounded-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-masthead-accent focus-visible:ring-offset-2 focus-visible:ring-offset-masthead'
    : 'w-full text-left min-h-[44px] px-3 py-2.5 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/70 border-l-2 border-transparent flex items-center gap-2.5 rounded-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card';

  const actionIconClass = isSidebar
    ? 'w-4 h-4 shrink-0 text-masthead-foreground/70'
    : 'w-4 h-4 shrink-0 text-primary';

  return (
    <div className="flex flex-col gap-6 flex-1 min-h-0">
      {/* 1. Workspace Navigation */}
      <nav aria-label={isSidebar ? 'Workspace navigation' : 'Workspace mobile navigation'} className="space-y-1">
        <div className={sectionLabelClass}>Workspace</div>
        <div className="space-y-0.5">
          {PRIMARY_NAV_ITEMS.map((item) => renderNavLink(item))}
        </div>
      </nav>

      {/* 2. Current Work Navigation (Contextual) */}
      {contextualItems.length > 0 && (
        <nav aria-label={isSidebar ? 'Current work navigation' : 'Current work mobile navigation'} className="space-y-1">
          <div className={cn(sectionLabelClass, isSidebar ? 'text-masthead-accent/80' : 'text-primary font-semibold')}>
            Current Work
          </div>
          <div className="space-y-0.5">
            {contextualItems.map((item) =>
              item.screen === Screen.TESTING && isTestingDraftDirty && onDeleteTestingDraft ? (
                <div key={item.screen} className="flex items-center gap-1">
                  <div className="flex-1 min-w-0">{renderNavLink(item)}</div>
                  <button
                    type="button"
                    aria-label="Delete testing draft"
                    onClick={() => setDeleteDraftConfirmOpen(true)}
                    className={cn(
                      'shrink-0 flex items-center justify-center min-h-[44px] min-w-[44px] rounded-none transition-colors',
                      isSidebar
                        ? 'text-masthead-foreground/60 hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-masthead-accent focus-visible:ring-offset-2 focus-visible:ring-offset-masthead'
                        : 'text-muted-foreground hover:text-destructive hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card'
                    )}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                renderNavLink(item)
              )
            )}
          </div>
        </nav>
      )}

      {/* 3. Reference and Support Navigation */}
      <nav aria-label={isSidebar ? 'Reference and support navigation' : 'Reference and support mobile navigation'} className="space-y-1">
        <div className={sectionLabelClass}>Reference & Support</div>
        <div className="space-y-0.5">
          {UTILITY_NAV_ITEMS.map((item) => renderNavLink(item))}
        </div>
      </nav>

      {/* 4. Workspace Actions */}
      <div className="space-y-1">
        <div className={sectionLabelClass}>Actions</div>
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => handleActionClick(onOpenUploadCSV)}
            className={actionButtonClass}
          >
            <Upload className={actionIconClass} aria-hidden="true" />
            <span className="break-words leading-tight">Upload CSV</span>
          </button>

          <button
            type="button"
            onClick={() => handleActionClick(onOpenGetStarted)}
            className={actionButtonClass}
          >
            <PlayCircle className={actionIconClass} aria-hidden="true" />
            <span className="break-words leading-tight">Get Started</span>
          </button>
        </div>
      </div>

      {/* 5. Footer Metadata */}
      <div
        className={cn(
          'pt-4 mt-auto border-t text-xs flex flex-col gap-1 px-3',
          isSidebar
            ? 'border-masthead-border/60 text-masthead-foreground/70'
            : 'border-border text-muted-foreground'
        )}
      >
        <div className={cn('font-semibold', isSidebar ? 'text-white' : 'text-foreground')}>
          RPAH Anaesthetic Allergy
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3 shrink-0 opacity-70" aria-hidden="true" />
            <span>Dataset</span>
          </span>
          <span className="font-mono">{isCustomData ? databaseDate : 'Demo'}</span>
        </div>
      </div>

      <ConfirmDialog
        open={deleteDraftConfirmOpen}
        onOpenChange={setDeleteDraftConfirmOpen}
        variant="danger"
        title="Delete testing draft?"
        message="This will permanently discard your in-progress testing session — all entered results, notes, and drug selections. This cannot be undone."
        confirmLabel="Delete draft"
        onConfirm={() => {
          onItemClick?.();
          onDeleteTestingDraft?.();
        }}
      />
    </div>
  );
};
