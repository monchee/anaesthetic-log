import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppSidebar } from './AppSidebar';
import { Screen } from '@/types';
import { ThemeProvider } from '@core/components/ThemeProvider';

describe('AppSidebar', () => {
  const defaultProps = {
    currentScreen: Screen.LOG,
    workflowMode: 'clinician' as const,
    onWorkflowModeChange: vi.fn(),
    onNavigate: vi.fn(),
    hrefFor: (screen: Screen) => (screen === Screen.LOG ? '/' : `/${screen}`),
    isTestingDraftDirty: false,
    hasActiveReport: false,
    onOpenUploadCSV: vi.fn(),
    onOpenQuickStart: vi.fn(),
    databaseDate: '2026-08-15',
    isCustomData: false,
  };

  it('renders primary navigation links as real anchors with href and aria-current', () => {
    render(
      <ThemeProvider>
        <AppSidebar {...defaultProps} />
      </ThemeProvider>
    );

    const homeLink = screen.getByRole('link', { name: /Home/i });
    const dashboardLink = screen.getByRole('link', { name: /Dashboard/i });

    expect(homeLink).toHaveAttribute('href', '/');
    expect(homeLink).toHaveAttribute('aria-current', 'page');

    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(dashboardLink).not.toHaveAttribute('aria-current');
  });

  it('navigates when an anchor is clicked with normal left-click', () => {
    const onNavigate = vi.fn();
    render(
      <ThemeProvider>
        <AppSidebar {...defaultProps} onNavigate={onNavigate} />
      </ThemeProvider>
    );

    const dashboardLink = screen.getByRole('link', { name: /Dashboard/i });
    fireEvent.click(dashboardLink);

    expect(onNavigate).toHaveBeenCalledWith(Screen.DASHBOARD);
  });

  it('preserves modified clicks without intercepting', () => {
    const onNavigate = vi.fn();
    render(
      <ThemeProvider>
        <AppSidebar {...defaultProps} onNavigate={onNavigate} />
      </ThemeProvider>
    );

    const dashboardLink = screen.getByRole('link', { name: /Dashboard/i });
    fireEvent.click(dashboardLink, { metaKey: true });

    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('renders contextual items when active report or dirty draft exists', () => {
    render(
      <ThemeProvider>
        <AppSidebar
          {...defaultProps}
          isTestingDraftDirty={true}
          hasActiveReport={true}
          workflowMode="clinician"
        />
      </ThemeProvider>
    );

    expect(screen.getByRole('link', { name: /Reports/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Testing Session/i })).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('triggers utility actions for CSV upload and Quick Start', () => {
    const onOpenUploadCSV = vi.fn();
    const onOpenQuickStart = vi.fn();

    render(
      <ThemeProvider>
        <AppSidebar
          {...defaultProps}
          onOpenUploadCSV={onOpenUploadCSV}
          onOpenQuickStart={onOpenQuickStart}
        />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Upload CSV/i }));
    expect(onOpenUploadCSV).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: /Quick Start Guide/i }));
    expect(onOpenQuickStart).toHaveBeenCalledOnce();
  });
});
