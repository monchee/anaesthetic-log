import React from 'react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui';
import { Sun, Moon, Menu, HelpCircle } from 'lucide-react';
import Footer from './Footer';
import DisclaimerBanner from './DisclaimerBanner';
import { useTheme } from './ThemeProvider';
import { Screen } from '../types';
import { HelpModal } from './HelpModal';

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
    onUploadPatients?: (patients: any[]) => void;
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

    return (
        <div className={`min-h-screen bg-[#fbfaff] dark:bg-slate-950 flex flex-col ${className || ''}`}>
            {/* Skip to Main Content Link */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#441170] focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
            >
                Skip to main content
            </a>

            {/* Full Width Header (Static) */}
            <header role="banner" aria-label="Application header" className="w-full flex flex-col shadow-md shadow-purple-900/5 z-50 relative no-print">
                {/* Main Navigation Bar */}
                <div className="bg-[#441170] text-white border-b border-purple-800/50 w-full">
                    {/* Safe Area Padding for mobile notch support */}
                    <div className="pt-[env(safe-area-inset-top)]">
                        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                            
                            {/* Title Area */}
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/10 shrink-0">
                                    {icon}
                                </div>
                                <div className="min-w-0">
                                    <h1 className="font-bold text-base sm:text-lg leading-tight truncate">
                                        {title}
                                    </h1>
                                    {subtitle && <div className="text-[10px] sm:text-xs text-purple-200 truncate font-medium">{subtitle}</div>}
                                </div>
                            </div>

                            {/* Actions Area */}
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                {actions}
                                
                                <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block"></div>

                                {/* Hamburger Menu */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger
                                        className="h-10 w-10 px-0 rounded-lg bg-white/5 hover:bg-white/20 text-white/80 hover:text-white border border-white/5"
                                        title="Menu"
                                    >
                                        <Menu className="w-5 h-5" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
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
                className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col relative z-10"
            >
                <div className={`${contentClassName || ''} flex-1`}>
                    {children}
                </div>
            </main>

            {/* Hidden HelpModal - triggered from dropdown menu */}
            <div className="hidden">
                <HelpModal onUploadPatients={onUploadPatients} />
            </div>

            {/* Footer */}
            {showFooter && <Footer setScreen={setScreen} databaseDate={databaseDate} onUploadPatients={onUploadPatients} />}
        </div>
    );
};
