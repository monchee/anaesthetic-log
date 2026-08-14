import React from 'react';
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { Activity, Clock, Stethoscope } from 'lucide-react';
import { LogFormData } from '@/types';
import { InputChangeHandler, preventNegativeInput } from './TestingLogFormSectionShared';

interface DrugChallengeReactionFieldsProps {
  formData: LogFormData;
  interventionOptions: readonly string[] | string[];
  symptomOptions: readonly string[] | string[];
  onInputChange: InputChangeHandler;
  onToggleSymptom: (symptom: string) => void;
}

export function DrugChallengeReactionFields({
  formData,
  interventionOptions,
  symptomOptions,
  onInputChange,
  onToggleSymptom,
}: DrugChallengeReactionFieldsProps) {
  return (
    <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-none border border-red-200 dark:border-red-900/30 space-y-6 animate-in fade-in slide-in-from-top-1 shadow-sm">
      <div className="flex items-center gap-2 pb-2 border-b border-red-200 dark:border-red-900/30">
        <Activity className="w-5 h-5 text-red-600" />
        <h4 className="font-bold text-red-800 dark:text-red-300 text-sm uppercase tracking-wide">Reaction Documentation</h4>
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
            onChange={(e) => onInputChange('reactionTime', e.target.value)}
            placeholder="Minutes"
            className="h-10 border-red-200 dark:border-red-900/30 focus:border-red-400 focus:ring-red-400 transition-[box-shadow,border-color] rounded-none bg-background font-mono tabular-nums"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-red-900 dark:text-red-200 font-semibold flex items-center gap-2">
            <Stethoscope className="w-4 h-4" aria-hidden="true" /> Treatment Required
          </Label>
          <Select value={formData.interventionType} onValueChange={(value) => onInputChange('interventionType', value)}>
            <SelectTrigger className="h-10 bg-background border-red-200 dark:border-red-900/30 focus:border-red-400 focus:ring-red-400 rounded-none" aria-label="Select treatment intervention">
              <SelectValue placeholder="Select intervention..." />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              {interventionOptions.map(opt => <SelectItem key={opt} value={opt} className="rounded-none">{opt}</SelectItem>)}
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
            onChange={(e) => onInputChange('interventionOther', e.target.value)}
            className="bg-background border-red-200 dark:border-red-900/30 rounded-none"
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
              onClick={() => onToggleSymptom(sym)}
              className={`px-3 py-1.5 rounded-none text-xs font-medium border transition-[color,background-color,border-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                formData.symptoms.includes(sym)
                  ? 'bg-red-600 text-white border-red-600 shadow-sm'
                  : 'bg-card text-red-900 border-red-200 hover:bg-red-100 hover:border-red-300 dark:bg-background dark:text-red-200 dark:border-red-900/50 dark:hover:bg-red-900/20 dark:hover:border-red-800'
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
            onChange={(e) => onInputChange('symptomsOther', e.target.value)}
            className="bg-background border-red-200 dark:border-red-900/30 rounded-none"
            placeholder="Describe symptoms..."
          />
        </div>
      )}
    </div>
  );
}
