import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import DisclaimerBanner from './DisclaimerBanner';
import { ScreenLayout } from './ScreenLayout';
import { Screen } from '@/types';
import { renderWithProviders } from '../../test/helpers/renderWithProviders';

describe('Shared polish safety and semantic token regression tests', () => {
  describe('Badge semantic status variants', () => {
    it('applies semantic status classes for danger and grades 1 through 4', () => {
      const { rerender } = render(<Badge variant="danger">Danger</Badge>);
      expect(screen.getByText('Danger')).toHaveClass('bg-status-danger', 'text-status-danger-foreground');

      rerender(<Badge variant="grade1">Grade 1</Badge>);
      expect(screen.getByText('Grade 1')).toHaveClass('bg-status-grade1');

      rerender(<Badge variant="grade2">Grade 2</Badge>);
      expect(screen.getByText('Grade 2')).toHaveClass('bg-status-grade2', 'text-foreground');

      rerender(<Badge variant="grade3">Grade 3</Badge>);
      expect(screen.getByText('Grade 3')).toHaveClass('bg-status-grade3');

      rerender(<Badge variant="grade4">Grade 4</Badge>);
      expect(screen.getByText('Grade 4')).toHaveClass('bg-status-grade4');
    });
  });

  describe('ConfirmDialog semantic status styling', () => {
    it('applies semantic status classes for warning and info confirmation actions', () => {
      const { rerender } = render(
        <ConfirmDialog
          open={true}
          onOpenChange={vi.fn()}
          title="Warning Dialog"
          message="Proceed with caution"
          variant="warning"
          confirmLabel="Confirm Warn"
          onConfirm={vi.fn()}
        />
      );

      const warnButton = screen.getByRole('button', { name: 'Confirm Warn' });
      expect(warnButton).toHaveClass('bg-status-warning', 'text-status-warning-foreground');

      rerender(
        <ConfirmDialog
          open={true}
          onOpenChange={vi.fn()}
          title="Info Dialog"
          message="Informational message"
          variant="info"
          confirmLabel="Confirm Info"
          onConfirm={vi.fn()}
        />
      );

      const infoButton = screen.getByRole('button', { name: 'Confirm Info' });
      expect(infoButton).toHaveClass('bg-status-info', 'text-status-info-foreground');
    });
  });

  describe('DisclaimerBanner semantic status and accessibility', () => {
    it('renders demo notice with semantic status-warning tokens and dismiss action', () => {
      const onClose = vi.fn();
      const onUpload = vi.fn();

      render(<DisclaimerBanner onClose={onClose} onUploadClick={onUpload} />);

      expect(screen.getByText('Demo System:')).toHaveClass('text-status-warning');
      const uploadButton = screen.getByRole('button', { name: /Upload a REDCap CSV export/i });
      fireEvent.click(uploadButton);
      expect(onUpload).toHaveBeenCalledOnce();

      const dismissButton = screen.getByRole('button', { name: 'Dismiss' });
      fireEvent.click(dismissButton);
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  describe('ScreenLayout responsive navigation and focus behaviour', () => {
    it('includes skip link and responsive container styling with accessible navigation', () => {
      const setScreen = vi.fn();

      renderWithProviders(
        <ScreenLayout
          title="DREAM Workbench"
          setScreen={setScreen}
          currentScreen={Screen.LOG}
          databaseDate="2026-08-15"
        >
          <div>Workspace Content</div>
        </ScreenLayout>
      );

      // Skip to main content link
      const skipLink = screen.getByRole('link', { name: /Skip to main content/i });
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');

      // Main container responsive padding
      const main = screen.getByRole('main', { name: 'Main content' });
      expect(main).toHaveClass('max-w-6xl', 'px-4', 'sm:px-5', 'md:px-6');

      // Navigation links have focus rings, correct href, and trigger screen changes
      const primaryNav = screen.getByRole('navigation', { name: 'Primary navigation' });
      const dashboardLink = within(primaryNav).getByRole('link', { name: 'Dashboard' });
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
      expect(dashboardLink).toHaveClass('focus-visible:ring-2');
      fireEvent.click(dashboardLink);
      expect(setScreen).toHaveBeenCalledWith(Screen.DASHBOARD);
    });
  });
});
