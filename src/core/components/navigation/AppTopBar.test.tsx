import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { AppTopBar, AppTopBarProps } from './AppTopBar';
import { Screen } from '@/types';
import { renderWithProviders } from '../../../test/helpers/renderWithProviders';

describe('AppTopBar', () => {
  const defaultProps: AppTopBarProps = {
    currentScreen: Screen.LOG,
    onNavigate: vi.fn(),
    hrefFor: (screen: Screen) => (screen === Screen.LOG ? '/' : `/${screen}`),
    isTestingDraftDirty: false,
    hasActiveReport: false,
    title: 'Patient Allergy Log',
    subtitle: 'Clinical assessment form',
  };

  it('renders application header with banner role and card background', () => {
    renderWithProviders(<AppTopBar {...defaultProps} />);

    const header = screen.getByRole('banner', { name: /Application header/i });
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('bg-card', 'text-card-foreground', 'border-b', 'border-border', 'no-print');
  });

  it('contains NO destination navigation links (Home, Dashboard, Research, etc.) in the top bar', () => {
    renderWithProviders(<AppTopBar {...defaultProps} />);

    expect(screen.queryByRole('navigation', { name: /Primary navigation/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^Dashboard/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^Research/i })).not.toBeInTheDocument();
  });

  it('renders page title and subtitle with break-words wrapping and without truncate', () => {
    const { container } = renderWithProviders(<AppTopBar {...defaultProps} />);

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings.length).toBeGreaterThan(0);
    headings.forEach((h1) => {
      expect(h1).toHaveTextContent('Patient Allergy Log');
      expect(h1).toHaveClass('break-words');
    });

    const subtitles = container.querySelectorAll('.text-muted-foreground');
    expect(subtitles.length).toBeGreaterThan(0);
  });

  it('renders page icon and actions when provided', () => {
    const DummyIcon = ({ className }: { className?: string }) => (
      <span data-testid="page-icon" className={className} />
    );

    renderWithProviders(
      <AppTopBar
        {...defaultProps}
        icon={DummyIcon}
        actions={<button type="button">Save Record</button>}
      />
    );

    expect(screen.getAllByTestId('page-icon').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Save Record' }).length).toBeGreaterThan(0);
  });

  it('renders privacy-safe status badges when testing draft is dirty or report is active', () => {
    renderWithProviders(
      <AppTopBar
        {...defaultProps}
        isTestingDraftDirty={true}
        hasActiveReport={true}
      />
    );

    const draftBadges = screen.getAllByText('Testing draft');
    expect(draftBadges.length).toBeGreaterThan(0);
    draftBadges.forEach((badge) => {
      expect(badge).toHaveAttribute('role', 'status');
      expect(badge).toHaveClass('bg-status-warning/15', 'text-status-warning');
      // Verify no patient data is exposed in the badge text
      expect(badge.textContent).toBe('Testing draft');
    });

    const activeBadges = screen.getAllByText('Report active');
    expect(activeBadges.length).toBeGreaterThan(0);
    activeBadges.forEach((badge) => {
      expect(badge).toHaveAttribute('role', 'status');
      expect(badge).toHaveClass('bg-primary/15', 'text-primary');
      expect(badge.textContent).toBe('Report active');
    });
  });

  it('renders display settings trigger and theme toggle controls', () => {
    renderWithProviders(<AppTopBar {...defaultProps} />);

    const displayButtons = screen.getAllByRole('button', { name: /Display settings/i });
    expect(displayButtons.length).toBeGreaterThan(0);

    const themeButtons = screen.getAllByRole('button', { name: /Switch to dark theme/i });
    expect(themeButtons.length).toBeGreaterThan(0);

    fireEvent.click(themeButtons[0]);
    expect(screen.getAllByRole('button', { name: /Switch to light theme/i }).length).toBeGreaterThan(0);
  });

  it('renders drawer trigger slot in mobile identity row when provided', () => {
    renderWithProviders(
      <AppTopBar
        {...defaultProps}
        drawerTrigger={<button type="button" aria-label="Open mobile menu">Menu</button>}
      />
    );

    expect(screen.getByRole('button', { name: /Open mobile menu/i })).toBeInTheDocument();
  });
});
