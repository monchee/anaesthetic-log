import React from 'react';
import { Card, CardContent } from '@/components/ui';
import { LogFormData } from '@/types';
import { formatDate, getPositiveResults, getNegativeResults } from '@shared/utils';
import { Ban, ShieldCheck } from 'lucide-react';

interface PatientHandoutProps {
  data: LogFormData;
}

const PatientHandout = ({ data }: PatientHandoutProps) => {
  const posResults = getPositiveResults(data);
  const negResults = getNegativeResults(data);

  return (
    <Card className="overflow-hidden print:overflow-visible print:shadow-none print:border-none">
        {/* Minimal Accent Header */}
        <div className="border-l-4 border-primary bg-slate-50 dark:bg-card/30 p-4 md:p-6 print:bg-white print:border-l-0 print:p-2">
          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Allergy Testing Results</h1>
            <p className="text-sm text-muted-foreground mt-1">Patient Information Handout</p>
          </div>
        </div>

        <CardContent className="p-4 md:p-8 lg:p-12 space-y-8 md:space-y-10 print:p-3 print:space-y-2">
           
           {/* Header Info */}
            <div className="bg-slate-50 dark:bg-card/30 border border-border rounded-lg p-4 flex justify-between items-start print:bg-white print:border-slate-300 print:p-2">
               <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider print:text-[9px]">Patient Name</p>
                  <p className="text-xl font-semibold tracking-tight text-primary print:text-sm">{data.firstName} {data.lastName}</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider print:text-[9px]">Date</p>
                  <p className="text-lg font-medium print:text-sm">{formatDate(data.visitDate)}</p>
               </div>
            </div>

           {/* Positive Results */}
            <div>
               <h3 className="text-red-700 dark:text-red-400 font-bold text-sm uppercase tracking-wider mb-4 pb-2 border-b-2 border-red-500 flex items-center gap-2 print:text-xs print:mb-1 print:pb-1">
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
                 <p className="text-muted-foreground italic p-4 bg-muted/30 dark:bg-muted/20 rounded-none border border-border print:p-2 print:text-xs">No positive reactions recorded today.</p>
              )}
           </div>

           {/* Negative Results */}
            <div>
               <h3 className="text-green-700 dark:text-green-400 font-bold text-sm uppercase tracking-wider mb-4 pb-2 border-b-2 border-green-500 flex items-center gap-2 print:text-xs print:mb-1 print:pb-1">
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
                 <p className="text-muted-foreground italic p-4 bg-muted/30 dark:bg-muted/20 rounded-none border border-border print:p-2 print:text-xs">No negative results recorded.</p>
              )}
           </div>

           {/* Department Info */}
            <div className="bg-slate-50 dark:bg-card/30 border border-border rounded-lg p-4 text-sm space-y-2 print:bg-white print:border-slate-300 print:p-2 print:space-y-0.5 print:text-xs">
               <h3 className="font-semibold text-primary dark:text-primary mb-2 uppercase text-[11px] tracking-wider print:text-[10px] print:mb-1">Contact Information</h3>
               <p className="font-semibold dark:text-foreground/90 print:text-xs">Department of Clinical Immunology & Allergy</p>
              <p className="dark:text-foreground/80 print:text-xs">Royal Prince Alfred Hospital</p>
              <p className="dark:text-foreground/80 print:text-xs">Clinic location: Level 5, Gloucester House</p>
              <p className="dark:text-foreground/80 print:text-xs">Phone: (02) 9515 8814</p>
              <p className="dark:text-foreground/80 print:text-xs">Email: SLHD-RPA-ClinicalImmunology@health.nsw.gov.au</p>
              <p className="pt-2 text-muted-foreground italic print:pt-1 print:text-xs">If you have any questions about these results, please contact the clinic.</p>
           </div>

           <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 text-center text-sm print:bg-white print:border-slate-300 print:text-xs">
              <p className="text-slate-700 dark:text-foreground/80">This report summarises your skin and/or challenge tests performed today.</p>
              <p className="font-semibold text-foreground mt-2 print:mt-1">Please provide this document to your anaesthetist before any future surgery.</p>
           </div>

        </CardContent>
    </Card>
  );
};

export default PatientHandout;
