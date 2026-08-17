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

  it('renders contextual items with semantic status-warning tokens and badges when active work exists', () => {
    render(
      <ThemeProvider>
        <MobileNavigationDrawer
          {...defaultProps}
          isOpen={true}
          isTestingDraftDirty={true}
          hasActiveReport={true}
        />
      </ThemeProvider>
    );

    const contextualNav = screen.getByRole('navigation', { name: 'Current work mobile navigation' });
    expect(contextualNav).toBeInTheDocument();

    const reportsLink = screen.getByRole('link', { name: /Reports/i });
    const testingLink = screen.getByRole('link', { name: /Testing Session/i });

    expect(reportsLink).toBeInTheDocument();
    expect(testingLink).toBeInTheDocument();

    expect(testingLink).toHaveClass('bg-status-warning/15', 'border-status-warning/30');
    expect(reportsLink).toHaveClass('bg-status-warning/15', 'border-status-warning/30');

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('renders active contextual item with bg-primary and contrasting badge', () => {
    render(
      <ThemeProvider>
        <MobileNavigationDrawer
          {...defaultProps}
          isOpen={true}
          currentScreen={Screen.TESTING}
          isTestingDraftDirty={true}
        />
      </ThemeProvider>
    );

    const testingLink = screen.getByRole('link', { name: /Testing Session/i });
    expect(testingLink).toHaveAttribute('aria-current', 'page');
    expect(testingLink).toHaveClass('bg-primary', 'text-primary-foreground');

    const draftBadge = screen.getByText('Draft');
    expect(draftBadge).toHaveClass('bg-white/20', 'text-white');
  });

  it('ensures all interactive elements meet 44px touch target and focus ring requirements', () => {
    render(
      <ThemeProvider>
        <MobileNavigationDrawer
          {...defaultProps}
          isOpen={true}
          isTestingDraftDirty={true}
          hasActiveReport={true}
        />
      </ThemeProvider>
    );

    const links = screen.getAllByRole('link');
    const buttons = screen.getAllByRole('button');

    [...links, ...buttons].forEach((el) => {
      expect(el).toHaveClass('min-h-[44px]');
      expect(el).toHaveClass('focus-visible:ring-2');
      expect(el).toHaveClass('focus-visible:outline-none');
      expect(el).toHaveClass('rounded-none');
    });
  });

  it('ensures navigation labels use break-words and do not truncate in drawer nav', () => {
    const { container } = render(
      <ThemeProvider>
        <MobileNavigationDrawer
          {...defaultProps}
          isOpen={true}
          isTestingDraftDirty={true}
          hasActiveReport={true}
        />
      </ThemeProvider>
    );

    const labelSpans = container.querySelectorAll('nav span.break-words');
    expect(labelSpans.length).toBeGreaterThan(0);

    const truncatedNavSpans = container.querySelectorAll('nav .truncate');
    expect(truncatedNavSpans.length).toBe(0);
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

  it('triggers utility actions for CSV upload and Get Started', () => {
    const onOpenUploadCSV = vi.fn();
    const onOpenGetStarted = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <ThemeProvider>
        <MobileNavigationDrawer
          {...defaultProps}
          isOpen={true}
          onOpenChange={onOpenChange}
          onOpenUploadCSV={onOpenUploadCSV}
          onOpenGetStarted={onOpenGetStarted}
        />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Upload CSV' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onOpenUploadCSV).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: 'Get Started' }));
    expect(onOpenGetStarted).toHaveBeenCalledOnce();
  });
});
