import React, { useState, useMemo } from 'react';
import { Card, CardContent, Button, Label, Switch, Checkbox, Input, Textarea } from '@/components/ui';
import { Patient, TestingPlanData } from '@/types';
import { Printer, Check, X, ClipboardList, ChevronDown, Plus, History } from 'lucide-react';
import { CATEGORY_THEMES, DEFAULT_THEME, DEFAULT_SELECTED_DRUGS } from '@shared/utils/constants';

interface TestingPlanGeneratorProps {
  patient: Patient;
  drugCategories: Record<string, string[]>;
  onPreview: (data: TestingPlanData) => void;
}

const TestingPlanGenerator: React.FC<TestingPlanGeneratorProps> = ({ patient, drugCategories, onPreview }) => {
  // Drugs pre-selected based on patient's medication history before reaction
  const historyDrugs = useMemo(() => {
    const allFlat = Object.values(drugCategories).flat().map(d => d.toLowerCase());
    const patientDrugs = [
      ...(patient.history.preInductionDrugs ?? []),
      ...(patient.history.postInductionDrugs ?? []),
      ...(patient.history.medications ?? []),
    ].map(d => d.toLowerCase());

    return Object.values(drugCategories).flat().filter(drug =>
      patientDrugs.some(pd => pd.includes(drug.toLowerCase()) || drug.toLowerCase().includes(pd))
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient.id]);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>(() => [
    ...new Set([...DEFAULT_SELECTED_DRUGS, ...historyDrugs])
  ]);
  const [customDrugs, setCustomDrugs] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [newCustomDrug, setNewCustomDrug] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [reactionDate, setReactionDate] = useState(patient.history.date ?? '');
  const [documentsToChase, setDocumentsToChase] = useState({
    tryptases: false,
    anaestheticChart: false,
    other: false,
    otherText: '',
  });

  const toggleDoc = (key: 'tryptases' | 'anaestheticChart' | 'other') => {
    setDocumentsToChase(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleDrug = (drug: string) => {
    setSelectedDrugs(prev => 
      prev.includes(drug) ? prev.filter(d => d !== drug) : [...prev, drug]
    );
  };

  const toggleCategory = (categoryDrugs: string[]) => {
    const allSelected = categoryDrugs.every(d => selectedDrugs.includes(d));
    if (allSelected) {
      // Deselect all in category
      setSelectedDrugs(prev => prev.filter(d => !categoryDrugs.includes(d)));
    } else {
      // Select all in category
      setSelectedDrugs(prev => [...new Set([...prev, ...categoryDrugs])]);
    }
  };

  const addCustomDrug = () => {
    if (newCustomDrug.trim()) {
      setCustomDrugs([...customDrugs, newCustomDrug.trim()]);
      setSelectedDrugs([...selectedDrugs, newCustomDrug.trim()]);
      setNewCustomDrug('');
    }
  };

  const removeCustomDrug = (drug: string) => {
    setCustomDrugs(prev => prev.filter(d => d !== drug));
    setSelectedDrugs(prev => prev.filter(d => d !== drug));
  };

  const handlePreview = () => {
    onPreview({
        selectedDrugs,
        customDrugs,
        notes,
        urgent,
        reactionDate,
        documentsToChase,
    });
  };

  const customTheme = CATEGORY_THEMES['Others'] || DEFAULT_THEME;
  const hasCustomActive = customDrugs.some(d => selectedDrugs.includes(d));

  return (
    <>
      <Card className="border-t-4 border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-900 shadow-md overflow-hidden">
        <div 
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
        >
             <div className="flex items-center gap-3">
                <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-none text-slate-600 dark:text-slate-400">
                    <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-semibold text-primary dark:text-primary text-lg">Testing Plan / Request Form</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Select drugs to generate a printable testing plan</p>
                </div>
             </div>
             <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
            <CardContent className="pt-0 pb-6 px-6">
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-6">

                    {/* Urgent flag + Reaction Date */}
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Switch id="urgent" checked={urgent} onCheckedChange={setUrgent} />
                            <Label
                                htmlFor="urgent"
                                className={`text-sm font-bold uppercase tracking-wide cursor-pointer ${urgent ? 'text-destructive' : 'text-muted-foreground'}`}
                            >
                                Urgent
                            </Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="reaction-date" className="text-xs font-semibold uppercase text-muted-foreground tracking-wider whitespace-nowrap">Date of Reaction</Label>
                            <Input
                                id="reaction-date"
                                type="date"
                                value={reactionDate ? reactionDate.slice(0, 10) : ''}
                                onChange={e => setReactionDate(e.target.value)}
                                className="h-8 w-auto"
                            />
                        </div>
                    </div>

                    {/* Documents to Chase */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Documents to Chase</Label>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <Checkbox id="doc-tryptases" checked={documentsToChase.tryptases} onCheckedChange={() => toggleDoc('tryptases')} />
                                <Label htmlFor="doc-tryptases" className="text-sm cursor-pointer">Tryptases</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="doc-anaesthetic" checked={documentsToChase.anaestheticChart} onCheckedChange={() => toggleDoc('anaestheticChart')} />
                                <Label htmlFor="doc-anaesthetic" className="text-sm cursor-pointer">Anaesthetic Chart</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="doc-other" checked={documentsToChase.other} onCheckedChange={() => toggleDoc('other')} />
                                <Label htmlFor="doc-other" className="text-sm cursor-pointer">Other</Label>
                            </div>
                            {documentsToChase.other && (
                                <Input
                                    placeholder="Specify..."
                                    value={documentsToChase.otherText}
                                    onChange={e => setDocumentsToChase(prev => ({ ...prev, otherText: e.target.value }))}
                                    className="flex-1 min-w-[160px] h-8"
                                />
                            )}
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Clinical Notes / Indication</Label>
                        <Textarea
                            placeholder="e.g. History of reaction to Rocuronium. Please test standard panel plus..."
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="min-h-[60px]"
                        />
                    </div>

                    {/* Drug Selection Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {Object.entries(drugCategories).map(([category, drugs]) => {
                            const categoryDrugs = drugs as string[];
                            const allCategorySelected = categoryDrugs.every(d => selectedDrugs.includes(d));
                            const hasActiveSelection = categoryDrugs.some(d => selectedDrugs.includes(d));
                            
                            const theme = CATEGORY_THEMES[category] || DEFAULT_THEME;

                            return (
                                <div 
                                    key={category} 
                                    className={`space-y-2 rounded-none p-3 transition-colors duration-150 ${hasActiveSelection ? `${theme.activeBg} ${theme.activeRing} ring-1` : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}
                                >
                                    <div className={`flex justify-between items-center border-b border-dashed pb-1 mb-2 ${hasActiveSelection ? `${theme.headerBorder}` : 'border-slate-200 dark:border-slate-800'}`}>
                                        <h4 className={`text-[10px] font-semibold uppercase tracking-wider flex items-center gap-2 ${hasActiveSelection ? theme.headerText : 'text-slate-500 dark:text-slate-400'}`}>
                                            {category}
                                            {hasActiveSelection && <span className={`flex h-1.5 w-1.5 rounded-none ${theme.pulse} animate-pulse`}></span>}
                                        </h4>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); toggleCategory(categoryDrugs); }}
                                            className={`text-[10px] hover:underline font-medium transition-colors ${hasActiveSelection ? theme.actionText : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
                                        >
                                            {allCategorySelected ? 'Select None' : 'Select All'}
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {categoryDrugs.map(drug => {
                                            const fromHistory = historyDrugs.includes(drug);
                                            return (
                                            <button
                                                key={drug}
                                                onClick={() => toggleDrug(drug)}
                                                className={`text-xs px-2.5 py-1.5 rounded border transition-all duration-150 flex items-center gap-1.5 text-left ${
                                                selectedDrugs.includes(drug)
                                                ? theme.btnSelected
                                                : `bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 ${theme.btnHover}`
                                                }`}
                                            >
                                                {selectedDrugs.includes(drug) && <Check className="w-3 h-3 shrink-0" />}
                                                {drug}
                                                {fromHistory && (
                                                    <History className="w-3 h-3 shrink-0 opacity-70" title="Given at time of reaction" />
                                                )}
                                            </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Custom Drugs Section */}
                        <div className={`space-y-2 rounded-none p-3 transition-colors duration-150 ${hasCustomActive ? `${customTheme.activeBg} ${customTheme.activeRing} ring-1` : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}>
                            <div className={`flex justify-between items-center border-b border-dashed pb-1 mb-2 ${hasCustomActive ? `${customTheme.headerBorder}` : 'border-slate-200 dark:border-slate-800'}`}>
                                <h4 className={`text-[10px] font-semibold uppercase tracking-wider flex items-center gap-2 ${hasCustomActive ? customTheme.headerText : 'text-slate-500 dark:text-slate-400'}`}>
                                    Additional Items
                                    {hasCustomActive && <span className={`flex h-1.5 w-1.5 rounded-none ${customTheme.pulse} animate-pulse`}></span>}
                                </h4>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {customDrugs.map(drug => (
                                    <button
                                        key={drug}
                                        onClick={() => toggleDrug(drug)}
                                        className={`text-xs px-2.5 py-1.5 rounded border transition-all duration-150 flex items-center gap-1.5 text-left group ${
                                            selectedDrugs.includes(drug) 
                                            ? customTheme.btnSelected
                                            : `bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 ${customTheme.btnHover}`
                                        }`}
                                    >
                                        {selectedDrugs.includes(drug) && <Check className="w-3 h-3 shrink-0" />}
                                        {drug}
                                        <span 
                                            onClick={(e) => { e.stopPropagation(); removeCustomDrug(drug); }}
                                            className="ml-1 opacity-50 hover:opacity-100 hover:text-red-400 dark:hover:text-red-300 transition-all"
                                        >
                                            <X className="w-3 h-3" />
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    className="flex-1 h-8 text-xs"
                                    placeholder="Add custom drug..."
                                    value={newCustomDrug}
                                    onChange={e => setNewCustomDrug(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addCustomDrug()}
                                />
                                <Button size="sm" variant="outline" onClick={addCustomDrug} className="h-8 w-8 p-0">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {historyDrugs.length > 0 && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <History className="w-3 h-3" /> = given at time of reaction (auto-selected from patient history)
                        </p>
                    )}

                    <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Button onClick={handlePreview} className="bg-primary hover:bg-primary/90 text-white shadow-md font-semibold">
                            <Printer className="w-4 h-4 mr-2" /> Preview & Print Plan
                        </Button>
                    </div>
                </div>
            </CardContent>
        )}
      </Card>
    </>
  );
};

export default TestingPlanGenerator;