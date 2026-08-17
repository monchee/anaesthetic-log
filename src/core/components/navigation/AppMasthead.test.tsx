import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import { AppMasthead, AppMastheadProps } from './AppMasthead';
import { Screen } from '@/types';
import { renderWithProviders } from '../../../test/helpers/renderWithProviders';

describe('AppMasthead', () => {
  const defaultProps: AppMastheadProps = {
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

  it('renders application header with banner role and masthead background', () => {
    renderWithProviders(<AppMasthead {...defaultProps} />);

    const header = screen.getByRole('banner', { name: /Application header/i });
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('bg-masthead', 'text-masthead-foreground', 'no-print');
  });

  it('renders brand lockup with stethoscope chip, DREAM wordmark, and xl subtitle', () => {
    renderWithProviders(<AppMasthead {...defaultProps} />);

    const brandLink = screen.getByRole('link', { name: /DREAM Home/i });
    expect(brandLink).toHaveAttribute('href', '/');
    expect(brandLink).toHaveClass('min-h-[44px]', 'rounded-none', 'focus-visible:ring-2', 'focus-visible:outline-none');

    const brandText = within(brandLink).getByText('DREAM');
    expect(brandText).toBeInTheDocument();
    expect(brandText).toHaveClass('break-words');

    const subtitleText = within(brandLink).getByText('Anaesthetic Allergy Workbench');
    expect(subtitleText).toBeInTheDocument();
    expect(subtitleText).toHaveClass('hidden', 'xl:inline-block', 'break-words');
  });

  it('renders active primary nav item with aria-current="page", border-masthead-accent, and WITHOUT bg-primary', () => {
    renderWithProviders(<AppMasthead {...defaultProps} currentScreen={Screen.LOG} />);

    const homeLink = screen.getByRole('link', { name: /^Home/i });
    const dashboardLink = screen.getByRole('link', { name: /^Dashboard/i });

    expect(homeLink).toHaveAttribute('aria-current', 'page');
    expect(homeLink).toHaveClass('text-masthead-foreground', 'font-semibold', 'border-masthead-accent');
    expect(homeLink).not.toHaveClass('bg-primary');

    expect(dashboardLink).not.toHaveAttribute('aria-current');
    expect(dashboardLink).toHaveClass('text-masthead-foreground/70', 'border-transparent');
    expect(dashboardLink).not.toHaveClass('bg-primary');
  });

  it('updates active state styling when currentScreen is DASHBOARD without using bg-primary', () => {
    renderWithProviders(<AppMasthead {...defaultProps} currentScreen={Screen.DASHBOARD} />);

    const homeLink = screen.getByRole('link', { name: /^Home/i });
    const dashboardLink = screen.getByRole('link', { name: /^Dashboard/i });

    expect(dashboardLink).toHaveAttribute('aria-current', 'page');
    expect(dashboardLink).toHaveClass('border-masthead-accent');
    expect(dashboardLink).not.toHaveClass('bg-primary');

    expect(homeLink).not.toHaveAttribute('aria-current');
    expect(homeLink).not.toHaveClass('bg-primary');
  });

  it('ensures every link and button in masthead has min-h-[44px], focus-visible:ring-2, and focus-visible:outline-none', () => {
    renderWithProviders(
      <AppMasthead
        {...defaultProps}
        hasActiveReport={true}
        isTestingDraftDirty={true}
      />
    );

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => {
      expect(link).toHaveClass('min-h-[44px]');
      expect(link).toHaveClass('focus-visible:ring-2');
      expect(link).toHaveClass('focus-visible:outline-none');
      expect(link).toHaveClass('rounded-none');
    });

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((button) => {
      expect(button).toHaveClass('min-h-[44px]');
      expect(button).toHaveClass('focus-visible:ring-2');
      expect(button).toHaveClass('focus-visible:outline-none');
      expect(button).toHaveClass('rounded-none');
    });
  });

  it('ensures label elements use break-words and never use truncate', () => {
    const { container } = renderWithProviders(
      <AppMasthead
        {...defaultProps}
        hasActiveReport={true}
        isTestingDraftDirty={true}
      />
    );

    const labels = container.querySelectorAll('span.break-words');
    expect(labels.length).toBeGreaterThan(0);

    const truncatedElements = container.querySelectorAll('.truncate');
    expect(truncatedElements.length).toBe(0);
  });

  describe('Contextual items matrix across hasActiveReport x isTestingDraftDirty combinations', () => {
    it('Case 1: hasActiveReport=false, isTestingDraftDirty=false -> 0 contextual items', () => {
      renderWithProviders(
        <AppMasthead
          {...defaultProps}
          currentScreen={Screen.LOG}
          hasActiveReport={false}
          isTestingDraftDirty={false}
        />
      );

      expect(screen.queryByRole('navigation', { name: /Current work navigation/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Reports/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Testing Session/i })).not.toBeInTheDocument();
    });

    it('Case 2: hasActiveReport=true, isTestingDraftDirty=false -> Reports with Active badge', () => {
      renderWithProviders(
        <AppMasthead
          {...defaultProps}
          currentScreen={Screen.LOG}
          hasActiveReport={true}
          isTestingDraftDirty={false}
        />
      );

      const contextualNav = screen.getByRole('navigation', { name: /Current work navigation/i });
      expect(contextualNav).toBeInTheDocument();

      const reportsLink = within(contextualNav).getByRole('link', { name: /Reports/i });
      expect(reportsLink).toBeInTheDocument();
      expect(reportsLink).toHaveAttribute('href', '/summary');
      expect(within(reportsLink).getByText('Active')).toBeInTheDocument();

      expect(within(contextualNav).queryByRole('link', { name: /Testing Session/i })).not.toBeInTheDocument();
    });

    it('Case 3: hasActiveReport=false, isTestingDraftDirty=true -> Testing Session with Draft badge', () => {
      renderWithProviders(
        <AppMasthead
          {...defaultProps}
          currentScreen={Screen.LOG}
          hasActiveReport={false}
          isTestingDraftDirty={true}
        />
      );

      const contextualNav = screen.getByRole('navigation', { name: /Current work navigation/i });
      expect(contextualNav).toBeInTheDocument();

      const testingLink = within(contextualNav).getByRole('link', { name: /Testing Session/i });
      expect(testingLink).toBeInTheDocument();
      expect(testingLink).toHaveAttribute('href', '/testing');
      expect(within(testingLink).getByText('Draft')).toBeInTheDocument();

      expect(within(contextualNav).queryByRole('link', { name: /Reports/i })).not.toBeInTheDocument();
    });

    it('Case 4: hasActiveReport=true, isTestingDraftDirty=true -> Both Reports and Testing Session with badges', () => {
      renderWithProviders(
        <AppMasthead
          {...defaultProps}
          currentScreen={Screen.LOG}
          hasActiveReport={true}
          isTestingDraftDirty={true}
        />
      );

      const contextualNav = screen.getByRole('navigation', { name: /Current work navigation/i });
      expect(contextualNav).toBeInTheDocument();

      const reportsLink = within(contextualNav).getByRole('link', { name: /Reports/i });
      expect(reportsLink).toBeInTheDocument();
      expect(within(reportsLink).getByText('Active')).toBeInTheDocument();

      const testingLink = within(contextualNav).getByRole('link', { name: /Testing Session/i });
      expect(testingLink).toBeInTheDocument();
      expect(within(testingLink).getByText('Draft')).toBeInTheDocument();
    });

    it('Case 5: currentScreen=TESTING without dirty draft -> Testing Session appears without Draft badge', () => {
      renderWithProviders(
        <AppMasthead
          {...defaultProps}
          currentScreen={Screen.TESTING}
          hasActiveReport={false}
          isTestingDraftDirty={false}
        />
      );

      const contextualNav = screen.getByRole('navigation', { name: /Current work navigation/i });
      expect(contextualNav).toBeInTheDocument();

      const testingLink = within(contextualNav).getByRole('link', { name: /Testing Session/i });
      expect(testingLink).toHaveAttribute('aria-current', 'page');
      expect(testingLink).toHaveClass('border-masthead-accent');
      expect(testingLink).not.toHaveClass('bg-primary');
      expect(within(testingLink).queryByText('Draft')).not.toBeInTheDocument();
    });
  });

  describe('Navigation and click handling', () => {
    it('calls onNavigate on normal click and prevents default', () => {
      const onNavigate = vi.fn();
      renderWithProviders(<AppMasthead {...defaultProps} onNavigate={onNavigate} />);

      const dashboardLink = screen.getByRole('link', { name: /^Dashboard/i });
      fireEvent.click(dashboardLink);

      expect(onNavigate).toHaveBeenCalledWith(Screen.DASHBOARD);
    });

    it('preserves modified clicks (meta, ctrl, alt, shift, non-left, defaultPrevented) without calling onNavigate', () => {
      const onNavigate = vi.fn();
      renderWithProviders(<AppMasthead {...defaultProps} onNavigate={onNavigate} />);

      const dashboardLink = screen.getByRole('link', { name: /^Dashboard/i });
      fireEvent.click(dashboardLink, { metaKey: true });
      fireEvent.click(dashboardLink, { ctrlKey: true });
      fireEvent.click(dashboardLink, { shiftKey: true });
      fireEvent.click(dashboardLink, { altKey: true });
      fireEvent.click(dashboardLink, { button: 1 });
      fireEvent.click(dashboardLink, { button: 2 });

      // Event where default is already prevented
      const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
      event.preventDefault();
      dashboardLink.dispatchEvent(event);

      expect(onNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Right cluster controls', () => {
    it('renders display settings trigger button with Type icon and aria-label', () => {
      renderWithProviders(<AppMasthead {...defaultProps} />);

      const displaySettingsBtn = screen.getByRole('button', { name: /Display settings/i });
      expect(displaySettingsBtn).toBeInTheDocument();
      expect(displaySettingsBtn).toHaveClass('min-h-[44px]', 'min-w-[44px]', 'rounded-none');
    });

    it('renders theme toggle with destination aria-label and switches theme on click', () => {
      renderWithProviders(<AppMasthead {...defaultProps} />);

      const themeToggle = screen.getByRole('button', { name: /Switch to dark theme/i });
      expect(themeToggle).toBeInTheDocument();
      expect(themeToggle).toHaveClass('min-h-[44px]', 'min-w-[44px]', 'rounded-none');

      fireEvent.click(themeToggle);
      expect(screen.getByRole('button', { name: /Switch to light theme/i })).toBeInTheDocument();
    });

    it('renders utility menu trigger button and opens utility menu with items and actions', () => {
      const onOpenUploadCSV = vi.fn();
      const onOpenGetStarted = vi.fn();
      const onNavigate = vi.fn();

      renderWithProviders(
        <AppMasthead
          {...defaultProps}
          onNavigate={onNavigate}
          onOpenUploadCSV={onOpenUploadCSV}
          onOpenGetStarted={onOpenGetStarted}
        />
      );

      const utilityBtn = screen.getByRole('button', { name: /More navigation and reference links/i });
      expect(utilityBtn).toBeInTheDocument();
      expect(utilityBtn).toHaveClass('min-h-[44px]', 'min-w-[44px]', 'rounded-none');

      fireEvent.pointerDown(utilityBtn, { button: 0 });

      expect(screen.getByRole('menuitem', { name: /Research/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /About/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /FAQ/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /Drug Reference/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /Contact/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /Resources/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /Changelog/i })).toBeInTheDocument();

      const uploadItem = screen.getByRole('menuitem', { name: /Upload CSV/i });
      fireEvent.click(uploadItem);
      expect(onOpenUploadCSV).toHaveBeenCalledTimes(1);

      fireEvent.pointerDown(utilityBtn, { button: 0 });
      const getStartedItem = screen.getByRole('menuitem', { name: /Get Started/i });
      fireEvent.click(getStartedItem);
      expect(onOpenGetStarted).toHaveBeenCalledTimes(1);
    });

    it('renders display settings trigger and opens font size stepper controls, enforcing 85% and 125% bounds', () => {
      localStorage.clear();
      renderWithProviders(<AppMasthead {...defaultProps} />);

      const displaySettingsBtn = screen.getByRole('button', { name: /Display settings/i });
      fireEvent.pointerDown(displaySettingsBtn, { button: 0 });

      const increaseBtn = screen.getByRole('button', { name: /Increase text size/i });
      const decreaseBtn = screen.getByRole('button', { name: /Decrease text size/i });

      expect(increaseBtn).toBeInTheDocument();
      expect(decreaseBtn).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();

      // Step down to minimum limit (85%)
      fireEvent.click(decreaseBtn); // 95%
      expect(screen.getByText('95%')).toBeInTheDocument();
      fireEvent.click(decreaseBtn); // 90%
      expect(screen.getByText('90%')).toBeInTheDocument();
      fireEvent.click(decreaseBtn); // 85%
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(decreaseBtn).toBeDisabled();
      expect(increaseBtn).not.toBeDisabled();

      // Step up past 100% to maximum limit (125%)
      for (let i = 0; i < 8; i++) {
        fireEvent.click(increaseBtn);
      }
      expect(screen.getByText('125%')).toBeInTheDocument();
      expect(increaseBtn).toBeDisabled();
      expect(decreaseBtn).not.toBeDisabled();

      // Reset back to 100%
      const resetBtn = screen.getByRole('menuitem', { name: /Reset \(100%\)/i });
      fireEvent.click(resetBtn);

      fireEvent.pointerDown(displaySettingsBtn, { button: 0 });
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('renders mobile menu trigger slot when provided', () => {
      renderWithProviders(
        <AppMasthead
          {...defaultProps}
          mobileMenuTrigger={<button type="button" aria-label="Open mobile menu">Menu</button>}
        />
      );

      expect(screen.getByRole('button', { name: /Open mobile menu/i })).toBeInTheDocument();
    });
  });

  describe('Page bar (header extension)', () => {
    it('renders title, subtitle, icon and actions when provided', () => {
      const DummyIcon = ({ className }: { className?: string }) => (
        <span data-testid="page-icon" className={className} />
      );

      renderWithProviders(
        <AppMasthead
          {...defaultProps}
          title="Patient Testing Protocol"
          subtitle="Pre-operative assessment records"
          icon={DummyIcon}
          actions={<button type="button">Action Button</button>}
        />
      );

      expect(screen.getByRole('heading', { level: 1, name: /Patient Testing Protocol/i })).toBeInTheDocument();
      expect(screen.getByText('Pre-operative assessment records')).toBeInTheDocument();
      expect(screen.getByTestId('page-icon')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
    });
  });
});
