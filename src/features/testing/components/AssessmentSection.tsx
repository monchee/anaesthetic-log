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
        className="flex min-h-[120px] w-full rounded-none border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        placeholder="Enter clinical notes, interpretation of results, and future recommendations..."
        value={plan}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
