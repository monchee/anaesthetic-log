import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import {
  Save,
  AlertTriangle,
  FileCheck2,
  User,
  TestTube2,
  Syringe,
  Activity,
  ClipboardList,
  Edit3,
} from 'lucide-react';
import { LogFormData } from '@shared/types';
import { SKIN_TEST_POSITIVE_THRESHOLD } from '@shared/utils/constants';
import { ValidationErrorLink } from './SaveActionSection';

interface ReviewSaveSectionProps {
  formData: LogFormData;
  isDirectEntry?: boolean;
  validationErrors: ValidationErrorLink[];
  errorSummaryRef: React.RefObject<HTMLDivElement | null>;
  onSave: () => void;
  onJumpToSection: (sectionIndex: number, fieldId?: string) => void;
}

export const ReviewSaveSection: React.FC<ReviewSaveSectionProps> = ({
  formData,
  isDirectEntry: _isDirectEntry = false,
  validationErrors,
  errorSummaryRef,
  onSave,
  onJumpToSection,
}) => {
  const positiveWheals = (formData.testPanel || []).filter(
    r => parseFloat(r.sptWheal) >= SKIN_TEST_POSITIVE_THRESHOLD
  );

  return (
    <div className="space-y-6 animate-section-reveal">
      <Card className="rounded-none shadow-sm">
        <CardHeader className="pb-3 border-b border-border bg-card">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <div className="bg-primary/10 dark:bg-primary/20 p-1.5 rounded-none">
              <FileCheck2 className="w-4 h-4 text-primary" />
            </div>
            Review Testing Session & Save
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Validation Error Alert */}
          {validationErrors.length > 0 && (
            <div
              ref={errorSummaryRef}
              role="alert"
              tabIndex={-1}
              className="rounded-none border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive space-y-2 outline-none focus-visible:ring-2 focus-visible:ring-destructive"
            >
              <div className="flex items-center gap-2 font-bold text-destructive">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Please fix the following issues before saving:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs">
                {validationErrors.map((error, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => {
                        const lower = error.message.toLowerCase();
                        if (lower.includes('mrn') || lower.includes('name') || lower.includes('visit')) {
                          onJumpToSection(0, error.fieldId);
                        } else if (lower.includes('challenge')) {
                          onJumpToSection(2, error.fieldId);
                        } else if (lower.includes('drug') || lower.includes('test') || lower.includes('panel')) {
                          onJumpToSection(1, error.fieldId);
                        } else {
                          onJumpToSection(4, error.fieldId);
                        }
                      }}
                      className="underline underline-offset-2 hover:text-destructive/80 font-medium text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-destructive"
                    >
                      {error.message}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section Summaries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Patient & Visit */}
            <div className="p-4 border border-border bg-muted/30 rounded-none space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-border pb-1 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" /> 1. Patient & Visit
                  </span>
                  <button
                    type="button"
                    onClick={() => onJumpToSection(0)}
                    className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <div className="text-sm space-y-1 text-foreground">
                  <p>
                    <strong>Name:</strong> {formData.lastName || '—'}, {formData.firstName || '—'}
                  </p>
                  <p>
                    <strong>MRN:</strong> <span className="font-mono">{formData.mrn || '—'}</span>
                  </p>
                  <p>
                    <strong>Visit Date:</strong> {formData.visitDate || '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. SPT & IDT */}
            <div className="p-4 border border-border bg-muted/30 rounded-none space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-border pb-1 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <TestTube2 className="w-3.5 h-3.5 text-primary" /> 2. SPT & IDT
                  </span>
                  <button
                    type="button"
                    onClick={() => onJumpToSection(1)}
                    className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <div className="text-sm space-y-1 text-foreground">
                  <p>
                    <strong>Drugs in Panel:</strong> {formData.testPanel?.length || 0}
                  </p>
                  <p>
                    <strong>Controls:</strong> Histamine ({formData.controls?.histamineSpt || '—'} mm) / Saline ({formData.controls?.salineSpt || '—'} mm)
                  </p>
                  {positiveWheals.length > 0 && (
                    <p className="text-status-danger font-semibold text-xs">
                      ⚠ {positiveWheals.length} positive wheal(s) (≥{SKIN_TEST_POSITIVE_THRESHOLD}mm)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Drug Challenge */}
            <div className="p-4 border border-border bg-muted/30 rounded-none space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-border pb-1 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Syringe className="w-3.5 h-3.5 text-primary" /> 3. Drug Challenge
                  </span>
                  <button
                    type="button"
                    onClick={() => onJumpToSection(2)}
                    className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <div className="text-sm space-y-1 text-foreground">
                  {formData.proceedToChallenge ? (
                    <>
                      <p>
                        <strong>Drug:</strong> {formData.challengeDrug === 'Other' ? formData.challengeDrugCustom : formData.challengeDrug || '—'}
                      </p>
                      <p>
                        <strong>Outcome:</strong> {formData.outcome === 'SUCCESS' ? 'Tolerated (Safe)' : formData.outcome === 'UNSUCCESS' ? 'Reaction Occurred' : 'Not recorded'}
                      </p>
                    </>
                  ) : (
                    <p className="text-muted-foreground italic text-xs">Not included in this session</p>
                  )}
                </div>
              </div>
            </div>

            {/* 4. Serial Serum Tryptase */}
            <div className="p-4 border border-border bg-muted/30 rounded-none space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-border pb-1 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-primary" /> 4. Serial Tryptase
                  </span>
                  <button
                    type="button"
                    onClick={() => onJumpToSection(3)}
                    className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <div className="text-sm space-y-1 text-foreground">
                  {formData.tryptase?.obtained ? (
                    <p>
                      <strong>Values:</strong> {formData.tryptase.values?.length || 0} sample(s) recorded
                    </p>
                  ) : (
                    <p className="text-muted-foreground italic text-xs">Not obtained or pending</p>
                  )}
                </div>
              </div>
            </div>

            {/* 5. Assessment & Plan */}
            <div className="p-4 border border-border bg-muted/30 rounded-none space-y-2 col-span-full">
              <div className="flex items-center justify-between border-b border-border pb-1 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-primary" /> 5. Assessment & Plan
                </span>
                <button
                  type="button"
                  onClick={() => onJumpToSection(4)}
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {formData.plan?.trim() || <span className="text-muted-foreground italic">No plan entered</span>}
              </p>
            </div>

            {/* 6. Nursing Notes */}
            {formData.nurseNotes && (
              <div className="p-4 border border-border bg-muted/30 rounded-none space-y-2 col-span-full">
                <div className="flex items-center justify-between border-b border-border pb-1 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5 text-primary" /> 6. Nursing Notes
                  </span>
                  <button
                    type="button"
                    onClick={() => onJumpToSection(5)}
                    className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Nursing documentation recorded {formData.nurseNotes.signedBy ? `by ${formData.nurseNotes.signedBy}` : ''}.
                </p>
              </div>
            )}
          </div>

          {/* Primary Save Button */}
          <div className="pt-4 border-t border-border">
            <Button
              onClick={onSave}
              size="lg"
              className="w-full py-6 text-lg rounded-none bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Save className="w-5 h-5 mr-2" /> Save Clinical Record
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewSaveSection;
