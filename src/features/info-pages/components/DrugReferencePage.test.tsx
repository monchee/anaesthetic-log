import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import DrugReferencePage from './DrugReferencePage';
import { CROSS_REACTIVITY_ITEMS, CROSS_REACTIVITY_GOVERNANCE } from '@shared/data/crossReactivity';
import snapshot from '@shared/data/protocols.snapshot.json';

describe('DrugReferencePage Component', () => {
  const setScreenMock = vi.fn();

  it('renders all six cross-reactivity categories from the pinned snapshot/adapter', () => {
    const { container } = render(<DrugReferencePage setScreen={setScreenMock} />);

    expect(CROSS_REACTIVITY_ITEMS).toHaveLength(6);
    expect(CROSS_REACTIVITY_ITEMS).toEqual(snapshot.cross_reactivity.items);

    // Verify each category exists as an accordion trigger
    const triggers = container.querySelectorAll('[data-radix-collection-item]');
    expect(triggers.length).toBe(6);

    for (let i = 0; i < CROSS_REACTIVITY_ITEMS.length; i++) {
      const item = CROSS_REACTIVITY_ITEMS[i];
      const trigger = triggers[i];
      expect(trigger).toHaveTextContent(item.category);

      // Open accordion item to verify content and alternatives
      fireEvent.click(trigger);
      expect(screen.getByText(item.info)).toBeInTheDocument();
      expect(screen.getByText(item.alternatives, { exact: false })).toBeInTheDocument();
    }
  });

  it('renders the "Alternatives:" label for each cross-reactivity item when expanded', () => {
    const { container } = render(<DrugReferencePage setScreen={setScreenMock} />);

    const triggers = container.querySelectorAll('[data-radix-collection-item]');
    for (const trigger of triggers) {
      fireEvent.click(trigger);
    }

    const altLabels = screen.getAllByText('Alternatives:');
    expect(altLabels).toHaveLength(6);
  });

  it('renders the "Clinical review pending" notice when under_review is true', () => {
    render(<DrugReferencePage setScreen={setScreenMock} />);

    expect(CROSS_REACTIVITY_GOVERNANCE.under_review).toBe(true);
    const notice = screen.getByText(/Clinical review pending/i);
    expect(notice).toBeInTheDocument();
  });

  it('does not invent or render reviewer or date when fields are blank', () => {
    render(<DrugReferencePage setScreen={setScreenMock} />);

    expect(CROSS_REACTIVITY_GOVERNANCE.reviewed_by).toBe('');
    expect(CROSS_REACTIVITY_GOVERNANCE.last_reviewed).toBe('');

    // Ensure no fallback date/reviewer strings are rendered
    expect(screen.queryByText(/Reviewed by/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Review date/i)).not.toBeInTheDocument();
  });
});
