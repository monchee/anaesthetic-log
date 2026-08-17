import { ReactNode } from 'react';
import { Toaster, TooltipProvider } from '@/components/ui';
import ErrorBoundary from './ErrorBoundary';
import { FontSizeProvider } from './FontSizeProvider';
import PasswordGate from './PasswordGate';
import { ThemeProvider } from './ThemeProvider';
import { APP_CONFIG } from '@shared/utils/constants';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey={APP_CONFIG.LOCAL_STORAGE_KEYS.THEME}>
        <FontSizeProvider>
          <TooltipProvider delayDuration={300}>
            <PasswordGate>{children}</PasswordGate>
            <Toaster position="top-center" expand={false} richColors closeButton duration={5000}
              toastOptions={{ classNames: {
                toast: 'border border-border rounded-none shadow-sm',
                actionButton: 'bg-primary text-white hover:bg-primary/90 transition-colors',
                description: 'text-muted-foreground',
              }}}
            />
          </TooltipProvider>
        </FontSizeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
