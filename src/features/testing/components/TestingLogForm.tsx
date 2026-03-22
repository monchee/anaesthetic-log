import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Label, Input, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { LogFormData, DrugTestRow } from '@/types';
import { Calendar, Activity, Syringe, CheckCircle2, Check, X, Save, Stethoscope, Plus, Clock, AlertOctagon, ThumbsUp, ThumbsDown } from 'lucide-react';
import { CATEGORY_THEMES, DEFAULT_THEME } from '@shared/utils/constants';
import { useTestingLogLogic } from '../hooks/useTestingLogLogic';

interface TestingLogFormProps {
  formData: LogFormData;
  setFormData: React.Dispatch<React.SetStateAction<LogFormData>>;
  onSubmit: () => void;
  drugCategories: Record<string, string[]>;
  symptomOptions: readonly string[] | string[];
  interventionOptions: readonly string[] | string[];
}

const FIELD_LABELS: Record<string, string> = {
  sptWheal: 'SPT',
  idt100: '1:100',
  idt10: '1:10',
  idtNeat: 'Neat'
};

// Memoized drug row component for better performance
const DrugRow = React.memo(({
  row,
  index,
  drugToCategoryMap,
  updateDrugData,
  removeRow
}: {
  row: DrugTestRow;
  index: number;
  drugToCategoryMap: Record<string, string>;
  updateDrugData: (index: number, field: string, value: string) => void;
  removeRow: (index: number) => void;
}) => {
  const category = drugToCategoryMap[row.drugName] || 'Others';
  const theme = CATEGORY_THEMES[category] || DEFAULT_THEME;
  const borderClass = row.drugName === 'Other' ? DEFAULT_THEME.rowBorder : theme.rowBorder;

  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-[1fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-x-3 gap-y-4 md:gap-2 p-3 sm:p-3.5 md:p-4 items-start md:items-center bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 border-l-[6px] ${borderClass} shadow-sm rounded-none group`}
    >
      {/* Name Column (Full width on mobile) */}
      <div className="col-span-2 md:col-span-1 flex items-center gap-2 md:self-center">
        {row.drugName === 'Other' ? (
          <Input
            className="h-10 md:h-9 text-sm flex-1 min-w-0 font-medium font-mono"
            placeholder="Specify name..."
            aria-label="Custom drug name"
            value={row.customName || ''}
            onChange={(e) => updateDrugData(index, 'customName', e.target.value)}
            autoFocus
          />
        ) : (
          <span className="font-medium text-sm text-slate-700 dark:text-slate-200 flex-1">
            {row.drugName}
          </span>
        )}

        <button
          onClick={() => removeRow(index)}
          className={`shrink-0 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-opacity p-2 md:p-1 ${row.drugName === 'Other' ? 'opacity-100' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'}`}
          aria-label="Remove drug"
          title="Remove drug"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Result Columns - 4 Grid Layout */}
      <div className="col-span-2 md:col-span-4 grid grid-cols-2 gap-x-2 gap-y-5 md:grid-cols-4 md:gap-2">
        {['sptWheal', 'idt100', 'idt10', 'idtNeat'].map((field) => (
          <div key={field} className="relative">
            <span className="md:hidden section-label absolute -top-3 left-0">{FIELD_LABELS[field]}</span>
            <Input
              type="number"
              min="0"
              onKeyDown={preventNegativeInput}
              aria-label={`${row.drugName} ${FIELD_LABELS[field]} result (mm)`}
              className={`h-9 text-center font-mono ${parseInt(row[field] || '0') >= 3 ? 'text-red-600 font-bold bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50' : ''}`}
              placeholder="-"
              value={row[field] || ''}
              onChange={(e) => updateDrugData(index, field, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Notes Row */}
      <div className="col-span-2 md:col-span-4 md:col-start-2">
        <Input
          aria-label={`${row.drugName} notes`}
          className="h-8 text-xs text-slate-600 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-500"
          placeholder="Notes..."
          value={row.notes || ''}
          onChange={(e) => updateDrugData(index, 'notes', e.target.value)}
        />
      </div>
    </div>
  );
});

const preventNegativeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["-", "e", "E", "+"].includes(e.key)) {
        e.preventDefault();
    }
};

const TestingLogForm: React.FC<TestingLogFormProps> = ({ 
  formData, 
  setFormData, 
  onSubmit, 
  drugCategories, 
  symptomOptions, 
  interventionOptions 
}) => {

  const {
    drugToCategoryMap,
    handleInputChange,
    handleControlChange,
    toggleDrug,
    toggleCategory,
    addCustomDrug,
    removeRow,
    updateDrugData,
    toggleSymptom,
    challengeOptions
  } = useTestingLogLogic({ formData, setFormData, drugCategories });

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 mt-4 sm:mt-6 md:mt-8">
      
{/* 1. Visit Details & Patient Info */}
      <Card style={{ '--section-index': 0 } as React.CSSProperties} className="animate-section-reveal">
        <CardContent className="pt-4 sm:pt-5 md:pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6">
                <div className="flex items-center gap-4">
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-none">
                        <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <div className="section-label">Patient Name</div>
                        <div className="text-lg font-bold text-slate-900 dark:text-primary">
                            {formData.lastName}, {formData.firstName}
                        </div>
                    </div>
                    <div className="border-l pl-4 border-slate-200 dark:border-slate-800">
                        <div className="section-label">MRN</div>
                        <div className="text-lg font-bold text-slate-900 dark:text-primary font-mono lowercase">
                            {formData.mrn}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4 border-t md:border-t-0 pt-3 md:pt-0">
                    <Label htmlFor="visit-date" className="whitespace-nowrap text-base font-semibold text-slate-900 dark:text-primary flex items-center gap-2">
                        <Calendar className="w-5 h-5" aria-hidden="true" /> Visit Date:
                    </Label>
                    <Input
                        id="visit-date"
                        type="date"
                        aria-describedby="visit-date-hint"
                        className="w-full md:max-w-[200px] font-mono"
                        value={formData.visitDate}
                        onChange={(e) => handleInputChange('visitDate', e.target.value)}
                    />
                    <span id="visit-date-hint" className="sr-only">
                        Enter the date when the patient visited for testing
                    </span>
                </div>
            </div>
        </CardContent>
      </Card>

      {/* 2. Skin Testing Panel */}
        <Card style={{ '--section-index': 1 } as React.CSSProperties} className="animate-section-reveal">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="flex items-center gap-2 text-base text-slate-900 dark:text-slate-100">
              <div className="bg-slate-100 dark:bg-slate-900/40 p-1.5 rounded-none">
                 <Activity className="w-4 h-4 text-primary dark:text-primary" />
              </div>
              SPT &amp; IDT Panel
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 sm:pt-4 md:pt-4 space-y-4 sm:space-y-5 md:space-y-6">

            {/* Selection Area: Categories */}
            <div className="space-y-4 mb-6">
               <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                   <Label className="text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">Select Drugs to Test:</Label>
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => setFormData(prev => ({ ...prev, testPanel: [] }))}
                     className="text-xs text-slate-400 hover:text-destructive h-6 px-2 rounded-none font-normal"
                     title="Clear all selected drugs"
                   >
                     Clear All
                   </Button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {Object.entries(drugCategories).map(([category, drugs]) => {
                    const categoryDrugs = drugs as string[];
                    const hasActiveSelection = categoryDrugs.some(drug =>
                        formData.testPanel.some(r => r.drugName === drug && !r.id)
                    );
                    const allCategorySelected = categoryDrugs.every(drug =>
                        formData.testPanel.some(r => r.drugName === drug && !r.id)
                    );

                    const theme = CATEGORY_THEMES[category] || DEFAULT_THEME;

                    return (
                    <div key={category} className={`space-y-2 rounded-none p-3 transition-colors duration-150 ${hasActiveSelection ? `${theme.activeBg} ${theme.activeRing} ring-1` : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}>
                        <div className={`flex justify-between items-center border-b border-dashed pb-1 mb-2 ${hasActiveSelection ? `${theme.headerBorder}` : 'border-slate-200 dark:border-slate-800'}`}>
                            <h3 className={`text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${hasActiveSelection ? theme.headerText : 'text-slate-500 dark:text-slate-400'}`}>
                                {category}
                                {hasActiveSelection && <span className={`flex h-1.5 w-1.5 rounded-full ${theme.pulse} animate-pulse`}></span>}
                            </h3>
                            <button
                                onClick={(e) => { e.preventDefault(); toggleCategory(categoryDrugs); }}
                                className={`text-[10px] hover:underline font-medium transition-colors ${hasActiveSelection ? theme.actionText : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
                            >
                                {allCategorySelected ? 'Select None' : 'Select All'}
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(drugs as string[]).map(drug => {
                                const isSelected = formData.testPanel.some(r => r.drugName === drug && !r.id);
                                return (
                                <button
                                    key={drug}
                                    onClick={() => toggleDrug(drug)}
                                    className={`text-xs px-2.5 py-1.5 rounded-none border transition-all duration-150 flex items-center gap-1.5 text-left ${
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
                                    onClick={addCustomDrug}
                                    className={`text-xs px-2.5 py-1.5 rounded-none border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-150 flex items-center gap-1.5 font-medium ${theme.btnHover}`}
                                >
                                    <Plus className="w-3 h-3 shrink-0" />
                                    Other
                                </button>
                            )}
                        </div>
                    </div>
                  )})}
               </div>
            </div>

            {/* Reference Controls */}
            <div className="bg-slate-50 dark:bg-slate-900 px-4 py-4 rounded-none border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
              <div className="section-label">
                Reference Controls (mm):
              </div>
              <div className="grid grid-cols-3 gap-2 md:flex md:flex-wrap md:items-center md:gap-x-8 md:gap-y-4">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
                  <Label htmlFor="histamine-spt" className="text-xs font-medium text-slate-700 dark:text-slate-300">Histamine (SPT)</Label>
                  <Input
                    id="histamine-spt"
                    type="number"
                    min="0"
                    onKeyDown={preventNegativeInput}
                    placeholder="0"
                    className="bg-white dark:bg-slate-950 h-9 w-full md:w-20 text-center text-sm font-mono"
                    value={formData.controls.histamineSpt}
                    onChange={(e) => handleControlChange('histamineSpt', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
                  <Label htmlFor="saline-spt" className="text-xs font-medium text-slate-700 dark:text-slate-300">Saline (SPT)</Label>
                  <Input
                    id="saline-spt"
                    type="number"
                    min="0"
                    onKeyDown={preventNegativeInput}
                    placeholder="0"
                    className="bg-white dark:bg-slate-950 h-9 w-full md:w-20 text-center text-sm font-mono"
                    value={formData.controls.salineSpt}
                    onChange={(e) => handleControlChange('salineSpt', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
                  <Label htmlFor="saline-idt" className="text-xs font-medium text-slate-700 dark:text-slate-300">Saline (IDT)</Label>
                  <Input
                    id="saline-idt"
                    type="number"
                    min="0"
                    onKeyDown={preventNegativeInput}
                    placeholder="0"
                    className="bg-white dark:bg-slate-950 h-9 w-full md:w-20 text-center text-sm font-mono"
                    value={formData.controls.salineIdt}
                    onChange={(e) => handleControlChange('salineIdt', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Data Entry Table */}
            {formData.testPanel.length > 0 ? (
              <div className={`rounded-none overflow-hidden animate-in fade-in slide-in-from-top-2`}>
                 <div className="hidden md:grid md:grid-cols-[1fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-2 p-3 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800 mb-2 rounded-none text-center">
                    <div className="text-left md:text-center">Drug</div>
                    <div>SPT</div>
                    <div>1:100</div>
                    <div>1:10</div>
                    <div>Neat</div>
                 </div>

                 <div className="space-y-3">
                   {formData.testPanel.map((row, index) => (
                     <DrugRow
                       key={row.id || row.drugName}
                       row={row}
                       index={index}
                       drugToCategoryMap={drugToCategoryMap}
                       updateDrugData={updateDrugData}
                       removeRow={removeRow}
                     />
                   ))}
                 </div>
              </div>
            ) : (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-900 rounded-none border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">No drugs selected. Choose a category above to begin.</p>
                </div>
            )}
          </CardContent>
        </Card>

      {/* 3. Drug Challenge */}
      <Card style={{ '--section-index': 2 } as React.CSSProperties} className="animate-section-reveal">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="flex items-center gap-2 text-base text-slate-900 dark:text-slate-100">
             <div className="bg-primary/10 dark:bg-slate-900/40 p-1.5 rounded-none">
                 <Syringe className="w-4 h-4 text-primary dark:text-primary" />
             </div>
             Drug Challenge
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">

            {/* Main Toggle */}
            <button
                type="button"
                role="switch"
                aria-checked={formData.proceedToChallenge}
                onClick={() => handleInputChange('proceedToChallenge', !formData.proceedToChallenge)}
                className={`flex w-full items-center justify-between p-4 rounded-none border-2 cursor-pointer transition-all duration-150 group ${
                    formData.proceedToChallenge
                    ? 'border-primary bg-[white] dark:bg-slate-900/10 shadow-sm'
                    : 'border-slate-100 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-950'
                }`}
            >
                <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-none transition-colors ${
                        formData.proceedToChallenge
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}>
                        <Activity className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <span className={`font-semibold tracking-tight transition-colors ${formData.proceedToChallenge ? 'text-slate-900 dark:text-primary' : 'text-slate-700 dark:text-slate-300'}`}>
                            Drug Challenge
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Proceed with live drug challenge</p>
                    </div>
                </div>

                {/* Visual Switch */}
                <div className={`w-12 h-7 rounded-none p-1 transition-colors duration-150 ease-in-out ${formData.proceedToChallenge ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <div className={`w-5 h-5 bg-white rounded-none shadow-sm transform transition-transform duration-150 ease-in-out ${formData.proceedToChallenge ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
            </button>

            {formData.proceedToChallenge && (
                <div className="space-y-8 pl-1 sm:pl-2 animate-in slide-in-from-top-2 fade-in duration-150">

                    {/* Drug Selection */}
                    <div className="space-y-3">
                         <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            Select Challenge Drug
                         </Label>
                         <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1 group">
                               <Syringe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-hover:text-primary transition-colors pointer-events-none" />
                               <Select
                                    value={formData.challengeDrug}
                                    onValueChange={(value) => handleInputChange('challengeDrug', value)}
                                >
                                    <SelectTrigger className="pl-10 h-11 border-slate-200 focus:border-primary focus:ring-primary" aria-label="Select challenge drug">
                                        <SelectValue placeholder="Choose drug from list..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {challengeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            {formData.challengeDrug === 'Other' && (
                                <Input
                                    className="flex-1 h-11"
                                    placeholder="Specify custom drug name..."
                                    aria-label="Custom challenge drug name"
                                    value={formData.challengeDrugCustom || ''}
                                    onChange={(e) => handleInputChange('challengeDrugCustom', e.target.value)}
                                    autoFocus
                                />
                            )}
                         </div>
                    </div>

                    {/* Outcome Selection */}
                    <div className="space-y-3">
                         <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Observation Outcome</Label>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <button
                                type="button"
                                onClick={() => handleInputChange('outcome', 'SUCCESS')}
                                className={`relative flex flex-col items-center justify-center gap-2 p-3 md:p-6 rounded-none border-2 transition-all duration-150 hover:shadow-md ${
                                    formData.outcome === 'SUCCESS'
                                    ? 'bg-green-50 border-green-500 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-green-300 hover:bg-green-50/50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400'
                                }`}
                             >
                                 <div className={`p-3 rounded-none ${
                                     formData.outcome === 'SUCCESS' ? 'bg-green-100 text-green-600 dark:bg-green-900/50' : 'bg-slate-100 text-slate-400 dark:bg-slate-900'
                                 }`}>
                                     <ThumbsUp className="w-6 h-6" />
                                 </div>
                                 <span className="font-bold text-sm">Tolerated (Safe)</span>
                                 {formData.outcome === 'SUCCESS' && (
                                     <div className="absolute top-3 right-3 text-green-600 dark:text-green-400">
                                         <CheckCircle2 className="w-5 h-5" />
                                     </div>
                                 )}
                             </button>

                             <button
                                type="button"
                                onClick={() => handleInputChange('outcome', 'UNSUCCESS')}
                                className={`relative flex flex-col items-center justify-center gap-2 p-3 md:p-6 rounded-none border-2 transition-all duration-150 hover:shadow-md ${
                                    formData.outcome === 'UNSUCCESS'
                                    ? 'bg-red-50 border-red-500 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-red-300 hover:bg-red-50/50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400'
                                }`}
                             >
                                 <div className={`p-3 rounded-none ${
                                     formData.outcome === 'UNSUCCESS' ? 'bg-red-100 text-red-600 dark:bg-red-900/50' : 'bg-slate-100 text-slate-400 dark:bg-slate-900'
                                 }`}>
                                     <ThumbsDown className="w-6 h-6" />
                                 </div>
                                 <span className="font-bold text-sm">Reaction Occurred</span>
                                 {formData.outcome === 'UNSUCCESS' && (
                                     <div className="absolute top-3 right-3 text-red-600 dark:text-red-400">
                                         <AlertOctagon className="w-5 h-5" />
                                     </div>
                                 )}
                             </button>
                         </div>
                    </div>

                    {/* Conditional Reaction Details */}
                    {formData.outcome === 'UNSUCCESS' && (
                        <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-none border border-red-200 dark:border-red-900/30 space-y-6 animate-in fade-in slide-in-from-top-1 shadow-sm">
                            <div className="flex items-center gap-2 pb-2 border-b border-red-200 dark:border-red-900/30">
                                <Activity className="w-5 h-5 text-red-600" />
                                <h4 className="font-bold text-red-800 dark:text-red-300 text-sm uppercase tracking-wide">
                                    Reaction Documentation
                                </h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="reaction-time" className="text-red-900 dark:text-red-200 font-semibold flex items-center gap-2">
                                        <Clock className="w-4 h-4" aria-hidden="true" /> Time to Reaction (min)
                                    </Label>
                                    <Input
                                        id="reaction-time"
                                        type="number"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        min="0"
                                        onKeyDown={preventNegativeInput}
                                        value={formData.reactionTime}
                                        onChange={(e) => handleInputChange('reactionTime', e.target.value)}
                                        placeholder="Minutes"
                                        className="h-10 border-slate-200 dark:border-slate-800 focus:ring-primary/20 transition-all rounded-none bg-white dark:bg-slate-950"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-red-900 dark:text-red-200 font-semibold flex items-center gap-2">
                                        <Stethoscope className="w-4 h-4" aria-hidden="true" /> Treatment Required
                                    </Label>
                                    <Select
                                        value={formData.interventionType}
                                        onValueChange={(value) => handleInputChange('interventionType', value)}
                                    >
                                        <SelectTrigger className="h-10 bg-white dark:bg-slate-950 border-red-200 focus:border-red-400 focus:ring-red-400" aria-label="Select treatment intervention">
                                            <SelectValue placeholder="Select intervention..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {interventionOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            {formData.interventionType === 'Other' && (
                                <div className="space-y-2 animate-in fade-in">
                                    <Label htmlFor="intervention-other" className="text-red-900 dark:text-red-200">Specify Treatment Details</Label>
                                    <Input
                                        id="intervention-other"
                                        value={formData.interventionOther}
                                        onChange={(e) => handleInputChange('interventionOther', e.target.value)}
                                        className="bg-white dark:bg-slate-950 border-red-200"
                                        placeholder="Describe intervention..."
                                    />
                                </div>
                            )}

                            <div className="space-y-3">
                                <Label className="text-red-900 dark:text-red-200 font-semibold">Observed Symptoms</Label>
                                <div role="group" aria-label="Select observed symptoms" className="flex flex-wrap gap-2">
                                    {symptomOptions.map(sym => (
                                        <button
                                            key={sym}
                                            type="button"
                                            role="checkbox"
                                            aria-checked={formData.symptoms.includes(sym)}
                                            aria-label={`${formData.symptoms.includes(sym) ? 'Remove' : 'Add'} ${sym}`}
                                            onClick={() => toggleSymptom(sym)}
                                            className={`px-3 py-1.5 rounded-none text-xs font-medium border transition-all duration-150 ${
                                                formData.symptoms.includes(sym)
                                                ? 'bg-red-600 text-white border-red-600 shadow-md transform scale-105'
                                                : 'bg-white text-red-900 border-red-200 hover:bg-red-100 hover:border-red-300 dark:bg-slate-950 dark:text-red-200 dark:border-red-900/50'
                                            }`}
                                        >
                                            {sym}
                                        </button>
                                    ))}
                                </div>
                            </div>
                             {formData.symptoms.includes('Other') && (
                                <div className="space-y-2 animate-in fade-in">
                                    <Label htmlFor="symptoms-other" className="text-red-900 dark:text-red-200">Specify Other Symptoms</Label>
                                    <Input
                                        id="symptoms-other"
                                        value={formData.symptomsOther}
                                        onChange={(e) => handleInputChange('symptomsOther', e.target.value)}
                                        className="bg-white dark:bg-slate-950 border-red-200"
                                        placeholder="Describe symptoms..."
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </CardContent>
      </Card>

      {/* 4. Plan & Assessment */}
      <Card style={{ '--section-index': 3 } as React.CSSProperties} className="animate-section-reveal">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
           <CardTitle className="flex items-center gap-2 text-base text-slate-900 dark:text-slate-100">
             <div className="bg-emerald-100 dark:bg-emerald-900/40 p-1.5 rounded-none">
                 <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
             </div>
             Assessment & Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
            <div className="space-y-2">
                <Label htmlFor="clinical-plan">Comments / Plan</Label>
                <textarea
                    id="clinical-plan"
                    className="flex min-h-[120px] w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                    placeholder=""
                    value={formData.plan}
                    onChange={(e) => handleInputChange('plan', e.target.value)}
                />
            </div>
        </CardContent>
      </Card>

      {/* Save Action */}
      <div className="pt-4 pb-20">
         <Button onClick={onSubmit} size="lg" className="w-full h-14 text-lg shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary font-semibold">
             <Save className="w-5 h-5 mr-2" /> Save Clinical Record
         </Button>
      </div>

    </div>
  );
};

export default TestingLogForm;
