import React from 'react';
import { Label, Input } from '../../../../components/ui';
import { Activity, Syringe, ThumbsUp, ThumbsDown, CheckCircle2, AlertOctagon, Clock, Stethoscope } from 'lucide-react';
import { LogFormData } from '../types';

type ChallengeFields = Pick<
  LogFormData,
  | 'challengeDrug'
  | 'challengeDrugCustom'
  | 'outcome'
  | 'reactionTime'
  | 'symptomsOther'
  | 'interventionType'
  | 'interventionOther'
>;

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
  onChange: <K extends keyof ChallengeFields>(field: K, value: ChallengeFields[K]) => void;
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
        role="switch"
        aria-checked={proceedToChallenge}
        aria-label="Proceed with live drug challenge"
        aria-describedby="legacy-challenge-proceed-desc"
        tabIndex={0}
        onClick={onToggleChallenge}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onToggleChallenge();
          }
        }}
        className={`flex items-center justify-between p-4 rounded-none border-2 cursor-pointer transition-[color,background-color,border-color,box-shadow] duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          proceedToChallenge
          ? 'border-primary bg-primary/5 dark:bg-card/40 shadow-sm'
          : 'border-border hover:border-primary/40 bg-card'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-none transition-colors ${
            proceedToChallenge
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground group-hover:text-foreground'
          }`}>
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">
              Drug Challenge
            </h3>
            <p id="legacy-challenge-proceed-desc" className="text-xs text-muted-foreground">Proceed with live drug challenge</p>
          </div>
        </div>

        {/* Visual Switch */}
        <div className={`w-12 h-7 rounded-none p-1 transition-colors duration-150 ease-in-out ${proceedToChallenge ? 'bg-primary' : 'bg-muted'}`}>
          <div className={`w-5 h-5 bg-background rounded-none shadow-sm transform transition-transform duration-150 ease-in-out ${proceedToChallenge ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
      </div>

      {proceedToChallenge && (
        <div className="space-y-8 pl-1 sm:pl-2 animate-in slide-in-from-top-2 fade-in duration-150">

          {/* Drug Selection */}
          <div className="space-y-3">
            <Label htmlFor="legacy-challenge-drug" className="text-sm font-semibold text-foreground flex items-center gap-2">
              Select Challenge Drug
            </Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 group">
                <Syringe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors pointer-events-none" />
                <select
                  id="legacy-challenge-drug"
                  value={challengeDrug}
                  onChange={(e) => onChange('challengeDrug', e.target.value)}
                  className="w-full pl-10 h-11 border-border border rounded-none bg-background text-foreground focus:border-ring focus:ring-2 focus:ring-ring focus:outline-none text-sm"
                >
                  <option value="" disabled>Choose drug from list...</option>
                  {challengeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              {challengeDrug === 'Other' && (
                <Input
                  className="flex-1 h-11 rounded-none font-mono"
                  placeholder="Specify custom drug name..."
                  aria-label="Specify custom drug name"
                  value={challengeDrugCustom || ''}
                  onChange={(e) => onChange('challengeDrugCustom', e.target.value)}
                  autoFocus
                />
              )}
            </div>
          </div>

          {/* Outcome Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">Observation Outcome</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => onChange('outcome', 'SUCCESS')}
                className={`relative flex flex-col items-center justify-center gap-2 p-6 rounded-none border-2 transition-[color,background-color,border-color,box-shadow] duration-150 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  outcome === 'SUCCESS'
                  ? 'bg-status-success/15 border-status-success text-status-success dark:bg-status-success/20 dark:text-status-success'
                  : 'bg-card border-border text-muted-foreground hover:border-status-success/40 hover:bg-status-success/10 hover:text-foreground'
                }`}
              >
                <div className={`p-3 rounded-none ${
                  outcome === 'SUCCESS' ? 'bg-status-success/20 text-status-success' : 'bg-muted text-muted-foreground'
                }`}>
                  <ThumbsUp className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm">Tolerated (Safe)</span>
                {outcome === 'SUCCESS' && (
                  <div className="absolute top-3 right-3 text-status-success">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => onChange('outcome', 'UNSUCCESS')}
                className={`relative flex flex-col items-center justify-center gap-2 p-6 rounded-none border-2 transition-[color,background-color,border-color,box-shadow] duration-150 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  outcome === 'UNSUCCESS'
                  ? 'bg-status-danger/15 border-status-danger text-status-danger dark:bg-status-danger/20 dark:text-status-danger'
                  : 'bg-card border-border text-muted-foreground hover:border-status-danger/40 hover:bg-status-danger/10 hover:text-foreground'
                }`}
              >
                <div className={`p-3 rounded-none ${
                  outcome === 'UNSUCCESS' ? 'bg-status-danger/20 text-status-danger' : 'bg-muted text-muted-foreground'
                }`}>
                  <ThumbsDown className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm">Reaction Occurred</span>
                {outcome === 'UNSUCCESS' && (
                  <div className="absolute top-3 right-3 text-status-danger">
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Reaction Details */}
          {outcome === 'UNSUCCESS' && (
            <div className="bg-status-danger/10 p-5 rounded-none border border-status-danger/30 space-y-6 animate-in fade-in slide-in-from-top-1 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-status-danger/30">
                <Activity className="w-5 h-5 text-status-danger" />
                <h4 className="font-bold text-status-danger text-sm uppercase tracking-wide">
                  Reaction Documentation
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="legacy-reaction-time" className="text-foreground font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Time to Reaction (min)
                  </Label>
                  <Input
                    id="legacy-reaction-time"
                    type="number"
                    min="0"
                    onKeyDown={preventNegativeInput}
                    value={reactionTime}
                    onChange={(e) => onChange('reactionTime', e.target.value)}
                    className="bg-background border-border focus:border-status-danger focus:ring-status-danger font-mono tabular-nums rounded-none"
                    placeholder="e.g. 5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legacy-intervention-type" className="text-foreground font-semibold flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" /> Treatment Required
                  </Label>
                  <select
                    id="legacy-intervention-type"
                    value={interventionType}
                    onChange={(e) => onChange('interventionType', e.target.value)}
                    className="w-full h-11 px-3 border-border border rounded-none focus:border-status-danger focus:ring-status-danger bg-background focus:outline-none focus:ring-2 text-sm text-foreground"
                  >
                    <option value="" disabled>Select intervention...</option>
                    {interventionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              {interventionType === 'Other' && (
                <div className="space-y-2 animate-in fade-in">
                  <Label htmlFor="legacy-intervention-other" className="text-foreground">Specify Treatment Details</Label>
                  <Input
                    id="legacy-intervention-other"
                    value={interventionOther}
                    onChange={(e) => onChange('interventionOther', e.target.value)}
                    className="bg-background border-border rounded-none"
                    placeholder="Describe intervention..."
                  />
                </div>
              )}

              <div className="space-y-3">
                <Label className="text-foreground font-semibold">Observed Symptoms</Label>
                <div className="flex flex-wrap gap-2">
                  {symptomOptions.map(sym => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => onToggleSymptom(sym)}
                      className={`px-3 py-1.5 rounded-none text-xs font-medium border transition-[color,background-color,border-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        symptoms.includes(sym)
                        ? 'bg-status-danger text-status-danger-foreground border-status-danger shadow-sm'
                        : 'bg-card text-foreground border-border hover:bg-status-danger/10 hover:border-status-danger/30 dark:bg-background dark:text-foreground dark:hover:bg-status-danger/20'
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>
              {symptoms.includes('Other') && (
                <div className="space-y-2 animate-in fade-in">
                  <Label htmlFor="legacy-symptoms-other" className="text-foreground">Specify Other Symptoms</Label>
                  <Input
                    id="legacy-symptoms-other"
                    value={symptomsOther}
                    onChange={(e) => onChange('symptomsOther', e.target.value)}
                    className="bg-background border-border rounded-none"
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
