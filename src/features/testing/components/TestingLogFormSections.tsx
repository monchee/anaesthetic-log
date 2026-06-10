import React from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import {
  Activity,
  AlertOctagon,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock,
  Plus,
  Save,
  Search,
  Stethoscope,
  Syringe,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react';
import { LogFormData } from '@/types';
import { CATEGORY_THEMES, DEFAULT_THEME } from '@shared/utils/constants';
import { DrugTestGrid } from './DrugTestGrid';

const preventNegativeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault();
};

const EMPTY_TRYPTASE: NonNullable<LogFormData['tryptase']> = {
  obtained: false,
  significantElevation: false,
  values: [],
};

type InputChangeHandler = (field: keyof LogFormData, value: LogFormData[keyof LogFormData]) => void;

interface VisitDetailsSectionProps {
  formData: LogFormData;
  onInputChange: InputChangeHandler;
}

export function VisitDetailsSection({ formData, onInputChange }: VisitDetailsSectionProps) {
  return (
    <Card style={{ '--section-index': 0 } as React.CSSProperties} className="animate-section-reveal">
      <CardContent className="pt-4 sm:pt-5 md:pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-muted p-2 rounded-none">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="section-label">Patient Name</div>
              <div className="text-lg font-bold text-slate-900 dark:text-primary">
                {formData.lastName}, {formData.firstName}
              </div>
            </div>
            <div className="border-l pl-4 border-border">
              <div className="section-label">MRN</div>
              <div className="text-lg font-bold text-slate-900 dark:text-primary font-mono lowercase">
                {formData.mrn}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 border-t md:border-t-0 pt-3 md:pt-0">
            <Label htmlFor="visit-date" className="whitespace-nowrap text-base font-semibold text-slate-900 dark:text-primary flex items-center gap-2">
              <Calendar className="w-5 h-5" aria-hidden="true" /> Visit Date:<span className="text-destructive ml-0.5" aria-hidden="true">*</span>
            </Label>
            <Input
              id="visit-date"
              type="date"
              aria-describedby="visit-date-hint"
              className="w-full md:max-w-[200px] font-mono"
              value={formData.visitDate}
              onChange={(e) => onInputChange('visitDate', e.target.value)}
            />
            <span id="visit-date-hint" className="sr-only">
              Enter the date when the patient visited for testing
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DrugTestPanelSectionProps {
  formData: LogFormData;
  setFormData: React.Dispatch<React.SetStateAction<LogFormData>>;
  drugCategories: Record<string, string[]>;
  drugFilter: string;
  setDrugFilter: (value: string) => void;
  drugToCategoryMap: Record<string, string>;
  onToggleDrug: (drug: string) => void;
  onToggleCategory: (drugs: string[]) => void;
  onAddCustomDrug: () => void;
  onControlChange: (field: keyof LogFormData['controls'], value: string) => void;
  onUpdateDrugData: (index: number, field: string, value: string) => void;
  onSelectProtocol: (rowIndex: number, protocolIndex: number) => void;
  onRemoveRow: (index: number) => void;
  onAddCustomIdtStep: (rowIndex: number) => void;
  onRemoveCustomIdtStep: (rowIndex: number, stepIndex: number) => void;
}

export function DrugTestPanelSection({
  formData,
  setFormData,
  drugCategories,
  drugFilter,
  setDrugFilter,
  drugToCategoryMap,
  onToggleDrug,
  onToggleCategory,
  onAddCustomDrug,
  onControlChange,
  onUpdateDrugData,
  onSelectProtocol,
  onRemoveRow,
  onAddCustomIdtStep,
  onRemoveCustomIdtStep,
}: DrugTestPanelSectionProps) {
  const noFilterMatches = drugFilter && Object.values(drugCategories).every(
    drugs => !(drugs as string[]).some(d => d.toLowerCase().includes(drugFilter.toLowerCase())),
  );

  return (
    <Card style={{ '--section-index': 1 } as React.CSSProperties} className="animate-section-reveal">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          <div className="bg-slate-100 dark:bg-card/40 p-1.5 rounded-none">
            <Activity className="w-4 h-4 text-primary dark:text-primary" />
          </div>
          SPT &amp; IDT Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 sm:pt-4 md:pt-4 space-y-4 sm:space-y-5 md:space-y-6">
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center border-b border-border pb-2">
            <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Select Drugs to Test:<span className="text-destructive ml-0.5" aria-hidden="true">*</span></Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFormData(prev => ({ ...prev, testPanel: [] }))}
              className="text-xs text-muted-foreground hover:text-destructive h-6 px-2 rounded-none font-normal"
              title="Clear all selected drugs"
            >
              Clear All
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={drugFilter}
              onChange={e => setDrugFilter(e.target.value)}
              placeholder="Filter drugs..."
              className="h-8 pl-8 pr-8 text-xs rounded-none"
            />
            {drugFilter && (
              <button
                onClick={() => setDrugFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {Object.entries(drugCategories).map(([category, drugs]) => {
              const categoryDrugs = drugs as string[];
              const filteredDrugs = drugFilter
                ? categoryDrugs.filter(d => d.toLowerCase().includes(drugFilter.toLowerCase()))
                : categoryDrugs;

              if (drugFilter && filteredDrugs.length === 0) return null;

              const hasActiveSelection = categoryDrugs.some(drug =>
                formData.testPanel.some(row => row.drugName === drug && !row.id),
              );
              const allCategorySelected = categoryDrugs.every(drug =>
                formData.testPanel.some(row => row.drugName === drug && !row.id),
              );
              const theme = CATEGORY_THEMES[category] || DEFAULT_THEME;

              return (
                <div key={category} className={`space-y-2 rounded-none p-3 transition-colors duration-150 ${category === 'Others' ? 'col-span-full' : ''} ${hasActiveSelection ? `${theme.activeBg} ${theme.activeRing} ring-1` : 'hover:bg-slate-50 dark:hover:bg-card/50'}`}>
                  <div className={`flex justify-between items-center border-b border-dashed pb-1 mb-2 ${hasActiveSelection ? `${theme.headerBorder}` : 'border-border'}`}>
                    <p className={`text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${hasActiveSelection ? theme.headerText : 'text-muted-foreground'}`}>
                      {category}
                      {hasActiveSelection && <span className={`flex h-1.5 w-1.5 rounded-full ${theme.pulse} animate-pulse`}></span>}
                    </p>
                    <button
                      onClick={(e) => { e.preventDefault(); onToggleCategory(categoryDrugs); }}
                      className={`text-xs hover:underline font-medium transition-colors ${hasActiveSelection ? theme.actionText : 'text-slate-500 hover:text-muted-foreground dark:hover:text-foreground/90'}`}
                    >
                      {allCategorySelected ? 'Select None' : 'Select All'}
                    </button>
                  </div>
                  <div className={category === 'Others' ? 'flex flex-wrap gap-2 md:grid md:grid-cols-3 lg:grid-cols-4' : 'flex flex-wrap gap-2'}>
                    {filteredDrugs.map(drug => {
                      const isSelected = formData.testPanel.some(row => row.drugName === drug && !row.id);
                      return (
                        <button
                          key={drug}
                          onClick={() => onToggleDrug(drug)}
                          className={`text-xs px-2.5 py-1.5 rounded-none border transition-[color,background-color,border-color,box-shadow] duration-150 flex items-center gap-1.5 text-left ${category === 'Others' ? 'md:w-full' : ''} ${
                            isSelected
                              ? theme.btnSelected
                              : `bg-card text-muted-foreground border-border hover:bg-slate-50 dark:hover:bg-muted ${theme.btnHover}`
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 shrink-0" />}
                          {drug}
                        </button>
                      );
                    })}

                    {category === 'Others' && (
                      <button
                        onClick={onAddCustomDrug}
                        className={`md:w-full text-xs px-2.5 py-1.5 rounded-none border border-dashed border-border text-muted-foreground hover:bg-slate-50 dark:hover:bg-muted transition-[color,background-color,border-color,box-shadow] duration-150 flex items-center gap-1.5 font-medium ${theme.btnHover}`}
                      >
                        <Plus className="w-3 h-3 shrink-0" />
                        Other
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {noFilterMatches && (
              <p className="text-xs text-muted-foreground col-span-full py-2">No drugs match &ldquo;{drugFilter}&rdquo;</p>
            )}
          </div>
        </div>

        <div className="bg-card px-4 py-4 rounded-none border border-border flex flex-col gap-4">
          <div className="section-label">Reference Controls (mm):</div>
          <div className="grid grid-cols-3 gap-2 md:flex md:flex-wrap md:items-center md:gap-x-8 md:gap-y-4">
            {([
              ['histamineSpt', 'histamine-spt', 'Histamine (SPT)'],
              ['salineSpt', 'saline-spt', 'Saline (SPT)'],
              ['salineIdt', 'saline-idt', 'Saline (IDT)'],
            ] as const).map(([field, id, label]) => (
              <div key={field} className="flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
                <Label htmlFor={id} className="text-xs font-medium text-slate-700 dark:text-foreground/80">{label}</Label>
                <Input
                  id={id}
                  type="number"
                  min="0"
                  onKeyDown={preventNegativeInput}
                  placeholder="0"
                  className="bg-background h-9 w-full md:w-20 text-center text-sm font-mono"
                  value={formData.controls[field]}
                  onChange={(e) => onControlChange(field, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <DrugTestGrid
          testPanel={formData.testPanel}
          drugToCategoryMap={drugToCategoryMap}
          onUpdate={onUpdateDrugData}
          onSelectProtocol={onSelectProtocol}
          onRemove={onRemoveRow}
          onAddCustomIdtStep={onAddCustomIdtStep}
          onRemoveCustomIdtStep={onRemoveCustomIdtStep}
        />
      </CardContent>
    </Card>
  );
}

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
          className={`flex w-full items-center justify-between p-4 rounded-none border-2 cursor-pointer transition-[color,background-color,border-color,box-shadow] duration-150 group ${
            formData.proceedToChallenge
              ? 'border-primary bg-[white] dark:bg-card/10 shadow-sm'
              : 'border-slate-100 hover:border-border dark:hover:border-border bg-background'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-none transition-colors ${
              formData.proceedToChallenge
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-400 dark:bg-muted dark:text-muted-foreground group-hover:text-slate-600 dark:group-hover:text-foreground/80'
            }`}>
              <Activity className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className={`font-semibold tracking-tight transition-colors ${formData.proceedToChallenge ? 'text-slate-900 dark:text-primary' : 'text-slate-700 dark:text-foreground/80'}`}>
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
              <Label className="text-sm font-semibold text-slate-700 dark:text-foreground/80 flex items-center gap-2">Select Challenge Drug</Label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                  <Syringe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors pointer-events-none" />
                  <Select value={formData.challengeDrug} onValueChange={(value) => onInputChange('challengeDrug', value)}>
                    <SelectTrigger className="pl-10 h-11 border-border focus:border-primary focus:ring-primary" aria-label="Select challenge drug">
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
                    onChange={(e) => onInputChange('challengeDrugCustom', e.target.value)}
                    autoFocus
                  />
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700 dark:text-foreground/80">Observation Outcome</Label>
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
                    ? 'bg-white border-slate-200 text-slate-600 hover:border-green-300 hover:bg-green-50/50 dark:bg-background dark:border-border dark:text-muted-foreground dark:hover:border-green-800 dark:hover:bg-green-900/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-red-300 hover:bg-red-50/50 dark:bg-background dark:border-border dark:text-muted-foreground dark:hover:border-red-800 dark:hover:bg-red-900/20';
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
                      className={`relative flex flex-col items-center justify-center gap-2 p-3 md:p-6 rounded-none border-2 transition-[color,background-color,border-color,box-shadow] duration-150 hover:shadow-md ${isSelected ? selectedClass : idleClass}`}
                    >
                      <div className={`p-3 rounded-none ${isSelected ? iconClass : 'bg-slate-100 text-slate-400 dark:bg-card'}`}>
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
                      className="h-10 border-border focus:ring-primary/20 transition-[box-shadow,border-color] rounded-none bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-red-900 dark:text-red-200 font-semibold flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" aria-hidden="true" /> Treatment Required
                    </Label>
                    <Select value={formData.interventionType} onValueChange={(value) => onInputChange('interventionType', value)}>
                      <SelectTrigger className="h-10 bg-background border-red-200 dark:border-red-900/30 focus:border-red-400 focus:ring-red-400" aria-label="Select treatment intervention">
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
                      onChange={(e) => onInputChange('interventionOther', e.target.value)}
                      className="bg-background border-red-200 dark:border-red-900/30"
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
                        className={`px-3 py-1.5 rounded-none text-xs font-medium border transition-[color,background-color,border-color,box-shadow] duration-150 ${
                          formData.symptoms.includes(sym)
                            ? 'bg-red-600 text-white border-red-600 shadow-md transform scale-105'
                            : 'bg-white text-red-900 border-red-200 hover:bg-red-100 hover:border-red-300 dark:bg-background dark:text-red-200 dark:border-red-900/50 dark:hover:bg-red-900/20 dark:hover:border-red-800'
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
                      className="bg-background border-red-200 dark:border-red-900/30"
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
  );
}

interface TryptaseSectionProps {
  formData: LogFormData;
  setFormData: React.Dispatch<React.SetStateAction<LogFormData>>;
}

export function TryptaseSection({ formData, setFormData }: TryptaseSectionProps) {
  return (
    <Card style={{ '--section-index': 3 } as React.CSSProperties} className="animate-section-reveal">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          <div className="bg-slate-100 dark:bg-card/40 p-1.5 rounded-none">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          Serial Serum Tryptase
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={formData.tryptase?.obtained ?? false}
            aria-label="Tryptase samples obtained"
            onClick={() => setFormData(prev => ({
              ...prev,
              tryptase: {
                obtained: !(prev.tryptase?.obtained ?? false),
                significantElevation: prev.tryptase?.significantElevation ?? false,
                values: prev.tryptase?.values ?? [],
              },
            }))}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${
              formData.tryptase?.obtained ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${formData.tryptase?.obtained ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
          <Label>Tryptase samples obtained</Label>
        </div>

        {formData.tryptase?.obtained && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={formData.tryptase.significantElevation}
                aria-label="Clinically significant dynamic elevation"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  tryptase: {
                    ...(prev.tryptase ?? EMPTY_TRYPTASE),
                    significantElevation: !(prev.tryptase ?? EMPTY_TRYPTASE).significantElevation,
                  },
                }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                  formData.tryptase.significantElevation ? 'bg-red-500' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${formData.tryptase.significantElevation ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
              <Label className={formData.tryptase.significantElevation ? 'text-red-600 font-semibold' : ''}>
                Clinically significant dynamic elevation
              </Label>
            </div>

            <div className="space-y-3">
              <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Sample Values (μg/L)</Label>
              {(formData.tryptase.values.length === 0 ? [{ time: '', result: '' }] : formData.tryptase.values).map((_, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-4 shrink-0">T{idx + 1}</span>
                    <Input
                      placeholder="Time (e.g. 15:30)"
                      className="h-9 rounded-none text-sm"
                      value={formData.tryptase?.values[idx]?.time ?? ''}
                      onChange={e => {
                        const vals = [...(formData.tryptase?.values ?? [])];
                        while (vals.length <= idx) vals.push({ time: '', result: '' });
                        vals[idx] = { ...vals[idx], time: e.target.value };
                        setFormData(prev => ({ ...prev, tryptase: { ...(prev.tryptase ?? EMPTY_TRYPTASE), values: vals } }));
                      }}
                    />
                    <Input
                      placeholder="Result"
                      className="h-9 rounded-none text-sm w-28"
                      value={formData.tryptase?.values[idx]?.result ?? ''}
                      onChange={e => {
                        const vals = [...(formData.tryptase?.values ?? [])];
                        while (vals.length <= idx) vals.push({ time: '', result: '' });
                        vals[idx] = { ...vals[idx], result: e.target.value };
                        setFormData(prev => ({ ...prev, tryptase: { ...(prev.tryptase ?? EMPTY_TRYPTASE), values: vals } }));
                      }}
                    />
                  </div>
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const vals = (formData.tryptase?.values ?? []).filter((_, i) => i !== idx);
                        setFormData(prev => ({ ...prev, tryptase: { ...(prev.tryptase ?? EMPTY_TRYPTASE), values: vals } }));
                      }}
                      className="text-muted-foreground hover:text-destructive p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {formData.tryptase.values.length < 4 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 px-2 rounded-none"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    tryptase: {
                      ...(prev.tryptase ?? EMPTY_TRYPTASE),
                      values: [...(prev.tryptase ?? EMPTY_TRYPTASE).values, { time: '', result: '' }],
                    },
                  }))}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add sample
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AssessmentPlanSectionProps {
  plan: string;
  onInputChange: InputChangeHandler;
}

export function AssessmentPlanSection({ plan, onInputChange }: AssessmentPlanSectionProps) {
  return (
    <Card style={{ '--section-index': 4 } as React.CSSProperties} className="animate-section-reveal">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
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
            className="flex min-h-[120px] w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-border dark:bg-background dark:ring-offset-background dark:placeholder:text-muted-foreground dark:focus-visible:ring-primary/40"
            placeholder=""
            value={plan}
            onChange={(e) => onInputChange('plan', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface NurseNotesSectionProps {
  formData: LogFormData;
  setFormData: React.Dispatch<React.SetStateAction<LogFormData>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function NurseNotesSection({ formData, setFormData, isOpen, setIsOpen }: NurseNotesSectionProps) {
  return (
    <Card style={{ '--section-index': 5 } as React.CSSProperties} className="animate-section-reveal border-blue-200 dark:border-blue-900/40">
      <CardHeader className="pb-3 border-b border-blue-100 dark:border-blue-900/30">
        <button type="button" className="flex items-center justify-between w-full text-left" onClick={() => setIsOpen(open => !open)}>
          <CardTitle className="flex items-center gap-2 text-base text-blue-700 dark:text-blue-400">
            <div className="bg-blue-100 dark:bg-blue-900/40 p-1.5 rounded-none">
              <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            Nursing Notes
            <span className="text-xs font-normal text-muted-foreground ml-1">(nursing team only)</span>
          </CardTitle>
          {isOpen ? <ChevronUp className="w-4 h-4 text-blue-500" /> : <ChevronDown className="w-4 h-4 text-blue-500" />}
        </button>
      </CardHeader>
      {isOpen && (
        <CardContent className="pt-6 space-y-5">
          {([
            ['preTesting', 'nurse-pre', 'Pre-Testing Observations', 'e.g. consent obtained, vitals stable, IV access established...'],
            ['duringTesting', 'nurse-during', 'During Testing', 'e.g. patient tolerated well, no adverse events observed...'],
            ['postTesting', 'nurse-post', 'Post-Testing / Discharge', 'e.g. patient discharged in stable condition, instructions given...'],
          ] as const).map(([field, id, label, placeholder]) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={id} className="text-blue-800 dark:text-blue-300 font-medium">{label}</Label>
              <textarea
                id={id}
                className="flex min-h-[80px] w-full rounded-none border border-blue-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:border-blue-900/40 dark:bg-background dark:placeholder:text-muted-foreground"
                placeholder={placeholder}
                value={formData.nurseNotes?.[field] || ''}
                onChange={e => setFormData(prev => ({ ...prev, nurseNotes: { ...prev.nurseNotes, [field]: e.target.value } }))}
              />
            </div>
          ))}
          <div className="space-y-2">
            <Label htmlFor="nurse-signed" className="text-blue-800 dark:text-blue-300 font-medium">Signed by (RN)</Label>
            <Input
              id="nurse-signed"
              className="border-blue-200 dark:border-blue-900/40 focus:ring-blue-400"
              placeholder="Nurse name..."
              value={formData.nurseNotes?.signedBy || ''}
              onChange={e => setFormData(prev => ({ ...prev, nurseNotes: { ...prev.nurseNotes, signedBy: e.target.value } }))}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}

interface SaveActionSectionProps {
  validationErrors: string[];
  errorSummaryRef: React.RefObject<HTMLDivElement | null>;
  onSave: () => void;
}

export function SaveActionSection({ validationErrors, errorSummaryRef, onSave }: SaveActionSectionProps) {
  return (
    <div className="pt-4 pb-20 space-y-3">
      {validationErrors.length > 0 && (
        <div
          ref={errorSummaryRef}
          role="alert"
          tabIndex={-1}
          className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive space-y-1 outline-none focus-visible:ring-2 focus-visible:ring-destructive"
        >
          <p className="font-semibold">Please fix the following before saving:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {validationErrors.map((error, index) => <li key={index}>{error}</li>)}
          </ul>
        </div>
      )}
      <Button onClick={onSave} size="lg" className="w-full h-14 text-lg shadow-lg hover:shadow-xl transition-[box-shadow,background-color] bg-primary hover:bg-primary font-semibold">
        <Save className="w-5 h-5 mr-2" /> Save Clinical Record
      </Button>
    </div>
  );
}
