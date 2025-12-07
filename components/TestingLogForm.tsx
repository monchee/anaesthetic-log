import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Label, Input, Button, Select, Badge } from './ui';
import { LogFormData } from '../types';
import { Check, X, History, Activity, Save, AlertTriangle, CheckCircle2, Calendar, Stethoscope, Plus } from 'lucide-react';

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

// Professional Color Themes for Categories
const CATEGORY_THEMES: Record<string, any> = {
  "Muscle Relaxants": {
    activeBg: "bg-sky-50 dark:bg-sky-900/20",
    activeRing: "ring-sky-100 dark:ring-sky-900/50",
    headerText: "text-sky-700 dark:text-sky-300",
    headerBorder: "border-sky-200 dark:border-sky-800",
    btnSelected: "bg-sky-600 border-sky-600 text-white shadow-sm ring-1 ring-sky-100 dark:ring-sky-900",
    btnHover: "hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400 dark:hover:border-sky-400",
    pulse: "bg-sky-600",
    rowBorder: "border-l-sky-600"
  },
  "Penicillins": {
    activeBg: "bg-orange-50 dark:bg-orange-900/20",
    activeRing: "ring-orange-100 dark:ring-orange-900/50",
    headerText: "text-orange-700 dark:text-orange-300",
    headerBorder: "border-orange-200 dark:border-orange-800",
    btnSelected: "bg-orange-500 border-orange-500 text-white shadow-sm ring-1 ring-orange-100 dark:ring-orange-900",
    btnHover: "hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 dark:hover:border-orange-400",
    pulse: "bg-orange-500",
    rowBorder: "border-l-orange-500"
  },
  "Cephalosporins": {
    activeBg: "bg-emerald-50 dark:bg-emerald-900/20",
    activeRing: "ring-emerald-100 dark:ring-emerald-900/50",
    headerText: "text-emerald-700 dark:text-emerald-300",
    headerBorder: "border-emerald-200 dark:border-emerald-800",
    btnSelected: "bg-emerald-600 border-emerald-600 text-white shadow-sm ring-1 ring-emerald-100 dark:ring-emerald-900",
    btnHover: "hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 dark:hover:border-emerald-400",
    pulse: "bg-emerald-600",
    rowBorder: "border-l-emerald-600"
  },
  "Hypnotics": {
    activeBg: "bg-indigo-50 dark:bg-indigo-900/20",
    activeRing: "ring-indigo-100 dark:ring-indigo-900/50",
    headerText: "text-indigo-700 dark:text-indigo-300",
    headerBorder: "border-indigo-200 dark:border-indigo-800",
    btnSelected: "bg-indigo-600 border-indigo-600 text-white shadow-sm ring-1 ring-indigo-100 dark:ring-indigo-900",
    btnHover: "hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 dark:hover:border-indigo-400",
    pulse: "bg-indigo-600",
    rowBorder: "border-l-indigo-600"
  },
  "Local Anaesthetics": {
    activeBg: "bg-cyan-50 dark:bg-cyan-900/20",
    activeRing: "ring-cyan-100 dark:ring-cyan-900/50",
    headerText: "text-cyan-700 dark:text-cyan-300",
    headerBorder: "border-cyan-200 dark:border-cyan-800",
    btnSelected: "bg-cyan-600 border-cyan-600 text-white shadow-sm ring-1 ring-cyan-100 dark:ring-cyan-900",
    btnHover: "hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 dark:hover:border-cyan-400",
    pulse: "bg-cyan-600",
    rowBorder: "border-l-cyan-600"
  },
  "Opioids": {
    activeBg: "bg-rose-50 dark:bg-rose-900/20",
    activeRing: "ring-rose-100 dark:ring-rose-900/50",
    headerText: "text-rose-700 dark:text-rose-300",
    headerBorder: "border-rose-200 dark:border-rose-800",
    btnSelected: "bg-rose-600 border-rose-600 text-white shadow-sm ring-1 ring-rose-100 dark:ring-rose-900",
    btnHover: "hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 dark:hover:border-rose-400",
    pulse: "bg-rose-600",
    rowBorder: "border-l-rose-600"
  },
  "Antiseptics": {
    activeBg: "bg-teal-50 dark:bg-teal-900/20",
    activeRing: "ring-teal-100 dark:ring-teal-900/50",
    headerText: "text-teal-700 dark:text-teal-300",
    headerBorder: "border-teal-200 dark:border-teal-800",
    btnSelected: "bg-teal-600 border-teal-600 text-white shadow-sm ring-1 ring-teal-100 dark:ring-teal-900",
    btnHover: "hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 dark:hover:border-teal-400",
    pulse: "bg-teal-600",
    rowBorder: "border-l-teal-600"
  },
  "Others": {
    activeBg: "bg-slate-100 dark:bg-slate-800",
    activeRing: "ring-slate-200 dark:ring-slate-700",
    headerText: "text-slate-700 dark:text-slate-300",
    headerBorder: "border-slate-300 dark:border-slate-700",
    btnSelected: "bg-slate-600 border-slate-600 text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-500",
    btnHover: "hover:border-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:hover:border-slate-500",
    pulse: "bg-slate-600",
    rowBorder: "border-l-slate-600"
  }
};

const DEFAULT_THEME = {
    activeBg: "bg-purple-50/80 dark:bg-purple-900/20",
    activeRing: "ring-purple-100 dark:ring-purple-900/50",
    headerText: "text-[#8055f1] dark:text-purple-300",
    headerBorder: "border-purple-200 dark:border-purple-800",
    btnSelected: "bg-[#8055f1] border-[#8055f1] text-white",
    btnHover: "hover:border-[#8055f1] hover:text-[#8055f1] dark:hover:text-purple-300",
    pulse: "bg-[#8055f1]",
    rowBorder: "border-l-[#8055f1]"
};

const TestingLogForm: React.FC<TestingLogFormProps> = ({ 
  formData, 
  setFormData, 
  onSubmit, 
  drugCategories, 
  symptomOptions, 
  interventionOptions 
}) => {

  // Create a map of Drug -> Category for quick lookup
  const drugToCategoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    Object.entries(drugCategories).forEach(([cat, drugs]) => {
      (drugs as string[]).forEach(d => {
        map[d] = cat;
      });
    });
    return map;
  }, [drugCategories]);

  const preventNegativeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent minus sign and 'e' which allows exponential notation
    if (["-", "e", "E", "+"].includes(e.key)) {
        e.preventDefault();
    }
  };

  const handleInputChange = (field: keyof LogFormData, value: any) => {
    if (field === 'reactionTime') {
        // Validation for simple top-level numbers
        if (value && parseFloat(value) < 0) return;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleControlChange = (field: string, value: string) => {
    if (value && parseFloat(value) < 0) return;
    setFormData(prev => ({
        ...prev, 
        controls: {
            ...prev.controls, 
            [field]: value
        }
    }));
  };

  const toggleDrug = (drugName: string) => {
    setFormData(prev => {
      // Find if this standard drug already exists (excluding custom 'Other' entries which have IDs)
      const exists = prev.testPanel.find(row => row.drugName === drugName && !row.id);
      
      if (exists) {
        return {
          ...prev,
          testPanel: prev.testPanel.filter(row => row.drugName !== drugName || row.id) // Keep custom rows
        };
      } else {
        return {
          ...prev,
          testPanel: [...prev.testPanel, { drugName, sptWheal: '', idt100: '', idt10: '', idtNeat: '', customName: '' }]
        };
      }
    });
  };

  const addCustomDrug = () => {
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
  };

  const removeRow = (index: number) => {
    setFormData(prev => ({
        ...prev,
        testPanel: prev.testPanel.filter((_, i) => i !== index)
    }));
  };

  const updateDrugData = (index: number, field: string, value: string) => {
    // Validation for grid numbers
    if (['sptWheal', 'idt100', 'idt10', 'idtNeat'].includes(field)) {
        if (value && parseFloat(value) < 0) return;
    }

    setFormData(prev => ({
      ...prev,
      testPanel: prev.testPanel.map((row, i) => 
        i === index ? { ...row, [field]: value } : row
      )
    }));
  };

  const toggleSymptom = (symptom: string) => {
    setFormData(prev => {
      const exists = prev.symptoms.includes(symptom);
      return {
        ...prev,
        symptoms: exists 
          ? prev.symptoms.filter(s => s !== symptom)
          : [...prev.symptoms, symptom]
      };
    });
  };

  // Prepare challenge options: Panel drugs + Standard drugs, with 'Other' forced to bottom
  const challengeOptions = React.useMemo(() => {
    // 1. Get drugs from the panel (using custom names if 'Other')
    const panelDrugs = (formData.testPanel || [])
        .map(r => r.drugName === 'Other' && r.customName ? r.customName : r.drugName)
        .filter((d): d is string => !!d);
    
    // 2. Get standard drug list
    const standardDrugs = Object.values(drugCategories).flat();
    
    // 3. Combine and deduplicate, excluding 'Other'
    const uniqueDrugs = Array.from(new Set([...panelDrugs, ...standardDrugs]))
        .filter(d => d !== 'Other');
    
    // 4. Sort alphabetically
    uniqueDrugs.sort();
    
    // 5. Append 'Other' at the end
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
                    className="max-w-[200px]"
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
            
            {/* Controls - Compact Single Line */}
            <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mr-2">Reference Controls (mm):</span>
              
              <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Histamine (SPT)</label>
                  <Input 
                    type="number" 
                    min="0"
                    onKeyDown={preventNegativeInput}
                    placeholder="0" 
                    className="bg-white h-8 w-16 text-center text-xs"
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
                    className="bg-white h-8 w-16 text-center text-xs"
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
                    className="bg-white h-8 w-16 text-center text-xs"
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
                    const hasActiveSelection = (drugs as string[]).some(drug => 
                        formData.testPanel.some(r => r.drugName === drug && !r.id)
                    );
                    
                    const theme = CATEGORY_THEMES[category] || DEFAULT_THEME;

                    return (
                    <div key={category} className={`space-y-2 rounded-xl p-3 transition-colors duration-300 ${hasActiveSelection ? `${theme.activeBg} ${theme.activeRing} ring-1` : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}>
                        <h4 className={`text-xs font-bold uppercase tracking-wide border-b border-dashed pb-1 mb-2 flex justify-between items-center ${hasActiveSelection ? `${theme.headerText} ${theme.headerBorder}` : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'}`}>
                            {category}
                            {hasActiveSelection && <span className={`flex h-2 w-2 rounded-full ${theme.pulse} animate-pulse`}></span>}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {(drugs as string[]).map(drug => {
                                // Only highlight if it's a standard drug entry (no ID)
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
                            
                            {/* "Add Other" Button at the bottom of Others category */}
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
                 <div className="hidden md:grid md:grid-cols-[1fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-2 p-3 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800 mb-2 rounded-t-lg">
                    <div>Drug</div>
                    <div>SPT</div>
                    <div>1:100</div>
                    <div>1:10</div>
                    <div>Neat</div>
                 </div>

                 <div className="space-y-3">
                   {formData.testPanel.map((row, index) => {
                      // Determine row border color based on category
                      const category = drugToCategoryMap[row.drugName] || 'Others';
                      const theme = CATEGORY_THEMES[category] || DEFAULT_THEME;
                      const borderClass = row.drugName === 'Other' ? DEFAULT_THEME.rowBorder : theme.rowBorder;

                      return (
                      <div 
                        key={row.id || row.drugName} 
                        className={`grid grid-cols-2 md:grid-cols-[1fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-x-3 gap-y-4 md:gap-2 p-4 md:p-3 items-start md:items-center bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 border-l-[6px] ${borderClass} shadow-sm rounded-r-md group animate-enter`}
                      >
                         {/* Name Column (Full width on mobile) */}
                         <div className="col-span-2 md:col-span-1 flex items-center gap-2">
                            {row.drugName === 'Other' ? (
                                <Input 
                                    className="h-10 md:h-9 text-sm flex-1 min-w-0 font-medium" 
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
                                <X className="w-5 h-5 md:w-4 md:h-4" />
                            </button>
                         </div>

                         {/* Input Columns (Grid on mobile) */}
                         {['sptWheal', 'idt100', 'idt10', 'idtNeat'].map((field) => (
                            <div key={field} className="relative flex flex-col gap-1.5 md:block">
                                {/* Mobile Label */}
                                <span className="md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                  {FIELD_LABELS[field]}
                                </span>
                                <div className="relative">
                                  <Input 
                                    type="number" 
                                    min="0"
                                    onKeyDown={preventNegativeInput}
                                    className="h-10 md:h-9 pr-8 text-sm text-center font-medium md:font-normal"
                                    placeholder="0"
                                    value={(row as any)[field] || ''}
                                    onChange={(e) => updateDrugData(index, field, e.target.value)}
                                  />
                                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 pointer-events-none">mm</span>
                                </div>
                            </div>
                         ))}
                      </div>
                   )})}
                 </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-900 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
                 Select drugs above to enter results.
              </div>
            )}

          </CardContent>
        </Card>

        {/* 3. Challenge Phase */}
        <Card className={`transition-all duration-300 ${formData.proceedToChallenge ? 'border-[#8055f1] ring-1 ring-[#e6e1fd] dark:ring-purple-900/50' : 'opacity-90'}`}>
          <div 
             className="p-4 flex items-center justify-between cursor-pointer border-b border-slate-100 dark:border-slate-800"
             onClick={() => handleInputChange('proceedToChallenge', !formData.proceedToChallenge)}
          >
             <CardTitle className="text-[#441170] dark:text-purple-300 flex items-center gap-2">
                <div className={`p-1.5 rounded-md transition-colors ${formData.proceedToChallenge ? 'bg-[#e6e1fd] dark:bg-purple-900/40' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  <History className={`w-4 h-4 ${formData.proceedToChallenge ? 'text-[#8055f1] dark:text-purple-300' : 'text-slate-400'}`} />
                </div>
                Challenge Phase
             </CardTitle>
             <div className={`w-11 h-6 rounded-full transition-colors relative ${formData.proceedToChallenge ? 'bg-[#8055f1]' : 'bg-slate-200 dark:bg-slate-700'}`}>
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform ${formData.proceedToChallenge ? 'translate-x-5' : ''}`} />
             </div>
          </div>
          
          {formData.proceedToChallenge && (
            <CardContent className="pt-4 space-y-5 animate-in slide-in-from-top-4">
              <div className="space-y-2">
                <Label>Challenge Drug</Label>
                <Select 
                  options={challengeOptions}
                  placeholder="Select drug being challenged..."
                  value={formData.challengeDrug}
                  onChange={(e) => handleInputChange('challengeDrug', e.target.value)}
                />
                {formData.challengeDrug === 'Other' && (
                  <Input 
                    placeholder="Specify name of challenge drug..."
                    className="mt-2 bg-white"
                    value={formData.challengeDrugCustom || ''}
                    onChange={(e) => handleInputChange('challengeDrugCustom', e.target.value)}
                    autoFocus
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <div 
                   onClick={() => handleInputChange('outcome', 'SUCCESS')}
                   className={`cursor-pointer rounded-lg border-2 p-3 text-center transition-all ${
                     formData.outcome === 'SUCCESS' 
                     ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                     : 'border-slate-100 dark:border-slate-800 hover:border-green-200 hover:bg-green-50/50 dark:hover:bg-green-900/10'
                   }`}
                 >
                    <CheckCircle2 className={`w-6 h-6 mx-auto mb-1 ${formData.outcome === 'SUCCESS' ? 'text-green-600 dark:text-green-400' : 'text-slate-300 dark:text-slate-600'}`} />
                    <span className="text-sm font-bold">Negative</span>
                 </div>
                 
                 <div 
                   onClick={() => handleInputChange('outcome', 'UNSUCCESS')}
                   className={`cursor-pointer rounded-lg border-2 p-3 text-center transition-all ${
                     formData.outcome === 'UNSUCCESS' 
                     ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' 
                     : 'border-slate-100 dark:border-slate-800 hover:border-red-200 hover:bg-red-50/50 dark:hover:bg-red-900/10'
                   }`}
                 >
                    <AlertTriangle className={`w-6 h-6 mx-auto mb-1 ${formData.outcome === 'UNSUCCESS' ? 'text-red-600 dark:text-red-400' : 'text-slate-300 dark:text-slate-600'}`} />
                    <span className="text-sm font-bold">Positive</span>
                 </div>
              </div>

              {formData.outcome === 'UNSUCCESS' && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg p-4 space-y-4 animate-in fade-in">
                   <div className="space-y-2">
                      <Label className="text-red-800 dark:text-red-300">Reaction Time (min)</Label>
                      <Input 
                        type="number" 
                        min="0"
                        onKeyDown={preventNegativeInput}
                        className="bg-white border-red-200 focus-visible:ring-red-500"
                        value={formData.reactionTime}
                        onChange={(e) => handleInputChange('reactionTime', e.target.value)}
                      />
                   </div>
                   
                   <div className="space-y-2">
                      <Label className="text-red-800 dark:text-red-300">Intervention</Label>
                      <Select 
                        options={interventionOptions} 
                        placeholder="Select Intervention..." 
                        value={formData.interventionType}
                        onChange={(e) => handleInputChange('interventionType', e.target.value)}
                        className="bg-white border-red-200 focus:ring-red-500"
                      />
                      {formData.interventionType === 'Other' && (
                        <Input 
                          placeholder="Specify other intervention..."
                          className="bg-white border-red-200 focus-visible:ring-red-500 mt-2"
                          value={formData.interventionOther}
                          onChange={(e) => handleInputChange('interventionOther', e.target.value)}
                        />
                      )}
                   </div>

                   <div className="space-y-2">
                      <Label className="text-red-800 dark:text-red-300">Symptoms</Label>
                      <div className="flex flex-wrap gap-2">
                        {symptomOptions.map((symptom) => (
                          <button
                            key={symptom}
                            onClick={() => toggleSymptom(symptom)}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                              formData.symptoms.includes(symptom)
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-red-900/30 hover:border-red-300'
                            }`}
                          >
                            {symptom}
                          </button>
                        ))}
                      </div>
                      {formData.symptoms.includes('Other') && (
                        <Input 
                          placeholder="Specify other symptoms..."
                          className="bg-white border-red-200 focus-visible:ring-red-500 mt-2"
                          value={formData.symptomsOther}
                          onChange={(e) => handleInputChange('symptomsOther', e.target.value)}
                        />
                      )}
                   </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* 4. Plan */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">Final Plan / Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea 
               className={`flex min-h-[80px] w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-[#8055f1] dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100`}
               placeholder="..."
               value={formData.plan}
               onChange={(e) => handleInputChange('plan', e.target.value)}
            />
          </CardContent>
        </Card>

        <Button onClick={onSubmit} size="lg" className="w-full text-lg shadow-lg shadow-purple-200 dark:shadow-purple-900/50">
          <Save className="w-5 h-5 mr-2" /> Save Record
        </Button>
    </div>
  );
};

export default TestingLogForm;