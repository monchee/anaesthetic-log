import React, { useState, useRef } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui';
import { Sun, Moon, Menu, HelpCircle, Upload, Stethoscope, LayoutDashboard, Info, FlaskConical, Mail, BookOpen, ScrollText, Database } from 'lucide-react';
import Footer from './Footer';
import DisclaimerBanner from './DisclaimerBanner';
import { useTheme } from './ThemeProvider';
import { Screen, Patient } from '@/types';
import { HelpModal } from './HelpModal';
import { CSVUploadInstructions } from '@features/dashboard/components/CSVUploadInstructions';
import { parseRedcapCSV } from '@shared/utils';
import { toast } from 'sonner';

interface ScreenLayoutProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    actions?: React.ReactNode;
    children: React.ReactNode;
    setScreen: (screen: Screen) => void;
    currentScreen?: Screen;
    databaseDate: string;
    showFooter?: boolean;
    className?: string;
    contentClassName?: string;
    showDisclaimer?: boolean;
    isCustomData?: boolean;
    onDismissDisclaimer?: () => void;
    onUploadPatients?: (patients: Patient[], fileLastModified?: number) => void;
    showNav?: boolean;
    csvUploadSheetOpen?: boolean;
    onCSVUploadSheetOpenChange?: (open: boolean) => void;
}

const primaryNav = [
    { label: 'Home', icon: Stethoscope, screen: Screen.LOG },
    { label: 'Dashboard', icon: LayoutDashboard, screen: Screen.DASHBOARD },
    { label: 'Research', icon: Database, screen: Screen.RESEARCH },
];

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
    title,
    subtitle,
    icon,
    actions,
    children,
    setScreen,
    currentScreen,
    databaseDate,
    showFooter = true,
    className,
    contentClassName,
    showDisclaimer,
    isCustomData = false,
    onDismissDisclaimer,
    onUploadPatients,
    showNav = true,
    csvUploadSheetOpen,
    onCSVUploadSheetOpenChange,
}) => {
    const { theme, toggleTheme } = useTheme();
    const [isCSVUploadSheetOpenLocal, setIsCSVUploadSheetOpenLocal] = useState(false);
    const isCSVUploadSheetOpen = csvUploadSheetOpen ?? isCSVUploadSheetOpenLocal;
    const setIsCSVUploadSheetOpen = onCSVUploadSheetOpenChange ?? setIsCSVUploadSheetOpenLocal;
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file && onUploadPatients) {
            setIsUploading(true);
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const text = event.target?.result as string;
                    const result = parseRedcapCSV(text);

                    if (result.success) {
                        onUploadPatients(result.data, file.lastModified);
                        toast.success('Database updated', {
                            description: `Successfully loaded ${result.data.length} records from CSV.`,
                        });
                        setIsCSVUploadSheetOpen(false);
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
            reader.readAsText(file);
        }

        if (e.target) {
            e.target.value = '';
        }
    };

    return (
        <div className={`min-h-screen print:min-h-0 bg-background dark:bg-background flex flex-col ${className || ''}`}>
            {/* Skip to Main Content Link */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-slate-900 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
                Skip to main content
            </a>

            {/* Full Width Header (Static) */}
            <header role="banner" aria-label="Application header" className="w-full flex flex-col shadow-sm z-50 relative no-print">
                {/* Main Navigation Bar */}
                <div className="bg-primary dark:bg-primary w-full transition-colors">
                    {/* Safe Area Padding for mobile notch support */}
                    <div className="pt-[env(safe-area-inset-top)]">
                        <div className="max-w-6xl mx-auto px-3 py-3 sm:px-4 flex flex-col sm:flex-row justify-between items-center gap-4">

                            {/* Title Area */}
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="bg-white/10 p-2 rounded-none backdrop-blur-sm border border-white/10 shrink-0 dark:border-white/20">
                                    {icon}
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-xl font-semibold tracking-tight leading-none truncate m-0 text-white">
                                        {title}
                                    </h1>
                                    {subtitle && <div className="text-xs text-white/80 truncate font-normal mt-1 opacity-90">{subtitle}</div>}
                                </div>
                            </div>

                            {/* Actions Area */}
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">

                                {/* Primary Nav Pills */}
                                {showNav && (
                                <nav aria-label="Primary navigation" className="flex items-center gap-1">
                                    {primaryNav.map(({ label, icon: Icon, screen }) => {
                                        const isActive = currentScreen === screen;
                                        return (
                                            <button
                                                key={screen}
                                                onClick={() => setScreen(screen)}
                                                aria-current={isActive ? 'page' : undefined}
                                                aria-label={label}
                                                className={`h-11 px-3 rounded-none flex items-center gap-1.5 text-sm border border-white/20 transition-all duration-200 shadow-sm btn-press
                                                    ${isActive
                                                        ? 'bg-white text-primary font-medium'
                                                        : 'bg-white/10 hover:bg-white/30 text-white'
                                                    }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span className="hidden sm:inline">{label}</span>
                                            </button>
                                        );
                                    })}
                                </nav>
                                )}

                                {actions && <div className="h-6 w-px bg-white/10 mx-1" />}
                                {actions}

                                {showNav && <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block"></div>}

                                {/* Hamburger Menu */}
                                {showNav && <DropdownMenu>
                                    <DropdownMenuTrigger
                                        className="h-11 px-4 rounded-none bg-white/10 hover:bg-white/30 text-white hover:text-white font-medium flex items-center gap-2 border border-white/20 transition-all duration-200 shadow-sm group btn-press"
                                        title="Open Navigation Menu"
                                        aria-label="Menu"
                                    >
                                        <Menu className="w-4 h-4 text-white opacity-90 group-hover:opacity-100 transition-opacity" />
                                        <span className="text-sm hidden sm:inline">Menu</span>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                        <DropdownMenuItem onClick={() => setIsCSVUploadSheetOpen(true)}>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload CSV
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => {
                                            const helpButton = document.querySelector('[data-help-modal-trigger]') as HTMLButtonElement;
                                            helpButton?.click();
                                        }}>
                                            <HelpCircle className="w-4 h-4 mr-2" />
                                            Quick Start Guide
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem onClick={() => setScreen(Screen.ABOUT)}><Info className="w-4 h-4 mr-2" />About</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setScreen(Screen.FAQ)}><HelpCircle className="w-4 h-4 mr-2" />FAQ</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setScreen(Screen.DRUG_REFERENCE)}><FlaskConical className="w-4 h-4 mr-2" />Drug Reference</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setScreen(Screen.CONTACT)}><Mail className="w-4 h-4 mr-2" />Contact / Support</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setScreen(Screen.RESOURCES)}><BookOpen className="w-4 h-4 mr-2" />Resources / Links</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setScreen(Screen.CHANGELOG)}><ScrollText className="w-4 h-4 mr-2" />Changelog</DropdownMenuItem>

                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem onClick={toggleTheme}>
                                            {theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Disclaimer Banner - Attached to Header */}
                {showDisclaimer && !isCustomData && onDismissDisclaimer && (
                    <div className="print:hidden">
                        <DisclaimerBanner onClose={onDismissDisclaimer} onUploadClick={() => setIsCSVUploadSheetOpen(true)} />
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main
                key={currentScreen}
                id="main-content"
                role="main"
                aria-label="Main content"
                tabIndex={-1}
                className="flex-1 w-full max-w-6xl mx-auto sm:px-5 md:px-6 py-3 sm:py-4 md:py-6 flex flex-col relative z-10 animate-screen-enter"
            >
                <div className={`${contentClassName || ''} flex-1 flex flex-col`}>
                    <React.Suspense fallback={
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-muted-foreground min-h-[50vh]">
                            <div className="flex flex-col items-center gap-4">
                                <div className="h-8 w-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                                <span className="text-sm font-medium animate-pulse">Loading content...</span>
                            </div>
                        </div>
                    }>
                        {children}
                    </React.Suspense>
                </div>
            </main>

            {/* Hidden HelpModal - triggered from dropdown menu */}
            <HelpModal onUploadPatients={onUploadPatients} hideTrigger={true} hasData={isCustomData} setScreen={setScreen} />

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

            {/* Footer */}
            {showFooter && <Footer setScreen={setScreen} databaseDate={databaseDate} onUploadPatients={onUploadPatients} isCustomData={isCustomData} />}
        </div>
    );
};
