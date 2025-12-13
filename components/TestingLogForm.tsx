
import React, { useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Label, Input, Button, Select } from './ui';
import { LogFormData } from '../types';
import { Check, X, Save, CheckCircle2, Calendar, Stethoscope, Plus, Syringe, Clock, AlertOctagon, ThumbsUp, ThumbsDown, Activity } from 'lucide-react';
import { CATEGORY_THEMES, DEFAULT_THEME } from '../lib/constants';

interface TestingLogFormProps {
  formData: LogFormData;
  setFormData: React.Dispatch<React.SetStateAction<LogFormData>>;
  onSubmit: () => void;
  drugCategories: Record<string, string[]>;
  symptomOptions: string[];
  interventionOptions: string[];
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
      className={`grid grid-cols-2 md:grid-cols-[1fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-x-3 gap-y-4 md:gap-2 p-4 md:p-3 items-start md:items-center bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 border-l-[6px] ${borderClass} shadow-sm rounded-r-md group`}
    >
      {/* Name Column (Full width on mobile) */}
      <div className="col-span-2 md:col-span-1 flex items-center gap-2">
        {row.drugName === 'Other' ? (
          <Input
            className="h-10 md:h-9 text-sm flex-1 min-w-0 font-medium font-mono"
            placeholder="Specify name..."
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
          className={`shrink-0 text-slate-300 hover:text-red-500 transition-opacity p-2 md:p-1 ${row.drugName === 'Other' ? 'opacity-100' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'}`}
          title="Remove drug"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Result Columns - 4 Grid Layout */}
      <div className="col-span-2 md:col-span-4 grid grid-cols-4 gap-2">
        {['sptWheal', 'idt100', 'idt10', 'idtNeat'].map((field) => (
          <div key={field} className="relative">
            <span className="md:hidden text-[10px] text-slate-400 absolute -top-3 left-0 uppercase font-bold">{FIELD_LABELS[field]}</span>
            <Input
              type="number"
              min="0"
              onKeyDown={preventNegativeInput}
              className={`h-9 text-center font-mono ${parseInt((row as any)[field]) >= 3 ? 'text-red-600 font-bold bg-red-50 border-red-200' : ''}`}
              placeholder="-"
              value={(row as any)[field]}
              onChange={(e) => updateDrugData(index, field, e.target.value)}
            />
          </div>
        ))}
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

  const drugToCategoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    Object.entries(drugCategories).forEach(([cat, drugs]) => {
      (drugs as string[]).forEach(d => {
        map[d] = cat;
      });
    });
    return map;
  }, [drugCategories]);

  const handleInputChange = useCallback((field: keyof LogFormData, value: any) => {
    if (field === 'reactionTime' && value !== '' && !isNaN(parseFloat(value)) && parseFloat(value) < 0) return;
    setFormData(prev => ({ ...prev, [field]: value }));
  }, [setFormData]);

  const handleControlChange = useCallback((field: string, value: string) => {
    if (value !== '' && !isNaN(parseFloat(value)) && parseFloat(value) < 0) return;
    setFormData(prev => ({
        ...prev, 
        controls: { ...prev.controls, [field]: value }
    }));
  }, [setFormData]);

  const toggleDrug = useCallback((drugName: string) => {
    setFormData(prev => {
      const exists = prev.testPanel.find(row => row.drugName === drugName && !row.id);
      if (exists) {
        return {
          ...prev,
          testPanel: prev.testPanel.filter(row => row.drugName !== drugName || row.id) 
        };
      } else {
        return {
          ...prev,
          testPanel: [...prev.testPanel, { drugName, sptWheal: '', idt100: '', idt10: '', idtNeat: '', customName: '' }]
        };
      }
    });
  }, [setFormData]);

  const toggleCategory = useCallback((categoryDrugs: string[]) => {
    setFormData(prev => {
      const currentPanelDrugs = prev.testPanel.filter(r => !r.id).map(row => row.drugName);
      const allSelected = categoryDrugs.every(d => currentPanelDrugs.includes(d));

      if (allSelected) {
        return {
          ...prev,
          testPanel: prev.testPanel.filter(row => row.id || !categoryDrugs.includes(row.drugName))
        };
      } else {
        const missingDrugs = categoryDrugs.filter(d => !currentPanelDrugs.includes(d));
        const newRows = missingDrugs.map(d => ({
            drugName: d,
            sptWheal: '',
            idt100: '',
            idt10: '',
            idtNeat: '',
            customName: ''
        }));
        return {
          ...prev,
          testPanel: [...prev.testPanel, ...newRows]
        };
      }
    });
  }, [setFormData]);

  const addCustomDrug = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      testPanel: [
        ...prev.testPanel, 
        { 
            id: `custom-${Date.now()}-${Math.random()}`,
            drugName: 'Other', 
            sptWheal: '', 
            idt100: '', 
            idt10: '', 
            idtNeat: '', 
            customName: '' 
        }
      ]
    }));
  }, [setFormData]);

  const removeRow = useCallback((index: number) => {
    setFormData(prev => ({
        ...prev,
        testPanel: prev.testPanel.filter((_, i) => i !== index)
    }));
  }, [setFormData]);

  const updateDrugData = useCallback((index: number, field: string, value: string) => {
    if (['sptWheal', 'idt100', 'idt10', 'idtNeat'].includes(field)) {
        if (value !== '' && !isNaN(parseFloat(value)) && parseFloat(value) < 0) return;
    }
    setFormData(prev => ({
      ...prev,
      testPanel: prev.testPanel.map((row, i) => i === index ? { ...row, [field]: value } : row)
    }));
  }, [setFormData]);

  const toggleSymptom = useCallback((symptom: string) => {
    setFormData(prev => {
      const exists = prev.symptoms.includes(symptom);
      return {
        ...prev,
        symptoms: exists ? prev.symptoms.filter(s => s !== symptom) : [...prev.symptoms, symptom]
      };
    });
  }, [setFormData]);

  const challengeOptions = useMemo(() => {
    const panelDrugs = (formData.testPanel || [])
        .map(r => r.drugName === 'Other' && r.customName ? r.customName : r.drugName)
        .filter((d): d is string => !!d);
    
    const standardDrugs = Object.values(drugCategories).flat();
    const uniqueDrugs = Array.from(new Set([...panelDrugs, ...standardDrugs])).filter(d => d !== 'Other');
    uniqueDrugs.sort();
    return [...uniqueDrugs, 'Other'];
  }, [formData.testPanel, drugCategories]);

  return (
    <div className="space-y-6 mt-8">
      
      {/* Section Header */}
      <div className="flex items-center gap-2 border-b-2 border-slate-200 dark:border-slate-800 pb-2 mb-2">
        <Stethoscope className="w-6 h-6 text-[#441170] dark:text-purple-300" />
        <h2 className="text-xl font-bold text-[#441170] dark:text-purple-300">Anaesthetic Allergy Testing</h2>
      </div>

      {/* 1. Visit Details */}
      <Card>
        <CardContent className="pt-6">
            <div className="flex items-center gap-4">
                <Label className="whitespace-nowrap text-base font-semibold text-[#441170] dark:text-purple-300 flex items-center gap-2">
                    <Calendar className="w-5 h-5" /> Visit Date:
                </Label>
                <Input 
                    type="date" 
                    className="max-w-[200px] font-mono"
                    value={formData.visitDate}
                    onChange={(e) => handleInputChange('visitDate', e.target.value)}
                />
            </div>
        </CardContent>
      </Card>

      {/* 2. Skin Testing Panel */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-[#441170] dark:text-purple-300 flex items-center gap-2">
              <div className="bg-[#e6e1fd] dark:bg-purple-900/40 p-1.5 rounded-md">
                 <Activity className="w-4 h-4 text-[#8055f1] dark:text-purple-300" />
              </div>
              SPT & IDT Panel
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-6">
            
            {/* Controls */}
            <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-wrap items-baseline gap-x-6 gap-y-2">
              <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mr-2">Reference Controls (mm):</span>
              
              <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Histamine (SPT)</label>
                  <Input 
                    type="number" 
                    min="0"
                    onKeyDown={preventNegativeInput}
                    placeholder="0" 
                    className="bg-white h-8 w-16 text-center text-xs font-mono"
                    value={formData.controls.histamineSpt}
                    onChange={(e) => handleControlChange('histamineSpt', e.target.value)}
                  />
              </div>

              <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Saline (SPT)</label>
                  <Input 
                    type="number" 
                    min="0"
                    onKeyDown={preventNegativeInput}
                    placeholder="0" 
                    className="bg-white h-8 w-16 text-center text-xs font-mono"
                    value={formData.controls.salineSpt}
                    onChange={(e) => handleControlChange('salineSpt', e.target.value)}
                  />
              </div>

              <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Saline (IDT)</label>
                  <Input 
                    type="number" 
                    min="0"
                    onKeyDown={preventNegativeInput}
                    placeholder="0" 
                    className="bg-white h-8 w-16 text-center text-xs font-mono"
                    value={formData.controls.salineIdt}
                    onChange={(e) => handleControlChange('salineIdt', e.target.value)}
                  />
              </div>
            </div>

            {/* Selection Area: Categories */}
            <div className="space-y-4 mb-6">
               <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                   <Label className="text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">Select Drugs to Test:</Label>
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
                    <div key={category} className={`space-y-2 rounded-xl p-3 transition-colors duration-300 ${hasActiveSelection ? `${theme.activeBg} ${theme.activeRing} ring-1` : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}>
                        <div className={`flex justify-between items-center border-b border-dashed pb-1 mb-2 ${hasActiveSelection ? `${theme.headerBorder}` : 'border-slate-200 dark:border-slate-800'}`}>
                            <h4 className={`text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${hasActiveSelection ? theme.headerText : 'text-slate-500 dark:text-slate-400'}`}>
                                {category}
                                {hasActiveSelection && <span className={`flex h-1.5 w-1.5 rounded-full ${theme.pulse} animate-pulse`}></span>}
                            </h4>
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
                                    onClick={addCustomDrug}
                                    className={`text-xs px-2.5 py-1.5 rounded border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 flex items-center gap-1.5 font-medium ${theme.btnHover}`}
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

            {/* Data Entry Table */}
            {formData.testPanel.length > 0 ? (
              <div className={`rounded-lg overflow-hidden animate-in fade-in slide-in-from-top-2`}>
                 <div className="hidden md:grid md:grid-cols-[1fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-2 p-3 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800 mb-2 rounded-t-lg text-center">
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
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">No drugs selected. Choose a category above to begin.</p>
                </div>
            )}
          </CardContent>
        </Card>

      {/* 3. Drug Challenge */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-[#441170] dark:text-purple-300 flex items-center gap-2">
             <div className="bg-[#e6e1fd] dark:bg-purple-900/40 p-1.5 rounded-md">
                 <Syringe className="w-4 h-4 text-[#8055f1] dark:text-purple-300" />
             </div>
             Drug Challenge
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
            
            {/* Main Toggle */}
            <div 
                onClick={() => handleInputChange('proceedToChallenge', !formData.proceedToChallenge)}
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 group ${
                    formData.proceedToChallenge 
                    ? 'border-[#8055f1] bg-[#fbfaff] dark:bg-[#441170]/10 shadow-sm' 
                    : 'border-slate-100 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-950'
                }`}
            >
                <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-full transition-colors ${
                        formData.proceedToChallenge 
                        ? 'bg-[#8055f1] text-white' 
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}>
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className={`font-bold transition-colors ${formData.proceedToChallenge ? 'text-[#441170] dark:text-purple-300' : 'text-slate-700 dark:text-slate-300'}`}>
                            Drug Challenge
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Proceed with live drug challenge</p>
                    </div>
                </div>
                
                {/* Visual Switch */}
                <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out ${formData.proceedToChallenge ? 'bg-[#8055f1]' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ease-in-out ${formData.proceedToChallenge ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
            </div>

            {formData.proceedToChallenge && (
                <div className="space-y-8 pl-1 sm:pl-2 animate-in slide-in-from-top-2 fade-in duration-300">
                    
                    {/* Drug Selection */}
                    <div className="space-y-3">
                         <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            Select Challenge Drug
                         </Label>
                         <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1 group">
                               <Syringe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-hover:text-[#8055f1] transition-colors pointer-events-none" />
                               <Select 
                                    value={formData.challengeDrug} 
                                    onChange={(e) => handleInputChange('challengeDrug', e.target.value)}
                                    className="pl-10 h-11 border-slate-200 focus:border-[#8055f1] focus:ring-[#8055f1]"
                                    placeholder="Choose drug from list..."
                                >
                                    {challengeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </Select>
                            </div>
                            {formData.challengeDrug === 'Other' && (
                                <Input 
                                    className="flex-1 h-11" 
                                    placeholder="Specify custom drug name..." 
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
                                className={`relative flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                                    formData.outcome === 'SUCCESS' 
                                    ? 'bg-green-50 border-green-500 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-green-300 hover:bg-green-50/50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400'
                                }`}
                             >
                                 <div className={`p-3 rounded-full ${
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
                                className={`relative flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                                    formData.outcome === 'UNSUCCESS' 
                                    ? 'bg-red-50 border-red-500 text-red-800 dark:bg-red-900/20 dark:text-red-300' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-red-300 hover:bg-red-50/50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400'
                                }`}
                             >
                                 <div className={`p-3 rounded-full ${
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
                        <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-xl border border-red-200 dark:border-red-900/30 space-y-6 animate-in fade-in slide-in-from-top-1 shadow-sm">
                            <div className="flex items-center gap-2 pb-2 border-b border-red-200 dark:border-red-900/30">
                                <Activity className="w-5 h-5 text-red-600" />
                                <h4 className="font-bold text-red-800 dark:text-red-300 text-sm uppercase tracking-wide">
                                    Reaction Documentation
                                </h4>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-red-900 dark:text-red-200 font-semibold flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> Time to Reaction (min)
                                    </Label>
                                    <Input 
                                        type="number" 
                                        min="0"
                                        onKeyDown={preventNegativeInput}
                                        value={formData.reactionTime} 
                                        onChange={(e) => handleInputChange('reactionTime', e.target.value)} 
                                        className="bg-white dark:bg-slate-950 border-red-200 focus:border-red-400 focus:ring-red-400"
                                        placeholder="e.g. 5"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-red-900 dark:text-red-200 font-semibold flex items-center gap-2">
                                        <Stethoscope className="w-4 h-4" /> Treatment Required
                                    </Label>
                                    <Select 
                                        value={formData.interventionType} 
                                        onChange={(e) => handleInputChange('interventionType', e.target.value)}
                                        className="bg-white dark:bg-slate-950 border-red-200 focus:border-red-400 focus:ring-red-400"
                                        placeholder="Select intervention..."
                                    >
                                        {interventionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </Select>
                                </div>
                            </div>
                            
                            {formData.interventionType === 'Other' && (
                                <div className="space-y-2 animate-in fade-in">
                                    <Label className="text-red-900 dark:text-red-200">Specify Treatment Details</Label>
                                    <Input 
                                        value={formData.interventionOther} 
                                        onChange={(e) => handleInputChange('interventionOther', e.target.value)} 
                                        className="bg-white dark:bg-slate-950 border-red-200"
                                        placeholder="Describe intervention..."
                                    />
                                </div>
                            )}

                            <div className="space-y-3">
                                <Label className="text-red-900 dark:text-red-200 font-semibold">Observed Symptoms</Label>
                                <div className="flex flex-wrap gap-2">
                                    {symptomOptions.map(sym => (
                                        <button
                                            key={sym}
                                            type="button"
                                            onClick={() => toggleSymptom(sym)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
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
                                    <Label className="text-red-900 dark:text-red-200">Specify Other Symptoms</Label>
                                    <Input 
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
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
           <CardTitle className="text-[#441170] dark:text-purple-300 flex items-center gap-2">
             <div className="bg-[#e6e1fd] dark:bg-purple-900/40 p-1.5 rounded-md">
                 <CheckCircle2 className="w-4 h-4 text-[#8055f1] dark:text-purple-300" />
             </div>
             Assessment & Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
            <div className="space-y-2">
                <Label>Comments / Plan</Label>
                <textarea 
                    className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                    placeholder="Enter clinical notes, interpretation of results, and future recommendations..."
                    value={formData.plan}
                    onChange={(e) => handleInputChange('plan', e.target.value)}
                />
            </div>
        </CardContent>
      </Card>

      {/* Save Action */}
      <div className="pt-4 pb-20">
         <Button onClick={onSubmit} size="lg" className="w-full h-14 text-lg shadow-lg hover:shadow-xl transition-all">
             <Save className="w-5 h-5 mr-2" /> Save Clinical Record
         </Button>
      </div>

    </div>
  );
};

export default TestingLogForm;
