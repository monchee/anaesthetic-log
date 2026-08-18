import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { ScreenLayout, ScreenLayoutProps } from './ScreenLayout';
import { Screen } from '@/types';
import { renderWithProviders } from '../../test/helpers/renderWithProviders';

describe('ScreenLayout', () => {
  const defaultProps: ScreenLayoutProps = {
    title: 'Clinical Workspace',
    subtitle: 'Anaesthetic allergy session',
    children: <div data-testid="workspace-content">Workspace Content</div>,
    setScreen: vi.fn(),
    navigate: vi.fn(),
    hrefFor: (screen: Screen) => (screen === Screen.LOG ? '/' : `/${screen}`),
    currentScreen: Screen.LOG,
    isTestingDraftDirty: false,
    hasActiveReport: false,
    databaseDate: '2026-08-15',
    isCustomData: false,
  };

  it('renders persistent sidebar and topbar when showNav=true', () => {
    const { container } = renderWithProviders(<ScreenLayout {...defaultProps} showNav={true} />);

    // Sidebar landmark
    const sidebar = screen.getByRole('complementary', { name: /Application sidebar/i });
    expect(sidebar).toBeInTheDocument();

    // Top bar header landmark
    const header = screen.getByRole('banner', { name: /Application header/i });
    expect(header).toBeInTheDocument();

    // Main workspace content
    expect(screen.getByTestId('workspace-content')).toBeInTheDocument();

    // Main content container has max-w-6xl
    const main = screen.getByRole('main', { name: /Main content/i });
    expect(main).toHaveClass('max-w-6xl');

    // Layout container has xl:pl-64 and neither container nor content column carries overflow-x-hidden
    expect(container.firstChild).toHaveClass('xl:pl-64');
    expect(container.firstChild).not.toHaveClass('overflow-x-hidden');

    // Content column does not have overflow-x-hidden (overflow-x containment lives on body)
    const contentColumn = container.querySelector('div.flex-1.flex.flex-col.min-w-0.w-full');
    expect(contentColumn).not.toHaveClass('overflow-x-hidden');
  });

  it('renders standalone header without sidebar or drawer trigger when showNav=false', () => {
    const { container } = renderWithProviders(<ScreenLayout {...defaultProps} showNav={false} />);

    // No sidebar
    expect(screen.queryByRole('complementary', { name: /Application sidebar/i })).not.toBeInTheDocument();

    // No drawer trigger
    expect(screen.queryByRole('button', { name: /Open navigation menu/i })).not.toBeInTheDocument();

    // Standalone header
    const header = screen.getByRole('banner', { name: /Application header/i });
    expect(header).toBeInTheDocument();
    expect(header).toHaveTextContent('Clinical Workspace');

    // Container does not have xl:pl-64
    expect(container.firstChild).not.toHaveClass('xl:pl-64');
  });

  it('renders skip to main content link targeting #main-content', () => {
    renderWithProviders(<ScreenLayout {...defaultProps} />);

    const skipLink = screen.getByText(/Skip to main content/i);
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('renders footer when showFooter=true and hides when showFooter=false', () => {
    const { rerender } = renderWithProviders(<ScreenLayout {...defaultProps} showFooter={true} />);
    expect(screen.getByRole('contentinfo', { name: /Application footer/i })).toBeInTheDocument();

    rerender(<ScreenLayout {...defaultProps} showFooter={false} />);
    expect(screen.queryByRole('contentinfo', { name: /Application footer/i })).not.toBeInTheDocument();
  });

  it('renders NavigationGuardDialog when pendingNavigation is active', () => {
    const confirmNavigation = vi.fn();
    const cancelNavigation = vi.fn();

    renderWithProviders(
      <ScreenLayout
        {...defaultProps}
        pendingNavigation={Screen.DASHBOARD}
        confirmNavigation={confirmNavigation}
        cancelNavigation={cancelNavigation}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Leave testing session\?/i)).toBeInTheDocument();
  });
});

