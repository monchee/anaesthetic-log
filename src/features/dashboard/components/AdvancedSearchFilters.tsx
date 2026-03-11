import React from 'react';
import { ChevronDown, ChevronUp, X, Filter, Calendar, Building2, Activity } from 'lucide-react';
import { Button, Badge, Input, Label } from '../../../../components/ui';
import { AdvancedSearchFilters as Filters } from '../hooks/useAdvancedSearch';
import { DRUG_CATEGORIES, CATEGORY_THEMES } from '../../../../lib/constants';

interface AdvancedSearchFiltersProps {
  filters: Filters;
  updateFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  clearFilters: () => void;
  activeFilterCount: number;
  suggestions: {
    procedures: string[];
    hospitals: string[];
    agents: string[];
  };
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
}

const GRADE_OPTIONS = [
  { value: 'I', label: 'Grade I', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  { value: 'II', label: 'Grade II', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
  { value: 'III', label: 'Grade III', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  { value: 'IV', label: 'Grade IV', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  { value: 'ungraded', label: 'Ungraded', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
];

/**
 * Toggle Button Component
 */
export const AdvancedSearchFilters: React.FC<
  Pick<AdvancedSearchFiltersProps, 'isExpanded' | 'setIsExpanded' | 'activeFilterCount' | 'clearFilters'>
> = ({
  isExpanded,
  setIsExpanded,
  activeFilterCount,
  clearFilters,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-9 text-xs"
      >
        <Filter className="w-3.5 h-3.5 mr-1.5" />
        Filters
        {activeFilterCount > 0 && (
          <Badge variant="default" className="ml-2 h-4 px-1.5 text-[10px] bg-primary">
            {activeFilterCount}
          </Badge>
        )}
        {isExpanded ? (
          <ChevronUp className="w-3.5 h-3.5 ml-1" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 ml-1" />
        )}
      </Button>

      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-9 text-xs text-slate-500 hover:text-slate-700"
        >
          <X className="w-3.5 h-3.5 mr-1" />
          Clear All
        </Button>
      )}
    </div>
  );
};

/**
 * Expanded Panel Content Component
 */
export const AdvancedSearchPanel: React.FC<Omit<AdvancedSearchFiltersProps, 'isExpanded' | 'setIsExpanded'>> = ({
  filters,
  updateFilter,
  suggestions,
}) => {
  const toggleGrade = (grade: string) => {
    const newGrades = filters.grades.includes(grade)
      ? filters.grades.filter(g => g !== grade)
      : [...filters.grades, grade];
    updateFilter('grades', newGrades);
  };

  const toggleAgent = (agent: string) => {
    const newAgents = filters.suspectedAgents.includes(agent)
      ? filters.suspectedAgents.filter(a => a !== agent)
      : [...filters.suspectedAgents, agent];
    updateFilter('suspectedAgents', newAgents);
  };

  const getOutcomeStyle = (outcome: string, isSelected: boolean) => {
    if (!isSelected) return 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600';
    
    switch (outcome) {
      case 'all': return 'bg-primary dark:bg-primary text-white shadow-sm';
      case 'completed': return 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm';
      case 'abandoned': return 'bg-rose-600 dark:bg-rose-500 text-white shadow-sm';
      default: return 'bg-primary text-white';
    }
  };

  // Flatten all drugs from all categories
  const allDrugs = Object.entries(DRUG_CATEGORIES).flatMap(([category, drugs]) => 
    drugs.map(drug => ({ drug, category }))
  );

  return (
    <div className="w-full p-4 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      
      {/* Row 1: Reaction Grade and Outcome - Vertically Aligned */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Reaction Grade */}
        <div className="flex flex-col">
          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
            <Activity className="w-3.5 h-3.5" />
            Reaction Grade
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {GRADE_OPTIONS.map(grade => {
              const isSelected = filters.grades.includes(grade.value);
              
              return (
                <button
                  key={grade.value}
                  onClick={() => toggleGrade(grade.value)}
                  className={`
                    px-3 py-1.5 rounded text-xs font-medium transition-all
                    ${isSelected
                      ? `${grade.color} shadow-sm`
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }
                  `}
                >
                  {grade.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Procedure Outcome */}
        <div className="flex flex-col">
          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
            Outcome
          </Label>
          <div className="flex gap-1.5">
            {(['all', 'completed', 'abandoned'] as const).map(outcome => (
              <button
                key={outcome}
                onClick={() => updateFilter('outcomeFilter', outcome)}
                className={`
                  flex-1 px-3 py-1.5 rounded text-xs font-medium transition-all capitalize
                  ${getOutcomeStyle(outcome, filters.outcomeFilter === outcome)}
                `}
              >
                {outcome}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Date Range + Hospital - True Single Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1 min-w-0">
          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-1.5">
            <Calendar className="w-3.5 h-3.5" />
            From
          </Label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => updateFilter('dateFrom', e.target.value)}
            className="h-9 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
          />
        </div>
        <div className="flex-1 min-w-0">
          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-1.5">
            <Calendar className="w-3.5 h-3.5" />
            To
          </Label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => updateFilter('dateTo', e.target.value)}
            className="h-9 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
          />
        </div>
        <div className="flex-1 min-w-0">
          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-1.5">
            <Building2 className="w-3.5 h-3.5" />
            Hospital
          </Label>
          <select
            value={filters.hospital}
            onChange={(e) => updateFilter('hospital', e.target.value)}
            className="w-full h-9 px-3 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary"
          >
            <option value="">All Hospitals</option>
            {suggestions.hospitals.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 3: Suspected Agents - All Drugs Always Visible */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          Suspected Agents
          {filters.suspectedAgents.length > 0 && (
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-primary/10 dark:bg-slate-900/30 text-primary dark:text-primary border-none">
              {filters.suspectedAgents.length}
            </Badge>
          )}
        </Label>
        <div className="flex flex-wrap gap-1">
          {allDrugs.map(({ drug, category }) => {
            const isSelected = filters.suspectedAgents.includes(drug);
            const theme = CATEGORY_THEMES[category];
            
            return (
              <button
                key={drug}
                onClick={() => toggleAgent(drug)}
                className={`
                  px-2.5 py-1 rounded text-xs font-medium transition-all
                  ${isSelected
                    ? theme.btnSelected
                    : `bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300 ${theme.btnHover}`
                  }
                `}
                title={category}
              >
                {drug}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
