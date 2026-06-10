import React from 'react';
import { Button } from '@/components/ui';
import { Save } from 'lucide-react';

interface SaveActionSectionProps {
  validationErrors: string[];
  errorSummaryRef: React.RefObject<HTMLDivElement | null>;
  onSave: () => void;
}

export function SaveActionSection({ validationErrors, errorSummaryRef, onSave }: SaveActionSectionProps) {
  return (
    <div className="pt-4 pb-20 space-y-3">
      {validationErrors.length > 0 && (
        <div
          ref={errorSummaryRef}
          role="alert"
          tabIndex={-1}
          className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive space-y-1 outline-none focus-visible:ring-2 focus-visible:ring-destructive"
        >
          <p className="font-semibold">Please fix the following before saving:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {validationErrors.map((error, index) => <li key={index}>{error}</li>)}
          </ul>
        </div>
      )}
      <Button onClick={onSave} size="lg" className="w-full h-14 text-lg shadow-lg hover:shadow-xl transition-[box-shadow,background-color] bg-primary hover:bg-primary font-semibold">
        <Save className="w-5 h-5 mr-2" /> Save Clinical Record
      </Button>
    </div>
  );
}
