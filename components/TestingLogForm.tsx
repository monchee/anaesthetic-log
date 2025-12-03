import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Label, Input, Button, Select, Badge } from './ui';
import { LogFormData } from '../types';
import { Check, X, History, Activity, Save, AlertTriangle, CheckCircle2, Calendar, Stethoscope } from 'lucide-react';

interface TestingLogFormProps {
  formData: LogFormData;
  setFormData: React.Dispatch<React.SetStateAction<LogFormData>>;
  onSubmit: () => void;
  drugOptions: string[];
  symptomOptions: string[];
  interventionOptions: string[];
}

const TestingLogForm: React.FC<TestingLogFormProps> = ({ 
  formData, 
  setFormData, 
  onSubmit, 
  drugOptions, 
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
      const exists = prev.testPanel.find(row => row.drugName === drugName);
      if (exists) {
        return {
          ...prev,
          testPanel: prev.testPanel.filter(row => row.drugName !== drugName)
        };
      } else {
        return {
          ...prev,
          testPanel: [...prev.testPanel, { drugName, sptWheal: '', idt100: '', idt10: '', idtNeat: '', customName: '' }]
        };
      }
    });
  };

  const updateDrugData = (drugName: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      testPanel: prev.testPanel.map(row => 
        row.drugName === drugName ? { ...row, [field]: value } : row
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

  return (
    <div className="space-y-6 mt-8">
      
      {/* Section Header */}
      <div className="flex items-center gap-2 border-b-2 border-slate-200 pb-2 mb-2">
        <Stethoscope className="w-6 h-6 text-[#441170]" />
        <h2 className="text-xl font-bold text-[#441170]">Anaesthetic Allergy Testing</h2>
      </div>

      {/* 1. Visit Details */}
      <Card>
        <CardContent className="pt-6">
            <div className="flex items-center gap-4">
                <Label className="whitespace-nowrap text-base font-semibold text-[#441170] flex items-center gap-2">
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
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-[#441170] flex items-center gap-2">
              <div className="bg-[#e6e1fd] p-1.5 rounded-md">
                 <Activity className="w-4 h-4 text-[#8055f1]" />
              </div>
              SPT & IDT Panel
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-6">
            
            {/* Controls */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <Label className="mb-3 block text-xs uppercase tracking-wider text-slate-500">Reference Controls (mm)</Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-slate-600 sm:text-left text-center block leading-tight">Histamine<br />(SPT)</span>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    className="bg-white h-8 text-center"
                    value={formData.controls.histamineSpt}
                    onChange={(e) => handleControlChange('histamineSpt', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-slate-600 sm:text-left text-center block leading-tight">Saline<br />(SPT)</span>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    className="bg-white h-8 text-center"
                    value={formData.controls.salineSpt}
                    onChange={(e) => handleControlChange('salineSpt', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-slate-600 sm:text-left text-center block leading-tight">Saline<br />(IDT)</span>
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

            {/* Selection Area: Pills */}
            <div className="space-y-2 mb-6">
               <Label className="text-xs uppercase text-slate-500 font-semibold tracking-wider">Select Drugs to Test:</Label>
               <div className="flex flex-wrap gap-2">
                  {drugOptions.map(drug => {
                    const isSelected = formData.testPanel.some(r => r.drugName === drug);
                    return (
                      <button
                        key={drug}
                        onClick={() => toggleDrug(drug)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 flex items-center gap-1.5 ${
                          isSelected 
                           ? 'bg-[#8055f1] text-white border-[#8055f1] shadow-sm ring-2 ring-purple-100' 
                           : 'bg-white text-slate-600 border-slate-200 hover:border-[#8055f1] hover:text-[#8055f1]'
                        }`}
                      >
                         {isSelected && <Check className="w-3 h-3" />}
                         {drug}
                      </button>
                    );
                  })}
               </div>
            </div>

            {/* Data Entry Table */}
            {formData.testPanel.length > 0 ? (
              <div className={`border border-slate-200 rounded-lg overflow-hidden animate-in fade-in slide-in-from-top-2`}>
                 <div className="grid grid-cols-[1fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-2 p-3 bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-100">
                    <div>Drug</div>
                    <div>SPT</div>
                    <div>1:100</div>
                    <div>1:10</div>
                    <div>Neat</div>
                 </div>

                 <div className="divide-y divide-slate-100">
                   {formData.testPanel.map((row) => (
                      <div key={row.drugName} className="grid grid-cols-[1fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-2 p-3 items-start bg-white group">
                         {/* Name Column */}
                         <div className="space-y-1 pt-1">
                            <div className="font-medium text-sm text-[#441170] flex items-center gap-2">
                              {row.drugName}
                              <button 
                                onClick={() => toggleDrug(row.drugName)}
                                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            {row.drugName === 'Other' && (
                               <Input 
                                 className="h-7 text-xs mt-1" 
                                 placeholder="Specify name..."
                                 value={row.customName || ''}
                                 onChange={(e) => updateDrugData(row.drugName, 'customName', e.target.value)}
                               />
                            )}
                         </div>

                         {/* Input Columns */}
                         {['sptWheal', 'idt100', 'idt10', 'idtNeat'].map((field) => (
                            <div key={field} className="relative">
                                <Input 
                                type="number" 
                                className="h-9 pr-6 text-sm text-center"
                                placeholder="0"
                                value={(row as any)[field] || ''}
                                onChange={(e) => updateDrugData(row.drugName, field, e.target.value)}
                                />
                                <span className="absolute right-2 top-2.5 text-xs text-slate-400">mm</span>
                            </div>
                         ))}
                      </div>
                   ))}
                 </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 text-slate-400 text-sm">
                 Select drugs above to enter results.
              </div>
            )}

          </CardContent>
        </Card>

        {/* 3. Challenge Phase */}
        <Card className={`transition-all duration-300 ${formData.proceedToChallenge ? 'border-[#8055f1] ring-1 ring-[#e6e1fd]' : 'opacity-90'}`}>
          <div 
             className="p-4 flex items-center justify-between cursor-pointer border-b border-slate-100"
             onClick={() => handleInputChange('proceedToChallenge', !formData.proceedToChallenge)}
          >
             <CardTitle className="text-[#441170] flex items-center gap-2">
                <div className={`p-1.5 rounded-md transition-colors ${formData.proceedToChallenge ? 'bg-[#e6e1fd]' : 'bg-slate-100'}`}>
                  <History className={`w-4 h-4 ${formData.proceedToChallenge ? 'text-[#8055f1]' : 'text-slate-400'}`} />
                </div>
                IV Challenge Phase
             </CardTitle>
             <div className={`w-11 h-6 rounded-full transition-colors relative ${formData.proceedToChallenge ? 'bg-[#8055f1]' : 'bg-slate-200'}`}>
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform ${formData.proceedToChallenge ? 'translate-x-5' : ''}`} />
             </div>
          </div>
          
          {formData.proceedToChallenge && (
            <CardContent className="pt-4 space-y-5 animate-in slide-in-from-top-4">
              <div className="space-y-2">
                <Label>Challenge Drug</Label>
                <Select 
                  options={[...new Set([...(formData.testPanel || []).map(r => r.drugName === 'Other' && r.customName ? r.customName : r.drugName).filter(Boolean), ...drugOptions])]}
                  placeholder="Select drug being challenged..."
                  value={formData.challengeDrug}
                  onChange={(e) => handleInputChange('challengeDrug', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div 
                   onClick={() => handleInputChange('outcome', 'SUCCESS')}
                   className={`cursor-pointer rounded-lg border-2 p-3 text-center transition-all ${
                     formData.outcome === 'SUCCESS' 
                     ? 'border-green-500 bg-green-50 text-green-700' 
                     : 'border-slate-100 hover:border-green-200 hover:bg-green-50/50'
                   }`}
                 >
                    <CheckCircle2 className={`w-6 h-6 mx-auto mb-1 ${formData.outcome === 'SUCCESS' ? 'text-green-600' : 'text-slate-300'}`} />
                    <span className="text-sm font-bold">Negative</span>
                 </div>
                 
                 <div 
                   onClick={() => handleInputChange('outcome', 'UNSUCCESS')}
                   className={`cursor-pointer rounded-lg border-2 p-3 text-center transition-all ${
                     formData.outcome === 'UNSUCCESS' 
                     ? 'border-red-500 bg-red-50 text-red-700' 
                     : 'border-slate-100 hover:border-red-200 hover:bg-red-50/50'
                   }`}
                 >
                    <AlertTriangle className={`w-6 h-6 mx-auto mb-1 ${formData.outcome === 'UNSUCCESS' ? 'text-red-600' : 'text-slate-300'}`} />
                    <span className="text-sm font-bold">Positive</span>
                 </div>
              </div>

              {formData.outcome === 'UNSUCCESS' && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 space-y-4 animate-in fade-in">
                   <div className="space-y-2">
                      <Label className="text-red-800">Reaction Time (min)</Label>
                      <Input 
                        type="number" 
                        className="bg-white border-red-200 focus-visible:ring-red-500"
                        value={formData.reactionTime}
                        onChange={(e) => handleInputChange('reactionTime', e.target.value)}
                      />
                   </div>
                   
                   <div className="space-y-2">
                      <Label className="text-red-800">Intervention</Label>
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
                      <Label className="text-red-800">Symptoms</Label>
                      <div className="flex flex-wrap gap-2">
                        {symptomOptions.map((symptom) => (
                          <button
                            key={symptom}
                            onClick={() => toggleSymptom(symptom)}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                              formData.symptoms.includes(symptom)
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-red-300'
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
            <CardTitle className="text-sm text-slate-500 uppercase tracking-wider">Final Plan / Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea 
               className={`flex min-h-[80px] w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-[#8055f1]`}
               placeholder="..."
               value={formData.plan}
               onChange={(e) => handleInputChange('plan', e.target.value)}
            />
          </CardContent>
        </Card>

        <Button onClick={onSubmit} size="lg" className="w-full text-lg shadow-lg shadow-purple-200">
          <Save className="w-5 h-5 mr-2" /> Save Record
        </Button>
    </div>
  );
};

export default TestingLogForm;