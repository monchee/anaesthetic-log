import React from 'react';
import { Button } from './ui';
import { Sun, Moon } from 'lucide-react';
import Footer from './Footer';
import { useTheme } from './ThemeProvider';
import { Screen } from '../types';

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
    contentClassName
}) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className={`max-w-6xl mx-auto min-h-screen bg-[#fbfaff] dark:bg-slate-950 flex flex-col ${className || ''}`}>
            {/* Header */}
            <div className="sticky top-0 z-50 bg-[#441170] text-white p-4 shadow-md flex justify-between items-center no-print">
                <div>
                    <h1 className="font-bold text-lg flex items-center gap-2">
                        {icon}
                        {title}
                    </h1>
                    {subtitle && <div className="text-xs text-[#cebfff]">{subtitle}</div>}
                </div>
                <div className="flex items-center gap-2">
                    {actions}
                    <Button variant="headerAction" size="sm" onClick={toggleTheme} className="w-9 px-0 ml-2" title="Toggle Dark Mode">
                        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* Content Content */}
            <div className={`flex-1 ${contentClassName || ''}`}>
                {children}
            </div>

            {/* Footer */}
            {showFooter && <Footer setScreen={setScreen} databaseDate={databaseDate} />}
        </div>
    );
};