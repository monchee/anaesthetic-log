import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { AppTopBar, AppTopBarProps } from './AppTopBar';
import { Screen } from '@shared/types';
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
    expect(header).toHaveClass(
      'bg-card',
      'text-card-foreground',
      'border-b',
      'border-border',
      'no-print'
    );
    expect(header).toHaveClass('xl:border-t-[3px]', 'xl:border-t-primary');
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

  it('renders drawer trigger slot in mobile and tablet identity rows when provided', () => {
    renderWithProviders(
      <AppTopBar
        {...defaultProps}
        drawerTrigger={<button type="button" aria-label="Open mobile menu">Menu</button>}
      />
    );

    const menuButtons = screen.getAllByRole('button', { name: /Open mobile menu/i });
    expect(menuButtons.length).toBeGreaterThan(0);
  });

  it('renders phone compact row (<md) without icon and subtitle to prevent wrapping', () => {
    const DummyIcon = ({ className }: { className?: string }) => (
      <span data-testid="page-icon" className={className} />
    );

    const { container } = renderWithProviders(
      <AppTopBar
        {...defaultProps}
        icon={DummyIcon}
        subtitle="Clinical assessment form"
      />
    );

    const phoneSection = container.querySelector('.md\\:hidden');
    expect(phoneSection).toBeInTheDocument();
    expect(phoneSection).toHaveClass('bg-masthead');
    expect(phoneSection?.querySelector('.min-h-\\[56px\\]')).toBeInTheDocument();

    // Phone section carries its standard masthead bottom divider
    expect(phoneSection).toHaveClass('border-b', 'border-masthead-border');

    // Phone section contains the title but NOT the icon or subtitle
    expect(phoneSection).toHaveTextContent('Patient Allergy Log');
    expect(phoneSection?.querySelector('[data-testid="page-icon"]')).toBeNull();
    expect(phoneSection?.querySelector('.text-muted-foreground')).toBeNull();
  });

  it('renders richer layout for tablet (md-xl) with icon and subtitle', () => {
    const DummyIcon = ({ className }: { className?: string }) => (
      <span data-testid="page-icon" className={className} />
    );

    const { container } = renderWithProviders(
      <AppTopBar
        {...defaultProps}
        icon={DummyIcon}
        subtitle="Clinical assessment form"
      />
    );

    const tabletSection = container.querySelector('.hidden.md\\:flex.md\\:flex-col.xl\\:hidden');
    expect(tabletSection).toBeInTheDocument();
    expect(tabletSection).toHaveTextContent('Patient Allergy Log');
    expect(tabletSection).toHaveTextContent('Clinical assessment form');
    expect(tabletSection?.querySelector('[data-testid="page-icon"]')).toBeInTheDocument();

    // Tablet row 1 keeps its divider because it separates the two tablet rows
    const tabletRow1 = tabletSection?.querySelector('.bg-masthead');
    expect(tabletRow1).toHaveClass('border-b', 'border-masthead-border');
  });
});
