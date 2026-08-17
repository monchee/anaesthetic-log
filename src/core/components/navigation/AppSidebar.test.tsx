import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import { AppSidebar, AppSidebarProps } from './AppSidebar';
import { Screen } from '@/types';
import { renderWithProviders } from '../../../test/helpers/renderWithProviders';

describe('AppSidebar', () => {
  const defaultProps: AppSidebarProps = {
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

  it('renders application sidebar with aside landmark, bg-masthead, and xl:flex class', () => {
    renderWithProviders(<AppSidebar {...defaultProps} />);

    const sidebar = screen.getByRole('complementary', { name: /Application sidebar/i });
    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveClass('hidden', 'xl:flex', 'bg-masthead', 'text-masthead-foreground', 'border-masthead-border', 'w-64', 'no-print');
  });

  it('renders brand lockup with Stethoscope chip and DREAM title linking to /', () => {
    renderWithProviders(<AppSidebar {...defaultProps} />);

    const brandLink = screen.getByRole('link', { name: /DREAM Home/i });
    expect(brandLink).toHaveAttribute('href', '/');
    expect(brandLink).toHaveClass('min-h-[44px]', 'rounded-none', 'focus-visible:ring-2', 'focus-visible:outline-none');

    expect(within(brandLink).getByText('DREAM')).toBeInTheDocument();
    expect(within(brandLink).getByText('Anaesthetic Allergy Workbench')).toBeInTheDocument();
  });

  it('renders navigation sections inside independent scroll area', () => {
    renderWithProviders(<AppSidebar {...defaultProps} />);

    expect(screen.getByRole('navigation', { name: /Workspace navigation/i })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /Reference and support navigation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload CSV/i })).toBeInTheDocument();
  });

  it('navigates to home when brand lockup is clicked', () => {
    const onNavigate = vi.fn();
    renderWithProviders(<AppSidebar {...defaultProps} onNavigate={onNavigate} />);

    const brandLink = screen.getByRole('link', { name: /DREAM Home/i });
    fireEvent.click(brandLink);

    expect(onNavigate).toHaveBeenCalledWith(Screen.LOG);
  });
});
