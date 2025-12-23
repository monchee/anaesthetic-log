import React from 'react';
import { Label } from '../../../../components/ui';

interface AssessmentSectionProps {
  plan: string;
  onChange: (value: string) => void;
}

export const AssessmentSection: React.FC<AssessmentSectionProps> = ({
  plan,
  onChange
}) => {
  return (
    <div className="space-y-2">
      <Label>Comments / Plan</Label>
      <textarea 
        className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
        placeholder="Enter clinical notes, interpretation of results, and future recommendations..."
        value={plan}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
