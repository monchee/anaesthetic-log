import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NavigationGuardDialog } from './NavigationGuardDialog';

describe('NavigationGuardDialog', () => {
  it('renders confirmation dialog with exact copy when open', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <NavigationGuardDialog
        isOpen={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Leave testing session?')).toBeInTheDocument();
    expect(
      screen.getByText('Your testing draft will remain on this device for up to 6 hours.')
    ).toBeInTheDocument();

    const stayBtn = screen.getByRole('button', { name: 'Stay in session' });
    const leaveBtn = screen.getByRole('button', { name: 'Leave and keep draft' });

    expect(stayBtn).toBeInTheDocument();
    expect(leaveBtn).toBeInTheDocument();
  });

  it('triggers onCancel when Stay in session is clicked', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <NavigationGuardDialog
        isOpen={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Stay in session' }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('triggers onConfirm when Leave and keep draft is clicked', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <NavigationGuardDialog
        isOpen={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Leave and keep draft' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();
  });
});
