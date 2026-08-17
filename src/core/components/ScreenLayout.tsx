import React, { useState, useRef } from 'react';
import { Screen, Patient } from '@/types';
import { pathFromScreen } from '@core/navigation/navigationConfig';
import { AppMasthead } from './navigation/AppMasthead';
import { MobileNavigationDrawer } from './navigation/MobileNavigationDrawer';
import { NavigationGuardDialog } from './navigation/NavigationGuardDialog';
import Footer from './Footer';
import DisclaimerBanner from './DisclaimerBanner';
import TTLExpiryBanner from './TTLExpiryBanner';
import { useTTLExpiryWarning } from '@shared/hooks/useTTLExpiryWarning';
import { useChromeHeight } from '@core/hooks/useChromeHeight';
import { CSVUploadInstructions } from '@features/dashboard/components/CSVUploadInstructions';
import { useRedcapCsvUpload } from '@shared/hooks/useRedcapCsvUpload';

export interface ScreenLayoutProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  contextBar?: React.ReactNode;
  children: React.ReactNode;
  setScreen: (screen: Screen) => void;
  navigate?: (screen: Screen) => void;
  hrefFor?: (screen: Screen) => string;
  pendingNavigation?: Screen | null;
  confirmNavigation?: () => void;
  cancelNavigation?: () => void;
  currentScreen?: Screen;
  isTestingDraftDirty?: boolean;
  hasActiveReport?: boolean;
  databaseDate: string;
  showFooter?: boolean;
  className?: string;
  contentClassName?: string;
  showDisclaimer?: boolean;
  isCustomData?: boolean;
  onDismissDisclaimer?: () => void;
  onUploadPatients?: (patients: Patient[], fileLastModified?: number) => void;
  onUploadComplete?: () => void;
  showNav?: boolean;
  csvUploadSheetOpen?: boolean;
  onCSVUploadSheetOpenChange?: (open: boolean) => void;
  onOpenGetStarted?: () => void;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  title,
  subtitle,
  icon,
  actions,
  contextBar,
  children,
  setScreen,
  navigate,
  hrefFor = pathFromScreen,
  pendingNavigation = null,
  confirmNavigation,
  cancelNavigation,
  currentScreen = Screen.LOG,
  isTestingDraftDirty = false,
  hasActiveReport = false,
  databaseDate,
  showFooter = true,
  className,
  contentClassName,
  showDisclaimer,
  isCustomData = false,
  onDismissDisclaimer,
  onUploadPatients,
  onUploadComplete,
  showNav = true,
  csvUploadSheetOpen,
  onCSVUploadSheetOpenChange,
  onOpenGetStarted,
}) => {
  const [isCSVUploadSheetOpenLocal, setIsCSVUploadSheetOpenLocal] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ttlExpiryWarning = useTTLExpiryWarning();
  const chromeRef = useChromeHeight<HTMLDivElement>();

  const isCSVUploadSheetOpen = csvUploadSheetOpen ?? isCSVUploadSheetOpenLocal;
  const setIsCSVUploadSheetOpen = onCSVUploadSheetOpenChange ?? setIsCSVUploadSheetOpenLocal;

  const onNavigate = navigate || setScreen;

  const { isUploading, handleFileChange: handleFileUpload } = useRedcapCsvUpload({
    onParsed: onUploadPatients,
    onComplete: () => {
      setIsCSVUploadSheetOpen(false);
      onUploadComplete?.();
    },
  });

  const handleOpenUploadCSV = () => {
    setIsCSVUploadSheetOpen(true);
  };

  const handleOpenGetStarted = () => {
    onOpenGetStarted?.();
  };

  return (
    <div className={`min-h-screen overflow-x-hidden print:min-h-0 bg-background dark:bg-background flex flex-col ${className || ''}`}>
      {/* Skip to Main Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Sticky Unified Chrome Stack */}
      <div ref={chromeRef} className="sticky top-0 z-40 no-print">
        {showNav ? (
          <AppMasthead
            currentScreen={currentScreen}
            onNavigate={onNavigate}
            hrefFor={hrefFor}
            isTestingDraftDirty={isTestingDraftDirty}
            hasActiveReport={hasActiveReport}
            onOpenUploadCSV={handleOpenUploadCSV}
            onOpenGetStarted={handleOpenGetStarted}
            databaseDate={databaseDate}
            isCustomData={isCustomData}
            title={title}
            subtitle={subtitle}
            icon={icon}
            actions={actions}
            mobileMenuTrigger={
              <div className="lg:hidden">
                <MobileNavigationDrawer
                  isOpen={isMobileDrawerOpen}
                  onOpenChange={setIsMobileDrawerOpen}
                  currentScreen={currentScreen}
                  onNavigate={onNavigate}
                  hrefFor={hrefFor}
                  isTestingDraftDirty={isTestingDraftDirty}
                  hasActiveReport={hasActiveReport}
                  onOpenUploadCSV={handleOpenUploadCSV}
                  onOpenGetStarted={handleOpenGetStarted}
                  databaseDate={databaseDate}
                  isCustomData={isCustomData}
                />
              </div>
            }
          />
        ) : (
          <header role="banner" aria-label="Application header" className="bg-card text-card-foreground border-b border-border no-print">
            <div className="max-w-6xl mx-auto px-4 sm:px-5 md:px-6 py-3 flex flex-row justify-between items-center gap-4 min-w-0">
              {/* Title Area */}
              <div className="flex items-center gap-3 min-w-0">
                {icon && (
                  <div className="bg-muted p-2 rounded-none border border-border shrink-0 text-foreground">
                    {icon}
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight leading-none truncate m-0 text-foreground">
                    {title}
                  </h1>
                  {subtitle && (
                    <div className="text-xs text-muted-foreground truncate font-normal mt-1">
                      {subtitle}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {actions && (
                <div className="flex items-center gap-2 shrink-0">
                  {actions}
                </div>
              )}
            </div>
          </header>
        )}

        {/* Tier 3: Context Bar */}
        {contextBar}

        {/* Disclaimer Banner */}
        {showDisclaimer && !isCustomData && onDismissDisclaimer && (
          <div className="print:hidden">
            <DisclaimerBanner
              onClose={onDismissDisclaimer}
              onUploadClick={() => setIsCSVUploadSheetOpen(true)}
            />
          </div>
        )}

        {/* TTL Expiry Warning Banner */}
        {ttlExpiryWarning.isNearExpiry && !ttlExpiryWarning.isDismissed && ttlExpiryWarning.expiresAt !== null && (
          <div className="print:hidden">
            <TTLExpiryBanner
              expiresAt={ttlExpiryWarning.expiresAt}
              onKeepWorking={ttlExpiryWarning.keepWorking}
              onDismiss={ttlExpiryWarning.dismiss}
            />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main
        key={currentScreen}
        id="main-content"
        role="main"
        aria-label="Main content"
        tabIndex={-1}
        className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-6 flex flex-col relative z-10 animate-screen-enter focus:outline-none"
      >
        <div className={`${contentClassName || ''} flex-1 flex flex-col`}>
          <React.Suspense
            fallback={
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-muted-foreground min-h-[50vh]">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-8 w-8 rounded-none border-2 border-primary/20 border-t-primary animate-spin" />
                  <span className="text-sm font-medium animate-pulse">Loading content...</span>
                </div>
              </div>
            }
          >
            {children}
          </React.Suspense>
        </div>
      </main>

      {/* Footer */}
      {showFooter && (
        <Footer
          currentScreen={currentScreen}
          setScreen={onNavigate}
          onNavigate={onNavigate}
          hrefFor={hrefFor}
          databaseDate={databaseDate}
          onUploadPatients={onUploadPatients}
          isCustomData={isCustomData}
        />
      )}

      {/* Hidden file input for CSV upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        aria-label="Upload CSV file"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Global CSV Upload Instructions Sheet */}
      {onUploadPatients && (
        <CSVUploadInstructions
          isOpen={isCSVUploadSheetOpen}
          onOpenChange={setIsCSVUploadSheetOpen}
          onUpload={handleFileUpload}
          isUploading={isUploading}
        />
      )}

      {/* Dirty Testing Navigation Guard Dialog */}
      {confirmNavigation && cancelNavigation && (
        <NavigationGuardDialog
          isOpen={pendingNavigation !== null}
          onConfirm={confirmNavigation}
          onCancel={cancelNavigation}
        />
      )}
    </div>
  );
};

export default ScreenLayout;
