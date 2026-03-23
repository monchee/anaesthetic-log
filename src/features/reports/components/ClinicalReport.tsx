
import React from 'react';
import { Card, CardContent } from '@/components/ui';
import { LogFormData } from '@/types';
import { formatDate } from '@shared/utils';
import { FileText, Activity, History } from 'lucide-react';

interface ClinicalReportProps {
  data: LogFormData;
}

const ClinicalReport: React.FC<ClinicalReportProps> = ({ data }) => {
  
  const formatSymptoms = (data: LogFormData) => {
    return data.symptoms.map(s => {
      if (s === 'Other') return `Other (${data.symptomsOther})`;
      return s;
    }).join(', ');
  };

  const formatIntervention = (data: LogFormData) => {
    if (data.interventionType === 'Other') return `Other: ${data.interventionOther}`;
    return data.interventionType;
  };

  return (
    <Card className="overflow-hidden print:shadow-none print:border-none">

      {/* Minimal Accent Header */}
      <div className="border-l-4 border-primary bg-slate-50 dark:bg-card/30 p-4 md:p-6 print:bg-white print:border-l-0 print:p-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Anaesthetic Testing Report</h1>
            <p className="text-sm text-muted-foreground mt-1">Clinical Immunology & Allergy · Royal Prince Alfred Hospital</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Generated</p>
            <p className="text-sm font-semibold text-foreground">{new Date().toLocaleDateString('en-AU')}</p>
          </div>
        </div>
      </div>

      <CardContent className="p-4 md:p-8 lg:p-12 space-y-8 md:space-y-10 print:p-3 print:space-y-3">
         
         {/* Patient Details */}
         <div className="bg-slate-50 dark:bg-card/30 border border-border rounded-lg p-4 print:bg-white print:border-slate-300">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 print:grid-cols-2 print:gap-2">
            <div>
               <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block mb-1 print:mb-0.5">Patient Name</label>
               <p className="text-xl md:text-2xl font-semibold tracking-tight text-primary print:text-base">{data.firstName} {data.lastName}</p>
            </div>
            <div>
               <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block mb-1 print:mb-0.5">MRN</label>
               <p className="text-lg font-mono font-medium text-foreground print:text-sm">{data.mrn}</p>
            </div>
            <div className="md:col-span-2 print:col-span-2">
               <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block mb-1 print:mb-0.5">Visit Date</label>
               <p className="text-lg font-medium text-foreground print:text-sm">{formatDate(data.visitDate)}</p>
            </div>
           </div>
         </div>

         {/* Skin Testing Results */}
         <div>
            <h3 className="text-sm md:text-base font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b-2 border-primary pb-2 mb-4 print:text-xs print:mb-2">
              <Activity className="w-5 h-5 print:w-4 print:h-4" /> Skin & Intradermal Testing
            </h3>
            
            {/* Controls */}
            <div className="bg-slate-50 dark:bg-card/30 border border-border rounded-lg p-3 text-sm mb-4 print:bg-white print:border-slate-300 print:p-2 print:mb-2 print:text-xs">
               <div className="font-semibold mb-2 block md:inline md:mr-2">Controls (mm):</div>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:inline-flex md:gap-4">
                   <span>Histamine SPT: <strong>{data.controls?.histamineSpt || '-'}</strong></span>
                   <span>Saline SPT: <strong>{data.controls?.salineSpt || '-'}</strong></span>
                   <span>Saline IDT: <strong>{data.controls?.salineIdt || '-'}</strong></span>
               </div>
            </div>

            {(data.testPanel || []).length > 0 ? (
              <>
                {/* Desktop/Print Table */}
                <div className="hidden md:block print:block">
                  <table className="w-full text-sm text-left border-collapse print:text-xs">
                     <thead>
                        <tr className="border-b-2 border-slate-200 text-muted-foreground">
                          <th className="py-2 font-semibold print:py-1 print:text-[10px]">Drug Tested</th>
                          <th className="py-2 font-semibold print:py-1 print:text-[10px]">SPT</th>
                          <th className="py-2 font-semibold print:py-1 print:text-[10px]">IDT 1:100</th>
                          <th className="py-2 font-semibold print:py-1 print:text-[10px]">IDT 1:10</th>
                          <th className="py-2 font-semibold print:py-1 print:text-[10px]">IDT Neat</th>
                          <th className="py-2 font-semibold print:py-1 print:text-[10px]">Notes</th>
                        </tr>
                     </thead>
                     <tbody>
                        {data.testPanel.map((row, i) => (
                          <tr key={i} className="border-b border-border">
                             <td className="py-2 font-medium print:py-1 print:text-xs">
                               {row.drugName === 'Other' ? (row.customName || 'Other') : row.drugName}
                             </td>
                             <td className="py-2 print:py-1 print:text-xs">{row.sptWheal || '-'} mm</td>
                             <td className="py-2 print:py-1 print:text-xs">{row.idt100 || '-'} mm</td>
                             <td className="py-2 print:py-1 print:text-xs">{row.idt10 || '-'} mm</td>
                             <td className="py-2 print:py-1 print:text-xs">{row.idtNeat || '-'} mm</td>
                             <td className="py-2 print:py-1 print:text-xs text-muted-foreground">{row.notes || ''}</td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden print:hidden space-y-3">
                   {data.testPanel.map((row, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-card/50 border border-border rounded-none p-4">
                          <div className="font-bold text-foreground mb-3 border-b border-border pb-2">
                             {row.drugName === 'Other' ? (row.customName || 'Other') : row.drugName}
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                              <div>
                                 <span className="text-[10px] text-muted-foreground uppercase font-bold block">SPT</span>
                                 <span className="font-medium">{row.sptWheal || '-'} mm</span>
                              </div>
                              <div>
                                 <span className="text-[10px] text-muted-foreground uppercase font-bold block">IDT 1:100</span>
                                 <span className="font-medium">{row.idt100 || '-'} mm</span>
                              </div>
                              <div>
                                 <span className="text-[10px] text-muted-foreground uppercase font-bold block">IDT 1:10</span>
                                 <span className="font-medium">{row.idt10 || '-'} mm</span>
                              </div>
                              <div>
                                 <span className="text-[10px] text-muted-foreground uppercase font-bold block">IDT Neat</span>
                                 <span className="font-medium">{row.idtNeat || '-'} mm</span>
                              </div>
                          </div>
                          {row.notes && (
                              <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">{row.notes}</div>
                          )}
                      </div>
                   ))}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground italic">No panel testing recorded.</p>
            )}
         </div>

         {/* Challenge Results */}
         <div>
            <h3 className="text-sm md:text-base font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b-2 border-primary pb-2 mb-4 print:text-xs print:mb-2">
              <History className="w-5 h-5 print:w-4 print:h-4" /> Drug Challenge Details
            </h3>
            {data.proceedToChallenge ? (
               <div className={`border-l-4 p-4 rounded-lg bg-card ${data.outcome === 'SUCCESS' ? 'border-green-500' : 'border-red-500'} print:bg-white print:border-l-2 print:p-2`}>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2 gap-2 print:mb-1">
                     <span className="font-bold text-lg print:text-sm">
                        {data.challengeDrug === 'Other' ? (data.challengeDrugCustom || 'Other') : data.challengeDrug}
                     </span>
                     <div className={`px-2 py-1 rounded text-xs font-bold text-white self-start md:self-auto ${data.outcome === 'SUCCESS' ? 'bg-green-600' : 'bg-red-600'} print:px-1 print:py-0.5 print:text-[10px]`}>
                        {data.outcome === 'SUCCESS' ? 'NEGATIVE (Safe)' : 'POSITIVE (Reaction)'}
                     </div>
                  </div>
                  
                  {data.outcome === 'UNSUCCESS' && (
                    <div className="mt-2 text-sm space-y-1 print:mt-1 print:text-xs print:space-y-0.5">
                       <p><span className="font-semibold">Reaction Time:</span> {data.reactionTime} mins</p>
                       <p><span className="font-semibold">Symptoms:</span> {formatSymptoms(data)}</p>
                       <p><span className="font-semibold">Intervention:</span> {formatIntervention(data)}</p>
                    </div>
                  )}
               </div>
            ) : (
               <p className="text-muted-foreground italic print:text-xs">No drug challenge performed.</p>
            )}
         </div>

         {/* Plan */}
         <div className="pb-4 print:pb-2">
            <h3 className="tracking-tight text-lg mb-2 flex items-center gap-2 text-foreground print:text-sm print:mb-1">
              <FileText className="w-5 h-5 print:w-4 print:h-4" /> Assessment & Plan
            </h3>
            <div className="bg-slate-50 dark:bg-card/30 border border-border rounded-lg p-4 whitespace-pre-wrap text-sm md:text-base print:bg-white print:border-slate-300 print:p-2 print:text-xs">
               {data.plan || 'No comments recorded.'}
            </div>
         </div>

         {/* Print Footer */}
         <div className="hidden print:block pt-4 border-t border-slate-200 mt-4">
            <div className="flex justify-between text-xs">
               <div className="border-t border-black w-40 pt-1">Clinician Signature</div>
               <div className="border-t border-black w-40 pt-1">Date</div>
            </div>
         </div>

      </CardContent>
    </Card>
  );
};

export default ClinicalReport;
