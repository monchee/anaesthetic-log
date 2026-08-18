import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Footer from './Footer';
import { Screen } from '@shared/types';

describe('Footer', () => {
  it('renders reduced footer with legal links, clinic identity, and version', () => {
    const onNavigate = vi.fn();
    render(
      <Footer
        databaseDate="2026-08-15"
        isCustomData={false}
        onNavigate={onNavigate}
        currentScreen={Screen.LOG}
      />
    );

    // Clinic identity
    expect(screen.getByText('RPAH Anaesthetic Allergy Clinic')).toBeInTheDocument();
    expect(screen.getByText('Safe sleep, clear answers')).toBeInTheDocument();

    // Dataset status
    expect(screen.getByText(/Dataset:/i)).toBeInTheDocument();
    expect(screen.getByText('Demo')).toBeInTheDocument();

    // Legal links are real anchors
    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy-policy');
    expect(screen.getByRole('link', { name: 'Governance' })).toHaveAttribute('href', '/clinical-governance');
    expect(screen.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms-of-use');
    expect(screen.getByRole('link', { name: 'Technical' })).toHaveAttribute('href', '/technical-documentation');
    expect(screen.getByRole('link', { name: 'Disclaimer' })).toHaveAttribute('href', '/disclaimer');

    // Duplicate utility links must be absent
    expect(screen.queryByRole('link', { name: 'About' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'FAQ' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Drugs' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Contact' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Resources' })).not.toBeInTheDocument();
  });

  it('triggers navigation when clicking legal or changelog links', () => {
    const onNavigate = vi.fn();
    render(
      <Footer
        databaseDate="2026-08-15"
        isCustomData={true}
        onNavigate={onNavigate}
        currentScreen={Screen.LOG}
      />
    );

    const privacyLink = screen.getByRole('link', { name: 'Privacy' });
    fireEvent.click(privacyLink);
    expect(onNavigate).toHaveBeenCalledWith(Screen.PRIVACY_POLICY);

    const changelogLink = screen.getByRole('link', { name: /view changelog/i });
    expect(changelogLink).toHaveAttribute('href', '/changelog');
    fireEvent.click(changelogLink);
    expect(onNavigate).toHaveBeenCalledWith(Screen.CHANGELOG);
  });
});
