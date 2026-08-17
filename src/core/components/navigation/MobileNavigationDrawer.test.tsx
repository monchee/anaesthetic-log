import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileNavigationDrawer } from './MobileNavigationDrawer';
import { Screen } from '@/types';
import { ThemeProvider } from '@core/components/ThemeProvider';

describe('MobileNavigationDrawer', () => {
  const defaultProps = {
    isOpen: false,
    onOpenChange: vi.fn(),
    currentScreen: Screen.LOG,
    onNavigate: vi.fn(),
    hrefFor: (screen: Screen) => (screen === Screen.LOG ? '/' : `/${screen}`),
    isTestingDraftDirty: false,
    hasActiveReport: false,
    onOpenUploadCSV: vi.fn(),
    onOpenGetStarted: vi.fn(),
    databaseDate: '2026-08-15',
    isCustomData: false,
  };

  it('renders trigger menu button with accessible aria attributes', () => {
    render(
      <ThemeProvider>
        <MobileNavigationDrawer {...defaultProps} />
      </ThemeProvider>
    );

    const triggerBtn = screen.getByRole('button', { name: 'Open Navigation Menu' });
    expect(triggerBtn).toHaveAttribute('aria-expanded', 'false');
    expect(triggerBtn).toHaveTextContent('Menu');
  });

  it('opens drawer and displays all navigation items without workflow mode selector', () => {
    render(
      <ThemeProvider>
        <MobileNavigationDrawer {...defaultProps} isOpen={true} />
      </ThemeProvider>
    );

    const dialog = screen.getByRole('dialog', { name: 'Navigation Drawer' });
    expect(dialog).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /Home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Research/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /About/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /FAQ/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Drug Reference/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Contact/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Resources/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Changelog/i })).toBeInTheDocument();

    // Verify workflow mode control is absent
    expect(screen.queryByLabelText(/Workflow view/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Workflow view/i)).not.toBeInTheDocument();
  });

  it('closes drawer when Escape key is pressed', () => {
    const onOpenChange = vi.fn();
    render(
      <ThemeProvider>
        <MobileNavigationDrawer {...defaultProps} isOpen={true} onOpenChange={onOpenChange} />
      </ThemeProvider>
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('navigates and closes drawer when a link is clicked', () => {
    const onOpenChange = vi.fn();
    const onNavigate = vi.fn();

    render(
      <ThemeProvider>
        <MobileNavigationDrawer
          {...defaultProps}
          isOpen={true}
          onOpenChange={onOpenChange}
          onNavigate={onNavigate}
        />
      </ThemeProvider>
    );

    const dashboardLink = screen.getByRole('link', { name: /Dashboard/i });
    fireEvent.click(dashboardLink);

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onNavigate).toHaveBeenCalledWith(Screen.DASHBOARD);
  });
});
