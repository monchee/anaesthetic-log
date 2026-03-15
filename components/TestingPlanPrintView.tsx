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
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center rounded-none print:hidden">
            <h3 className="text-lg font-semibold tracking-tight text-slate-800 dark:text-slate-100">Testing Plan Document</h3>
            <Button size="sm" onClick={handlePrint} className="bg-slate-900">
                <Printer className="w-4 h-4 mr-2" /> Print Now
            </Button>
        </div>

        <CardContent className="p-8 md:p-12 print:p-2">
             {/* Document Header */}
             <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 print:pb-2 print:border-b">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-primary print:text-lg">Anaesthetic Allergy Testing Request</h1>
                    <p className="text-slate-500 font-medium print:text-xs">Department of Clinical Immunology & Allergy</p>
                    <p className="text-sm text-slate-400 print:text-[9px]">Royal Prince Alfred Hospital</p>
                </div>
                <div className="text-right">
                        <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded mb-2 print:bg-slate-100 print:px-2 print:py-1 print:mb-1">
                        <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider print:text-[9px]">Date of Request</p>
                        <p className="font-mono font-semibold text-lg print:text-xs">{formatDate(new Date().toISOString())}</p>
                        </div>
                </div>
            </div>

            {/* Patient Banner */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-none grid grid-cols-2 gap-4 mt-8 print:bg-slate-50 print:p-2 print:mt-2 print:gap-2">
                <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider print:text-[9px]">Patient Name</p>
                    <p className="text-xl font-semibold tracking-tight text-primary print:text-base">{patient.firstName} {patient.lastName}</p>
                </div>
                <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider print:text-[9px]">MRN / Record ID</p>
                    <p className="text-lg font-mono font-medium text-slate-700 dark:text-slate-300 print:text-xs">{patient.mrn}</p>
                </div>
                <div>
                        <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider print:text-[9px]">DOB</p>
                        <p className="text-slate-700 dark:text-slate-300 font-medium print:text-xs">{formatDate(patient.dob)}</p>
                </div>
                <div>
                        <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider print:text-[9px]">Gender</p>
                        <p className="text-slate-700 font-medium print:text-xs">{patient.gender}</p>
                </div>
            </div>

            {/* Notes */}
            {notes && (
                <div className="mt-8 print:mt-2">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 mb-2 uppercase text-[11px] tracking-wider print:text-[10px] print:mb-1 print:pb-0.5">Clinical Notes</h4>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-sm print:text-xs">{notes}</p>
                </div>
            )}

            {/* Selected Drugs List */}
            <div className="mt-8 print:mt-2">
                <h4 className="font-semibold text-slate-800 dark:text-slate-100 border-b-2 border-slate-800 dark:border-slate-700 mb-4 uppercase text-[11px] tracking-wider flex items-center gap-2 print:text-[10px] print:mb-2 print:pb-1 print:border-b">
                    <FileText className="w-4 h-4 print:w-3 print:h-3" /> Requested Panel
                </h4>
                
                {selectedDrugs.length > 0 ? (
                    <div className="columns-2 gap-8 space-y-4 print:columns-3 print:gap-4 print:space-y-1">
                        {/* Group selected drugs by category for display */}
                        {Object.entries(drugCategories).map(([category, drugs]) => {
                            const activeInCat = (drugs as string[]).filter(d => selectedDrugs.includes(d));
                            if (activeInCat.length === 0) return null;
                            
                            return (
                                <div key={category} className="break-inside-avoid mb-4 print:mb-1">
                                    <h5 className="font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase mb-2 print:text-[10px] print:mb-0.5">{category}</h5>
                                    <ul className="list-disc pl-5 space-y-1 print:pl-3 print:space-y-0">
                                        {activeInCat.map(d => (
                                            <li key={d} className="text-sm pl-1 print:text-xs print:pl-0.5">
                                                {d}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}

                        {/* Custom Drugs Group */}
                        {customDrugs.filter(d => selectedDrugs.includes(d)).length > 0 && (
                            <div className="break-inside-avoid mb-4 print:mb-1">
                                <h5 className="font-semibold text-slate-600 text-xs uppercase mb-2 print:text-[10px] print:mb-0.5">Additional</h5>
                                <ul className="list-disc pl-5 space-y-1 print:pl-3 print:space-y-0">
                                    {customDrugs.filter(d => selectedDrugs.includes(d)).map(d => (
                                        <li key={d} className="text-sm pl-1 print:text-xs print:pl-0.5">
                                            {d}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-slate-400 italic print:text-xs">No drugs selected.</p>
                )}
            </div>
            
            {/* Signature Area */}
            <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between gap-12 print:flex print:mt-4 print:pt-3 print:gap-8">
                <div className="flex-1 border-t border-black pt-2 print:pt-1">
                    <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider print:text-[9px]">Requested By (Name & Signature)</p>
                </div>
                <div className="w-40 border-t border-black pt-2 print:pt-1 print:w-32">
                    <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider print:text-[9px]">Date</p>
                </div>
            </div>

            {/* Proceed Action (Hidden on Print) */}
            <div className="mt-12 pt-6 border-t border-slate-100 print:hidden flex justify-end">
                <Button size="lg" onClick={onProceed} className="shadow-lg shadow-slate-200 dark:shadow-slate-900/50">
                    Proceed to Testing Panel <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
            </div>
        </CardContent>
    </Card>
  );
};

export default TestingPlanPrintView;
