import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SkinTestBreakdown from './SkinTestBreakdown';

const mockStatsByCategory = [
  {
    category: 'Muscle Relaxants',
    stats: [
      {
        name: 'Rocuronium',
        spt: 5,
        idt100: 2,
        idt10: 1,
        idtNeat: 0,
        challenge: 0,
        total: 8,
      },
      {
        name: 'Suxamethonium',
        spt: 0,
        idt100: 0,
        idt10: 0,
        idtNeat: 0,
        challenge: 0,
        total: 0,
      },
    ],
  },
  {
    category: 'Anaesthetics',
    stats: [
      {
        name: 'Propofol',
        spt: 1,
        idt100: 0,
        idt10: 0,
        idtNeat: 0,
        challenge: 1,
        total: 2,
      },
    ],
  },
];

describe('SkinTestBreakdown', () => {
  const defaultProps = {
    statsByCategory: mockStatsByCategory,
    expandedCategories: ['Muscle Relaxants'],
    toggleCategory: vi.fn(),
    toggleAllCategories: vi.fn(),
  };

  it('renders header, title, and Expand/Collapse All toggle', () => {
    const { rerender } = render(<SkinTestBreakdown {...defaultProps} />);

    expect(screen.getByRole('heading', { level: 2, name: /Positive Skin Test Breakdown/i })).toBeInTheDocument();
    expect(screen.getByText(/Number of positive patient reactions by drug/i)).toBeInTheDocument();

    const expandAllBtn = screen.getByRole('button', { name: /Expand All/i });
    expect(expandAllBtn).toBeInTheDocument();
    fireEvent.click(expandAllBtn);
    expect(defaultProps.toggleAllCategories).toHaveBeenCalledTimes(1);

    // When all categories are expanded
    rerender(
      <SkinTestBreakdown
        {...defaultProps}
        expandedCategories={['Muscle Relaxants', 'Anaesthetics']}
      />
    );
    expect(screen.getByRole('button', { name: /Collapse All/i })).toBeInTheDocument();
  });

  describe('Desktop Table View', () => {
    it('renders desktop table with correct column headers', () => {
      render(<SkinTestBreakdown {...defaultProps} />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      const headers = ['Drug', 'SPT', 'IDT 1:100', 'IDT 1:10', 'IDT Neat', 'Challenge Pos', 'Total Cases'];
      headers.forEach(header => {
        expect(screen.getByRole('columnheader', { name: header })).toBeInTheDocument();
      });
    });

    it('renders expanded category rows and drug items in table', () => {
      render(<SkinTestBreakdown {...defaultProps} />);

      // Muscle Relaxants category button
      const muscleRelaxantsDesktopBtn = screen.getByRole('button', {
        name: /Collapse Muscle Relaxants skin test results/i,
      });
      expect(muscleRelaxantsDesktopBtn).toHaveAttribute('aria-expanded', 'true');

      // Check Rocuronium data in table
      expect(screen.getAllByText('Rocuronium').length).toBeGreaterThan(0);
      expect(screen.getAllByText('8').length).toBeGreaterThan(0); // Total

      // Suxamethonium with 0 should show '-'
      expect(screen.getAllByText('Suxamethonium').length).toBeGreaterThan(0);

      // Anaesthetics is collapsed
      const anaestheticsDesktopBtn = screen.getByRole('button', {
        name: /Expand Anaesthetics skin test results/i,
      });
      expect(anaestheticsDesktopBtn).toHaveAttribute('aria-expanded', 'false');

      // Click to toggle
      fireEvent.click(anaestheticsDesktopBtn);
      expect(defaultProps.toggleCategory).toHaveBeenCalledWith('Anaesthetics');
    });
  });

  describe('Mobile Phone Card View', () => {
    it('renders mobile category accordion headers with positive badges', () => {
      render(<SkinTestBreakdown {...defaultProps} />);

      // Mobile button for Muscle Relaxants
      const mobileMuscleBtn = screen.getByRole('button', {
        name: /Collapse Muscle Relaxants category/i,
      });
      expect(mobileMuscleBtn).toHaveAttribute('aria-expanded', 'true');

      // Mobile button for Anaesthetics
      const mobileAnaesthBtn = screen.getByRole('button', {
        name: /Expand Anaesthetics category/i,
      });
      expect(mobileAnaesthBtn).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(mobileMuscleBtn);
      expect(defaultProps.toggleCategory).toHaveBeenCalledWith('Muscle Relaxants');
    });

    it('renders all clinical drug fields and modalities on mobile when category is expanded', () => {
      render(<SkinTestBreakdown {...defaultProps} />);

      // Under Muscle Relaxants (expanded)
      expect(screen.getAllByText('Rocuronium').length).toBe(2); // 1 desktop, 1 mobile
      expect(screen.getAllByText('Suxamethonium').length).toBe(2);

      // Modality labels should be visible on mobile
      expect(screen.getAllByText('SPT').length).toBeGreaterThan(0);
      expect(screen.getAllByText('1:100').length).toBeGreaterThan(0);
      expect(screen.getAllByText('1:10').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Neat').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Chal').length).toBeGreaterThan(0);
    });
  });

  describe('Empty State', () => {
    it('renders empty message when statsByCategory is empty', () => {
      render(
        <SkinTestBreakdown
          statsByCategory={[]}
          expandedCategories={[]}
          toggleCategory={vi.fn()}
          toggleAllCategories={vi.fn()}
        />
      );

      expect(screen.getAllByText('No data available.').length).toBeGreaterThan(0);
    });
  });
});
