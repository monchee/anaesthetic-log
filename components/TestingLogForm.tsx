import React from 'react';
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

const TestingLogForm: React.FC<TestingLogFormProps> = ({ 
  formData, 
  setFormData, 
  onSubmit, 
  drugCategories, 
  symptomOptions, 
  interventionOptions 
}) => {

  const handleInputChange = (field: keyof LogFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleControlChange = (field: string, value: string) => {
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
            
            {/* Controls */}
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <Label className="mb-3 block text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Reference Controls (mm)</Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 sm:text-left text-center block leading-tight">Histamine<br />(SPT)</span>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    className="bg-white h-8 text-center"
                    value={formData.controls.histamineSpt}
                    onChange={(e) => handleControlChange('histamineSpt', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 sm:text-left text-center block leading-tight">Saline<br />(SPT)</span>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    className="bg-white h-8 text-center"
                    value={formData.controls.salineSpt}
                    onChange={(e) => handleControlChange('salineSpt', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 sm:text-left text-center block leading-tight">Saline<br />(IDT)</span>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    className="bg-white h-8 text-center"
                    value={formData.controls.salineIdt}
                    onChange={(e) => handleControlChange('salineIdt', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Selection Area: Categories */}
            <div className="space-y-4 mb-6">
               <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                   <Label className="text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">Select Drugs to Test:</Label>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {Object.entries(drugCategories).map(([category, drugs]) => (
                    <div key={category} className="space-y-2">
                        <h4 className="text-xs font-bold text-[#441170] dark:text-purple-300 uppercase tracking-wide border-b border-dashed border-slate-200 dark:border-slate-800 pb-1 mb-2">
                            {category}
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
                                    ? 'bg-[#8055f1] text-white border-[#8055f1] shadow-sm ring-1 ring-purple-100 font-medium' 
                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#8055f1] dark:hover:border-[#8055f1] hover:text-[#8055f1] dark:hover:text-purple-300 hover:bg-slate-50 dark:hover:bg-slate-800'
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
                                    className="text-xs px-2.5 py-1.5 rounded border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-[#8055f1] hover:text-[#8055f1] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 flex items-center gap-1.5 font-medium"
                                >
                                    <Plus className="w-3 h-3 shrink-0" />
                                    Other (Not listed)
                                </button>
                            )}
                        </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Data Entry Table */}
            {formData.testPanel.length > 0 ? (
              <div className={`border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden animate-in fade-in slide-in-from-top-2`}>
                 <div className="grid grid-cols-[1fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-2 p-3 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                    <div>Drug</div>
                    <div>SPT</div>
                    <div>1:100</div>
                    <div>1:10</div>
                    <div>Neat</div>
                 </div>

                 <div className="divide-y divide-slate-100 dark:divide-slate-800">
                   {formData.testPanel.map((row, index) => (
                      <div key={row.id || row.drugName} className="grid grid-cols-[1fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-2 p-3 items-center bg-white dark:bg-slate-950 group">
                         {/* Name Column */}
                         <div className="flex items-center gap-2">
                            {row.drugName === 'Other' ? (
                                <Input 
                                    className="h-9 text-sm flex-1 min-w-0 font-medium" 
                                    placeholder="Specify name..."
                                    value={row.customName || ''}
                                    onChange={(e) => updateDrugData(index, 'customName', e.target.value)}
                                    autoFocus
                                />
                            ) : (
                                <span className="font-medium text-sm text-[#441170] dark:text-purple-300 flex-1">
                                    {row.drugName}
                                </span>
                            )}
                            
                            <button 
                                onClick={() => removeRow(index)}
                                className={`shrink-0 text-slate-300 hover:text-red-500 transition-opacity p-1 ${row.drugName === 'Other' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                title="Remove drug"
                            >
                                <X className="w-4 h-4" />
                            </button>
                         </div>

                         {/* Input Columns */}
                         {['sptWheal', 'idt100', 'idt10', 'idtNeat'].map((field) => (
                            <div key={field} className="relative">
                                <Input 
                                type="number" 
                                className="h-9 pr-6 text-sm text-center"
                                placeholder="0"
                                value={(row as any)[field] || ''}
                                onChange={(e) => updateDrugData(index, field, e.target.value)}
                                />
                                <span className="absolute right-2 top-2.5 text-xs text-slate-400">mm</span>
                            </div>
                         ))}
                      </div>
                   ))}
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
                IV Challenge Phase
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

              <div className="grid grid-cols-2 gap-3">
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