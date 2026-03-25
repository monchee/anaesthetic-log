import { useState } from 'react';
import { toast } from 'sonner';
import { LogFormData } from '../../../../types';
import { isSupabaseConfigured } from '../../../lib/supabase';
import { deidentify, submitResult } from '../services/ResearchService';

interface UseResearchSubmitResult {
  isAvailable: boolean;
  isSubmitting: boolean;
  isSubmitted: boolean;
  error: string | null;
  submit: (formData: LogFormData, redcapId?: string) => Promise<void>;
  reset: () => void;
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
      toast.success('Saved to research database', {
        description: 'De-identified record submitted successfully.',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save to research database.';
      setError(message);
      toast.error('Failed to save to research database', {
        description: message,
        duration: 8000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setIsSubmitted(false);
    setError(null);
  };

  return {
    isAvailable: isSupabaseConfigured,
    isSubmitting,
    isSubmitted,
    error,
    submit,
    reset,
  };
}
