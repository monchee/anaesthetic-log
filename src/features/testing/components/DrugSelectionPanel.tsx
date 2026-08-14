import React from 'react';
import { Label } from '../../../../components/ui';
import { Check, Plus } from 'lucide-react';
import { CATEGORY_THEMES, DEFAULT_THEME } from '@shared/utils/constants';
import { DrugTestRow } from '../../../../types';

interface DrugSelectionPanelProps {
  drugCategories: Record<string, string[]>;
  testPanel: DrugTestRow[];
  onToggleDrug: (drug: string) => void;
  onToggleCategory: (drugs: string[]) => void;
  onAddCustomDrug: () => void;
}

export const DrugSelectionPanel: React.FC<DrugSelectionPanelProps> = ({
  drugCategories,
  testPanel,
  onToggleDrug,
  onToggleCategory,
  onAddCustomDrug
}) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex justify-between items-center border-b border-border pb-2">
        <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Select Drugs to Test:</Label>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {Object.entries(drugCategories).map(([category, drugs]) => {
          const categoryDrugs = drugs as string[];
          const hasActiveSelection = categoryDrugs.some(drug => 
            testPanel.some(r => r.drugName === drug && !r.id)
          );
          const allCategorySelected = categoryDrugs.every(drug => 
            testPanel.some(r => r.drugName === drug && !r.id)
          );
          
          const theme = CATEGORY_THEMES[category] || DEFAULT_THEME;

          return (
            <div key={category} className={`space-y-2 rounded-none p-3 transition-colors duration-150 ${hasActiveSelection ? `${theme.activeBg} ${theme.activeRing} ring-1` : 'hover:bg-muted/50'}`}>
              <div className={`flex justify-between items-center border-b border-dashed pb-1 mb-2 ${hasActiveSelection ? `${theme.headerBorder}` : 'border-border'}`}>
                <h4 className={`text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${hasActiveSelection ? theme.headerText : 'text-muted-foreground'}`}>
                  {category}
                  {hasActiveSelection && <span className={`flex h-1.5 w-1.5 rounded-none ${theme.pulse} animate-pulse`}></span>}
                </h4>
                <button 
                  onClick={(e) => { e.preventDefault(); onToggleCategory(categoryDrugs); }}
                  className={`text-xs hover:underline font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${hasActiveSelection ? theme.actionText : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {allCategorySelected ? 'Select None' : 'Select All'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(drugs as string[]).map(drug => {
                  const isSelected = testPanel.some(r => r.drugName === drug && !r.id);
                  return (
                    <button
                      key={drug}
                      onClick={() => onToggleDrug(drug)}
                      aria-pressed={isSelected}
                      className={`text-xs px-2.5 py-1.5 rounded-none border transition-[color,background-color,border-color,box-shadow] duration-150 flex items-center gap-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        isSelected 
                        ? theme.btnSelected
                        : `bg-card text-muted-foreground border-border hover:bg-muted/50 ${theme.btnHover}`
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 shrink-0" />}
                      {drug}
                    </button>
                  );
                })}
                
                {category === 'Others' && (
                  <button
                    onClick={onAddCustomDrug}
                    className={`text-xs px-2.5 py-1.5 rounded-none border border-dashed border-border text-muted-foreground hover:bg-muted/50 transition-[color,background-color,border-color,box-shadow] duration-150 flex items-center gap-1.5 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${theme.btnHover}`}
                  >
                    <Plus className="w-3 h-3 shrink-0" />
                    Other
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
