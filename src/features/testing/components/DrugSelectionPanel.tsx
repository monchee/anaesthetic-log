import React from 'react';
import { Label } from '../../../../components/ui';
import { Check, Plus } from 'lucide-react';
import { CATEGORY_THEMES, DEFAULT_THEME } from '../../../../lib/constants';
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
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
        <Label className="text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">Select Drugs to Test:</Label>
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
            <div key={category} className={`space-y-2 rounded-none p-3 transition-colors duration-300 ${hasActiveSelection ? `${theme.activeBg} ${theme.activeRing} ring-1` : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}>
              <div className={`flex justify-between items-center border-b border-dashed pb-1 mb-2 ${hasActiveSelection ? `${theme.headerBorder}` : 'border-slate-200 dark:border-slate-800'}`}>
                <h4 className={`text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${hasActiveSelection ? theme.headerText : 'text-slate-500 dark:text-slate-400'}`}>
                  {category}
                  {hasActiveSelection && <span className={`flex h-1.5 w-1.5 rounded-none ${theme.pulse} animate-pulse`}></span>}
                </h4>
                <button 
                  onClick={(e) => { e.preventDefault(); onToggleCategory(categoryDrugs); }}
                  className={`text-[10px] hover:underline font-medium transition-colors ${hasActiveSelection ? theme.actionText : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
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
                      className={`text-xs px-2.5 py-1.5 rounded border transition-all duration-200 flex items-center gap-1.5 text-left ${
                        isSelected 
                        ? theme.btnSelected
                        : `bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 ${theme.btnHover}`
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
                    className={`text-xs px-2.5 py-1.5 rounded border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 flex items-center gap-1.5 font-medium ${theme.btnHover}`}
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
