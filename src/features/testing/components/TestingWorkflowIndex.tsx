import React from 'react';
import {
  User,
  TestTube2,
  Syringe,
  Activity,
  FileCheck2,
  ClipboardList,
  Save,
  Eye,
  Clock,
  Circle,
  MinusCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { LogFormData } from '@shared/types';
import { cn } from '@shared/utils';
import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui';
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

export interface TestingWorkflowIndexProps {
  activeIndex: number;
  onSelectSection: (index: number) => void;
  formData: LogFormData;
  isDirectEntry?: boolean;
  className?: string;
  variant?: 'rail' | 'mobile';
}

type StatusIconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface StatusPresentation {
  Icon: StatusIconComponent;
  className: string;
}

const getStatusPresentation = (
  status: SectionStatus,
  isActive: boolean
): StatusPresentation => {
  if (isActive) {
    return { Icon: getStatusIcon(status), className: 'text-workflow-active-foreground' };
  }

  switch (status) {
    case 'Ready for review':
      return { Icon: Eye, className: 'text-primary' };
    case 'In progress':
      return { Icon: Clock, className: 'text-status-warning' };
    case 'Not included':
      return { Icon: MinusCircle, className: 'text-muted-foreground' };
    case 'Not started':
    default:
      return { Icon: Circle, className: 'text-muted-foreground' };
  }
};

const getStatusIcon = (status: SectionStatus): StatusIconComponent => {
  switch (status) {
    case 'Ready for review':
      return Eye;
    case 'In progress':
      return Clock;
    case 'Not included':
      return MinusCircle;
    case 'Not started':
    default:
      return Circle;
  }
};

interface WorkflowSummaryCounts {
  ready: number;
  needsAttention: number;
  notIncluded: number;
}

const getWorkflowSummary = (statuses: SectionStatus[]): WorkflowSummaryCounts => ({
  ready: statuses.filter(status => status === 'Ready for review').length,
  needsAttention: statuses.filter(status => status === 'Not started' || status === 'In progress').length,
  notIncluded: statuses.filter(status => status === 'Not included').length,
});

interface WorkflowSummaryProps {
  summary: WorkflowSummaryCounts;
  className?: string;
}

const WorkflowSummary: React.FC<WorkflowSummaryProps> = ({ summary, className }) => (
  <p className={cn('text-xs leading-5 text-muted-foreground', className)}>
    <span className="text-primary font-medium">{summary.ready} ready</span>
    <span aria-hidden="true"> · </span>
    <span>{summary.needsAttention} need attention</span>
    <span aria-hidden="true"> · </span>
    <span>{summary.notIncluded} not included</span>
  </p>
);

interface WorkflowSectionListProps {
  activeIndex: number;
  onSelectSection: (index: number) => void;
  statuses: SectionStatus[];
}

const WorkflowSectionList: React.FC<WorkflowSectionListProps> = ({
  activeIndex,
  onSelectSection,
  statuses,
}) => (
  <ol className="list-none m-0 p-0 border-t border-border">
    {WORKFLOW_SECTIONS.map((section, index) => {
      const isActive = activeIndex === index;
      const status = statuses[index];
      const Icon = section.icon;
      const { Icon: StatusIcon, className: statusClassName } = getStatusPresentation(status, isActive);

      return (
        <li key={section.key} className="m-0 p-0 border-b border-border last:border-b-0">
          <button
            type="button"
            onClick={() => onSelectSection(index)}
            aria-current={isActive ? 'step' : undefined}
            aria-label={`${section.number}. ${section.label} (${status})`}
            className={cn(
              'group flex w-full min-h-[44px] items-start gap-3 px-3 py-3 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
              isActive
                ? 'bg-workflow-active text-workflow-active-foreground'
                : 'bg-card text-foreground hover:bg-muted/60'
            )}
          >
            <span
              className={cn(
                'w-5 shrink-0 pt-0.5 font-mono text-sm tabular-nums leading-5',
                isActive ? 'text-workflow-active-foreground' : 'text-muted-foreground group-hover:text-foreground'
              )}
            >
              {section.number}
            </span>
            <Icon
              className={cn(
                'mt-0.5 h-5 w-5 shrink-0',
                isActive ? 'text-workflow-active-foreground' : 'text-primary'
              )}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1">
              <span className="block break-words text-sm font-medium leading-5">
                {section.label}
              </span>
              <span className={cn('mt-1 flex items-center gap-1.5 text-xs leading-4', statusClassName)}>
                <StatusIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{status}</span>
              </span>
            </span>
          </button>
        </li>
      );
    })}
  </ol>
);

const getDestinationLabel = (direction: 'Previous' | 'Next', index: number): string => {
  const destinationIndex = direction === 'Previous' ? index - 1 : index + 1;
  const destination = WORKFLOW_SECTIONS[destinationIndex];
  return destination ? `${direction} section: ${destination.label}` : `${direction} section`;
};

export const TestingWorkflowIndex: React.FC<TestingWorkflowIndexProps> = ({
  activeIndex,
  onSelectSection,
  formData,
  isDirectEntry = false,
  className,
  variant = 'rail',
}) => {
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const statuses = React.useMemo(
    () => WORKFLOW_SECTIONS.map(section => deriveSectionStatus(section.key, formData, isDirectEntry)),
    [formData, isDirectEntry]
  );
  const summary = React.useMemo(() => getWorkflowSummary(statuses), [statuses]);
  const activeSection = WORKFLOW_SECTIONS[activeIndex] ?? WORKFLOW_SECTIONS[0];
  const activeStatus = statuses[activeIndex] ?? statuses[0];
  const ActiveStatusIcon = getStatusPresentation(activeStatus, false).Icon;
  const activeStatusClassName = getStatusPresentation(activeStatus, false).className;
  const lastSectionIndex = WORKFLOW_SECTIONS.length - 1;

  if (variant === 'mobile') {
    return (
      <nav aria-label="Testing Workflow Sections" className={cn('print:hidden select-none', className)}>
        <div className="border border-border bg-card p-3 shadow-sm rounded-none">
          <div className="min-w-0">
            <div className="text-xs font-semibold tracking-wide text-muted-foreground">
              Section {activeIndex + 1} of {WORKFLOW_SECTIONS.length}
            </div>
            <div className="mt-1 break-words text-base font-semibold leading-5 text-foreground">
              {activeSection.label}
            </div>
            <div className={cn('mt-2 flex items-center gap-1.5 text-xs leading-4', activeStatusClassName)}>
              <ActiveStatusIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{activeStatus}</span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSelectSection(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
              className="min-h-[44px] min-w-[44px] rounded-none px-2"
              aria-label={getDestinationLabel('Previous', activeIndex)}
            >
              <ChevronLeft data-icon aria-hidden="true" />
              <span className="sr-only">Previous section</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSelectSection(Math.min(lastSectionIndex, activeIndex + 1))}
              disabled={activeIndex === lastSectionIndex}
              className="min-h-[44px] min-w-[44px] rounded-none px-2"
              aria-label={getDestinationLabel('Next', activeIndex)}
            >
              <ChevronRight data-icon aria-hidden="true" />
              <span className="sr-only">Next section</span>
            </Button>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-[44px] flex-1 rounded-none px-3 sm:flex-none"
                >
                  All sections
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="max-h-[85vh] rounded-none px-0 pb-0 pt-5 sm:px-0"
              >
                <SheetHeader className="px-4 text-left sm:px-5">
                  <SheetTitle>All workflow sections</SheetTitle>
                  <SheetDescription>
                    Choose a section to continue the clinical record.
                  </SheetDescription>
                  <WorkflowSummary summary={summary} className="pt-1" />
                </SheetHeader>
                <div className="mt-4 overflow-y-auto border-t border-border">
                  <WorkflowSectionList
                    activeIndex={activeIndex}
                    statuses={statuses}
                    onSelectSection={index => {
                      setSheetOpen(false);
                      onSelectSection(index);
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Testing Workflow Sections"
      className={cn('print:hidden select-none', className)}
    >
      <div className="border-b border-border px-3 pb-3">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-semibold tracking-wide text-foreground">Workflow</span>
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {activeIndex + 1} of {WORKFLOW_SECTIONS.length}
          </span>
        </div>
        <WorkflowSummary summary={summary} className="mt-1" />
      </div>
      <WorkflowSectionList
        activeIndex={activeIndex}
        statuses={statuses}
        onSelectSection={onSelectSection}
      />
    </nav>
  );
};

export default TestingWorkflowIndex;
