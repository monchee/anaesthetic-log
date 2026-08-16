import React, { useState, useRef } from 'react';
import { Screen, Patient } from '@/types';
import { pathFromScreen } from '@core/navigation/navigationConfig';
import { AppSidebar } from './navigation/AppSidebar';
import { MobileNavigationDrawer } from './navigation/MobileNavigationDrawer';
import { NavigationGuardDialog } from './navigation/NavigationGuardDialog';
import Footer from './Footer';
import DisclaimerBanner from './DisclaimerBanner';
import TTLExpiryBanner from './TTLExpiryBanner';
import { useTTLExpiryWarning } from '@shared/hooks/useTTLExpiryWarning';
import { CSVUploadInstructions } from '@features/dashboard/components/CSVUploadInstructions';
import { parseRedcapCSV, decodeCsvBytes } from '@shared/utils';
import { toast } from 'sonner';

export interface ScreenLayoutProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
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
  onOpenHelp?: () => void;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  title,
  subtitle,
  icon,
  actions,
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
  onOpenHelp,
}) => {
  const [isCSVUploadSheetOpenLocal, setIsCSVUploadSheetOpenLocal] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ttlExpiryWarning = useTTLExpiryWarning();

  const isCSVUploadSheetOpen = csvUploadSheetOpen ?? isCSVUploadSheetOpenLocal;
  const setIsCSVUploadSheetOpen = onCSVUploadSheetOpenChange ?? setIsCSVUploadSheetOpenLocal;

  const onNavigate = navigate || setScreen;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file && onUploadPatients) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = decodeCsvBytes(event.target?.result as ArrayBuffer);
          const result = parseRedcapCSV(text);

          if (result.success) {
            onUploadPatients(result.data, file.lastModified);
            toast.success('Database updated', {
              description: `Imported ${result.data.length} record(s).${result.details ? ` ${result.details.join(' ')}` : ''}`,
            });
            setIsCSVUploadSheetOpen(false);
            onUploadComplete?.();
          } else {
            toast.error('Failed to parse CSV', {
              description: result.error || 'Please check the file format.',
              duration: 8000,
            });
          }
        } catch {
          toast.error('Error reading file', { duration: 8000 });
        } finally {
          setIsUploading(false);
        }
      };
      reader.onerror = () => {
        toast.error('Error reading file', { duration: 8000 });
        setIsUploading(false);
      };
      reader.readAsArrayBuffer(file);
    }

    if (e.target) {
      e.target.value = '';
    }
  };

  const handleOpenUploadCSV = () => {
    setIsCSVUploadSheetOpen(true);
  };

  const handleOpenQuickStart = () => {
    if (onOpenHelp) {
      onOpenHelp();
      return;
    }
    const helpButton = document.querySelector('[data-help-modal-trigger]') as HTMLButtonElement;
    if (helpButton) {
      helpButton.click();
    }
  };

  return (
    <div className={`min-h-screen overflow-x-hidden print:min-h-0 bg-background dark:bg-background flex flex-col lg:flex-row ${className || ''}`}>
      {/* Skip to Main Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Desktop Sidebar */}
      {showNav && (
        <AppSidebar
          currentScreen={currentScreen}
          onNavigate={onNavigate}
          hrefFor={hrefFor}
          isTestingDraftDirty={isTestingDraftDirty}
          hasActiveReport={hasActiveReport}
          onOpenUploadCSV={handleOpenUploadCSV}
          onOpenQuickStart={handleOpenQuickStart}
          databaseDate={databaseDate}
          isCustomData={isCustomData}
        />
      )}

      {/* Main Column (Header + Content + Footer) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Application Header */}
        <header role="banner" aria-label="Application header" className="w-full flex flex-col shadow-sm z-40 relative no-print">
          <div className="bg-primary dark:bg-primary w-full transition-colors text-primary-foreground">
            <div className="pt-[env(safe-area-inset-top)]">
              <div className="max-w-6xl mx-auto px-3.5 py-3 sm:px-5 md:px-6 flex flex-row justify-between items-center gap-4">
                {/* Title Area */}
                <div className="flex items-center gap-3 min-w-0">
                  {icon && (
                    <div className="bg-white/10 p-2 rounded-none backdrop-blur-sm border border-white/15 shrink-0">
                      {icon}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl font-bold tracking-tight leading-none truncate m-0 text-white">
                      {title}
                    </h1>
                    {subtitle && (
                      <div className="text-xs text-white/85 truncate font-normal mt-1">
                        {subtitle}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions & Mobile Drawer */}
                <div className="flex items-center gap-2 shrink-0">
                  {actions}

                  {/* Mobile Navigation Drawer Trigger */}
                  {showNav && (
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
                        onOpenQuickStart={handleOpenQuickStart}
                        databaseDate={databaseDate}
                        isCustomData={isCustomData}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

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
        </header>

        {/* Main Content Area */}
        <main
          key={currentScreen}
          id="main-content"
          role="main"
          aria-label="Main content"
          tabIndex={-1}
          className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-5 md:px-6 py-3 sm:py-4 md:py-6 flex flex-col relative z-10 animate-screen-enter focus:outline-none"
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
      </div>

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
