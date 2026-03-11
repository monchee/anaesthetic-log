import React from 'react';
import { Label, Input } from '../../../../components/ui';
import { Activity, Syringe, ThumbsUp, ThumbsDown, CheckCircle2, AlertOctagon, Clock, Stethoscope } from 'lucide-react';

interface ChallengeSectionProps {
  proceedToChallenge: boolean;
  challengeDrug: string;
  challengeDrugCustom?: string;
  outcome: 'SUCCESS' | 'UNSUCCESS' | null;
  reactionTime: string;
  symptoms: string[];
  symptomsOther: string;
  interventionType: string;
  interventionOther: string;
  challengeOptions: string[];
  symptomOptions: readonly string[] | string[];
  interventionOptions: readonly string[] | string[];
  onToggleChallenge: () => void;
  onChange: (field: string, value: any) => void;
  onToggleSymptom: (symptom: string) => void;
}

const preventNegativeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (["-", "e", "E", "+"].includes(e.key)) {
    e.preventDefault();
  }
};

export const ChallengeSection: React.FC<ChallengeSectionProps> = ({
  proceedToChallenge,
  challengeDrug,
  challengeDrugCustom,
  outcome,
  reactionTime,
  symptoms,
  symptomsOther,
  interventionType,
  interventionOther,
  challengeOptions,
  symptomOptions,
  interventionOptions,
  onToggleChallenge,
  onChange,
  onToggleSymptom
}) => {
  return (
    <div className="space-y-6">
      {/* Main Toggle */}
      <div 
        onClick={onToggleChallenge}
        className={`flex items-center justify-between p-4 rounded-none border-2 cursor-pointer transition-all duration-300 group ${
          proceedToChallenge 
          ? 'border-primary bg-slate-50 dark:bg-slate-900/10 shadow-sm' 
          : 'border-slate-100 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-950'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-none transition-colors ${
            proceedToChallenge 
            ? 'bg-primary text-white' 
            : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
          }`}>
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`font-bold transition-colors ${proceedToChallenge ? 'text-slate-800 dark:text-primary' : 'text-slate-700 dark:text-slate-300'}`}>
              Drug Challenge
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Proceed with live drug challenge</p>
          </div>
        </div>
        
        {/* Visual Switch */}
        <div className={`w-12 h-7 rounded-none p-1 transition-colors duration-300 ease-in-out ${proceedToChallenge ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
          <div className={`w-5 h-5 bg-white rounded-none shadow-sm transform transition-transform duration-300 ease-in-out ${proceedToChallenge ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
      </div>

      {proceedToChallenge && (
        <div className="space-y-8 pl-1 sm:pl-2 animate-in slide-in-from-top-2 fade-in duration-300">
          
          {/* Drug Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              Select Challenge Drug
            </Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 group">
                <Syringe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-hover:text-primary transition-colors pointer-events-none" />
                <select 
                  value={challengeDrug} 
                  onChange={(e) => onChange('challengeDrug', e.target.value)}
                  className="w-full pl-10 h-11 border-slate-200 border rounded-none focus:border-primary focus:ring-primary dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-2"
                >
                  <option value="" disabled>Choose drug from list...</option>
                  {challengeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              {challengeDrug === 'Other' && (
                <Input 
                  className="flex-1 h-11" 
                  placeholder="Specify custom drug name..." 
                  value={challengeDrugCustom || ''}
                  onChange={(e) => onChange('challengeDrugCustom', e.target.value)}
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
                onClick={() => onChange('outcome', 'SUCCESS')}
                className={`relative flex flex-col items-center justify-center gap-2 p-6 rounded-none border-2 transition-all duration-200 hover:shadow-md ${
                  outcome === 'SUCCESS' 
                  ? 'bg-green-50 border-green-500 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-green-300 hover:bg-green-50/50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400'
                }`}
              >
                <div className={`p-3 rounded-none ${
                  outcome === 'SUCCESS' ? 'bg-green-100 text-green-600 dark:bg-green-900/50' : 'bg-slate-100 text-slate-400 dark:bg-slate-900'
                }`}>
                  <ThumbsUp className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm">Tolerated (Safe)</span>
                {outcome === 'SUCCESS' && (
                  <div className="absolute top-3 right-3 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
              </button>

              <button 
                type="button" 
                onClick={() => onChange('outcome', 'UNSUCCESS')}
                className={`relative flex flex-col items-center justify-center gap-2 p-6 rounded-none border-2 transition-all duration-200 hover:shadow-md ${
                  outcome === 'UNSUCCESS' 
                  ? 'bg-red-50 border-red-500 text-red-800 dark:bg-red-900/20 dark:text-red-300' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-red-300 hover:bg-red-50/50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400'
                }`}
              >
                <div className={`p-3 rounded-none ${
                  outcome === 'UNSUCCESS' ? 'bg-red-100 text-red-600 dark:bg-red-900/50' : 'bg-slate-100 text-slate-400 dark:bg-slate-900'
                }`}>
                  <ThumbsDown className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm">Reaction Occurred</span>
                {outcome === 'UNSUCCESS' && (
                  <div className="absolute top-3 right-3 text-red-600 dark:text-red-400">
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Reaction Details */}
          {outcome === 'UNSUCCESS' && (
            <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-none border border-red-200 dark:border-red-900/30 space-y-6 animate-in fade-in slide-in-from-top-1 shadow-sm">
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
                    value={reactionTime} 
                    onChange={(e) => onChange('reactionTime', e.target.value)} 
                    className="bg-white dark:bg-slate-950 border-red-200 focus:border-red-400 focus:ring-red-400"
                    placeholder="e.g. 5"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-red-900 dark:text-red-200 font-semibold flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" /> Treatment Required
                  </Label>
                  <select 
                    value={interventionType} 
                    onChange={(e) => onChange('interventionType', e.target.value)}
                    className="w-full h-11 px-3 border-red-200 border rounded-none focus:border-red-400 focus:ring-red-400 bg-white dark:bg-slate-950 dark:border-red-900/30 focus:outline-none focus:ring-2"
                  >
                    <option value="" disabled>Select intervention...</option>
                    {interventionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
              
              {interventionType === 'Other' && (
                <div className="space-y-2 animate-in fade-in">
                  <Label className="text-red-900 dark:text-red-200">Specify Treatment Details</Label>
                  <Input 
                    value={interventionOther} 
                    onChange={(e) => onChange('interventionOther', e.target.value)} 
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
                      onClick={() => onToggleSymptom(sym)}
                      className={`px-3 py-1.5 rounded-none text-xs font-medium border transition-all duration-200 ${
                        symptoms.includes(sym)
                        ? 'bg-red-600 text-white border-red-600 shadow-md transform scale-105'
                        : 'bg-white text-red-900 border-red-200 hover:bg-red-100 hover:border-red-300 dark:bg-slate-950 dark:text-red-200 dark:border-red-900/50'
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>
              {symptoms.includes('Other') && (
                <div className="space-y-2 animate-in fade-in">
                  <Label className="text-red-900 dark:text-red-200">Specify Other Symptoms</Label>
                  <Input 
                    value={symptomsOther} 
                    onChange={(e) => onChange('symptomsOther', e.target.value)} 
                    className="bg-white dark:bg-slate-950 border-red-200"
                    placeholder="Describe symptoms..."
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
