import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppSidebar } from './AppSidebar';
import { Screen } from '@/types';
import { ThemeProvider } from '@core/components/ThemeProvider';

describe('AppSidebar', () => {
  const defaultProps = {
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

  it('renders desktop rail with w-72 width and compact navy masthead', () => {
    render(
      <ThemeProvider>
        <AppSidebar {...defaultProps} />
      </ThemeProvider>
    );

    const aside = screen.getByRole('complementary', { name: /Desktop application sidebar/i });
    expect(aside).toHaveClass('w-72');

    const brandLink = screen.getByRole('link', { name: /DREAM Anaesthetic Allergy Workbench/i });
    expect(brandLink).toHaveAttribute('href', '/');
    expect(brandLink).toHaveClass('focus-visible:ring-2');
  });

  it('renders primary navigation links as real anchors with href and aria-current', () => {
    render(
      <ThemeProvider>
        <AppSidebar {...defaultProps} />
      </ThemeProvider>
    );

    const homeLink = screen.getByRole('link', { name: /^Home/i });
    const dashboardLink = screen.getByRole('link', { name: /^Dashboard/i });

    expect(homeLink).toHaveAttribute('href', '/');
    expect(homeLink).toHaveAttribute('aria-current', 'page');
    expect(homeLink).toHaveClass('bg-primary', 'text-primary-foreground');

    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(dashboardLink).not.toHaveAttribute('aria-current');
    expect(dashboardLink).toHaveClass('text-foreground/80');
  });

  it('navigates when an anchor is clicked with normal left-click', () => {
    const onNavigate = vi.fn();
    render(
      <ThemeProvider>
        <AppSidebar {...defaultProps} onNavigate={onNavigate} />
      </ThemeProvider>
    );

    const dashboardLink = screen.getByRole('link', { name: /^Dashboard/i });
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

    const dashboardLink = screen.getByRole('link', { name: /^Dashboard/i });
    fireEvent.click(dashboardLink, { metaKey: true });
    fireEvent.click(dashboardLink, { ctrlKey: true });
    fireEvent.click(dashboardLink, { shiftKey: true });
    fireEvent.click(dashboardLink, { altKey: true });

    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('renders contextual items in stable order (Reports before Testing) when active work exists', () => {
    render(
      <ThemeProvider>
        <AppSidebar
          {...defaultProps}
          isTestingDraftDirty={true}
          hasActiveReport={true}
        />
      </ThemeProvider>
    );

    const reportsLink = screen.getByRole('link', { name: /Reports/i });
    const testingLink = screen.getByRole('link', { name: /Testing Session/i });

    expect(reportsLink).toBeInTheDocument();
    expect(testingLink).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();

    // Verify document ordering (Reports before Testing)
    expect(reportsLink.compareDocumentPosition(testingLink)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it('renders quiet sentence-case contextual markers without whole-row amber tint on inactive rows', () => {
    render(
      <ThemeProvider>
        <AppSidebar
          {...defaultProps}
          currentScreen={Screen.LOG}
          isTestingDraftDirty={true}
          hasActiveReport={true}
        />
      </ThemeProvider>
    );

    const reportsLink = screen.getByRole('link', { name: /Reports/i });
    const testingLink = screen.getByRole('link', { name: /Testing Session/i });

    // Inactive contextual rows must not have whole-row amber tint, card borders, or btn-press
    expect(testingLink).not.toHaveClass('bg-amber-500/10');
    expect(testingLink).not.toHaveClass('border-amber-500/30');
    expect(testingLink).not.toHaveClass('btn-press');
    expect(testingLink).not.toHaveClass('transition-all');

    expect(reportsLink).not.toHaveClass('bg-amber-500/10');
    expect(reportsLink).not.toHaveClass('btn-press');

    // Semantic markers have sentence-case text and quiet styling using project tokens
    const draftBadge = screen.getByText('Draft');
    expect(draftBadge).toHaveClass('text-status-warning');
    expect(draftBadge).toHaveClass('bg-status-warning/15');
    expect(draftBadge).toHaveClass('border-status-warning/30');

    const activeBadge = screen.getByText('Active');
    expect(activeBadge).toHaveClass('text-status-info');
    expect(activeBadge).toHaveClass('bg-status-info/15');
    expect(activeBadge).toHaveClass('border-status-info/30');
  });

  it('renders active contextual items with solid bg-primary treatment and legible quiet badge', () => {
    render(
      <ThemeProvider>
        <AppSidebar
          {...defaultProps}
          currentScreen={Screen.TESTING}
          isTestingDraftDirty={true}
        />
      </ThemeProvider>
    );

    const testingLink = screen.getByRole('link', { name: /Testing Session/i });
    expect(testingLink).toHaveAttribute('aria-current', 'page');
    expect(testingLink).toHaveClass('bg-primary', 'text-primary-foreground');

    const draftBadge = screen.getByText('Draft');
    expect(draftBadge).toHaveClass('text-white');
    expect(draftBadge).toHaveClass('bg-white/20');
  });

  it('ensures active contextual link in Current Work triggers scroll-to-active and maintains interaction contract', () => {
    const scrollIntoViewMock = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

    const onNavigate = vi.fn();
    render(
      <ThemeProvider>
        <AppSidebar
          {...defaultProps}
          currentScreen={Screen.TESTING}
          isTestingDraftDirty={true}
          onNavigate={onNavigate}
        />
      </ThemeProvider>
    );

    const contextualNav = screen.getByRole('navigation', { name: /Current work navigation/i });
    const testingLink = screen.getByRole('link', { name: /Testing Session/i });

    // Link is inside the upper contextual navigation container
    expect(contextualNav).toContainElement(testingLink);
    expect(testingLink).toHaveAttribute('aria-current', 'page');
    expect(testingLink).toHaveClass('bg-primary', 'text-primary-foreground', 'scroll-my-1');

    // Scroll-to-active was invoked on the active contextual link
    expect(scrollIntoViewMock).toHaveBeenCalledWith(
      expect.objectContaining({
        block: 'nearest',
      })
    );

    // Interaction contract: regular click navigates to TESTING
    fireEvent.click(testingLink);
    expect(onNavigate).toHaveBeenCalledWith(Screen.TESTING);
  });

  it('re-triggers scroll-to-active when switching to active contextual reports', () => {
    const scrollIntoViewMock = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

    const { rerender } = render(
      <ThemeProvider>
        <AppSidebar
          {...defaultProps}
          currentScreen={Screen.LOG}
          hasActiveReport={true}
        />
      </ThemeProvider>
    );

    scrollIntoViewMock.mockClear();

    rerender(
      <ThemeProvider>
        <AppSidebar
          {...defaultProps}
          currentScreen={Screen.SUMMARY}
          hasActiveReport={true}
        />
      </ThemeProvider>
    );

    const reportsLink = screen.getByRole('link', { name: /Reports/i });
    expect(reportsLink).toHaveAttribute('aria-current', 'page');
    expect(scrollIntoViewMock).toHaveBeenCalled();
  });

  it('re-fits active contextual link on window resize using container-local scroll without scrolling global window', () => {
    const onNavigate = vi.fn();
    const globalScrollTo = vi.fn();
    window.scrollTo = globalScrollTo;

    const { unmount } = render(
      <ThemeProvider>
        <AppSidebar
          {...defaultProps}
          currentScreen={Screen.TESTING}
          isTestingDraftDirty={true}
          onNavigate={onNavigate}
        />
      </ThemeProvider>
    );

    const testingLink = screen.getByRole('link', { name: /Testing Session/i });
    const scrollNav = screen.getByRole('navigation', { name: /Current work navigation/i });
    const scrollContainer = scrollNav.parentElement as HTMLElement;

    expect(testingLink).toHaveAttribute('aria-current', 'page');

    // Simulate geometry where active link is partially below the scroll container viewport
    const containerTop = 100;
    const containerHeight = 200;
    const containerBottom = containerTop + containerHeight; // 300

    const targetHeight = 44;
    const targetBottom = containerBottom + 30; // 330 (overflows by 30px)
    const targetTop = targetBottom - targetHeight; // 286

    vi.spyOn(scrollContainer, 'getBoundingClientRect').mockReturnValue({
      top: containerTop,
      bottom: containerBottom,
      left: 0,
      right: 288,
      width: 288,
      height: containerHeight,
      x: 0,
      y: containerTop,
      toJSON: () => {},
    });

    vi.spyOn(testingLink, 'getBoundingClientRect').mockReturnValue({
      top: targetTop,
      bottom: targetBottom,
      left: 0,
      right: 288,
      width: 288,
      height: targetHeight,
      x: 0,
      y: targetTop,
      toJSON: () => {},
    });

    scrollContainer.scrollTop = 0;

    // Trigger viewport resize event
    window.dispatchEvent(new Event('resize'));

    // Container-local scrollTop should have adjusted to bring active link into view
    const expectedOverflow = targetBottom - containerBottom;
    expect(scrollContainer.scrollTop).toBe(expectedOverflow);

    // Global document/window must not be scrolled
    expect(globalScrollTo).not.toHaveBeenCalled();

    // Link remains clickable and fires navigation callback
    fireEvent.click(testingLink);
    expect(onNavigate).toHaveBeenCalledWith(Screen.TESTING);

    unmount();
  });

  it('re-fits active contextual link when scrolled above container top', () => {
    render(
      <ThemeProvider>
        <AppSidebar
          {...defaultProps}
          currentScreen={Screen.TESTING}
          isTestingDraftDirty={true}
        />
      </ThemeProvider>
    );

    const testingLink = screen.getByRole('link', { name: /Testing Session/i });
    const scrollNav = screen.getByRole('navigation', { name: /Current work navigation/i });
    const scrollContainer = scrollNav.parentElement as HTMLElement;

    const containerTop = 100;
    const containerHeight = 200;
    const containerBottom = 300;

    const targetTop = 80; // 20px above container top
    const targetHeight = 44;
    const targetBottom = targetTop + targetHeight;

    vi.spyOn(scrollContainer, 'getBoundingClientRect').mockReturnValue({
      top: containerTop,
      bottom: containerBottom,
      left: 0,
      right: 288,
      width: 288,
      height: containerHeight,
      x: 0,
      y: containerTop,
      toJSON: () => {},
    });

    vi.spyOn(testingLink, 'getBoundingClientRect').mockReturnValue({
      top: targetTop,
      bottom: targetBottom,
      left: 0,
      right: 288,
      width: 288,
      height: targetHeight,
      x: 0,
      y: targetTop,
      toJSON: () => {},
    });

    scrollContainer.scrollTop = 50;

    window.dispatchEvent(new Event('resize'));

    // scrollTop should decrease by 20 (from 50 to 30)
    expect(scrollContainer.scrollTop).toBe(30);
  });

  it('attaches and cleans up ResizeObserver when available', () => {
    let observedElement: Element | null = null;
    const disconnectMock = vi.fn();

    class MockResizeObserver {
      constructor(_callback: (...args: unknown[]) => void) {}
      observe(element: Element) {
        observedElement = element;
      }
      unobserve = vi.fn();
      disconnect = disconnectMock;
    }

    const originalResizeObserver = window.ResizeObserver;
    window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

    try {
      const { unmount } = render(
        <ThemeProvider>
          <AppSidebar
            {...defaultProps}
            currentScreen={Screen.TESTING}
            isTestingDraftDirty={true}
          />
        </ThemeProvider>
      );

      const scrollNav = screen.getByRole('navigation', { name: /Current work navigation/i });
      const scrollContainer = scrollNav.parentElement as HTMLElement;
      expect(observedElement).toBe(scrollContainer);

      unmount();
      expect(disconnectMock).toHaveBeenCalled();
    } finally {
      window.ResizeObserver = originalResizeObserver;
    }
  });

  it('renders complete long labels without truncate class and allows safe wrapping', () => {
    render(
      <ThemeProvider>
        <AppSidebar
          {...defaultProps}
          isTestingDraftDirty={true}
          hasActiveReport={true}
        />
      </ThemeProvider>
    );

    const contactLink = screen.getByRole('link', { name: /Contact \/ Support/i });
    const resourcesLink = screen.getByRole('link', { name: /Resources \/ Links/i });
    const drugRefLink = screen.getByRole('link', { name: /Drug Reference/i });

    expect(contactLink).toBeInTheDocument();
    expect(resourcesLink).toBeInTheDocument();
    expect(drugRefLink).toBeInTheDocument();

    const labelSpans = screen.getAllByText(
      /Home|Dashboard|Reports|Testing Session|Research|About|FAQ|Drug Reference|Contact \/ Support|Resources \/ Links|Changelog|Upload CSV|Get Started/i
    );

    labelSpans.forEach((span) => {
      expect(span).not.toHaveClass('truncate');
      expect(span).toHaveClass('break-words');
    });
  });

  it('enforces 44px minimum target height on all navigation links, utility buttons, and theme control', () => {
    render(
      <ThemeProvider>
        <AppSidebar
          {...defaultProps}
          isTestingDraftDirty={true}
          hasActiveReport={true}
        />
      </ThemeProvider>
    );

    const interactiveLinks = screen.getAllByRole('link');
    const interactiveButtons = screen.getAllByRole('button');

    // Navigation links should have min-h-[44px]
    const navLinks = interactiveLinks.filter((l) => l.getAttribute('href') !== '/');
    navLinks.forEach((link) => {
      expect(link).toHaveClass('min-h-[44px]');
    });

    interactiveButtons.forEach((button) => {
      expect(button).toHaveClass('min-h-[44px]');
    });
  });

  it('includes visible focus rings on interactive elements', () => {
    render(
      <ThemeProvider>
        <AppSidebar {...defaultProps} />
      </ThemeProvider>
    );

    const links = screen.getAllByRole('link');
    const buttons = screen.getAllByRole('button');

    [...links, ...buttons].forEach((element) => {
      expect(element).toHaveClass('focus-visible:ring-2');
      expect(element).toHaveClass('focus-visible:outline-none');
    });
  });

  it('preserves group ordering across the desktop rail', () => {
    render(
      <ThemeProvider>
        <AppSidebar
          {...defaultProps}
          isTestingDraftDirty={true}
          hasActiveReport={true}
        />
      </ThemeProvider>
    );

    const masthead = screen.getByRole('link', { name: /DREAM Anaesthetic Allergy Workbench/i });
    const primaryNav = screen.getByRole('navigation', { name: /Primary sidebar navigation/i });
    const currentWorkNav = screen.getByRole('navigation', { name: /Current work navigation/i });
    const uploadBtn = screen.getByRole('button', { name: /Upload CSV/i });
    const contactLink = screen.getByRole('link', { name: /Contact \/ Support/i });
    const themeBtn = screen.getByRole('button', { name: /Theme/i });
    const metadata = screen.getByText('NSW Health RPAH');

    expect(masthead.compareDocumentPosition(primaryNav)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(primaryNav.compareDocumentPosition(currentWorkNav)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(currentWorkNav.compareDocumentPosition(uploadBtn)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(uploadBtn.compareDocumentPosition(contactLink)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(contactLink.compareDocumentPosition(themeBtn)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(themeBtn.compareDocumentPosition(metadata)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it('triggers utility actions for CSV upload and Get Started', () => {
    const onOpenUploadCSV = vi.fn();
    const onOpenGetStarted = vi.fn();

    render(
      <ThemeProvider>
        <AppSidebar
          {...defaultProps}
          onOpenUploadCSV={onOpenUploadCSV}
          onOpenGetStarted={onOpenGetStarted}
        />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Upload CSV/i }));
    expect(onOpenUploadCSV).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: /Get Started/i }));
    expect(onOpenGetStarted).toHaveBeenCalledOnce();
  });

  it('handles navigation for utility links', () => {
    const onNavigate = vi.fn();
    render(
      <ThemeProvider>
        <AppSidebar {...defaultProps} onNavigate={onNavigate} />
      </ThemeProvider>
    );

    const contactLink = screen.getByRole('link', { name: /Contact \/ Support/i });
    fireEvent.click(contactLink);
    expect(onNavigate).toHaveBeenCalledWith(Screen.CONTACT);

    const resourcesLink = screen.getByRole('link', { name: /Resources \/ Links/i });
    fireEvent.click(resourcesLink);
    expect(onNavigate).toHaveBeenCalledWith(Screen.RESOURCES);
  });

  it('toggles theme when theme toggle button is clicked', () => {
    render(
      <ThemeProvider>
        <AppSidebar {...defaultProps} />
      </ThemeProvider>
    );

    const themeBtn = screen.getByRole('button', { name: /Theme/i });
    fireEvent.click(themeBtn);
    expect(screen.getByRole('button', { name: /Theme/i })).toBeInTheDocument();
  });

  it('does not render workflow mode selector', () => {
    render(
      <ThemeProvider>
        <AppSidebar {...defaultProps} />
      </ThemeProvider>
    );

    expect(screen.queryByLabelText(/Workflow view/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Workflow view/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Clinician')).not.toBeInTheDocument();
    expect(screen.queryByText('Nurse')).not.toBeInTheDocument();
  });
});
