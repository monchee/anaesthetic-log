import React, { useState } from 'react';
import { Patient } from '@/types';
import { decodeCsvBytes, parseRedcapCSV } from '@shared/utils';
import { toast } from 'sonner';

export interface UseRedcapCsvUploadOptions {
  onParsed?: (patients: Patient[], lastModified?: number) => void;
  onComplete?: () => void;
}

export interface UseRedcapCsvUploadResult {
  isUploading: boolean;
  uploadFile: (file: File) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function useRedcapCsvUpload(
  options: UseRedcapCsvUploadOptions = {}
): UseRedcapCsvUploadResult {
  const { onParsed, onComplete } = options;
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = (file: File) => {
    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = decodeCsvBytes(event.target?.result as ArrayBuffer);
        const result = parseRedcapCSV(text);

        if (result.success) {
          onParsed?.(result.data, file.lastModified);
          toast.success('Database updated', {
            description: `Imported ${result.data.length} record(s).${
              result.details ? ` ${result.details.join(' ')}` : ''
            }`,
          });
          onComplete?.();
        } else {
          toast.error('Failed to parse CSV', {
            description: result.error || 'Please check the file format.',
            duration: 8000,
          });
        }
      } catch {
        toast.error('Error reading file', { duration: 8000 });
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      toast.error('Error reading file', { duration: 8000 });
      setIsUploading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  return {
    isUploading,
    uploadFile,
    handleFileChange,
  };
}
