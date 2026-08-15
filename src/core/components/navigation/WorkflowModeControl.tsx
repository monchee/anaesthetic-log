import React from 'react';
import { UserCheck, Stethoscope } from 'lucide-react';
import { WorkflowMode } from '@core/hooks/useWorkflowMode';

interface WorkflowModeControlProps {
  mode: WorkflowMode;
  onChange: (mode: WorkflowMode) => void;
  className?: string;
  compact?: boolean;
}

export const WorkflowModeControl: React.FC<WorkflowModeControlProps> = ({
  mode,
  onChange,
  className = '',
  compact = false,
}) => {
  return (
    <div
      className={`flex flex-col gap-1.5 ${className}`}
      role="group"
      aria-label="Workflow view selection"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Workflow view
        </span>
        <span
          className="text-[11px] text-muted-foreground cursor-help"
          title="Changes task order only. Does not change access or clinical data."
        >
          Task order only
        </span>
      </div>

      <div
        className="grid grid-cols-2 p-0.5 bg-muted/60 dark:bg-muted/40 border border-border rounded-none"
        role="radiogroup"
        aria-label="Workflow view mode"
      >
        <button
          type="button"
          role="radio"
          aria-checked={mode === 'clinician'}
          onClick={() => onChange('clinician')}
          className={`min-h-[44px] ${compact ? 'sm:min-h-[36px]' : 'min-h-[40px]'} px-3 py-1.5 text-xs font-semibold rounded-none transition-all flex items-center justify-center gap-1.5 btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
            mode === 'clinician'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Clinician</span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={mode === 'nurse'}
          onClick={() => onChange('nurse')}
          className={`min-h-[44px] ${compact ? 'sm:min-h-[36px]' : 'min-h-[40px]'} px-3 py-1.5 text-xs font-semibold rounded-none transition-all flex items-center justify-center gap-1.5 btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
            mode === 'nurse'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Nurse</span>
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground leading-tight">
        Changes task order only and not access or clinical data.
      </p>
    </div>
  );
};
