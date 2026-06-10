import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Label } from '@/components/ui';
import { CheckCircle2 } from 'lucide-react';
import { InputChangeHandler } from './TestingLogFormSectionShared';

interface AssessmentPlanSectionProps {
  plan: string;
  onInputChange: InputChangeHandler;
}

export function AssessmentPlanSection({ plan, onInputChange }: AssessmentPlanSectionProps) {
  return (
    <Card style={{ '--section-index': 4 } as React.CSSProperties} className="animate-section-reveal">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          <div className="bg-emerald-100 dark:bg-emerald-900/40 p-1.5 rounded-none">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          Assessment & Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <Label htmlFor="clinical-plan">Comments / Plan</Label>
          <textarea
            id="clinical-plan"
            className="flex min-h-[120px] w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-border dark:bg-background dark:ring-offset-background dark:placeholder:text-muted-foreground dark:focus-visible:ring-primary/40"
            placeholder=""
            value={plan}
            onChange={(e) => onInputChange('plan', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
