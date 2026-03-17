import React, { useState, useRef } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, Button } from './ui';
import { Sun, Moon, Menu, HelpCircle, Upload } from 'lucide-react';
import Footer from './Footer';
import DisclaimerBanner from './DisclaimerBanner';
import { useTheme } from './ThemeProvider';
import { Screen, Patient } from '../types';
import { HelpModal } from './HelpModal';
import { CSVUploadInstructions } from './dashboard/CSVUploadInstructions';
import { parseRedcapCSV } from '../lib/utils';
import toast from 'react-hot-toast';

interface ScreenLayoutProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    actions?: React.ReactNode;
    children: React.ReactNode;
    setScreen: (screen: Screen) => void;
    databaseDate: string;
    showFooter?: boolean;
    className?: string;
    contentClassName?: string;
    showDisclaimer?: boolean;
    isCustomData?: boolean;
    onDismissDisclaimer?: () => void;
    onUploadPatients?: (patients: Patient[]) => void;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
    title,
    subtitle,
    icon,
    actions,
    children,
    setScreen,
    databaseDate,
    showFooter = true,
    className,
    contentClassName,
    showDisclaimer,
    isCustomData = false,
    onDismissDisclaimer,
    onUploadPatients
}) => {
    const { theme, toggleTheme } = useTheme();
    const [isCSVUploadSheetOpen, setIsCSVUploadSheetOpen] = useState(false);
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
                        onUploadPatients(result.data);
                        toast.success(
                            <div className="flex flex-col gap-1">
                                <span className="font-bold">Database updated</span>
                                <span className="text-sm font-normal">Successfully loaded {result.data.length} records from CSV.</span>
                            </div>
                        );
                        setIsCSVUploadSheetOpen(false);
                    } else {
                        toast.error(
                            <div className="flex flex-col gap-1">
                                <span className="font-bold">Failed to parse CSV</span>
                                <span className="text-sm font-normal">{result.error || "Please check the file format."}</span>
                            </div>
                        );
                    }
                } catch {
                    toast.error("Error reading file");
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
        <div className={`min-h-screen bg-background dark:bg-background flex flex-col ${className || ''}`}>
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
                <div className="bg-primary text-white border-b border-slate-800 w-full">
                    {/* Safe Area Padding for mobile notch support */}
                    <div className="pt-[env(safe-area-inset-top)]">
                        <div className="max-w-6xl mx-auto px-3 py-2 sm:px-4 sm:py-3 lg:py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                            
                            {/* Title Area */}
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="bg-white/10 p-2 rounded-none backdrop-blur-sm border border-white/10 shrink-0">
                                    {icon}
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-xl font-semibold tracking-tight leading-none truncate m-0 text-white">
                                        {title}
                                    </h1>
                                    {subtitle && <div className="text-[10px] sm:text-xs text-white/80 truncate font-normal mt-1 italic opacity-90">{subtitle}</div>}
                                </div>
                            </div>

                            {/* Actions Area */}
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                {actions}
                                
                                <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block"></div>

                                {/* Hamburger Menu */}
                                <nav aria-label="Main navigation">
                                <DropdownMenu>
                                    <DropdownMenuTrigger
                                        className="h-9 px-4 rounded-none bg-white/10 hover:bg-white/30 text-white hover:text-white font-medium flex items-center gap-2 border border-white/20 transition-all duration-200 shadow-sm group"
                                        title="Open Navigation Menu"
                                    >
                                        <Menu className="w-4 h-4 text-white opacity-90 group-hover:opacity-100 transition-opacity" />
                                        <span className="text-sm">Menu</span>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                        {/* Upload CSV */}
                                        <DropdownMenuItem onClick={() => {
                                            const trigger = document.querySelector('[data-csv-upload-trigger]') as HTMLButtonElement;
                                            trigger?.click();
                                        }}>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload CSV
                                        </DropdownMenuItem>

                                        {/* Quick Start Guide */}
                                        <DropdownMenuItem onClick={() => {
                                            const helpButton = document.querySelector('[data-help-modal-trigger]') as HTMLButtonElement;
                                            helpButton?.click();
                                        }}>
                                            <HelpCircle className="w-4 h-4 mr-2" />
                                            Quick Start Guide
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem onClick={() => setScreen(Screen.ABOUT)}>
                                            About
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setScreen(Screen.FAQ)}>
                                            FAQ
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setScreen(Screen.DRUG_REFERENCE)}>
                                            Drug Reference
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setScreen(Screen.CONTACT)}>
                                            Contact / Support
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setScreen(Screen.RESOURCES)}>
                                            Resources / Links
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setScreen(Screen.CHANGELOG)}>
                                            Changelog
                                        </DropdownMenuItem>
                                        
                                        <DropdownMenuSeparator />
                                        
                                        {/* Dark Mode Toggle */}
                                        <DropdownMenuItem onClick={toggleTheme}>
                                            {theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Disclaimer Banner - Attached to Header */}
                {/* Only show if enabled AND user has not uploaded their own data */}
                {showDisclaimer && !isCustomData && onDismissDisclaimer && (
                    <div className="print:hidden">
                        <DisclaimerBanner onClose={onDismissDisclaimer} />
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main
                id="main-content"
                role="main"
                aria-label="Main content"
                tabIndex={-1}
                className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-5 md:px-6 py-3 sm:py-4 md:py-6 flex flex-col relative z-10"
            >
                <div className={`${contentClassName || ''} flex-1 flex flex-col`}>
                    <React.Suspense fallback={
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-500 min-h-[50vh]">
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
            <HelpModal onUploadPatients={onUploadPatients} hideTrigger={true} />

            {/* Hidden file input for CSV upload */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                aria-label="Upload CSV file"
                onChange={handleFileUpload}
                className="hidden"
            />

            {/* Hidden trigger button for CSV upload sheet */}
            <Button
                className="hidden"
                data-csv-upload-trigger
                onClick={() => setIsCSVUploadSheetOpen(true)}
            >
                Upload CSV
            </Button>

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
            {showFooter && <Footer setScreen={setScreen} databaseDate={databaseDate} onUploadPatients={onUploadPatients} />}
        </div>
    );
};
