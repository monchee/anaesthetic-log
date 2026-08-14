import React from 'react';
import { Card, CardContent, Input, Label } from '@/components/ui';
import { Activity, Calendar } from 'lucide-react';
import { LogFormData } from '@/types';
import { InputChangeHandler } from './TestingLogFormSectionShared';

interface VisitDetailsSectionProps {
  formData: LogFormData;
  onInputChange: InputChangeHandler;
}

export function VisitDetailsSection({ formData, onInputChange }: VisitDetailsSectionProps) {
  return (
    <Card style={{ '--section-index': 0 } as React.CSSProperties} className="animate-section-reveal rounded-none">
      <CardContent className="pt-4 sm:pt-5 md:pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-muted p-2 rounded-none">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="section-label">Patient Name</div>
              <div className="text-lg font-bold text-foreground">
                {formData.lastName}, {formData.firstName}
              </div>
            </div>
            <div className="border-l pl-4 border-border">
              <div className="section-label">MRN</div>
              <div className="text-lg font-bold text-foreground font-mono">
                {formData.mrn}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 border-t md:border-t-0 pt-3 md:pt-0">
            <Label htmlFor="visit-date" className="whitespace-nowrap text-base font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" aria-hidden="true" /> Visit Date:<span className="text-destructive ml-0.5" aria-hidden="true">*</span>
            </Label>
            <Input
              id="visit-date"
              type="date"
              aria-describedby="visit-date-hint"
              className="w-full md:max-w-[200px] font-mono tabular-nums rounded-none"
              value={formData.visitDate}
              onChange={(e) => onInputChange('visitDate', e.target.value)}
            />
            <span id="visit-date-hint" className="sr-only">
              Enter the date when the patient visited for testing
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
