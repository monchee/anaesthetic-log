import { useState } from 'react';
import { LogFormData } from '../../../../types';
import { isSupabaseConfigured } from '../../../lib/supabase';
import { deidentify, submitResult } from '../services/ResearchService';

interface UseResearchSubmitResult {
  isAvailable: boolean;
  isSubmitting: boolean;
  isSubmitted: boolean;
  error: string | null;
  submit: (formData: LogFormData, redcapId?: string) => Promise<void>;
}

export function useResearchSubmit(): UseResearchSubmitResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (formData: LogFormData, redcapId?: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const submission = deidentify(formData, redcapId);
      await submitResult(submission);
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save to research database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isAvailable: isSupabaseConfigured,
    isSubmitting,
    isSubmitted,
    error,
    submit,
  };
}
