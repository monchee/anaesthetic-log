import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { Activity, AlertOctagon, CheckCircle2, Syringe, ThumbsDown, ThumbsUp } from 'lucide-react';
import { LogFormData } from '@/types';
import { InputChangeHandler } from './TestingLogFormSectionShared';
import { DrugChallengeReactionFields } from './DrugChallengeReactionFields';

interface DrugChallengeSectionProps {
  formData: LogFormData;
  challengeOptions: string[];
  symptomOptions: readonly string[] | string[];
  interventionOptions: readonly string[] | string[];
  onInputChange: InputChangeHandler;
  onToggleSymptom: (symptom: string) => void;
}

export function DrugChallengeSection({
  formData,
  challengeOptions,
  symptomOptions,
  interventionOptions,
  onInputChange,
  onToggleSymptom,
}: DrugChallengeSectionProps) {
  return (
    <Card style={{ '--section-index': 2 } as React.CSSProperties} className="animate-section-reveal">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          <div className="bg-primary/10 dark:bg-card/40 p-1.5 rounded-none">
            <Syringe className="w-4 h-4 text-primary dark:text-primary" />
          </div>
          Drug Challenge
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <button
          type="button"
          role="switch"
          aria-checked={formData.proceedToChallenge}
          onClick={() => onInputChange('proceedToChallenge', !formData.proceedToChallenge)}
          className={`flex w-full items-center justify-between p-4 rounded-none border-2 cursor-pointer transition-[color,background-color,border-color,box-shadow] duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            formData.proceedToChallenge
              ? 'border-primary bg-primary/5 dark:bg-card/40 shadow-sm'
              : 'border-border hover:border-primary/40 bg-card'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-none transition-colors ${
              formData.proceedToChallenge
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground group-hover:text-foreground'
            }`}>
              <Activity className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className={`font-semibold tracking-tight transition-colors ${formData.proceedToChallenge ? 'text-foreground font-bold' : 'text-foreground'}`}>
                Drug Challenge
              </span>
              <p className="text-xs text-muted-foreground">Proceed with live drug challenge</p>
            </div>
          </div>
          <div className={`w-12 h-7 rounded-none p-1 transition-colors duration-150 ease-in-out ${formData.proceedToChallenge ? 'bg-primary' : 'bg-muted'}`}>
            <div className={`w-5 h-5 bg-background rounded-none shadow-sm transform transition-transform duration-150 ease-in-out ${formData.proceedToChallenge ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
        </button>

        {formData.proceedToChallenge && (
          <div className="space-y-8 pl-1 sm:pl-2 animate-in slide-in-from-top-2 fade-in duration-150">
            <div className="space-y-3">
              <Label htmlFor="challenge-drug-select" className="text-sm font-semibold text-foreground flex items-center gap-2">Select Challenge Drug</Label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                  <Syringe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors pointer-events-none" />
                  <Select value={formData.challengeDrug} onValueChange={(value) => onInputChange('challengeDrug', value)}>
                    <SelectTrigger id="challenge-drug-select" className="pl-10 h-11 border-border focus:border-ring focus:ring-ring rounded-none bg-background text-foreground" aria-label="Select challenge drug">
                      <SelectValue placeholder="Choose drug from list..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      {challengeOptions.map(opt => <SelectItem key={opt} value={opt} className="rounded-none">{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {formData.challengeDrug === 'Other' && (
                  <Input
                    className="flex-1 h-11 rounded-none font-mono"
                    placeholder="Specify custom drug name..."
                    aria-label="Custom challenge drug name"
                    value={formData.challengeDrugCustom || ''}
                    onChange={(e) => onInputChange('challengeDrugCustom', e.target.value)}
                    autoFocus
                  />
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">Observation Outcome</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {([
                  ['SUCCESS', 'Tolerated (Safe)', ThumbsUp, 'green'],
                  ['UNSUCCESS', 'Reaction Occurred', ThumbsDown, 'red'],
                ] as const).map(([outcome, label, Icon, tone]) => {
                  const isSelected = formData.outcome === outcome;
                  const selectedClass = tone === 'green'
                    ? 'bg-green-50 border-green-500 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                    : 'bg-red-50 border-red-500 text-red-800 dark:bg-red-900/20 dark:text-red-300';
                  const idleClass = tone === 'green'
                    ? 'bg-card border-border text-muted-foreground hover:border-green-300 hover:bg-green-50/50 dark:hover:border-green-800 dark:hover:bg-green-900/20 hover:text-foreground'
                    : 'bg-card border-border text-muted-foreground hover:border-red-300 hover:bg-red-50/50 dark:hover:border-red-800 dark:hover:bg-red-900/20 hover:text-foreground';
                  const iconClass = tone === 'green'
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/50'
                    : 'bg-red-100 text-red-600 dark:bg-red-900/50';
                  const checkClass = tone === 'green'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400';
                  return (
                    <button
                      key={outcome}
                      type="button"
                      onClick={() => onInputChange('outcome', outcome)}
                      className={`relative flex flex-col items-center justify-center gap-2 p-3 md:p-6 rounded-none border-2 transition-[color,background-color,border-color,box-shadow] duration-150 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isSelected ? selectedClass : idleClass}`}
                    >
                      <div className={`p-3 rounded-none ${isSelected ? iconClass : 'bg-muted text-muted-foreground'}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-sm">{label}</span>
                      {isSelected && (
                        <div className={`absolute top-3 right-3 ${checkClass}`}>
                          {tone === 'green' ? <CheckCircle2 className="w-5 h-5" /> : <AlertOctagon className="w-5 h-5" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {formData.outcome === 'UNSUCCESS' && (
              <DrugChallengeReactionFields
                formData={formData}
                interventionOptions={interventionOptions}
                symptomOptions={symptomOptions}
                onInputChange={onInputChange}
                onToggleSymptom={onToggleSymptom}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
