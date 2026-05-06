import React, { useState } from 'react';
import { Input } from '../../../../components/ui';
import { X, Plus } from 'lucide-react';
import { DrugTestRow, DrugProtocol } from '../../../../types';
import { CATEGORY_THEMES, DEFAULT_THEME } from '@shared/utils/constants';
import { getSkinProtocolsForDrug } from '@shared/data/drugMasterlist';

interface DrugTestGridProps {
  testPanel: DrugTestRow[];
  drugToCategoryMap: Record<string, string>;
  onUpdate: (index: number, field: string, value: string) => void;
  onSelectProtocol: (rowIndex: number, protocolIndex: number) => void;
  onRemove: (index: number) => void;
  onAddCustomIdtStep: (rowIndex: number) => void;
  onRemoveCustomIdtStep: (rowIndex: number, stepIndex: number) => void;
}

const preventNegativeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault();
};

const isPositive = (v: string) => (parseInt(v) || 0) >= 3;

interface DrugRowProps {
  row: DrugTestRow;
  index: number;
  protocol: DrugProtocol | null;
  allProtocols: DrugProtocol[];
  drugToCategoryMap: Record<string, string>;
  onUpdate: (index: number, field: string, value: string) => void;
  onSelectProtocol: (rowIndex: number, protocolIndex: number) => void;
  onRemove: (index: number) => void;
  onAddCustomIdtStep: (rowIndex: number) => void;
  onRemoveCustomIdtStep: (rowIndex: number, stepIndex: number) => void;
}

const DrugRow = React.memo(({
  row, index, protocol, allProtocols, drugToCategoryMap, onUpdate, onSelectProtocol, onRemove, onAddCustomIdtStep, onRemoveCustomIdtStep,
}: DrugRowProps) => {
  const category = drugToCategoryMap[row.drugName] || 'Others';
  const theme = CATEGORY_THEMES[category] || DEFAULT_THEME;
  const borderClass = row.drugName === 'Other' ? DEFAULT_THEME.rowBorder : theme.rowBorder;
  const protocolIndex = row.protocolIndex ?? 0;
  const [showProtocols, setShowProtocols] = useState(false);

  // Resolve IDT results — handle legacy records that came in via migration
  const idtResults = row.idtResults ?? [];
  const idtSteps = row.drugName === 'Other'
    ? (row.customIdtSteps ?? [])
    : (protocol?.idtSteps ?? []);

  return (
    <div className={`p-4 md:p-3 bg-background border border-border border-l-[6px] ${borderClass} shadow-sm rounded-none group space-y-3`}>
      {/* Drug name row */}
      <div className="flex items-center gap-2">
        {row.drugName === 'Other' ? (
          <Input
            className="h-9 text-sm flex-1 min-w-0 font-medium font-mono"
            placeholder="Specify name..."
            value={row.customName || ''}
            onChange={(e) => onUpdate(index, 'customName', e.target.value)}
            autoFocus
          />
        ) : (
          <span className="font-medium text-sm text-slate-700 dark:text-foreground/90 flex-1">
            {row.drugName}
            {protocol?.presentation && (
              <span className="ml-1.5 text-xs text-muted-foreground font-normal">({protocol.presentation})</span>
            )}
          </span>
        )}
        <button
          onClick={() => onRemove(index)}
          className={`shrink-0 text-slate-300 hover:text-red-500 transition-opacity p-1 ${row.drugName === 'Other' ? 'opacity-100' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'}`}
          title="Remove drug"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Custom drug protocol configuration */}
      {row.drugName === 'Other' && (
        <div className="border border-dashed border-border p-2 space-y-2 bg-slate-50/50 dark:bg-card/30">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground shrink-0 w-7">SPT</span>
            <Input
              className="h-7 text-xs flex-1"
              placeholder="Neat concentration (e.g. 10mg/mL)..."
              value={row.customSptConcentration || ''}
              onChange={(e) => onUpdate(index, 'customSptConcentration', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">IDT Dilutions</div>
            {(row.customIdtSteps ?? []).map((step, si) => (
              <div key={si} className="flex items-center gap-1.5">
                <Input
                  className="h-7 text-xs flex-1"
                  placeholder="Ratio (e.g. 1:100)"
                  value={step.ratio}
                  onChange={(e) => onUpdate(index, `customIdtStep_ratio_${si}`, e.target.value)}
                />
                <Input
                  className="h-7 text-xs flex-1"
                  placeholder="Conc. (e.g. 0.1mg/mL)"
                  value={step.concentration}
                  onChange={(e) => onUpdate(index, `customIdtStep_concentration_${si}`, e.target.value)}
                />
                <button
                  onClick={() => onRemoveCustomIdtStep(index, si)}
                  className="shrink-0 text-slate-300 hover:text-red-500 transition-colors"
                  title="Remove step"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              onClick={() => onAddCustomIdtStep(index)}
              className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add IDT dilution step
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`challenge-${index}`}
              checked={row.includeInChallenge || false}
              onChange={(e) => onUpdate(index, 'includeInChallenge', e.target.checked.toString())}
              className="w-3.5 h-3.5 accent-primary"
            />
            <label htmlFor={`challenge-${index}`} className="text-xs text-muted-foreground cursor-pointer select-none">
              Include in drug challenge
            </label>
          </div>
        </div>
      )}

      {/* Protocol picker — collapsed by default when multiple protocols exist */}
      {allProtocols.length > 1 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          {showProtocols ? (
            <>
              {allProtocols.map((p, pi) => (
                <button
                  key={pi}
                  onClick={() => { setShowProtocols(false); onSelectProtocol(index, pi); }}
                  className={`text-[10px] px-2 py-0.5 rounded-none border transition-all ${
                    pi === protocolIndex
                      ? `${theme.btnSelected}`
                      : `bg-card text-muted-foreground border-border ${theme.btnHover}`
                  }`}
                >
                  {p.protocolLabel || `Protocol ${pi + 1}`}
                </button>
              ))}
              <button
                onClick={() => setShowProtocols(false)}
                className="text-[10px] px-1.5 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowProtocols(true)}
              className={`text-[10px] px-2 py-0.5 rounded-none border bg-card text-muted-foreground border-border hover:bg-muted transition-all ${theme.btnHover}`}
            >
              {allProtocols.length} protocols ▾
            </button>
          )}
        </div>
      )}

      {/* SPT concentration reference */}
      {protocol?.sptNeatConcentration && (
        <div className="text-[10px] text-muted-foreground">
          <span className="font-semibold uppercase tracking-wide">SPT Preparation: </span>
          {protocol.sptNeatConcentration}
        </div>
      )}

      {/* Result inputs grid */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${1 + idtSteps.length}, minmax(0, 1fr))` }}>
        {/* SPT */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase text-center text-muted-foreground">SPT</div>
          <div className="text-[9px] text-center text-muted-foreground/60 leading-tight min-h-[2rem] flex items-center justify-center">
            {row.drugName === 'Other' ? (row.customSptConcentration || '') : (protocol?.sptNeatConcentration ? 'Neat' : '')}
          </div>
          <Input
            type="text"
            inputMode="decimal"
            pattern="[0-9]*"
            onKeyDown={preventNegativeInput}
            className={`h-9 text-center font-mono ${isPositive(row.sptWheal) ? 'text-red-600 font-bold bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50' : ''}`}
            placeholder="-"
            value={row.sptWheal}
            onChange={(e) => onUpdate(index, 'sptWheal', e.target.value)}
          />
        </div>

        {/* IDT steps */}
        {idtSteps.map((step, si) => {
          const val = idtResults[si] ?? '';
          return (
            <div key={si} className="space-y-1">
              <div className="text-[10px] font-bold uppercase text-center text-muted-foreground">IDT {step.ratio}</div>
              <div className="text-[9px] text-center text-muted-foreground/60 leading-tight min-h-[2rem] flex items-center justify-center">
                {step.concentration}
              </div>
              <Input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*"
                onKeyDown={preventNegativeInput}
                className={`h-9 text-center font-mono ${isPositive(val) ? 'text-red-600 font-bold bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50' : ''}`}
                placeholder="-"
                value={val}
                onChange={(e) => onUpdate(index, `idt_${si}`, e.target.value)}
              />
            </div>
          );
        })}

        {/* Legacy fallback: show 3 unlabelled IDT columns if old record with no protocol */}
        {idtSteps.length === 0 && !protocol && idtResults.length > 0 && idtResults.map((val, si) => (
          <div key={si} className="space-y-1">
            <div className="text-[10px] font-bold uppercase text-center text-muted-foreground">IDT {si + 1}</div>
            <div className="min-h-[2rem]" />
            <Input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*"
              onKeyDown={preventNegativeInput}
              className={`h-9 text-center font-mono ${isPositive(val) ? 'text-red-600 font-bold bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50' : ''}`}
              placeholder="-"
              value={val}
              onChange={(e) => onUpdate(index, `idt_${si}`, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Notes */}
      <Input
        className="h-8 text-xs text-muted-foreground"
        placeholder="Notes..."
        value={row.notes || ''}
        onChange={(e) => onUpdate(index, 'notes', e.target.value)}
      />
    </div>
  );
});

DrugRow.displayName = 'DrugRow';

export const DrugTestGrid: React.FC<DrugTestGridProps> = ({
  testPanel, drugToCategoryMap, onUpdate, onSelectProtocol, onRemove, onAddCustomIdtStep, onRemoveCustomIdtStep,
}) => {
  if (testPanel.length === 0) {
    return (
      <div className="text-center py-10 bg-card rounded-none border border-dashed border-border">
        <p className="text-muted-foreground text-sm">No drugs selected. Choose a category above to begin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
      {testPanel.map((row, index) => {
        const allProtocols = getSkinProtocolsForDrug(row.drugName);
        const protocol = allProtocols[row.protocolIndex ?? 0] ?? null;
        return (
          <DrugRow
            key={row.id || `${row.drugName}-${index}`}
            row={row}
            index={index}
            protocol={protocol}
            allProtocols={allProtocols}
            drugToCategoryMap={drugToCategoryMap}
            onUpdate={onUpdate}
            onSelectProtocol={onSelectProtocol}
            onRemove={onRemove}
            onAddCustomIdtStep={onAddCustomIdtStep}
            onRemoveCustomIdtStep={onRemoveCustomIdtStep}
          />
        );
      })}
    </div>
  );
};
