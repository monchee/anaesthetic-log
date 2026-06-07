import React from 'react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { Patient, TestingPlanData } from '@/types';
import { formatDate } from '@shared/utils';
import { Printer, FileText, ChevronRight, Mail, AlertTriangle, FolderSearch, NotebookText, FlaskConical } from 'lucide-react';
import { formatTestingPlanAsText } from '@shared/utils/testingPlanFormatter';
import { getSkinProtocolsForDrug, getProtocolsForDrug } from '@shared/data/drugMasterlist';

interface TestingPlanPrintViewProps {
  patient: Patient;
  data: TestingPlanData;
  drugCategories: Record<string, string[]>;
  onProceed: () => void;
}

const TestingPlanPrintView = ({ patient, data, drugCategories, onProceed }: TestingPlanPrintViewProps) => {
  const { selectedDrugs, customDrugs, notes, urgent, reactionDate, documentsToChase } = data;
  const patientName = `${patient.firstName} ${patient.lastName}`;
  const patientIdentifier = `${patientName} · MRN ${patient.mrn}${patient.dob ? ` · DOB ${formatDate(patient.dob)}` : ''}`;

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    const body = formatTestingPlanAsText(patient, data, drugCategories);
    const subject = `Testing Plan: ${patient.firstName} ${patient.lastName} - ${reactionDate ? new Date(reactionDate).toLocaleDateString('en-AU') : 'Date unknown'}`;
    window.location.href = `mailto:SLHD-RPA-allergynurses@health.nsw.gov.au?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <Card className="overflow-hidden print:overflow-visible print:shadow-none print:border-none print:bg-white">
        {/* Print-only running identity */}
        <div className="hidden print:flex print:fixed print:top-0 print:left-0 print:right-0 print:z-50 print:items-center print:justify-between print:border-b print:border-black print:bg-white print:px-[15mm] print:py-[3mm] print:text-[9px] print:font-semibold print:text-black">
            <span>{patientIdentifier}</span>
            <span>Anaesthetic Allergy Testing Request</span>
        </div>
        <div className="hidden print:flex print:fixed print:bottom-0 print:left-0 print:right-0 print:z-50 print:items-center print:justify-between print:border-t print:border-black print:bg-white print:px-[15mm] print:py-[3mm] print:text-[9px] print:font-semibold print:text-black">
            <span>{patient.lastName}, {patient.firstName} · MRN {patient.mrn}</span>
            <span>Date of request: {formatDate(new Date().toISOString())}</span>
        </div>

        {/* Screen-only Controls */}
        <div className="p-4 border-b border-border bg-muted flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-2 rounded-none print:hidden">
            <p className="text-lg font-semibold tracking-tight text-foreground">Testing Plan Document</p>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button size="sm" variant="outline" onClick={handleEmail}>
                    <Mail className="w-4 h-4 mr-2" /> Email to Allergy Nurse
                </Button>
                <Button size="sm" onClick={handlePrint}>
                    <Printer className="w-4 h-4 mr-2" /> Print Now
                </Button>
            </div>
        </div>

        {/* Minimal Accent Header */}
        <div className="border-l-4 border-primary bg-muted p-4 md:p-6 print:bg-white print:border-l-0 print:p-2">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-bold text-foreground print:text-black">Anaesthetic Allergy Testing Request</h2>
                    <p className="text-sm text-muted-foreground mt-1">Department of Clinical Immunology & Allergy · Royal Prince Alfred Hospital</p>
                </div>
                <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Date of Request</p>
                    <p className="text-sm font-semibold text-foreground">{formatDate(new Date().toISOString())}</p>
                </div>
            </div>
        </div>

        <CardContent className="p-4 md:p-8 lg:p-12 space-y-8 md:space-y-10 print:p-4 print:space-y-3">
             {/* Urgent Banner */}
             {urgent && (
                 <div className="mb-4 print:mb-2 flex items-center gap-3 bg-red-600 text-white px-5 py-3 print:px-2 print:py-1 font-bold uppercase tracking-widest text-sm print:text-xs print:bg-black print:border-2 print:border-black">
                     <AlertTriangle className="w-5 h-5 print:w-4 print:h-4 shrink-0" />
                     URGENT — Priority Testing Required
                 </div>
             )}

            {/* Patient Banner */}
            <div className="bg-muted border border-border rounded-none p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 print:grid-cols-3 print:bg-white print:border-slate-300 print:p-2 print:gap-2">
                <div>
                    <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider print:text-[9px]">Patient Name</p>
                    <p className="text-xl font-semibold tracking-tight text-primary print:text-base print:text-black">{patientName}</p>
                </div>
                <div>
                    <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider print:text-[9px]">MRN</p>
                    <p className="text-lg font-mono font-medium text-foreground/80 print:text-xs">{patient.mrn}</p>
                </div>
                {patient.redcapId && patient.redcapId !== patient.mrn && (
                <div>
                    <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider print:text-[9px]">REDCap Record ID</p>
                    <p className="text-lg font-mono font-medium text-foreground/80 print:text-xs">{patient.redcapId}</p>
                </div>
                )}
                <div>
                    <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider print:text-[9px]">DOB</p>
                    <p className="text-foreground/80 font-medium print:text-xs">{formatDate(patient.dob)}</p>
                </div>
                <div>
                    <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider print:text-[9px]">Gender</p>
                    <p className="text-foreground/80 font-medium print:text-xs">{patient.gender}</p>
                </div>
                {reactionDate && (
                    <div className="col-span-2 sm:col-span-1 print:col-span-1">
                        <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider print:text-[9px]">Date of Reaction</p>
                        <p className="text-foreground/80 font-medium print:text-xs">{formatDate(reactionDate)}</p>
                    </div>
                )}
            </div>

            {/* Documents to Chase */}
            {documentsToChase && (documentsToChase.tryptases || documentsToChase.anaestheticChart || documentsToChase.other) && (
                <div className="mt-5 print:mt-1.5">
                    <h3 className="font-semibold text-xs uppercase tracking-widest border-b border-border mb-2 pb-1 print:text-[10px] print:mb-1 print:pb-0.5 flex items-center gap-1.5 print:text-black">
                        <span className="inline-block w-0.5 h-3 bg-primary print:bg-black shrink-0" />
                        <FolderSearch className="w-3.5 h-3.5 print:w-3 print:h-3" />
                        Documents to Chase
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1 print:gap-1">
                        {documentsToChase.tryptases && (
                            <Badge variant="outline" className="gap-1 bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400 font-semibold uppercase tracking-wide print:text-[10px] print:bg-white print:border print:border-black print:text-black">
                                <span className="w-1.5 h-1.5 bg-amber-500 print:bg-black inline-block shrink-0" />
                                Tryptases
                            </Badge>
                        )}
                        {documentsToChase.anaestheticChart && (
                            <Badge variant="outline" className="gap-1 bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400 font-semibold uppercase tracking-wide print:text-[10px] print:bg-white print:border print:border-black print:text-black">
                                <span className="w-1.5 h-1.5 bg-amber-500 print:bg-black inline-block shrink-0" />
                                Anaesthetic Chart
                            </Badge>
                        )}
                        {documentsToChase.other && (
                            <Badge variant="outline" className="gap-1 bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400 font-semibold uppercase tracking-wide print:text-[10px] print:bg-white print:border print:border-black print:text-black">
                                <span className="w-1.5 h-1.5 bg-amber-500 print:bg-black inline-block shrink-0" />
                                Other{documentsToChase.otherText ? `: ${documentsToChase.otherText}` : ''}
                            </Badge>
                        )}
                    </div>
                </div>
            )}

            {/* Notes */}
            {notes && (
                <div className="mt-6 print:mt-1.5">
                    <h3 className="font-semibold text-xs uppercase tracking-widest border-b border-border mb-2 pb-1 print:text-[10px] print:mb-1 print:pb-0.5 flex items-center gap-1.5 print:text-black">
                        <span className="inline-block w-0.5 h-3 bg-primary print:bg-black shrink-0" />
                        <NotebookText className="w-3.5 h-3.5 print:w-3 print:h-3" />
                        Clinical Notes
                    </h3>
                    <p className="text-foreground/80 whitespace-pre-wrap text-sm print:text-xs">{notes}</p>
                </div>
            )}

            {/* Requested Panel — Protocol Table */}
            <div className="mt-6 print:mt-1.5">
                <h3 className="font-semibold text-xs uppercase tracking-widest border-b-2 border-foreground mb-3 pb-1 print:text-[10px] print:mb-1.5 print:pb-0.5 print:border-b flex items-center gap-1.5 print:text-black">
                    <span className="inline-block w-0.5 h-3 bg-primary print:bg-black shrink-0" />
                    <FileText className="w-4 h-4 print:w-3 print:h-3" /> Requested Skin Testing Panel
                </h3>

                {/* Reference Controls */}
                <div className="mb-3 print:mb-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs print:text-[10px]">
                    <span className="font-semibold text-muted-foreground uppercase tracking-wide text-xs print:text-[9px]">Reference Controls:</span>
                    {[
                        { label: 'Histamine (SPT)', unit: 'mm' },
                        { label: 'Saline (SPT)', unit: 'mm' },
                        { label: 'Saline (IDT)', unit: 'mm' },
                    ].map(({ label, unit }) => (
                        <span key={label} className="flex items-end gap-1">
                            <span className="text-foreground/80 print:text-slate-700">{label}</span>
                            <span className="border-b border-gray-400 print:border-black inline-block min-w-[3rem] print:h-5" />
                            <span className="text-muted-foreground text-xs">{unit}</span>
                        </span>
                    ))}
                </div>

                {selectedDrugs.length > 0 ? (
                    <div className="space-y-4 print:space-y-2">
                        {Object.entries(drugCategories).map(([category, drugs]) => {
                            const activeInCat = (drugs as string[]).filter(d => selectedDrugs.includes(d));
                            if (activeInCat.length === 0) return null;
                            return (
                                <div key={category} className="break-inside-avoid bg-muted border border-border rounded-none overflow-hidden print:bg-white print:border-slate-300">
                                    <div className="px-3 py-1.5 bg-card border-b border-border rounded-none print:bg-white print:border-slate-300">
                                        <h4 className="font-bold text-xs uppercase tracking-wider text-primary print:text-[9px] print:text-black">{category}</h4>
                                    </div>

                                    {/* Mobile card list — hidden on md+ and print */}
                                    <ul className="divide-y divide-border/50 md:hidden print:hidden">
                                        {activeInCat.map(d => {
                                            const protocols = getSkinProtocolsForDrug(d);
                                            const protocolIdx = data.selectedProtocols?.[d] ?? 0;
                                            const protocol = protocols[protocolIdx] ?? protocols[0];
                                            return (
                                                <li key={d} className="px-3 py-2 space-y-1.5 text-xs">
                                                    <div className="font-medium text-foreground/90">
                                                        {d}
                                                        {protocols.length > 1 && protocol && (
                                                            <span className="ml-1 text-xs text-muted-foreground">({protocol.protocolLabel})</span>
                                                        )}
                                                    </div>
                                                    {protocol?.presentation && (
                                                        <div className="text-muted-foreground">{protocol.presentation}</div>
                                                    )}
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                                        <div className="text-muted-foreground">
                                                            <span className="font-medium text-foreground/80">SPT prep:</span> {protocol?.sptNeatConcentration || '—'}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-medium text-foreground/80">SPT:</span>
                                                            <span className="border-b border-gray-400 inline-block min-w-[2.5rem]" />
                                                            <span className="text-muted-foreground text-xs">mm</span>
                                                        </div>
                                                    </div>
                                                    {protocol?.idtSteps && protocol.idtSteps.length > 0 && (
                                                        <div className="space-y-1">
                                                            <span className="font-medium text-foreground/80">IDT:</span>
                                                            {protocol.idtSteps.map((s, i) => (
                                                                <div key={i} className="flex items-center gap-2 font-mono pl-2">
                                                                    <span className="text-muted-foreground">{s.ratio}{s.concentration ? ` (${s.concentration})` : ''}</span>
                                                                    <span className="border-b border-gray-400 inline-block min-w-[2.5rem]" />
                                                                    <span className="text-muted-foreground text-xs">mm</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>

                                    {/* Desktop/print table — hidden on mobile */}
                                    <table className="hidden md:table print:table w-full text-xs print:text-[9px]">
                                        <thead>
                                            <tr className="border-b border-border text-muted-foreground uppercase text-xs tracking-wide print:border-slate-300">
                                                <th scope="col" className="text-left px-3 py-1.5 font-semibold w-1/5">Drug</th>
                                                <th scope="col" className="text-left px-3 py-1.5 font-semibold w-1/5">Presentation</th>
                                                <th scope="col" className="text-left px-3 py-1.5 font-semibold w-1/5">SPT Preparation</th>
                                                <th scope="col" className="text-center px-3 py-1.5 font-semibold w-[70px]">SPT Result</th>
                                                <th scope="col" className="text-left px-3 py-1.5 font-semibold">IDT Protocol / Result</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activeInCat.map(d => {
                                                const protocols = getSkinProtocolsForDrug(d);
                                                const protocolIdx = data.selectedProtocols?.[d] ?? 0;
                                                const protocol = protocols[protocolIdx] ?? protocols[0];
                                                return (
                                                    <tr key={d} className="border-b border-border/50 last:border-0 print:border-slate-200">
                                                        <td className="px-3 py-2 font-medium text-foreground/90 print:text-slate-800">
                                                            {d}
                                                            {protocols.length > 1 && protocol && (
                                                                <span className="ml-1 text-xs print:text-[9px] text-muted-foreground">({protocol.protocolLabel})</span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2 text-muted-foreground print:text-slate-600">{protocol?.presentation || '—'}</td>
                                                        <td className="px-3 py-2 text-muted-foreground print:text-slate-600">{protocol?.sptNeatConcentration || '—'}</td>
                                                        <td className="px-3 py-2 text-center">
                                                            <span className="flex items-end justify-center print:h-6">
                                                                <span className="border-b border-gray-400 print:border-black inline-block min-w-[3rem] print:h-5" />
                                                                <span className="text-muted-foreground text-xs ml-0.5">mm</span>
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2 text-muted-foreground font-mono print:text-slate-600">
                                                            {protocol?.idtSteps && protocol.idtSteps.length > 0 ? (
                                                                <div className="space-y-1">
                                                                    {protocol.idtSteps.map((s, i) => (
                                                                        <div key={i} className="flex items-end gap-2">
                                                                            <span>{s.ratio}{s.concentration ? ` (${s.concentration})` : ''}</span>
                                                                            <span className="border-b border-gray-400 print:border-black inline-block min-w-[3rem] print:h-5" />
                                                                            <span className="text-muted-foreground text-xs">mm</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : '—'}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })}

                        {/* Custom Drugs */}
                        {customDrugs.filter(e => selectedDrugs.includes(e.name)).length > 0 && (
                            <div className="break-inside-avoid bg-muted border border-border rounded-none overflow-hidden print:bg-white print:border-slate-300">
                                <div className="px-3 py-1.5 bg-card border-b border-border print:bg-white">
                                    <h4 className="font-bold text-xs uppercase tracking-wider text-primary print:text-[9px] print:text-black">Additional</h4>
                                </div>
                                <ul className="divide-y divide-border/50 print:divide-slate-200">
                                    {customDrugs.filter(e => selectedDrugs.includes(e.name)).map(entry => (
                                        <li key={entry.name} className="px-3 py-2 print:text-xs">
                                            <div className="font-medium text-sm text-foreground/80 print:text-xs">{entry.name}</div>
                                            {(entry.sptConcentration || (entry.idtSteps && entry.idtSteps.length > 0)) ? (
                                                <div className="mt-0.5 text-xs text-muted-foreground space-y-0.5 print:text-[10px]">
                                                    {entry.sptConcentration && <div>SPT: {entry.sptConcentration}</div>}
                                                    {entry.idtSteps?.map((step, i) => (
                                                        <div key={i}>IDT {i + 1}: {step.ratio}{step.concentration ? ` — ${step.concentration}` : ''}</div>
                                                    ))}
                                                    {entry.includeInChallenge && <div>Drug Challenge: Yes</div>}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground italic text-xs">protocol not in library</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-muted-foreground italic print:text-xs">No drugs selected.</p>
                )}
            </div>

            {/* Challenge Protocols section */}
            {(() => {
                const challengeDrugs = selectedDrugs.filter(d => {
                    const protos = getProtocolsForDrug(d);
                    return protos.some(p => p.testType === 'challenge' && p.challengeSteps.length > 0);
                });
                if (challengeDrugs.length === 0) return null;
                return (
                    <div className="mt-6 print:mt-2">
                        <h3 className="font-semibold text-xs uppercase tracking-widest border-b-2 border-foreground mb-3 pb-1 print:text-[10px] print:mb-1.5 print:pb-0.5 print:border-b flex items-center gap-1.5 print:text-black">
                            <span className="inline-block w-0.5 h-3 bg-primary print:bg-black shrink-0" />
                            <FlaskConical className="w-4 h-4 print:w-3 print:h-3" /> Challenge / Desensitisation Protocols
                        </h3>
                        <div className="space-y-4 print:space-y-2">
                            {challengeDrugs.map(d => {
                                const challengeProtos = getProtocolsForDrug(d).filter(p => p.testType === 'challenge' && p.challengeSteps.length > 0);
                                return challengeProtos.map((proto, pi) => (
                                    <div key={`${d}-${pi}`} className="break-inside-avoid bg-muted border border-border rounded-none overflow-hidden print:bg-white print:border-slate-300">
                                        <div className="px-3 py-1.5 bg-card border-b border-border rounded-none print:bg-white">
                                            <h4 className="font-bold text-xs uppercase tracking-wider text-primary print:text-[9px] print:text-black">
                                                {d} — {proto.protocolLabel} {proto.presentation ? `(${proto.presentation})` : ''}
                                            </h4>
                                        </div>

                                        {/* Mobile card list — hidden on md+ and print */}
                                        <ul className="divide-y divide-border/50 md:hidden print:hidden">
                                            {proto.challengeSteps.map(step => (
                                                <li key={step.step} className="px-3 py-2 text-xs space-y-1">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="font-mono text-muted-foreground w-10 shrink-0">Step {step.step}</span>
                                                        <span className="font-medium text-foreground/90">{step.dose}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-x-4 text-muted-foreground pl-12">
                                                        {step.volume && <div>Vol: {step.volume}</div>}
                                                        {step.cumulative && <div>Cumul: {step.cumulative}</div>}
                                                    </div>
                                                    <div className="flex items-center gap-2 pl-12">
                                                        <span className="text-muted-foreground">Result:</span>
                                                        <span className="border-b border-gray-400 inline-block min-w-[6rem]" />
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Desktop/print table — hidden on mobile */}
                                        <table className="hidden md:table print:table w-full text-xs print:text-[9px]">
                                            <thead>
                                                <tr className="border-b border-border text-muted-foreground uppercase text-xs tracking-wide print:border-slate-300">
                                                    <th scope="col" className="text-left px-3 py-1.5 font-semibold w-12">Step</th>
                                                    <th scope="col" className="text-left px-3 py-1.5 font-semibold">Dose</th>
                                                    <th scope="col" className="text-left px-3 py-1.5 font-semibold">Volume</th>
                                                    <th scope="col" className="text-left px-3 py-1.5 font-semibold">Cumulative</th>
                                                    <th scope="col" className="text-left px-3 py-1.5 font-semibold">Result / Observations</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {proto.challengeSteps.map(step => (
                                                    <tr key={step.step} className="border-b border-border/50 last:border-0 print:border-slate-200">
                                                        <td className="px-3 py-2 font-mono text-muted-foreground">{step.step}</td>
                                                        <td className="px-3 py-2 font-medium text-foreground/90 print:text-slate-800">{step.dose}</td>
                                                        <td className="px-3 py-2 text-muted-foreground">{step.volume || '—'}</td>
                                                        <td className="px-3 py-2 text-muted-foreground">{step.cumulative || '—'}</td>
                                                        <td className="px-3 py-2">
                                                            <span className="border-b border-gray-400 print:border-black inline-block min-w-[6rem] print:h-5" />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ));
                            })}
                        </div>
                    </div>
                );
            })()}
            
            {/* Nurse / Time / Date sign-off */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-1 text-xs print:text-[10px] pt-4 print:pt-2">
                {[
                    { label: 'Date of testing', width: 'min-w-[6rem]' },
                    { label: 'Time', width: 'min-w-[4rem]' },
                    { label: 'Nurse', width: 'min-w-[10rem]' },
                ].map(({ label, width }) => (
                    <span key={label} className="flex items-end gap-1.5">
                        <span className="font-semibold text-foreground/80 print:text-slate-700">{label}:</span>
                        <span className={`border-b border-gray-400 print:border-black inline-block print:h-6 ${width}`} />
                    </span>
                ))}
            </div>

            {/* Signature Area */}
            <div className="pt-6 border-t border-border print:pt-4">
                <div className="flex justify-between gap-12 print:gap-6">
                    <div className="flex-1">
                        <div className="border-b border-foreground print:border-black h-8 print:h-12" />
                        <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider print:text-[9px] mt-1">Requested By (Name & Signature)</p>
                    </div>
                    <div className="w-40 print:w-32">
                        <div className="border-b border-foreground print:border-black h-8 print:h-12" />
                        <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider print:text-[9px] mt-1">Date</p>
                    </div>
                </div>
            </div>

            {/* Proceed Action (Hidden on Print) */}
            <div className="mt-8 pt-4 border-t border-border print:hidden flex justify-end">
                <Button size="lg" onClick={onProceed} className="shadow-lg shadow-border">
                    Proceed to Testing Panel <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
            </div>
        </CardContent>
    </Card>
  );
};

export default TestingPlanPrintView;
