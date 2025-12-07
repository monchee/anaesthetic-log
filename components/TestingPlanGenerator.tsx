import React, { useState } from 'react';
import { Card, CardContent, Button, Label } from './ui';
import { Patient, TestingPlanData } from '../types';
import { Printer, Check, X, ClipboardList, ChevronDown, Plus } from 'lucide-react';

interface TestingPlanGeneratorProps {
  patient: Patient;
  drugCategories: Record<string, string[]>;
  onPreview: (data: TestingPlanData) => void;
}

// Professional Color Themes for Categories (Matching TestingLogForm)
const CATEGORY_THEMES: Record<string, any> = {
  "Muscle Relaxants": {
    activeBg: "bg-sky-50 dark:bg-sky-900/20",
    activeRing: "ring-sky-100 dark:ring-sky-900/50",
    headerText: "text-sky-700 dark:text-sky-300",
    headerBorder: "border-sky-200 dark:border-sky-800",
    btnSelected: "bg-sky-600 border-sky-600 text-white shadow-sm ring-1 ring-sky-100 dark:ring-sky-900",
    btnHover: "hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400 dark:hover:border-sky-400",
    actionText: "text-sky-600 dark:text-sky-400",
    pulse: "bg-sky-600"
  },
  "Penicillins": {
    activeBg: "bg-orange-50 dark:bg-orange-900/20",
    activeRing: "ring-orange-100 dark:ring-orange-900/50",
    headerText: "text-orange-700 dark:text-orange-300",
    headerBorder: "border-orange-200 dark:border-orange-800",
    btnSelected: "bg-orange-500 border-orange-500 text-white shadow-sm ring-1 ring-orange-100 dark:ring-orange-900",
    btnHover: "hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 dark:hover:border-orange-400",
    actionText: "text-orange-600 dark:text-orange-400",
    pulse: "bg-orange-500"
  },
  "Cephalosporins": {
    activeBg: "bg-emerald-50 dark:bg-emerald-900/20",
    activeRing: "ring-emerald-100 dark:ring-emerald-900/50",
    headerText: "text-emerald-700 dark:text-emerald-300",
    headerBorder: "border-emerald-200 dark:border-emerald-800",
    btnSelected: "bg-emerald-600 border-emerald-600 text-white shadow-sm ring-1 ring-emerald-100 dark:ring-emerald-900",
    btnHover: "hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 dark:hover:border-emerald-400",
    actionText: "text-emerald-600 dark:text-emerald-400",
    pulse: "bg-emerald-600"
  },
  "Hypnotics": {
    activeBg: "bg-indigo-50 dark:bg-indigo-900/20",
    activeRing: "ring-indigo-100 dark:ring-indigo-900/50",
    headerText: "text-indigo-700 dark:text-indigo-300",
    headerBorder: "border-indigo-200 dark:border-indigo-800",
    btnSelected: "bg-indigo-600 border-indigo-600 text-white shadow-sm ring-1 ring-indigo-100 dark:ring-indigo-900",
    btnHover: "hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 dark:hover:border-indigo-400",
    actionText: "text-indigo-600 dark:text-indigo-400",
    pulse: "bg-indigo-600"
  },
  "Local Anaesthetics": {
    activeBg: "bg-cyan-50 dark:bg-cyan-900/20",
    activeRing: "ring-cyan-100 dark:ring-cyan-900/50",
    headerText: "text-cyan-700 dark:text-cyan-300",
    headerBorder: "border-cyan-200 dark:border-cyan-800",
    btnSelected: "bg-cyan-600 border-cyan-600 text-white shadow-sm ring-1 ring-cyan-100 dark:ring-cyan-900",
    btnHover: "hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 dark:hover:border-cyan-400",
    actionText: "text-cyan-600 dark:text-cyan-400",
    pulse: "bg-cyan-600"
  },
  "Opioids": {
    activeBg: "bg-rose-50 dark:bg-rose-900/20",
    activeRing: "ring-rose-100 dark:ring-rose-900/50",
    headerText: "text-rose-700 dark:text-rose-300",
    headerBorder: "border-rose-200 dark:border-rose-800",
    btnSelected: "bg-rose-600 border-rose-600 text-white shadow-sm ring-1 ring-rose-100 dark:ring-rose-900",
    btnHover: "hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 dark:hover:border-rose-400",
    actionText: "text-rose-600 dark:text-rose-400",
    pulse: "bg-rose-600"
  },
  "Antiseptics": {
    activeBg: "bg-teal-50 dark:bg-teal-900/20",
    activeRing: "ring-teal-100 dark:ring-teal-900/50",
    headerText: "text-teal-700 dark:text-teal-300",
    headerBorder: "border-teal-200 dark:border-teal-800",
    btnSelected: "bg-teal-600 border-teal-600 text-white shadow-sm ring-1 ring-teal-100 dark:ring-teal-900",
    btnHover: "hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 dark:hover:border-teal-400",
    actionText: "text-teal-600 dark:text-teal-400",
    pulse: "bg-teal-600"
  },
  "Others": {
    activeBg: "bg-slate-100 dark:bg-slate-800",
    activeRing: "ring-slate-200 dark:ring-slate-700",
    headerText: "text-slate-700 dark:text-slate-300",
    headerBorder: "border-slate-300 dark:border-slate-700",
    btnSelected: "bg-slate-600 border-slate-600 text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-500",
    btnHover: "hover:border-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:hover:border-slate-500",
    actionText: "text-slate-600 dark:text-slate-400",
    pulse: "bg-slate-600"
  }
};

const DEFAULT_THEME = {
    activeBg: "bg-purple-50/80 dark:bg-purple-900/20",
    activeRing: "ring-purple-100 dark:ring-purple-900/50",
    headerText: "text-[#8055f1] dark:text-purple-300",
    headerBorder: "border-purple-200 dark:border-purple-800",
    btnSelected: "bg-[#8055f1] border-[#8055f1] text-white",
    btnHover: "hover:border-[#8055f1] hover:text-[#8055f1] dark:hover:text-purple-300",
    actionText: "text-[#8055f1] dark:text-purple-400",
    pulse: "bg-[#8055f1]"
};

const TestingPlanGenerator: React.FC<TestingPlanGeneratorProps> = ({ patient, drugCategories, onPreview }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [customDrugs, setCustomDrugs] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [newCustomDrug, setNewCustomDrug] = useState('');

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
        notes
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
                <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-md text-slate-600 dark:text-slate-400">
                    <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">Testing Plan / Request Form</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Select drugs to generate a printable testing plan</p>
                </div>
             </div>
             <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
            <CardContent className="pt-0 pb-6 px-6 animate-enter">
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-6">
                    
                    {/* Notes Section */}
                    <div className="space-y-2">
                        <Label>Clinical Notes / Indication</Label>
                        <textarea 
                            className="flex min-h-[60px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                            placeholder="e.g. History of reaction to Rocuronium. Please test standard panel plus..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
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
                                    className={`space-y-2 rounded-xl p-3 transition-colors duration-300 ${hasActiveSelection ? `${theme.activeBg} ${theme.activeRing} ring-1` : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}
                                >
                                    <div className={`flex justify-between items-center border-b border-dashed pb-1 mb-2 ${hasActiveSelection ? `${theme.headerBorder}` : 'border-slate-200 dark:border-slate-800'}`}>
                                        <h4 className={`text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${hasActiveSelection ? theme.headerText : 'text-slate-700 dark:text-slate-300'}`}>
                                            {category}
                                            {hasActiveSelection && <span className={`flex h-1.5 w-1.5 rounded-full ${theme.pulse} animate-pulse`}></span>}
                                        </h4>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); toggleCategory(categoryDrugs); }}
                                            className={`text-[10px] hover:underline font-medium transition-colors ${hasActiveSelection ? theme.actionText : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
                                        >
                                            {allCategorySelected ? 'Select None' : 'Select All'}
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {categoryDrugs.map(drug => (
                                            <button
                                                key={drug}
                                                onClick={() => toggleDrug(drug)}
                                                className={`text-xs px-2.5 py-1.5 rounded border transition-all duration-200 flex items-center gap-1.5 text-left ${
                                                selectedDrugs.includes(drug) 
                                                ? theme.btnSelected
                                                : `bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 ${theme.btnHover}`
                                                }`}
                                            >
                                                {selectedDrugs.includes(drug) && <Check className="w-3 h-3 shrink-0" />}
                                                {drug}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Custom Drugs Section */}
                        <div className={`space-y-2 rounded-xl p-3 transition-colors duration-300 ${hasCustomActive ? `${customTheme.activeBg} ${customTheme.activeRing} ring-1` : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}>
                            <div className={`flex justify-between items-center border-b border-dashed pb-1 mb-2 ${hasCustomActive ? `${customTheme.headerBorder}` : 'border-slate-200 dark:border-slate-800'}`}>
                                <h4 className={`text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${hasCustomActive ? customTheme.headerText : 'text-slate-700 dark:text-slate-300'}`}>
                                    Additional Items
                                    {hasCustomActive && <span className={`flex h-1.5 w-1.5 rounded-full ${customTheme.pulse} animate-pulse`}></span>}
                                </h4>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {customDrugs.map(drug => (
                                    <button
                                        key={drug}
                                        onClick={() => toggleDrug(drug)}
                                        className={`text-xs px-2.5 py-1.5 rounded border transition-all duration-200 flex items-center gap-1.5 text-left group ${
                                            selectedDrugs.includes(drug) 
                                            ? customTheme.btnSelected
                                            : `bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 ${customTheme.btnHover}`
                                        }`}
                                    >
                                        {selectedDrugs.includes(drug) && <Check className="w-3 h-3 shrink-0" />}
                                        {drug}
                                        <span 
                                            onClick={(e) => { e.stopPropagation(); removeCustomDrug(drug); }}
                                            className="ml-1 opacity-50 hover:opacity-100 hover:text-red-400 dark:hover:text-red-300"
                                        >
                                            <X className="w-3 h-3" />
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    className="flex-1 h-8 rounded text-xs border border-slate-200 px-2 bg-white text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                                    placeholder="Add custom drug..."
                                    value={newCustomDrug}
                                    onChange={(e) => setNewCustomDrug(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addCustomDrug()}
                                />
                                <Button size="sm" variant="outline" onClick={addCustomDrug} className="h-8 w-8 p-0">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Button onClick={handlePreview} className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600">
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