import React from 'react';
import { Button, Card, CardContent } from './ui';
import { Patient, TestingPlanData } from '../types';
import { formatDate } from '../lib/utils';
import { Printer, FileText, ChevronRight } from 'lucide-react';

interface TestingPlanPrintViewProps {
  patient: Patient;
  data: TestingPlanData;
  drugCategories: Record<string, string[]>;
  onProceed: () => void;
}

const TestingPlanPrintView = ({ patient, data, drugCategories, onProceed }: TestingPlanPrintViewProps) => {
  const { selectedDrugs, customDrugs, notes } = data;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className="max-w-4xl mx-auto mt-8 print:shadow-none print:border-none print:max-w-none print:mt-0">
        {/* Screen-only Controls */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center rounded-t-xl print:hidden">
            <h3 className="font-bold text-slate-800">Testing Plan Document</h3>
            <Button size="sm" onClick={handlePrint} className="bg-[#441170]">
                <Printer className="w-4 h-4 mr-2" /> Print Now
            </Button>
        </div>

        <CardContent className="p-8 md:p-12 print:p-0">
             {/* Document Header */}
             <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Anaesthetic Allergy Testing Request</h1>
                    <p className="text-slate-500 font-medium">Department of Clinical Immunology & Allergy</p>
                    <p className="text-sm text-slate-400">Royal Prince Alfred Hospital</p>
                </div>
                <div className="text-right">
                        <div className="bg-slate-100 px-4 py-2 rounded mb-2 print:bg-slate-100">
                        <p className="text-xs uppercase font-bold text-slate-500">Date of Request</p>
                        <p className="font-mono font-bold text-lg">{formatDate(new Date().toISOString())}</p>
                        </div>
                </div>
            </div>

            {/* Patient Banner */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-md grid grid-cols-2 gap-4 mt-8 print:bg-slate-50">
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
                <div className="mt-8">
                    <h4 className="font-bold text-slate-800 border-b border-slate-100 mb-2 uppercase text-sm tracking-wide">Clinical Notes</h4>
                    <p className="text-slate-700 whitespace-pre-wrap">{notes}</p>
                </div>
            )}

            {/* Selected Drugs List */}
            <div className="mt-8">
                <h4 className="font-bold text-slate-800 border-b-2 border-slate-800 mb-4 uppercase text-sm tracking-wide flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Requested Panel
                </h4>
                
                {selectedDrugs.length > 0 ? (
                    <div className="columns-2 gap-8 space-y-4">
                        {/* Group selected drugs by category for display */}
                        {Object.entries(drugCategories).map(([category, drugs]) => {
                            const activeInCat = (drugs as string[]).filter(d => selectedDrugs.includes(d));
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

            {/* Proceed Action (Hidden on Print) */}
            <div className="mt-12 pt-6 border-t border-slate-100 print:hidden flex justify-end">
                <Button size="lg" onClick={onProceed} className="shadow-lg shadow-purple-200 dark:shadow-purple-900/50">
                    Proceed to Testing Panel <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
            </div>
        </CardContent>
    </Card>
  );
};

export default TestingPlanPrintView;