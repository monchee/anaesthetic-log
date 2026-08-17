import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@core/components/ThemeProvider';
import { FontSizeProvider } from '@core/components/FontSizeProvider';

import { TooltipProvider } from '@/components/ui';

/**
 * Custom render function that wraps components with all necessary providers
 */
function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="test-theme">
      <FontSizeProvider>
        <TooltipProvider delayDuration={0}>
          {children}
        </TooltipProvider>
      </FontSizeProvider>
    </ThemeProvider>
  );
}

/**
 * Render with all providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

/**
 * Re-export everything from React Testing Library
 */
export * from '@testing-library/react';
export { renderWithProviders as render };
