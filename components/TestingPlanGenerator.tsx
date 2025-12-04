
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Label } from './ui';
import { Patient } from '../types';
import { FileText, Printer, Check, X, ClipboardList, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { formatDate } from '../lib/utils';

interface TestingPlanGeneratorProps {
  patient: Patient;
  drugCategories: Record<string, string[]>;
}

const TestingPlanGenerator: React.FC<TestingPlanGeneratorProps> = ({ patient, drugCategories }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [customDrugs, setCustomDrugs] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [showPreview, setShowPreview] = useState(false);
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* 1. Main Card in the Flow */}
      <Card className="border-t-4 border-slate-400 bg-white shadow-md overflow-hidden">
        <div 
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
        >
             <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-1.5 rounded-md text-slate-600">
                    <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-lg">Testing Plan / Request Form</h3>
                    <p className="text-xs text-slate-500">Select drugs to generate a printable testing plan</p>
                </div>
             </div>
             <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
            <CardContent className="pt-0 pb-6 px-6 animate-in slide-in-from-top-2">
                <div className="border-t border-slate-100 pt-4 space-y-6">
                    
                    {/* Notes Section */}
                    <div className="space-y-2">
                        <Label>Clinical Notes / Indication</Label>
                        <textarea 
                            className="flex min-h-[60px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                            placeholder="e.g. History of reaction to Rocuronium. Please test standard panel plus..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    {/* Drug Selection Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {Object.entries(drugCategories).map(([category, drugs]) => {
                            const allCategorySelected = drugs.every(d => selectedDrugs.includes(d));
                            return (
                                <div key={category} className="space-y-2">
                                    <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-1 mb-2">
                                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                            {category}
                                        </h4>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); toggleCategory(drugs); }}
                                            className="text-[10px] text-[#8055f1] hover:underline font-medium"
                                        >
                                            {allCategorySelected ? 'None' : 'All'}
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {drugs.map(drug => (
                                            <button
                                                key={drug}
                                                onClick={() => toggleDrug(drug)}
                                                className={`text-xs px-2.5 py-1.5 rounded border transition-all duration-200 flex items-center gap-1.5 text-left ${
                                                selectedDrugs.includes(drug) 
                                                ? 'bg-slate-800 text-white border-slate-800 shadow-sm font-medium' 
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
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
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-dashed border-slate-200 pb-1 mb-2">
                                Additional Items
                            </h4>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {customDrugs.map(drug => (
                                    <button
                                        key={drug}
                                        onClick={() => toggleDrug(drug)}
                                        className={`text-xs px-2.5 py-1.5 rounded border transition-all duration-200 flex items-center gap-1.5 text-left group ${
                                            selectedDrugs.includes(drug) 
                                            ? 'bg-slate-800 text-white border-slate-800 shadow-sm font-medium' 
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                                        }`}
                                    >
                                        {selectedDrugs.includes(drug) && <Check className="w-3 h-3 shrink-0" />}
                                        {drug}
                                        <span 
                                            onClick={(e) => { e.stopPropagation(); removeCustomDrug(drug); }}
                                            className="ml-1 opacity-50 hover:opacity-100 hover:text-red-400"
                                        >
                                            <X className="w-3 h-3" />
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    className="flex-1 h-8 rounded text-xs border border-slate-200 px-2"
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

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <Button onClick={() => setShowPreview(true)} className="bg-slate-800 hover:bg-slate-900">
                            <Printer className="w-4 h-4 mr-2" /> Preview & Print Plan
                        </Button>
                    </div>
                </div>
            </CardContent>
        )}
      </Card>

      {/* Print Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:p-0 print:bg-white print:static">
            
            {/* Modal Content / Printable Area */}
            <div 
                id="printable-plan"
                className="bg-white w-full max-w-3xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:w-full print:max-w-none"
            >
                {/* Screen-only Header */}
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 print:hidden">
                    <h3 className="font-bold text-slate-800">Print Preview</h3>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowPreview(false)}>Cancel</Button>
                        <Button size="sm" onClick={handlePrint} className="bg-[#441170]">
                            <Printer className="w-4 h-4 mr-2" /> Print
                        </Button>
                    </div>
                </div>

                {/* Actual Document Content */}
                <div className="p-8 overflow-y-auto print:overflow-visible print:p-0 space-y-6">
                    
                    {/* Document Header */}
                    <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Anaesthetic Allergy Testing Request</h1>
                            <p className="text-slate-500 font-medium">Department of Clinical Immunology & Allergy</p>
                            <p className="text-sm text-slate-400">Royal Prince Alfred Hospital</p>
                        </div>
                        <div className="text-right">
                             <div className="bg-slate-100 px-4 py-2 rounded mb-2">
                                <p className="text-xs uppercase font-bold text-slate-500">Date of Request</p>
                                <p className="font-mono font-bold text-lg">{formatDate(new Date().toISOString())}</p>
                             </div>
                        </div>
                    </div>

                    {/* Patient Banner */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-md grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs uppercase font-bold text-slate-400">Patient Name</p>
                            <p className="text-xl font-bold text-slate-900">{patient.firstName} {patient.lastName}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase font-bold text-slate-400">MRN / Record ID</p>
                            <p className="text-lg font-mono text-slate-700">{patient.mrn}</p>
                        </div>
                        <div>
                             <p className="text-xs uppercase font-bold text-slate-400">DOB</p>
                             <p className="text-slate-700">{formatDate(patient.dob)}</p>
                        </div>
                        <div>
                             <p className="text-xs uppercase font-bold text-slate-400">Gender</p>
                             <p className="text-slate-700">{patient.gender}</p>
                        </div>
                    </div>

                    {/* Notes */}
                    {notes && (
                        <div>
                            <h4 className="font-bold text-slate-800 border-b border-slate-100 mb-2 uppercase text-sm tracking-wide">Clinical Notes</h4>
                            <p className="text-slate-700 whitespace-pre-wrap">{notes}</p>
                        </div>
                    )}

                    {/* Selected Drugs List */}
                    <div>
                        <h4 className="font-bold text-slate-800 border-b-2 border-slate-800 mb-4 uppercase text-sm tracking-wide flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Requested Panel
                        </h4>
                        
                        {selectedDrugs.length > 0 ? (
                            <div className="columns-2 gap-8 space-y-4">
                                {/* Group selected drugs by category for display */}
                                {Object.entries(drugCategories).map(([category, drugs]) => {
                                    const activeInCat = drugs.filter(d => selectedDrugs.includes(d));
                                    if (activeInCat.length === 0) return null;
                                    
                                    return (
                                        <div key={category} className="break-inside-avoid mb-4">
                                            <h5 className="font-bold text-slate-600 text-sm mb-2">{category}</h5>
                                            <ul className="list-disc pl-5 space-y-1">
                                                {activeInCat.map(d => (
                                                    <li key={d} className="text-sm pl-1">
                                                        {d}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })}

                                {/* Custom Drugs Group */}
                                {customDrugs.filter(d => selectedDrugs.includes(d)).length > 0 && (
                                    <div className="break-inside-avoid mb-4">
                                        <h5 className="font-bold text-slate-600 text-sm mb-2">Additional</h5>
                                        <ul className="list-disc pl-5 space-y-1">
                                            {customDrugs.filter(d => selectedDrugs.includes(d)).map(d => (
                                                <li key={d} className="text-sm pl-1">
                                                    {d}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-slate-400 italic">No drugs selected.</p>
                        )}
                    </div>
                    
                    {/* Signature Area */}
                    <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between gap-12 print:flex hidden">
                        <div className="flex-1 border-t border-black pt-2">
                            <p className="text-xs uppercase font-bold text-slate-500">Requested By (Name & Signature)</p>
                        </div>
                        <div className="w-40 border-t border-black pt-2">
                            <p className="text-xs uppercase font-bold text-slate-500">Date</p>
                        </div>
                    </div>

                </div>
            </div>

            <style>{`
                @media print {
                    body > * { display: none !important; }
                    #printable-plan, #printable-plan * { display: block !important; visibility: visible !important; }
                    #printable-plan { 
                        position: absolute !important; 
                        left: 0 !important; 
                        top: 0 !important; 
                        width: 100% !important; 
                        max-width: none !important; 
                        max-height: none !important;
                        box-shadow: none !important;
                    }
                    /* Restore flex layouts for printing */
                    #printable-plan .flex { display: flex !important; }
                    #printable-plan .grid { display: grid !important; }
                    #printable-plan .columns-2 { columns: 2 !important; }
                    #printable-plan .hidden.print\\:flex { display: flex !important; }
                    #printable-plan .print\\:hidden { display: none !important; }
                    /* Ensure bullets are visible */
                    #printable-plan ul { list-style-type: disc !important; }
                    #printable-plan li { display: list-item !important; }
                }
            `}</style>
        </div>
      )}
    </>
  );
};

export default TestingPlanGenerator;
