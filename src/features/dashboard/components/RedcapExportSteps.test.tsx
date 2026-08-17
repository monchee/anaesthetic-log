import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RedcapExportSteps } from './RedcapExportSteps';

describe('RedcapExportSteps', () => {
  it('renders the login link, numbered steps, and file input in resting state', () => {
    const onUpload = vi.fn();
    render(<RedcapExportSteps onUpload={onUpload} isUploading={false} />);

    // Step 1 link
    const loginLink = screen.getByRole('link', { name: 'redcap.slhd.nsw.gov.au' });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', 'https://redcap.slhd.nsw.gov.au/');
    expect(loginLink).toHaveAttribute('target', '_blank');

    // Numbered step instructions
    expect(screen.getByText(/Data Exports, Reports, and Stats/i)).toBeInTheDocument();
    expect(screen.getByText(/All data \(all records and fields\)/i)).toBeInTheDocument();
    expect(screen.getByText(/CSV \/ Microsoft Excel \(labels\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Export Data/i)).toBeInTheDocument();
    expect(screen.getByText(/Ready!/i)).toBeInTheDocument();

    // File input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('accept', '.csv');
    expect(fileInput).not.toBeDisabled();
  });

  it('shows parsing status when isUploading is true', () => {
    const onUpload = vi.fn();
    render(<RedcapExportSteps onUpload={onUpload} isUploading={true} />);

    const statusEl = screen.getByRole('status');
    expect(statusEl).toBeInTheDocument();
    expect(screen.getByText('Parsing…')).toBeInTheDocument();
    expect(document.querySelector('input[type="file"]')).not.toBeInTheDocument();
  });

  it('fires onUpload callback when a file is selected', () => {
    const onUpload = vi.fn();
    render(<RedcapExportSteps onUpload={onUpload} isUploading={false} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'export.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(onUpload).toHaveBeenCalledOnce();
  });
});
