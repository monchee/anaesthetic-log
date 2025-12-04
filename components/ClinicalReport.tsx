

import React from 'react';
import { Card, CardContent } from './ui';
import { LogFormData } from '../types';
import { formatDate } from '../lib/utils';
import { Activity, History, FileText, Printer, CheckCircle2, AlertTriangle } from 'lucide-react';

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
    <Card className="border-t-8 border-t-[#441170] overflow-hidden print:shadow-none print:border-none">
      
      {/* Report Header */}
      <div className="bg-[#441170] text-white p-6 flex justify-between items-start print:bg-[#441170] print:text-white">
         <div>
           <h1 className="text-xl font-bold">Clinical Immunology & Allergy</h1>
           <p className="text-sm opacity-90">Royal Prince Alfred Hospital</p>
         </div>
         <div className="text-right">
           <h2 className="font-semibold text-lg">Anaesthetic Testing Report</h2>
           <p className="text-sm opacity-80 text-white">Generated: {new Date().toLocaleDateString()}</p>
         </div>
      </div>

      <CardContent className="p-8 space-y-8">
         
         {/* Patient Details */}
         <div className="grid grid-cols-2 gap-8 border-b border-slate-100 py-6">
            <div>
               <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Patient Name</label>
               <p className="text-2xl font-bold text-[#441170]">{data.firstName} {data.lastName}</p>
            </div>
            <div>
               <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">REDCap Record ID</label>
               <p className="text-lg font-mono font-medium">{data.mrn}</p>
            </div>
            <div className="col-span-2">
               <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Visit Date</label>
               <p className="text-lg font-medium">{formatDate(data.visitDate)}</p>
            </div>
         </div>

         {/* Skin Testing Results */}
         <div>
            <h3 className="text-[#441170] font-bold text-lg mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5" /> Skin & Intradermal Testing
            </h3>
            
            {/* Controls */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 text-sm print:bg-slate-50 print:border-slate-300">
               <span className="font-semibold mr-2">Controls (mm):</span>
               <span className="mr-4">Histamine SPT: <strong>{data.controls?.histamineSpt || '-'}</strong></span>
               <span className="mr-4">Saline SPT: <strong>{data.controls?.salineSpt || '-'}</strong></span>
               <span>Saline IDT: <strong>{data.controls?.salineIdt || '-'}</strong></span>
            </div>

            {(data.testPanel || []).length > 0 ? (
              <table className="w-full text-sm text-left border-collapse">
                 <thead>
                    <tr className="border-b-2 border-slate-200 text-slate-600">
                      <th className="py-2 font-semibold">Drug Tested</th>
                      <th className="py-2 font-semibold">SPT</th>
                      <th className="py-2 font-semibold">IDT 1:100</th>
                      <th className="py-2 font-semibold">IDT 1:10</th>
                      <th className="py-2 font-semibold">IDT Neat</th>
                    </tr>
                 </thead>
                 <tbody>
                    {data.testPanel.map((row, i) => (
                      <tr key={i} className="border-b border-slate-100">
                         <td className="py-2 font-medium">
                           {row.drugName === 'Other' ? (row.customName || 'Other') : row.drugName}
                         </td>
                         <td className="py-2">{row.sptWheal || '-'} mm</td>
                         <td className="py-2">{row.idt100 || '-'} mm</td>
                         <td className="py-2">{row.idt10 || '-'} mm</td>
                         <td className="py-2">{row.idtNeat || '-'} mm</td>
                      </tr>
                    ))}
                 </tbody>
              </table>
            ) : (
              <p className="text-slate-500 italic">No panel testing recorded.</p>
            )}
         </div>

         {/* Challenge Results */}
         <div>
            <h3 className="text-[#441170] font-bold text-lg mb-3 flex items-center gap-2">
              <History className="w-5 h-5" /> IV Challenge Details
            </h3>
            {data.proceedToChallenge ? (
               <div className={`p-4 rounded-lg border-l-4 ${data.outcome === 'SUCCESS' 
                   ? 'bg-green-50 border-green-500 print:bg-green-50' 
                   : 'bg-red-50 border-red-500 print:bg-red-50'}`}>
                  <div className="flex justify-between items-center mb-2">
                     <span className="font-bold text-lg">
                        {data.challengeDrug === 'Other' ? (data.challengeDrugCustom || 'Other') : data.challengeDrug}
                     </span>
                     <div className={`px-2 py-1 rounded text-xs font-bold text-white ${data.outcome === 'SUCCESS' ? 'bg-green-600' : 'bg-red-600'}`}>
                        {data.outcome === 'SUCCESS' ? 'NEGATIVE (Safe)' : 'POSITIVE (Reaction)'}
                     </div>
                  </div>
                  
                  {data.outcome === 'UNSUCCESS' && (
                    <div className="mt-2 text-sm space-y-1">
                       <p><span className="font-semibold">Reaction Time:</span> {data.reactionTime} mins</p>
                       <p><span className="font-semibold">Symptoms:</span> {formatSymptoms(data)}</p>
                       <p><span className="font-semibold">Intervention:</span> {formatIntervention(data)}</p>
                    </div>
                  )}
               </div>
            ) : (
               <p className="text-slate-500 italic">No IV challenge performed.</p>
            )}
         </div>

         {/* Plan */}
         <div className="pb-4">
            <h3 className="text-[#441170] font-bold text-lg mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Assessment & Plan
            </h3>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 min-h-[100px] whitespace-pre-wrap">
               {data.plan || 'No comments recorded.'}
            </div>
         </div>

         {/* Print Footer */}
         <div className="hidden print:block pt-12 border-t border-slate-200 mt-8">
            <div className="flex justify-between text-sm">
               <div className="border-t border-black w-48 pt-2">Clinician Signature</div>
               <div className="border-t border-black w-48 pt-2">Date</div>
            </div>
         </div>

      </CardContent>
    </Card>
  );
};

export default ClinicalReport;