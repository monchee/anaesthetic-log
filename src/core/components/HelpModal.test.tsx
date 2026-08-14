import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { HelpModal } from './HelpModal';
import { Screen } from '@/types';
import changelogData from '@shared/data/changelog.json';

const currentVersion = changelogData[0].version;

describe('HelpModal Quick Start behaviour', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('auto-opens when hasData is false on first run', () => {
    render(<HelpModal hasData={false} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Quick Start/i })).toBeInTheDocument();
    expect(screen.getByText(/Welcome to The DREAM App/i)).toBeInTheDocument();
  });

  it('acknowledges new version via "Got it" button and persists to localStorage', () => {
    render(<HelpModal hasData={true} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const gotItBtn = screen.getByRole('button', { name: 'Got it' });
    fireEvent.click(gotItBtn);

    expect(localStorage.setItem).toHaveBeenCalledWith('dream:last_seen_version', currentVersion);
  });

  it('acknowledges new version via "Skip for now" and persists to localStorage', () => {
    render(<HelpModal hasData={false} />);

    const skipBtn = screen.getByRole('button', { name: 'Skip for now' });
    fireEvent.click(skipBtn);

    expect(localStorage.setItem).toHaveBeenCalledWith('dream:last_seen_version', currentVersion);
  });

  it('navigates to changelog screen when "View full changelog →" is clicked', () => {
    const setScreen = vi.fn();
    render(<HelpModal hasData={true} setScreen={setScreen} />);

    const changelogBtn = screen.getByRole('button', { name: /View full changelog/i });
    fireEvent.click(changelogBtn);

    expect(setScreen).toHaveBeenCalledWith(Screen.CHANGELOG);
    expect(localStorage.setItem).toHaveBeenCalledWith('dream:last_seen_version', currentVersion);
  });

  it('does not auto-open if version is already acknowledged and hasData is true', () => {
    localStorage.getItem = vi.fn((key: string) => (key === 'dream:last_seen_version' ? currentVersion : null));

    render(<HelpModal hasData={true} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
