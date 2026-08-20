import React from 'react';
import { Card, CardContent, Input, Label } from '@/components/ui';
import { Activity, Calendar, User } from 'lucide-react';
import { LogFormData } from '@shared/types';
import { InputChangeHandler } from './TestingLogFormSectionShared';
import { ValidationErrorLink } from './SaveActionSection';

interface VisitDetailsSectionProps {
  formData: LogFormData;
  onInputChange: InputChangeHandler;
  isDirectEntry?: boolean;
  validationErrors?: ValidationErrorLink[];
}

export function VisitDetailsSection({
  formData,
  onInputChange,
  isDirectEntry = false,
  validationErrors = [],
}: VisitDetailsSectionProps) {
  const getError = (fieldId: string) => validationErrors.find(e => e.fieldId === fieldId)?.message;
  const mrnError = getError('patient-mrn');
  const firstNameError = getError('patient-first-name');
  const lastNameError = getError('patient-last-name');
  const visitDateError = getError('visit-date');

  return (
    <Card style={{ '--section-index': 0 } as React.CSSProperties} className="animate-section-reveal">
      <CardContent>
        {isDirectEntry ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <div className="bg-primary/10 dark:bg-primary/20 p-1.5 rounded-none">
                <User className="w-4 h-4 text-primary" />
              </div>
              <h3 className="heading-subsection">Patient Identity</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="patient-mrn" className="section-label mb-1.5 min-h-[2rem] flex flex-col justify-end">
                  <span>
                    MRN<span className="text-destructive ml-0.5" aria-hidden="true">*</span>
                  </span>
                </Label>
                <Input
                  id="patient-mrn"
                  className="rounded-none font-mono"
                  value={formData.mrn}
                  onChange={(e) => onInputChange('mrn', e.target.value)}
                  placeholder="Record number..."
                  aria-invalid={!!mrnError}
                  aria-describedby={mrnError ? 'patient-mrn-error' : undefined}
                />
                {mrnError && (
                  <p id="patient-mrn-error" className="text-destructive text-xs mt-1">
                    {mrnError}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="patient-first-name" className="section-label mb-1.5 min-h-[2rem] flex flex-col justify-end">
                  <span>
                    First Name<span className="text-destructive ml-0.5" aria-hidden="true">*</span>
                  </span>
                </Label>
                <Input
                  id="patient-first-name"
                  className="rounded-none"
                  value={formData.firstName}
                  onChange={(e) => onInputChange('firstName', e.target.value)}
                  placeholder="First name..."
                  aria-invalid={!!firstNameError}
                  aria-describedby={firstNameError ? 'patient-first-name-error' : undefined}
                />
                {firstNameError && (
                  <p id="patient-first-name-error" className="text-destructive text-xs mt-1">
                    {firstNameError}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="patient-last-name" className="section-label mb-1.5 min-h-[2rem] flex flex-col justify-end">
                  <span>
                    Last Name<span className="text-destructive ml-0.5" aria-hidden="true">*</span>
                  </span>
                </Label>
                <Input
                  id="patient-last-name"
                  className="rounded-none"
                  value={formData.lastName}
                  onChange={(e) => onInputChange('lastName', e.target.value)}
                  placeholder="Last name..."
                  aria-invalid={!!lastNameError}
                  aria-describedby={lastNameError ? 'patient-last-name-error' : undefined}
                />
                {lastNameError && (
                  <p id="patient-last-name-error" className="text-destructive text-xs mt-1">
                    {lastNameError}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="patient-dob" className="section-label mb-1.5 min-h-[2rem] flex flex-col justify-end">
                  <span>
                    Date of Birth <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
                  </span>
                </Label>
                <Input
                  id="patient-dob"
                  type="date"
                  className="rounded-none font-mono tabular-nums"
                  value={formData.dob || ''}
                  onChange={(e) => onInputChange('dob', e.target.value)}
                />
              </div>
            </div>
            <div className="pt-2 border-t border-border flex items-center gap-4">
              <Label htmlFor="visit-date" className="whitespace-nowrap text-sm font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" aria-hidden="true" /> Visit Date:<span className="text-destructive ml-0.5" aria-hidden="true">*</span>
              </Label>
              <Input
                id="visit-date"
                type="date"
                aria-describedby={visitDateError ? 'visit-date-error' : 'visit-date-hint'}
                className="max-w-[200px] font-mono tabular-nums rounded-none"
                value={formData.visitDate}
                onChange={(e) => onInputChange('visitDate', e.target.value)}
                aria-invalid={!!visitDateError}
              />
              <span id="visit-date-hint" className="sr-only">
                Enter the date when the patient visited for testing
              </span>
              {visitDateError && (
                <p id="visit-date-error" className="text-destructive text-xs">
                  {visitDateError}
                </p>
              )}
            </div>
          </div>
        ) : (
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
                aria-describedby={visitDateError ? 'visit-date-error' : 'visit-date-hint'}
                className="w-full md:max-w-[200px] font-mono tabular-nums rounded-none"
                value={formData.visitDate}
                onChange={(e) => onInputChange('visitDate', e.target.value)}
                aria-invalid={!!visitDateError}
              />
              <span id="visit-date-hint" className="sr-only">
                Enter the date when the patient visited for testing
              </span>
              {visitDateError && (
                <p id="visit-date-error" className="text-destructive text-xs">
                  {visitDateError}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
