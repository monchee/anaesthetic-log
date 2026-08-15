import React from 'react';
import {
  User,
  TestTube2,
  Syringe,
  Activity,
  FileCheck2,
  ClipboardList,
  Save,
  CheckCircle2,
  Clock,
  Circle,
  MinusCircle,
} from 'lucide-react';
import { LogFormData } from '@/types';
import { cn } from '@shared/utils';
import { testingService } from '../services/TestingService';

export type TestingWorkflowSectionKey =
  | 'patient-visit'
  | 'spt-idt'
  | 'drug-challenge'
  | 'tryptase'
  | 'assessment-plan'
  | 'nursing-notes'
  | 'review-save';

export type SectionStatus = 'Not started' | 'In progress' | 'Ready for review' | 'Not included';

export interface WorkflowSectionMeta {
  key: TestingWorkflowSectionKey;
  number: number;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const WORKFLOW_SECTIONS: WorkflowSectionMeta[] = [
  { key: 'patient-visit', number: 1, label: 'Patient and visit', shortLabel: 'Patient', icon: User },
  { key: 'spt-idt', number: 2, label: 'SPT and IDT', shortLabel: 'SPT/IDT', icon: TestTube2 },
  { key: 'drug-challenge', number: 3, label: 'Drug challenge', shortLabel: 'Challenge', icon: Syringe },
  { key: 'tryptase', number: 4, label: 'Serial serum tryptase', shortLabel: 'Tryptase', icon: Activity },
  { key: 'assessment-plan', number: 5, label: 'Assessment and plan', shortLabel: 'Plan', icon: FileCheck2 },
  { key: 'nursing-notes', number: 6, label: 'Nursing notes', shortLabel: 'Nursing', icon: ClipboardList },
  { key: 'review-save', number: 7, label: 'Review and save', shortLabel: 'Save', icon: Save },
];

export function deriveSectionStatus(
  sectionKey: TestingWorkflowSectionKey,
  formData: LogFormData,
  _isDirectEntry = false
): SectionStatus {
  switch (sectionKey) {
    case 'patient-visit': {
      const hasMrn = Boolean(formData.mrn?.trim());
      const hasFirstName = Boolean(formData.firstName?.trim());
      const hasLastName = Boolean(formData.lastName?.trim());
      const hasVisitDate = Boolean(formData.visitDate?.trim());
      const count = [hasMrn, hasFirstName, hasLastName, hasVisitDate].filter(Boolean).length;

      if (count === 4) return 'Ready for review';
      if (count > 0) return 'In progress';
      return 'Not started';
    }

    case 'spt-idt': {
      const controls = formData.controls;
      const hasAllControls = Boolean(
        controls?.histamineSpt?.trim() && controls?.salineSpt?.trim() && controls?.salineIdt?.trim()
      );
      const hasAnyControl = Boolean(
        controls?.histamineSpt?.trim() || controls?.salineSpt?.trim() || controls?.salineIdt?.trim()
      );

      const rows = formData.testPanel || [];
      const hasRows = rows.length > 0;
      const allOtherRowsNamed = rows.every(
        row => row.drugName !== 'Other' || Boolean(row.customName?.trim())
      );
      const hasAnyUnregisteredOther = rows.some(
        row => row.drugName === 'Other' && !row.customName?.trim()
      );
      const rowsWithResults = rows.filter(
        row => Boolean(row.sptWheal?.trim()) || (row.idtResults || []).some(r => Boolean(r?.trim()))
      );
      const hasAnyResults = rowsWithResults.length > 0;

      if (hasRows && allOtherRowsNamed && hasAllControls && hasAnyResults) {
        return 'Ready for review';
      }
      if (hasAnyControl || hasAnyResults || hasAnyUnregisteredOther) {
        return 'In progress';
      }
      return 'Not started';
    }

    case 'drug-challenge': {
      if (!formData.proceedToChallenge) return 'Not included';
      const hasDrug = Boolean(formData.challengeDrug && (formData.challengeDrug !== 'Other' || formData.challengeDrugCustom?.trim()));
      const hasOutcome = Boolean(formData.outcome);
      if (hasDrug && hasOutcome) {
        if (formData.outcome === 'UNSUCCESS') {
          const hasReactionTime = Boolean(formData.reactionTime?.trim());
          const hasSymptoms = (formData.symptoms?.length ?? 0) > 0;
          return (hasReactionTime && hasSymptoms) ? 'Ready for review' : 'In progress';
        }
        return 'Ready for review';
      }
      return 'In progress';
    }

    case 'tryptase': {
      if (!formData.tryptase?.obtained && (!formData.tryptase?.values || formData.tryptase.values.length === 0)) {
        return 'Not included';
      }
      if (formData.tryptase?.obtained) {
        const values = formData.tryptase.values || [];
        const hasValidValues = values.length > 0 && values.some(
          v => Boolean(v.time?.trim()) && Boolean(v.result?.trim())
        );
        return hasValidValues ? 'Ready for review' : 'In progress';
      }
      return 'Not included';
    }

    case 'assessment-plan': {
      return formData.plan?.trim() ? 'Ready for review' : 'Not started';
    }

    case 'nursing-notes': {
      const notes = formData.nurseNotes;
      if (!notes || (!notes.preTesting?.trim() && !notes.duringTesting?.trim() && !notes.postTesting?.trim() && !notes.signedBy?.trim())) {
        return 'Not included';
      }
      if (notes.signedBy?.trim()) {
        return 'Ready for review';
      }
      return 'In progress';
    }

    case 'review-save': {
      const validation = testingService.validateForm(formData);
      return validation.isValid ? 'Ready for review' : 'In progress';
    }

    default:
      return 'Not started';
  }
}

interface TestingWorkflowIndexProps {
  activeIndex: number;
  onSelectSection: (index: number) => void;
  formData: LogFormData;
  isDirectEntry?: boolean;
  className?: string;
}

export const TestingWorkflowIndex: React.FC<TestingWorkflowIndexProps> = ({
  activeIndex,
  onSelectSection,
  formData,
  isDirectEntry = false,
  className,
}) => {
  const getStatusIcon = (status: SectionStatus) => {
    switch (status) {
      case 'Ready for review':
        return <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0" aria-hidden="true" />;
      case 'In progress':
        return <Clock className="w-3.5 h-3.5 text-status-warning shrink-0" aria-hidden="true" />;
      case 'Not included':
        return <MinusCircle className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" aria-hidden="true" />;
      case 'Not started':
      default:
        return <Circle className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" aria-hidden="true" />;
    }
  };

  const getStatusBadgeStyle = (status: SectionStatus) => {
    switch (status) {
      case 'Ready for review':
        return 'text-status-success border-status-success/40 bg-status-success/10';
      case 'In progress':
        return 'text-status-warning border-status-warning/40 bg-status-warning/10';
      case 'Not included':
        return 'text-muted-foreground/70 border-border bg-muted/40';
      case 'Not started':
      default:
        return 'text-muted-foreground border-border bg-card';
    }
  };

  return (
    <nav
      aria-label="Testing Workflow Sections"
      className={cn('space-y-1 print:hidden select-none', className)}
    >
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 py-1.5 flex items-center justify-between border-b border-border mb-2">
        <span>Workflow Sections</span>
        <span className="font-mono text-xs tabular-nums text-foreground">
          Section {activeIndex + 1} of 7
        </span>
      </div>

      <ol className="space-y-1 list-none p-0 m-0">
        {WORKFLOW_SECTIONS.map((section, index) => {
          const isActive = activeIndex === index;
          const status = deriveSectionStatus(section.key, formData, isDirectEntry);
          const Icon = section.icon;

          return (
            <li key={section.key} className="m-0 p-0">
              <button
                type="button"
                onClick={() => onSelectSection(index)}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`${section.number}. ${section.label} (${status})`}
                className={cn(
                  'w-full text-left min-h-[44px] px-3 py-2.5 rounded-none flex items-center justify-between gap-2.5 transition-all border group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-sm'
                    : 'bg-card text-foreground/90 border-border hover:bg-muted/70 hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={cn(
                      'flex items-center justify-center w-6 h-6 rounded-none text-xs font-mono font-bold shrink-0',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-muted text-muted-foreground group-hover:text-foreground'
                    )}
                  >
                    {section.number}
                  </span>
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0',
                      isActive ? 'text-primary-foreground' : 'text-primary'
                    )}
                    aria-hidden="true"
                  />
                  <span className="text-sm truncate">{section.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={cn(
                      'text-xs uppercase font-semibold tracking-wider px-1.5 py-0.5 border rounded-none hidden sm:inline-flex items-center gap-1',
                      isActive
                        ? 'bg-white/15 text-white border-white/30'
                        : getStatusBadgeStyle(status)
                    )}
                  >
                    {status}
                  </span>
                  {!isActive && getStatusIcon(status)}
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default TestingWorkflowIndex;
