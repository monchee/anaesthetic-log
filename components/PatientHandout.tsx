import React from 'react';
import { Card, CardContent } from './ui';
import { LogFormData } from '../types';
import { formatDate, getPositiveResults, getNegativeResults } from '../lib/utils';
import { Ban, ShieldCheck } from 'lucide-react';

interface PatientHandoutProps {
  data: LogFormData;
}

const PatientHandout = ({ data }: PatientHandoutProps) => {
  const posResults = getPositiveResults(data);
  const negResults = getNegativeResults(data);

  return (
    <Card className="overflow-hidden print:shadow-none print:border-none">
        <div className="bg-slate-900 text-white p-8 text-center print:bg-slate-900 print:text-white print:p-2 print:py-3">
           <h1 className="text-2xl font-semibold tracking-tight mb-2 print:text-base print:mb-1">Allergy Testing Results</h1>
           <p className="text-white/80 print:text-xs">Patient Information Handout</p>
        </div>

        <CardContent className="p-8 space-y-8 print:p-3 print:space-y-2">
           
           {/* Header Info */}
            <div className="flex justify-between border-b border-slate-200 py-6 print:py-2">
               <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider print:text-[9px]">Patient Name</p>
                  <p className="text-xl font-semibold tracking-tight text-primary print:text-sm">{data.firstName} {data.lastName}</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider print:text-[9px]">Date</p>
                  <p className="text-lg font-medium print:text-sm">{formatDate(data.visitDate)}</p>
               </div>
            </div>

           {/* Positive Results */}
            <div>
               <h3 className="text-red-600 font-semibold text-[11px] uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-red-100 pb-2 print:text-xs print:mb-1 print:pb-1">
                  <Ban className="w-5 h-5 print:w-3 print:h-3" /> Drugs to avoid
               </h3>
              {posResults.length > 0 ? (
                 <ul className="space-y-3 print:space-y-1">
                    {posResults.map((drugName, idx) => (
                        <li key={idx} className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-700 p-4 rounded-none flex justify-between items-center print:bg-red-50 print:p-1.5 print:text-xs">
                           <span className="font-semibold text-red-900 text-lg print:text-xs">{drugName}</span>
                           <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded print:px-1 print:py-0.5 print:text-[9px]">AVOID</span>
                        </li>
                    ))}
                 </ul>
              ) : (
                 <p className="text-slate-500 italic p-4 bg-slate-50 dark:bg-slate-900 rounded-none border border-slate-200 dark:border-slate-800 print:p-2 print:text-xs">No positive reactions recorded today.</p>
              )}
           </div>

           {/* Negative Results */}
            <div>
               <h3 className="text-green-600 font-semibold text-[11px] uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-green-100 pb-2 print:text-xs print:mb-1 print:pb-1">
                  <ShieldCheck className="w-5 h-5 print:w-3 print:h-3" /> Drugs tolerated
               </h3>
              {negResults.length > 0 ? (
                 <ul className="space-y-3 print:space-y-1">
                    {negResults.map((drugName, idx) => (
                        <li key={idx} className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-700 p-4 rounded-none flex justify-between items-center print:bg-green-50 print:p-1.5 print:text-xs">
                           <span className="font-semibold text-green-900 text-lg print:text-xs">{drugName}</span>
                           <span className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded print:px-1 print:py-0.5 print:text-[9px]">SAFE</span>
                        </li>
                    ))}
                 </ul>
              ) : (
                 <p className="text-slate-500 italic p-4 bg-slate-50 dark:bg-slate-900 rounded-none border border-slate-200 dark:border-slate-800 print:p-2 print:text-xs">No negative results recorded.</p>
              )}
           </div>

           {/* Department Info */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-none border border-slate-200 dark:border-slate-800 text-sm space-y-1 print:bg-slate-50 print:p-2 print:space-y-0.5 print:text-xs">
               <h3 className="font-semibold text-primary dark:text-primary mb-2 uppercase text-[11px] tracking-wider print:text-[10px] print:mb-1">Contact Information</h3>
               <p className="font-semibold dark:text-slate-200 print:text-xs">Department of Clinical Immunology & Allergy</p>
              <p className="dark:text-slate-300 print:text-xs">Royal Prince Alfred Hospital</p>
              <p className="dark:text-slate-300 print:text-xs">Clinic location: Level 5, Gloucester House</p>
              <p className="dark:text-slate-300 print:text-xs">Phone: (02) 9515 8814</p>
              <p className="dark:text-slate-300 print:text-xs">Email: SLHD-RPA-ClinicalImmunology@health.nsw.gov.au</p>
              <p className="pt-2 text-slate-600 dark:text-slate-400 italic print:pt-1 print:text-xs">If you have any questions about these results, please contact the clinic.</p>
           </div>

           <div className="text-xs text-slate-400 pt-8 text-center border-t border-slate-200 mt-8 print:pt-2 print:mt-2 print:text-[9px]">
              <p>This report summarises your skin and/or challenge tests performed today.</p>
              <p className="font-semibold text-slate-600 mt-1 print:mt-0.5">Please provide this document to your anaesthetist before any future surgery.</p>
           </div>

        </CardContent>
    </Card>
  );
};

export default PatientHandout;
