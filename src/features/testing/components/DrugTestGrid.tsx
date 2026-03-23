import React from 'react';
import { Input } from '../../../../components/ui';
import { X } from 'lucide-react';
import { DrugTestRow } from '../../../../types';
import { CATEGORY_THEMES, DEFAULT_THEME } from '../../../../lib/constants';

interface DrugTestGridProps {
  testPanel: DrugTestRow[];
  drugToCategoryMap: Record<string, string>;
  onUpdate: (index: number, field: string, value: string) => void;
  onRemove: (index: number) => void;
}

const FIELD_LABELS: Record<string, string> = {
  sptWheal: 'SPT',
  idt100: '1:100',
  idt10: '1:10',
  idtNeat: 'Neat'
};

const preventNegativeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (["-", "e", "E", "+"].includes(e.key)) {
    e.preventDefault();
  }
};

const DrugRow = React.memo(({
  row,
  index,
  drugToCategoryMap,
  onUpdate,
  onRemove
}: {
  row: DrugTestRow;
  index: number;
  drugToCategoryMap: Record<string, string>;
  onUpdate: (index: number, field: string, value: string) => void;
  onRemove: (index: number) => void;
}) => {
  const category = drugToCategoryMap[row.drugName] || 'Others';
  const theme = CATEGORY_THEMES[category] || DEFAULT_THEME;
  const borderClass = row.drugName === 'Other' ? DEFAULT_THEME.rowBorder : theme.rowBorder;

  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-[1fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-x-3 gap-y-4 md:gap-2 p-4 md:p-3 items-start md:items-center bg-background border border-border border-l-[6px] ${borderClass} shadow-sm rounded-none group`}
    >
      {/* Name Column */}
      <div className="col-span-2 md:col-span-1 flex items-center gap-2">
        {row.drugName === 'Other' ? (
          <Input
            className="h-10 md:h-9 text-sm flex-1 min-w-0 font-medium font-mono"
            placeholder="Specify name..."
            value={row.customName || ''}
            onChange={(e) => onUpdate(index, 'customName', e.target.value)}
            autoFocus
          />
        ) : (
          <span className="font-medium text-sm text-slate-700 dark:text-foreground/90 flex-1">
            {row.drugName}
          </span>
        )}

        <button
          onClick={() => onRemove(index)}
          className={`shrink-0 text-slate-300 hover:text-red-500 transition-opacity p-2 md:p-1 ${row.drugName === 'Other' ? 'opacity-100' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'}`}
          title="Remove drug"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Result Columns */}
      <div className="col-span-2 md:col-span-4 grid grid-cols-4 gap-2">
        {['sptWheal', 'idt100', 'idt10', 'idtNeat'].map((field) => (
          <div key={field} className="relative">
            <span className="md:hidden text-[10px] text-slate-400 absolute -top-3 left-0 uppercase font-bold">{FIELD_LABELS[field]}</span>
            <Input
              type="number"
              min="0"
              onKeyDown={preventNegativeInput}
              className={`h-9 text-center font-mono ${parseInt((row as any)[field]) >= 3 ? 'text-red-600 font-bold bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50' : ''}`}
              placeholder="-"
              value={(row as any)[field]}
              onChange={(e) => onUpdate(index, field, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

DrugRow.displayName = 'DrugRow';

export const DrugTestGrid: React.FC<DrugTestGridProps> = ({
  testPanel,
  drugToCategoryMap,
  onUpdate,
  onRemove
}) => {
  if (testPanel.length === 0) {
    return (
      <div className="text-center py-10 bg-card rounded-none border border-dashed border-border">
        <p className="text-muted-foreground text-sm">No drugs selected. Choose a category above to begin.</p>
      </div>
    );
  }

  return (
    <div className="rounded-none overflow-hidden animate-in fade-in slide-in-from-top-2">
      <div className="hidden md:grid md:grid-cols-[1fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-2 p-3 bg-slate-100/50 dark:bg-card/50 text-xs font-bold text-muted-foreground uppercase border-b border-border mb-2 rounded-none text-center">
        <div className="text-left md:text-center">Drug</div>
        <div>SPT</div>
        <div>1:100</div>
        <div>1:10</div>
        <div>Neat</div>
      </div>

      <div className="space-y-3">
        {testPanel.map((row, index) => (
          <DrugRow
            key={row.id || row.drugName}
            row={row}
            index={index}
            drugToCategoryMap={drugToCategoryMap}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
};
