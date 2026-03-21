import React from 'react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { Patient, TestingPlanData } from '@/types';
import { formatDate } from '@shared/utils';
import { Printer, FileText, ChevronRight, Mail, AlertTriangle, FolderSearch, NotebookText } from 'lucide-react';
import { formatTestingPlanAsText } from '@shared/utils/testingPlanFormatter';

interface TestingPlanPrintViewProps {
  patient: Patient;
  data: TestingPlanData;
  drugCategories: Record<string, string[]>;
  onProceed: () => void;
}

const TestingPlanPrintView = ({ patient, data, drugCategories, onProceed }: TestingPlanPrintViewProps) => {
  const { selectedDrugs, customDrugs, notes, urgent, reactionDate, documentsToChase } = data;

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    const body = formatTestingPlanAsText(patient, data, drugCategories);
    const subject = `Testing Plan: ${patient.firstName} ${patient.lastName} - ${reactionDate ? new Date(reactionDate).toLocaleDateString('en-AU') : 'Date unknown'}`;
    window.location.href = `mailto:SLHD-RPA-allergynurses@health.nsw.gov.au?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <Card className="overflow-hidden print:shadow-none print:border-none print:bg-white">
        {/* Screen-only Controls */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-2 rounded-none print:hidden">
            <h3 className="text-lg font-semibold tracking-tight text-slate-800 dark:text-slate-100">Testing Plan Document</h3>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button size="sm" variant="outline" onClick={handleEmail}>
                    <Mail className="w-4 h-4 mr-2" /> Email to Allergy Nurse
                </Button>
                <Button size="sm" onClick={handlePrint} className="bg-slate-900">
                    <Printer className="w-4 h-4 mr-2" /> Print Now
                </Button>
            </div>
        </div>

        {/* Minimal Accent Header */}
        <div className="border-l-4 border-primary bg-slate-50 dark:bg-slate-900/30 p-4 md:p-6 print:bg-white print:border-l-0 print:p-2">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">Anaesthetic Allergy Testing Request</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Department of Clinical Immunology & Allergy · Royal Prince Alfred Hospital</p>
                </div>
                <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Date of Request</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatDate(new Date().toISOString())}</p>
                </div>
            </div>
        </div>

        <CardContent className="p-4 md:p-8 lg:p-12 space-y-8 md:space-y-10 print:p-4 print:space-y-3">
             {/* Urgent Banner */}
             {urgent && (
                 <div className="mb-4 print:mb-2 flex items-center gap-3 bg-red-600 text-white px-5 py-3 print:px-2 print:py-1 font-bold uppercase tracking-widest text-sm print:text-xs">
                     <AlertTriangle className="w-5 h-5 print:w-4 print:h-4 shrink-0" />
                     URGENT — Priority Testing Required
                 </div>
             )}

            {/* Patient Banner */}
            <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 print:grid-cols-3 print:bg-white print:border-slate-300 print:p-2 print:gap-2">
                <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider print:text-[9px]">Patient Name</p>
                    <p className="text-xl font-semibold tracking-tight text-primary print:text-base">{patient.firstName} {patient.lastName}</p>
                </div>
                <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider print:text-[9px]">MRN</p>
                    <p className="text-lg font-mono font-medium text-slate-700 dark:text-slate-300 print:text-xs">{patient.mrn}</p>
                </div>
                {patient.redcapId && patient.redcapId !== patient.mrn && (
                <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider print:text-[9px]">REDCap Record ID</p>
                    <p className="text-lg font-mono font-medium text-slate-700 dark:text-slate-300 print:text-xs">{patient.redcapId}</p>
                </div>
                )}
                <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider print:text-[9px]">DOB</p>
                    <p className="text-slate-700 dark:text-slate-300 font-medium print:text-xs">{formatDate(patient.dob)}</p>
                </div>
                <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider print:text-[9px]">Gender</p>
                    <p className="text-slate-700 font-medium print:text-xs">{patient.gender}</p>
                </div>
                {reactionDate && (
                    <div className="col-span-2 sm:col-span-1 print:col-span-1">
                        <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider print:text-[9px]">Date of Reaction</p>
                        <p className="text-slate-700 dark:text-slate-300 font-medium print:text-xs">{formatDate(reactionDate)}</p>
                    </div>
                )}
            </div>

            {/* Documents to Chase */}
            {documentsToChase && (documentsToChase.tryptases || documentsToChase.anaestheticChart || documentsToChase.other) && (
                <div className="mt-5 print:mt-1.5">
                    <h4 className="font-semibold text-[10px] uppercase tracking-widest border-b border-slate-200 dark:border-slate-700 mb-2 pb-1 print:text-[10px] print:mb-1 print:pb-0.5 flex items-center gap-1.5">
                        <span className="inline-block w-0.5 h-3 bg-primary shrink-0" />
                        <FolderSearch className="w-3.5 h-3.5 print:w-3 print:h-3" />
                        Documents to Chase
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-1 print:gap-1">
                        {documentsToChase.tryptases && (
                            <Badge variant="outline" className="gap-1 bg-amber-50 border-amber-300 text-amber-800 font-semibold uppercase tracking-wide print:text-[10px] print:bg-amber-50 print:border-amber-300 print:text-amber-800">
                                <span className="w-1.5 h-1.5 bg-amber-500 inline-block shrink-0" />
                                Tryptases
                            </Badge>
                        )}
                        {documentsToChase.anaestheticChart && (
                            <Badge variant="outline" className="gap-1 bg-amber-50 border-amber-300 text-amber-800 font-semibold uppercase tracking-wide print:text-[10px] print:bg-amber-50 print:border-amber-300 print:text-amber-800">
                                <span className="w-1.5 h-1.5 bg-amber-500 inline-block shrink-0" />
                                Anaesthetic Chart
                            </Badge>
                        )}
                        {documentsToChase.other && (
                            <Badge variant="outline" className="gap-1 bg-amber-50 border-amber-300 text-amber-800 font-semibold uppercase tracking-wide print:text-[10px] print:bg-amber-50 print:border-amber-300 print:text-amber-800">
                                <span className="w-1.5 h-1.5 bg-amber-500 inline-block shrink-0" />
                                Other{documentsToChase.otherText ? `: ${documentsToChase.otherText}` : ''}
                            </Badge>
                        )}
                    </div>
                </div>
            )}

            {/* Notes */}
            {notes && (
                <div className="mt-6 print:mt-1.5">
                    <h4 className="font-semibold text-[10px] uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 mb-2 pb-1 print:text-[10px] print:mb-1 print:pb-0.5 flex items-center gap-1.5">
                        <span className="inline-block w-0.5 h-3 bg-primary shrink-0" />
                        <NotebookText className="w-3.5 h-3.5 print:w-3 print:h-3" />
                        Clinical Notes
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-sm print:text-xs">{notes}</p>
                </div>
            )}

            {/* Selected Drugs List */}
            <div className="mt-6 print:mt-1.5">
                <h4 className="font-semibold text-[10px] uppercase tracking-widest border-b-2 border-slate-800 dark:border-slate-700 mb-3 pb-1 print:text-[10px] print:mb-1.5 print:pb-0.5 print:border-b flex items-center gap-1.5">
                    <span className="inline-block w-0.5 h-3 bg-primary shrink-0" />
                    <FileText className="w-4 h-4 print:w-3 print:h-3" /> Requested Panel
                </h4>

                {selectedDrugs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 print:grid-cols-3 print:gap-2">
                        {/* Group selected drugs by category for display */}
                        {Object.entries(drugCategories).map(([category, drugs]) => {
                            const activeInCat = (drugs as string[]).filter(d => selectedDrugs.includes(d));
                            if (activeInCat.length === 0) return null;

                            return (
                                <div key={category} className="break-inside-avoid mb-0 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-lg p-3 print:mb-0 print:p-2 print:bg-white print:border-slate-300">
                                    <h5 className="font-bold text-[10px] uppercase tracking-wider text-primary border-b border-slate-200 dark:border-slate-700 pb-1 mb-1.5 print:text-[9px] print:pb-0.5 print:mb-1">{category}</h5>
                                    <ul className="space-y-1 print:space-y-0">
                                        {activeInCat.map(d => (
                                            <li key={d} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 print:text-xs print:gap-1.5">
                                                <span className="w-1.5 h-1.5 bg-primary/40 shrink-0 inline-block print:w-1 print:h-1" />
                                                {d}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}

                        {/* Custom Drugs Group */}
                        {customDrugs.filter(d => selectedDrugs.includes(d)).length > 0 && (
                            <div className="break-inside-avoid mb-0 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-lg p-3 print:mb-0 print:p-2 print:bg-white print:border-slate-300">
                                <h5 className="font-bold text-[10px] uppercase tracking-wider text-primary border-b border-slate-200 dark:border-slate-700 pb-1 mb-1.5 print:text-[9px] print:pb-0.5 print:mb-1">Additional</h5>
                                <ul className="space-y-1 print:space-y-0">
                                    {customDrugs.filter(d => selectedDrugs.includes(d)).map(d => (
                                        <li key={d} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 print:text-xs print:gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-primary/40 shrink-0 inline-block print:w-1 print:h-1" />
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
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 print:pt-3">
                <div className="flex justify-between gap-12 print:gap-6">
                    <div className="flex-1 border-t border-black pt-2 print:pt-1">
                        <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider print:text-[9px]">Requested By (Name & Signature)</p>
                    </div>
                    <div className="w-40 border-t border-black pt-2 print:pt-1 print:w-32">
                        <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider print:text-[9px]">Date</p>
                    </div>
                </div>
            </div>

            {/* Proceed Action (Hidden on Print) */}
            <div className="mt-8 pt-4 border-t border-slate-100 print:hidden flex justify-end">
                <Button size="lg" onClick={onProceed} className="shadow-lg shadow-slate-200 dark:shadow-slate-900/50">
                    Proceed to Testing Panel <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
            </div>
        </CardContent>
    </Card>
  );
};

export default TestingPlanPrintView;
