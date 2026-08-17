import React from 'react';
import {
  Stethoscope,
  Upload,
  PlayCircle,
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
  onOpenGetStarted: () => void;
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
  onOpenGetStarted,
  databaseDate,
  isCustomData = false,
}) => {
  const { theme, toggleTheme } = useTheme();
  const activeLinkRef = React.useRef<HTMLAnchorElement | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);

  const contextualItems = getContextualNavItems({
    currentScreen,
    isTestingDraftDirty,
    hasActiveReport,
  });

  const fitActiveLink = React.useCallback(() => {
    const container = scrollContainerRef.current;
    const target = activeLinkRef.current;
    if (!container || !target) return;

    if (
      typeof container.getBoundingClientRect === 'function' &&
      typeof target.getBoundingClientRect === 'function'
    ) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      if (containerRect.height > 0 && targetRect.height > 0) {
        if (targetRect.top < containerRect.top) {
          container.scrollTop += targetRect.top - containerRect.top;
        } else if (targetRect.bottom > containerRect.bottom) {
          container.scrollTop += targetRect.bottom - containerRect.bottom;
        }
        return;
      }
    }

    target.scrollIntoView?.({
      block: 'nearest',
      inline: 'nearest',
      behavior: 'auto',
    });
  }, []);

  React.useEffect(() => {
    fitActiveLink();

    const container = scrollContainerRef.current;
    let resizeObserver: ResizeObserver | null = null;

    if (typeof ResizeObserver !== 'undefined' && container) {
      resizeObserver = new ResizeObserver(() => {
        fitActiveLink();
      });
      resizeObserver.observe(container);
    }

    const handleResize = () => {
      fitActiveLink();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [fitActiveLink, currentScreen, isTestingDraftDirty, hasActiveReport]);

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>, screen: Screen) => {
    if (shouldHandleNavigation(event)) {
      event.preventDefault();
      onNavigate(screen);
    }
  };

  const renderBadge = (badge: string, isActive: boolean) => {
    const isDraft = badge.toLowerCase() === 'draft';
    const isActiveMarker = badge.toLowerCase() === 'active';

    let badgeClasses = 'px-1.5 py-0.5 text-xs font-medium rounded-none shrink-0 ';

    if (isActive) {
      // High-contrast readable text against navy primary active row
      badgeClasses += 'bg-white/20 text-white border border-white/30';
    } else if (isDraft) {
      // Semantic status-warning token for inactive Draft marker
      badgeClasses += 'bg-status-warning/15 text-status-warning border border-status-warning/30';
    } else if (isActiveMarker) {
      // Semantic status-info token for inactive Active marker
      badgeClasses += 'bg-status-info/15 text-status-info border border-status-info/30';
    } else {
      badgeClasses += 'bg-muted text-muted-foreground border border-border';
    }

    return <span className={badgeClasses}>{badge}</span>;
  };

  const renderNavLink = (item: NavigationItem, isScrollableItem = false) => {
    const isActive = currentScreen === item.screen;
    const Icon = item.icon;
    const href = hrefFor(item.screen);

    return (
      <a
        key={item.screen}
        ref={isActive && isScrollableItem ? activeLinkRef : undefined}
        href={href}
        aria-current={isActive ? 'page' : undefined}
        onClick={(e) => handleLinkClick(e, item.screen)}
        className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-none flex items-center justify-between gap-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 scroll-my-1 ${
          isActive
            ? 'bg-primary text-primary-foreground font-semibold'
            : 'text-foreground/80 hover:text-foreground hover:bg-muted/60'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon
            className={`w-4 h-4 shrink-0 ${
              isActive ? 'text-primary-foreground' : 'text-muted-foreground'
            }`}
            aria-hidden="true"
          />
          <span className="leading-snug break-words">{item.label}</span>
        </div>
        {item.badge && renderBadge(item.badge, isActive)}
      </a>
    );
  };

  return (
    <aside
      aria-label="Desktop application sidebar"
      className="hidden lg:flex flex-col w-72 shrink-0 border-r border-border bg-card/60 dark:bg-card/40 min-h-screen sticky top-0 h-screen select-none overflow-hidden no-print"
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-border bg-primary text-primary-foreground shrink-0">
        <a
          href={hrefFor(Screen.LOG)}
          onClick={(e) => handleLinkClick(e, Screen.LOG)}
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-none"
        >
          <div className="p-2 bg-white/10 border border-white/20 rounded-none shrink-0 group-hover:bg-white/20 transition-colors">
            <Stethoscope className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold tracking-tight text-white leading-none">
              DREAM
            </div>
            <div className="text-xs text-white/80 font-normal mt-1 leading-tight">
              Anaesthetic Allergy Workbench
            </div>
          </div>
        </a>
      </div>

      {/* Scrollable Upper Region: Primary & Current Work Navigation */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-3.5 space-y-5 min-h-0"
      >
        {/* Primary Navigation */}
        <nav aria-label="Primary sidebar navigation" className="space-y-1">
          <div className="px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            Primary Navigation
          </div>
          {PRIMARY_NAV_ITEMS.map((item) => renderNavLink(item, true))}
        </nav>

        {/* Contextual Current Work */}
        {contextualItems.length > 0 && (
          <nav aria-label="Current work navigation" className="space-y-1">
            <div className="px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center justify-between">
              <span>Current Work</span>
              <span className="text-xs lowercase font-normal opacity-80">contextual</span>
            </div>
            {contextualItems.map((item) => renderNavLink(item, true))}
          </nav>
        )}
      </div>

      {/* Pinned Lower Region: Utility Actions, Utility Links, Theme Control, Metadata */}
      <div className="shrink-0 border-t border-border p-3.5 space-y-4 bg-card/80 dark:bg-card/60">
        {/* Utility Menu */}
        <div className="space-y-1">
          <div className="px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            Utility Menu
          </div>

          <button
            type="button"
            onClick={onOpenUploadCSV}
            className="w-full min-h-[44px] px-3.5 py-2 text-left rounded-none flex items-center gap-2.5 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            <Upload className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
            <span className="leading-snug break-words">Upload CSV</span>
          </button>

          <button
            type="button"
            onClick={onOpenGetStarted}
            className="w-full min-h-[44px] px-3.5 py-2 text-left rounded-none flex items-center gap-2.5 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            <PlayCircle className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
            <span className="leading-snug break-words">Get Started</span>
          </button>

          {UTILITY_NAV_ITEMS.map((item) => renderNavLink(item, false))}
        </div>

        {/* Theme Control & System Metadata */}
        <div className="pt-3 border-t border-border space-y-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full min-h-[44px] px-3 py-2 text-xs font-medium border border-border rounded-none flex items-center justify-between text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            <span className="flex items-center gap-2">
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
            </span>
            <span className="text-xs uppercase font-mono">{theme}</span>
          </button>

          <div className="text-xs text-muted-foreground flex items-center justify-between px-1">
            <span className="leading-snug break-words">NSW Health RPAH</span>
            <span className="font-mono text-xs">
              {isCustomData ? databaseDate : 'Demo'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
