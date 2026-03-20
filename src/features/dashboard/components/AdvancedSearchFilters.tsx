import React, { useState } from 'react';
import { X, Filter, Calendar, Building2, Activity, Search as SearchIcon } from 'lucide-react';
import { Button, Badge, Input, Label, Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui';
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
  { value: 'I', label: 'Grade I', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  { value: 'II', label: 'Grade II', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800' },
  { value: 'III', label: 'Grade III', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800' },
  { value: 'IV', label: 'Grade IV', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800' },
  { value: 'ungraded', label: 'Ungraded', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700' },
];

export const AdvancedSearchFilters: React.FC<Pick<AdvancedSearchFiltersProps, 'activeFilterCount' | 'isExpanded' | 'setIsExpanded'>> = ({
  activeFilterCount,
  isExpanded,
  setIsExpanded,
}) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setIsExpanded(!isExpanded)}
      className={`h-9 font-medium text-xs border-slate-200 dark:border-slate-800 transition-colors ${
        isExpanded 
          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' 
          : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
      }`}
    >
      <Filter className="w-4 h-4 mr-2" />
      Filters
      {activeFilterCount > 0 && (
        <Badge variant="default" className="ml-2 h-5 px-1.5 min-w-5 justify-center text-[10px] bg-primary text-primary-foreground">
          {activeFilterCount}
        </Badge>
      )}
    </Button>
  );
};

export const AdvancedSearchPanel: React.FC<Omit<AdvancedSearchFiltersProps, 'isExpanded' | 'setIsExpanded'>> = ({
  filters,
  updateFilter,
  clearFilters,
  activeFilterCount,
  suggestions,
}) => {
  const [agentSearch, setAgentSearch] = useState('');
  const [isAgentsExpanded, setIsAgentsExpanded] = useState(false);

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
    if (!isSelected) return 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700';
    
    switch (outcome) {
      case 'all': return 'bg-slate-900 dark:bg-slate-100 text-slate-50 dark:text-slate-900 border-transparent shadow-sm';
      case 'completed': return 'bg-emerald-600 dark:bg-emerald-500 text-white border-transparent shadow-sm';
      case 'abandoned': return 'bg-rose-600 dark:bg-rose-500 text-white border-transparent shadow-sm';
      default: return 'bg-primary text-primary-foreground border-transparent shadow-sm';
    }
  };

  // Flatten all drugs from all categories
  const allDrugs = Object.entries(DRUG_CATEGORIES).flatMap(([category, drugs]) => 
    drugs.map(drug => ({ drug, category }))
  );

  const filteredDrugs = allDrugs.filter(d => d.drug.toLowerCase().includes(agentSearch.toLowerCase()));

  // Active status checks
  const hasGrades = filters.grades.length > 0;
  const isOutcomeActive = filters.outcomeFilter !== 'all';
  const hasDates = !!filters.dateFrom || !!filters.dateTo;
  const hasHospital = !!filters.hospital;
  const hasAgents = filters.suspectedAgents.length > 0;

  const triggerClassName = (isActive: boolean) => `
    h-8 text-xs rounded-none border-dashed transition-all
    ${isActive 
      ? "border-primary/50 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary" 
      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200"
    }
  `;

  return (
    <div className="w-full mt-3 animate-in fade-in duration-200 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* 1. Reaction Severity Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={triggerClassName(hasGrades)}>
              <Activity className="w-3.5 h-3.5 mr-2" />
              Severity
              {hasGrades && (
                <Badge variant="secondary" className="ml-2 px-1 text-[10px] rounded-sm bg-primary/20 text-primary border-none leading-none pt-0.5 h-4">
                  {filters.grades.length}
                </Badge>
              )}
              {!hasGrades && <span className="ml-1 opacity-50">Any</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-4 rounded-none border-slate-200 dark:border-slate-800 shadow-md" align="start">
            <Label className="text-[10px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-[0.1em] mb-3 block opacity-70">
              Reaction Severity
            </Label>
            <div className="grid grid-cols-3 gap-2 w-full">
              {GRADE_OPTIONS.map(grade => {
                const isSelected = filters.grades.includes(grade.value);
                const isUngraded = grade.value === 'ungraded';
                return (
                  <button
                    key={grade.value}
                    onClick={() => toggleGrade(grade.value)}
                    aria-label={grade.label}
                    className={`
                      ${isUngraded ? 'col-span-2' : 'col-span-1'}
                      h-9 rounded-none border text-[10px] font-bold transition-all flex items-center justify-center gap-1
                      ${isSelected
                        ? `${grade.color} ring-1 ring-inset ring-current shadow-sm`
                        : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }
                    `}
                  >
                    {grade.label.replace('Grade ', '')}
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shrink-0" />}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* 2. Procedure Outcome Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={triggerClassName(isOutcomeActive)}>
              Outcome: <span className={`ml-1 ${!isOutcomeActive ? 'opacity-50' : 'capitalize'}`}>{filters.outcomeFilter}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-4 rounded-none border-slate-200 dark:border-slate-800 shadow-md" align="start">
            <Label className="text-[10px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-[0.1em] mb-3 block opacity-70">
              Procedure Outcome
            </Label>
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 h-9">
              {(['all', 'completed', 'abandoned'] as const).map(outcome => (
                <button
                  key={outcome}
                  onClick={() => updateFilter('outcomeFilter', outcome)}
                  className={`
                    flex-1 px-3 text-[10px] font-bold transition-all capitalize whitespace-nowrap flex items-center justify-center
                    ${getOutcomeStyle(outcome, filters.outcomeFilter === outcome)}
                  `}
                >
                  {outcome}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* 3. Date Range Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={triggerClassName(hasDates)}>
              <Calendar className="w-3.5 h-3.5 mr-2" />
              Date
              {(filters.dateFrom || filters.dateTo) && (
                <span className="ml-1 opacity-70">
                  : {filters.dateFrom ? new Date(filters.dateFrom).toLocaleDateString() : 'Start'} 
                  {' - '} 
                  {filters.dateTo ? new Date(filters.dateTo).toLocaleDateString() : 'End'}
                </span>
              )}
              {!hasDates && <span className="ml-1 opacity-50">All Time</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4 rounded-none border-slate-200 dark:border-slate-800 shadow-md" align="start">
            <Label className="text-[10px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-[0.1em] mb-3 opacity-70 flex items-center gap-1.5">
              Date Range
            </Label>
            <div className="flex items-center gap-2 h-9">
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                className="h-full flex-1 text-[11px] px-2 rounded-none border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 bg-white dark:bg-slate-900"
              />
              <span className="text-[9px] text-slate-400 font-black uppercase shrink-0 px-0.5">To</span>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
                className="h-full flex-1 text-[11px] px-2 rounded-none border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 bg-white dark:bg-slate-900"
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* 4. Hospital Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={triggerClassName(hasHospital)}>
              <Building2 className="w-3.5 h-3.5 mr-2" />
              Hospital
              <span className={`ml-1 truncate max-w-[120px] ${!hasHospital ? 'opacity-50' : 'capitalize'}`}>
                {filters.hospital || 'All Locations'}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-4 rounded-none border-slate-200 dark:border-slate-800 shadow-md" align="start">
            <Label className="text-[10px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-[0.1em] mb-3 block opacity-70">
              Hospital Location
            </Label>
            <div className="relative h-9">
              <select
                value={filters.hospital}
                onChange={(e) => updateFilter('hospital', e.target.value)}
                className="w-full h-full px-3 text-[11px] appearance-none rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer pr-10"
              >
                <option value="">All Hospitals</option>
                {suggestions.hospitals.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Building2 className="w-3 h-3" />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* 5. Suspected Agents Toggle (Expanded Below) */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsAgentsExpanded((prev) => !prev)}
          className={triggerClassName(hasAgents || isAgentsExpanded)}
        >
          <SearchIcon className="w-3.5 h-3.5 mr-2" />
          Agents
          {hasAgents && (
            <Badge variant="secondary" className="ml-2 px-1 text-[10px] rounded-sm bg-primary/20 text-primary border-none leading-none pt-0.5 h-4">
              {filters.suspectedAgents.length}
            </Badge>
          )}
          {!hasAgents && <span className="ml-1 opacity-50">0 Selected</span>}
        </Button>

        {/* Clear All action (only visible when filters are active) */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2.5 text-[10px] font-bold uppercase tracking-[0.05em] text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 ml-auto transition-colors"
          >
            <X className="w-3 h-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Expanded Agents Panel */}
      {isAgentsExpanded && (
        <div className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm flex flex-col animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center gap-4 justify-between">
            <div className="relative w-full max-w-[320px]">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search specific drugs or agents..." 
                value={agentSearch}
                onChange={(e) => setAgentSearch(e.target.value)}
                className="pl-9 pr-9 h-8 text-xs rounded-sm border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-primary bg-white dark:bg-slate-950 w-full shadow-sm"
              />
              {agentSearch && (
                <button 
                  onClick={() => setAgentSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 flex items-center justify-center p-1 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 opacity-70 flex items-center gap-2">
               {hasAgents && <span className="text-primary">{filters.suspectedAgents.length} Selected</span>}
               {!hasAgents && <span>0 Selected</span>}
            </div>
          </div>
          
          <div className="p-4 min-h-[100px] max-h-[40vh] sm:max-h-[300px] overflow-y-auto custom-scrollbar">
            <div className="flex flex-wrap gap-2">
              {filteredDrugs.length > 0 ? (
                filteredDrugs.map(({ drug, category }) => {
                  const isSelected = filters.suspectedAgents.includes(drug);
                  const theme = CATEGORY_THEMES[category];
                  
                  return (
                    <button
                      key={drug}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleAgent(drug);
                      }}
                      className={`
                        px-3 py-1.5 text-[10px] font-bold transition-all relative overflow-hidden group
                        ${isSelected
                          ? `${theme.btnSelected} ring-1 ring-inset ring-black/5 dark:ring-white/5 shadow-sm scale-[1.02]`
                          : `bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-950`
                        }
                      `}
                      title={category}
                    >
                      <span className="relative z-10">{drug}</span>
                      {isSelected && (
                        <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-white/30 -mr-0.5 -mt-0.5 rotate-45" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="text-xs text-slate-400 py-8 text-center w-full font-medium italic">
                  No agents found matching "{agentSearch}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
