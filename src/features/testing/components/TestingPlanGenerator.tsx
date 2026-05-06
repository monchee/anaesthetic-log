import React, { useState, useMemo } from 'react';
import { Card, CardContent, Button, Label, Switch, Checkbox, Input, Textarea } from '@/components/ui';
import { Patient, TestingPlanData, CustomDrugEntry } from '@/types';
import { Printer, Check, X, ClipboardList, ChevronDown, Plus, History, Pin, Search } from 'lucide-react';
import { CATEGORY_THEMES, DEFAULT_THEME, DEFAULT_SELECTED_DRUGS } from '@shared/utils/constants';

interface TestingPlanGeneratorProps {
  patient: Patient;
  drugCategories: Record<string, string[]>;
  onPreview: (data: TestingPlanData) => void;
}

const TestingPlanGenerator: React.FC<TestingPlanGeneratorProps> = ({ patient, drugCategories, onPreview }) => {
  // Drugs matched from the patient's reaction history (used for UI badges)
  const historyDrugs = useMemo(() => {
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

  const initialDrugs = useMemo(() => {
    // Priority 1: explicit testing plan from REDCap instrument
    if (patient.history.testingPlan?.length) {
      return [...new Set([...DEFAULT_SELECTED_DRUGS, ...patient.history.testingPlan])];
    }
    // Fallback: infer from drugs given during the reaction
    return [...new Set([...DEFAULT_SELECTED_DRUGS, ...historyDrugs])];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient.id]);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>(initialDrugs);
  const [customDrugs, setCustomDrugs] = useState<CustomDrugEntry[]>([]);
  const [notes, setNotes] = useState('');
  const [drugFilter, setDrugFilter] = useState('');
  const [newCustomDrug, setNewCustomDrug] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [reactionDate, setReactionDate] = useState(patient.history.date ?? '');
  const [documentsToChase, setDocumentsToChase] = useState({
    tryptases: patient.history.documentsToChase?.tryptases ?? false,
    anaestheticChart: patient.history.documentsToChase?.anaestheticChart ?? false,
    other: patient.history.documentsToChase?.other ?? false,
    otherText: patient.history.documentsToChase?.otherText ?? '',
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
      const name = newCustomDrug.trim();
      setCustomDrugs(prev => [...prev, { name, sptConcentration: '', idtSteps: [], includeInChallenge: false }]);
      setSelectedDrugs(prev => [...prev, name]);
      setNewCustomDrug('');
    }
  };

  const removeCustomDrug = (name: string) => {
    setCustomDrugs(prev => prev.filter(e => e.name !== name));
    setSelectedDrugs(prev => prev.filter(d => d !== name));
  };

  const updateCustomEntry = (name: string, field: keyof CustomDrugEntry, value: any) => {
    setCustomDrugs(prev => prev.map(e => e.name === name ? { ...e, [field]: value } : e));
  };

  const updateCustomEntryStep = (name: string, si: number, field: string, value: string) => {
    setCustomDrugs(prev => prev.map(e => {
      if (e.name !== name) return e;
      const steps = [...(e.idtSteps ?? [])];
      steps[si] = { ...(steps[si] ?? { ratio: '', concentration: '' }), [field]: value };
      return { ...e, idtSteps: steps };
    }));
  };

  const addCustomEntryIdtStep = (name: string) => {
    setCustomDrugs(prev => prev.map(e =>
      e.name === name ? { ...e, idtSteps: [...(e.idtSteps ?? []), { ratio: '', concentration: '' }] } : e
    ));
  };

  const removeCustomEntryIdtStep = (name: string, idx: number) => {
    setCustomDrugs(prev => prev.map(e =>
      e.name === name ? { ...e, idtSteps: (e.idtSteps ?? []).filter((_, i) => i !== idx) } : e
    ));
  };

  const handlePreview = () => {
    onPreview({
        selectedDrugs,
        selectedProtocols: {},
        customDrugs,
        notes,
        urgent,
        reactionDate,
        documentsToChase,
    });
  };

  const customTheme = CATEGORY_THEMES['Others'] || DEFAULT_THEME;
  const hasCustomActive = customDrugs.some(e => selectedDrugs.includes(e.name));

  return (
    <>
      <Card className="bg-card shadow-md overflow-hidden">
        <div 
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-card transition-colors"
            onClick={() => setIsOpen(!isOpen)}
        >
             <div className="flex items-center gap-3">
                <div className="bg-slate-100 dark:bg-card p-1.5 rounded-none text-muted-foreground">
                    <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-semibold text-primary dark:text-primary text-lg">Testing Plan / Request Form</h3>
                    <p className="text-xs text-muted-foreground font-medium">Select drugs to generate a printable testing plan</p>
                </div>
             </div>
             <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
            <CardContent className="p-4 sm:p-6">
                <div className="border-t border-border pt-4 space-y-6">

                    {/* Request Details: Date of Reaction + Urgent */}
                    <div className={`space-y-2 rounded-none p-3 transition-colors duration-150 ${
                        urgent
                            ? 'bg-red-50 dark:bg-red-900/20 ring-1 ring-red-300 dark:ring-red-800'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                    }`}>
                        <div className={`flex items-center border-b border-dashed pb-1 mb-2 ${
                            urgent ? 'border-red-300 dark:border-red-800' : 'border-border'
                        }`}>
                            <h4 className={`text-[10px] font-semibold uppercase tracking-wider ${
                                urgent ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
                            }`}>Request Details</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
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
                            <div className="flex items-center gap-2 cursor-pointer ml-auto" onClick={() => setUrgent(!urgent)}>
                                <Switch id="urgent" checked={urgent} onCheckedChange={setUrgent} />
                                <Label
                                    htmlFor="urgent"
                                    className={`text-sm font-bold uppercase tracking-wide cursor-pointer ${
                                        urgent ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
                                    }`}
                                >
                                    Urgent
                                </Label>
                            </div>
                        </div>
                    </div>

                    {/* Documents to Chase */}
                    <div className="space-y-2 rounded-none p-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors duration-150">
                        <div className="flex items-center border-b border-dashed border-border pb-1 mb-2">
                            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Documents to Chase</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
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

                    {/* Drug Selection Grid */}
                    <div className="space-y-2 rounded-none p-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors duration-150">
                        <div className="flex items-center justify-between border-b border-dashed border-border pb-1 mb-2">
                            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Select Drugs for Testing</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setSelectedDrugs([]); setCustomDrugs([]); }}
                              className="text-xs text-slate-400 hover:text-destructive h-6 px-2 rounded-none"
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
                        {Object.entries(drugCategories).map(([category, drugs]) => {
                            const categoryDrugs = drugs as string[];
                            const filteredDrugs = drugFilter
                              ? categoryDrugs.filter(d => d.toLowerCase().includes(drugFilter.toLowerCase()))
                              : categoryDrugs;

                            if (drugFilter && filteredDrugs.length === 0) return null;

                            const allCategorySelected = categoryDrugs.every(d => selectedDrugs.includes(d));
                            const hasActiveSelection = categoryDrugs.some(d => selectedDrugs.includes(d));

                            const theme = CATEGORY_THEMES[category] || DEFAULT_THEME;

                            return (
                                <div
                                    key={category}
                                    className={`space-y-2 rounded-none p-3 transition-colors duration-150 ${category === 'Others' ? 'col-span-full' : ''} ${hasActiveSelection ? `${theme.activeBg} ${theme.activeRing} ring-1` : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}
                                >
                                    <div className={`flex justify-between items-center border-b border-dashed pb-1 mb-2 ${hasActiveSelection ? `${theme.headerBorder}` : 'border-border'}`}>
                                        <h4 className={`text-[10px] font-semibold uppercase tracking-wider flex items-center gap-2 ${hasActiveSelection ? theme.headerText : 'text-muted-foreground'}`}>
                                            {category}
                                            {hasActiveSelection && <span className={`flex h-1.5 w-1.5 rounded-none ${theme.pulse} animate-pulse`}></span>}
                                        </h4>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); toggleCategory(categoryDrugs); }}
                                            className={`text-[10px] hover:underline font-medium transition-colors ${hasActiveSelection ? theme.actionText : 'text-slate-500 hover:text-muted-foreground dark:hover:text-foreground/90'}`}
                                        >
                                            {allCategorySelected ? 'Select None' : 'Select All'}
                                        </button>
                                    </div>
                                    <div className={category === 'Others' ? 'flex flex-wrap gap-2 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'flex flex-wrap gap-2'}>
                                        {filteredDrugs.map(drug => {
                                            const fromHistory = historyDrugs.includes(drug);
                                            const isDefault = DEFAULT_SELECTED_DRUGS.includes(drug);
                                            return (
                                            <button
                                                key={drug}
                                                onClick={() => toggleDrug(drug)}
                                                className={`text-xs px-2.5 py-1.5 rounded-none border transition-all duration-150 flex items-center gap-1.5 text-left ${category === 'Others' ? 'md:w-full' : ''} ${
                                                selectedDrugs.includes(drug)
                                                ? theme.btnSelected
                                                : `bg-card text-muted-foreground border-border hover:bg-slate-50 dark:hover:bg-card ${theme.btnHover}`
                                                }`}
                                            >
                                                {selectedDrugs.includes(drug) && <Check className="w-3 h-3 shrink-0" />}
                                                {drug}
                                                {isDefault && (
                                                    <Pin className="w-3 h-3 shrink-0 opacity-70" aria-label="Standard pre-fill" />
                                                )}
                                                {fromHistory && (
                                                    <History className="w-3 h-3 shrink-0 opacity-70" aria-label="Given at time of reaction" />
                                                )}
                                            </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                        {drugFilter && Object.values(drugCategories).every(
                          drugs => !(drugs as string[]).some(d => d.toLowerCase().includes(drugFilter.toLowerCase()))
                        ) && (
                          <p className="text-xs text-muted-foreground col-span-full py-2">No drugs match &ldquo;{drugFilter}&rdquo;</p>
                        )}

                        {/* Custom Drugs Section */}
                        <div className={`col-span-full space-y-2 rounded-none p-3 transition-colors duration-150 ${hasCustomActive ? `${customTheme.activeBg} ${customTheme.activeRing} ring-1` : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}>
                            <div className={`flex justify-between items-center border-b border-dashed pb-1 mb-2 ${hasCustomActive ? `${customTheme.headerBorder}` : 'border-border'}`}>
                                <h4 className={`text-[10px] font-semibold uppercase tracking-wider flex items-center gap-2 ${hasCustomActive ? customTheme.headerText : 'text-muted-foreground'}`}>
                                    Additional Items
                                    {hasCustomActive && <span className={`flex h-1.5 w-1.5 rounded-none ${customTheme.pulse} animate-pulse`}></span>}
                                </h4>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                {customDrugs.map(entry => (
                                    <button
                                        key={entry.name}
                                        onClick={() => toggleDrug(entry.name)}
                                        className={`md:w-full text-xs px-2.5 py-1.5 rounded-none border transition-all duration-150 flex items-center gap-1.5 text-left group ${
                                            selectedDrugs.includes(entry.name)
                                            ? customTheme.btnSelected
                                            : `bg-card text-muted-foreground border-border hover:bg-slate-50 dark:hover:bg-card ${customTheme.btnHover}`
                                        }`}
                                    >
                                        {selectedDrugs.includes(entry.name) && <Check className="w-3 h-3 shrink-0" />}
                                        {entry.name}
                                        <span
                                            onClick={(e) => { e.stopPropagation(); removeCustomDrug(entry.name); }}
                                            className="ml-1 opacity-50 hover:opacity-100 hover:text-red-400 dark:hover:text-red-300 transition-all"
                                        >
                                            <X className="w-3 h-3" />
                                        </span>
                                    </button>
                                ))}
                            </div>
                            {/* Inline protocol editing for selected custom drugs */}
                            {customDrugs.filter(e => selectedDrugs.includes(e.name)).map(entry => (
                                <div key={`proto-${entry.name}`} className="border border-dashed border-border p-2 space-y-2 bg-slate-50/50 dark:bg-card/30 mb-2">
                                    <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{entry.name} — Protocol</div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground shrink-0 w-7">SPT</span>
                                        <Input
                                            className="h-7 text-xs flex-1"
                                            placeholder="Neat concentration (e.g. 10mg/mL)..."
                                            value={entry.sptConcentration || ''}
                                            onChange={ev => updateCustomEntry(entry.name, 'sptConcentration', ev.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">IDT Dilutions</div>
                                        {(entry.idtSteps ?? []).map((step, si) => (
                                            <div key={si} className="flex items-center gap-1.5">
                                                <Input className="h-7 text-xs flex-1" placeholder="Ratio (e.g. 1:100)" value={step.ratio} onChange={ev => updateCustomEntryStep(entry.name, si, 'ratio', ev.target.value)} />
                                                <Input className="h-7 text-xs flex-1" placeholder="Conc. (e.g. 0.1mg/mL)" value={step.concentration} onChange={ev => updateCustomEntryStep(entry.name, si, 'concentration', ev.target.value)} />
                                                <button onClick={() => removeCustomEntryIdtStep(entry.name, si)} className="shrink-0 text-slate-300 hover:text-red-500 transition-colors" title="Remove step">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                        <button onClick={() => addCustomEntryIdtStep(entry.name)} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                                            <Plus className="w-3 h-3" /> Add IDT dilution step
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id={`plan-challenge-${entry.name}`} checked={entry.includeInChallenge || false} onChange={ev => updateCustomEntry(entry.name, 'includeInChallenge', ev.target.checked)} className="w-3.5 h-3.5 accent-primary" />
                                        <label htmlFor={`plan-challenge-${entry.name}`} className="text-xs text-muted-foreground cursor-pointer select-none">Include in drug challenge</label>
                                    </div>
                                </div>
                            ))}
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
                    </div>

                    {/* Legend callout */}
                    <div className="flex flex-col gap-1.5 p-3 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 rounded-none">
                        <div className="flex items-start gap-2.5">
                            <Pin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                            <p className="text-xs text-amber-700 dark:text-amber-400 leading-snug">
                                <Pin className="inline w-3 h-3 mx-0.5 opacity-80" /> <span className="font-semibold">Pre-filled</span> for all patients by default.
                            </p>
                        </div>
                        {historyDrugs.length > 0 && (
                            <div className="flex items-start gap-2.5">
                                <History className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                                <p className="text-xs text-amber-700 dark:text-amber-400 leading-snug">
                                    <History className="inline w-3 h-3 mx-0.5 opacity-80" /> <span className="font-semibold">Auto-selected</span> from patient history — given at time of reaction.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Notes Section */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Clinical Notes / Indication</Label>
                        <Textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="min-h-[60px]"
                        />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-border">
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