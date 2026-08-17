import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRedcapCsvUpload } from './useRedcapCsvUpload';
import { toast } from 'sonner';
import * as csvUtils from '@shared/utils/csvUtils';
import { createMockPatient } from '@/src/test/factories/patientFactory';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useRedcapCsvUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles successful CSV upload, calls onParsed with lastModified, calls onComplete, and shows success toast', async () => {
    const mockPatients = [createMockPatient({ id: '1', firstName: 'John', lastName: 'Doe' })];
    vi.spyOn(csvUtils, 'decodeCsvBytes').mockReturnValue('Record ID,First Name,Last Name,Date of Reaction:\n1,John,Doe,2023-01-01');
    vi.spyOn(csvUtils, 'parseRedcapCSV').mockReturnValue({
      success: true,
      data: mockPatients,
      details: ['Processed 1 record.'],
    });

    const onParsed = vi.fn();
    const onComplete = vi.fn();

    const { result } = renderHook(() =>
      useRedcapCsvUpload({ onParsed, onComplete })
    );

    const testDate = 1700000000000;
    const file = new File(['dummy content'], 'test.csv', {
      type: 'text/csv',
      lastModified: testDate,
    });

    await act(async () => {
      result.current.uploadFile(file);
      // Wait for FileReader async callbacks
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(onParsed).toHaveBeenCalledWith(mockPatients, testDate);
    expect(toast.success).toHaveBeenCalledWith('Database updated', {
      description: 'Imported 1 record(s). Processed 1 record.',
    });
    expect(onComplete).toHaveBeenCalled();
    expect(result.current.isUploading).toBe(false);
  });

  it('shows error toast when CSV parsing fails', async () => {
    vi.spyOn(csvUtils, 'decodeCsvBytes').mockReturnValue('invalid,csv');
    vi.spyOn(csvUtils, 'parseRedcapCSV').mockReturnValue({
      success: false,
      data: [],
      error: 'Missing required columns: Record ID',
    });

    const onParsed = vi.fn();
    const onComplete = vi.fn();

    const { result } = renderHook(() =>
      useRedcapCsvUpload({ onParsed, onComplete })
    );

    const file = new File(['invalid,csv'], 'test.csv', { type: 'text/csv' });

    await act(async () => {
      result.current.uploadFile(file);
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(onParsed).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Failed to parse CSV', {
      description: 'Missing required columns: Record ID',
      duration: 8000,
    });
    expect(result.current.isUploading).toBe(false);
  });

  it('shows error toast when FileReader throws or errors', async () => {
    vi.spyOn(csvUtils, 'decodeCsvBytes').mockImplementation(() => {
      throw new Error('Decoding failure');
    });

    const { result } = renderHook(() => useRedcapCsvUpload());
    const file = new File(['corrupt data'], 'test.csv', { type: 'text/csv' });

    await act(async () => {
      result.current.uploadFile(file);
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(toast.error).toHaveBeenCalledWith('Error reading file', { duration: 8000 });
    expect(result.current.isUploading).toBe(false);
  });

  it('resets input value on handleFileChange so the same file can be re-selected', async () => {
    vi.spyOn(csvUtils, 'decodeCsvBytes').mockReturnValue('Record ID,First Name,Last Name,Date of Reaction:\n1,John,Doe,2023-01-01');
    vi.spyOn(csvUtils, 'parseRedcapCSV').mockReturnValue({
      success: true,
      data: [],
    });

    const { result } = renderHook(() => useRedcapCsvUpload());

    const file = new File(['valid'], 'test.csv', { type: 'text/csv' });
    const target = {
      files: [file],
      value: 'C:\\fakepath\\test.csv',
    } as unknown as HTMLInputElement;

    const changeEvent = {
      target,
    } as React.ChangeEvent<HTMLInputElement>;

    await act(async () => {
      result.current.handleFileChange(changeEvent);
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(target.value).toBe('');
  });
});
