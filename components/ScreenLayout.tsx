import React from 'react';
import { Button } from './ui';
import { Sun, Moon } from 'lucide-react';
import Footer from './Footer';
import DisclaimerBanner from './DisclaimerBanner';
import { useTheme } from './ThemeProvider';
import { useFontSize } from './FontSizeProvider';
import { Screen, Patient } from '../types';

interface ScreenLayoutProps {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    icon?: React.ReactNode;
    actions?: React.ReactNode;
    children: React.ReactNode;
    setScreen: (screen: Screen) => void;
    databaseDate: string;
    showFooter?: boolean;
    className?: string;
    contentClassName?: string;
    showDisclaimer?: boolean;
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
    onDismissDisclaimer,
    onUploadPatients
}) => {
    const { theme, toggleTheme } = useTheme();
    const { increaseFontSize, decreaseFontSize, canIncrease, canDecrease } = useFontSize();

    return (
        <div className={`max-w-6xl mx-auto min-h-screen bg-[#fbfaff] dark:bg-slate-950 flex flex-col ${className || ''}`}>
            {/* Header - Static Style */}
            <div className="mx-3 mt-3 mb-6">
                <div className="bg-[#441170] text-white p-3 sm:p-4 shadow-lg shadow-purple-900/20 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 transition-all duration-300 border border-purple-800/50">
                    
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

                        {/* Font Size Controls */}
                        <div className="flex items-center bg-black/20 rounded-lg p-0.5 border border-white/5">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={decreaseFontSize} 
                                disabled={!canDecrease}
                                className="h-7 w-8 px-0 text-white hover:bg-white/10 hover:text-white disabled:opacity-30 rounded-md" 
                                title="Decrease Font Size"
                            >
                                <span className="text-xs font-bold leading-none">A</span>
                            </Button>
                            <div className="w-px h-4 bg-white/10 mx-0.5"></div>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={increaseFontSize} 
                                disabled={!canIncrease}
                                className="h-7 w-8 px-0 text-white hover:bg-white/10 hover:text-white disabled:opacity-30 rounded-md" 
                                title="Increase Font Size"
                            >
                                <span className="text-lg font-bold leading-none">A</span>
                            </Button>
                        </div>

                        {/* Theme Toggle */}
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={toggleTheme} 
                            className="h-10 w-10 px-0 ml-1 rounded-lg bg-white/5 hover:bg-white/20 text-yellow-300 hover:text-yellow-200 border border-white/5 shadow-inner" 
                            title="Toggle Dark Mode"
                        >
                            {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6 text-purple-100" />}
                        </Button>
                    </div>
                </div>
                
                {/* Disclaimer Banner - integrated into header area */}
                {showDisclaimer && onDismissDisclaimer && (
                    <DisclaimerBanner onClose={onDismissDisclaimer} />
                )}
            </div>

            {/* Content Content - Animated Entry */}
            {/* Added relative and z-10 to ensure dropdowns in content appear above footer */}
            <div className={`flex-1 animate-enter px-3 sm:px-4 relative z-10 ${contentClassName || ''}`}>
                {children}
            </div>

            {/* Footer */}
            {showFooter && <Footer setScreen={setScreen} databaseDate={databaseDate} onUploadPatients={onUploadPatients} />}
        </div>
    );
};