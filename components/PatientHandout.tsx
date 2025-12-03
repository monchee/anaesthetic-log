import React from 'react';
import { Card, CardContent } from './ui';
import { LogFormData } from '../types';
import { formatDate, getPositiveResults, getNegativeResults } from '../lib/utils';
import { Ban, ShieldCheck } from 'lucide-react';

interface PatientHandoutProps {
  data: LogFormData;
}

const PatientHandout: React.FC<PatientHandoutProps> = ({ data }) => {
  const posResults = getPositiveResults(data);
  const negResults = getNegativeResults(data);

  return (
    <Card className="overflow-hidden print:shadow-none print:border-none">
        <div className="bg-[#441170] text-white p-8 text-center print:bg-[#441170] print:text-white">
           <h1 className="text-2xl font-bold mb-2">Allergy Testing Results</h1>
           <p className="text-white/80">Patient Information Handout</p>
        </div>

        <CardContent className="p-8 space-y-8">
           
           {/* Header Info */}
           <div className="flex justify-between border-b border-slate-200 py-6">
              <div>
                 <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Patient Name</p>
                 <p className="text-xl font-bold">{data.firstName} {data.lastName}</p>
              </div>
              <div className="text-right">
                 <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Date</p>
                 <p className="text-lg">{formatDate(data.visitDate)}</p>
              </div>
           </div>

           {/* Positive Results */}
           <div>
              <h3 className="text-red-600 font-bold text-lg mb-4 flex items-center gap-2 border-b border-red-100 pb-2">
                 <Ban className="w-5 h-5" /> Drugs to avoid
              </h3>
              {posResults.length > 0 ? (
                 <ul className="space-y-3">
                    {posResults.map((drugName, idx) => (
                       <li key={idx} className="bg-red-50 border border-red-100 p-4 rounded-lg flex justify-between items-center print:bg-red-50">
                          <span className="font-bold text-red-900 text-lg">{drugName}</span>
                          <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">AVOID</span>
                       </li>
                    ))}
                 </ul>
              ) : (
                 <p className="text-slate-500 italic p-4 bg-slate-50 rounded-lg border border-slate-200">No positive reactions recorded today.</p>
              )}
           </div>

           {/* Negative Results */}
           <div>
              <h3 className="text-green-600 font-bold text-lg mb-4 flex items-center gap-2 border-b border-green-100 pb-2">
                 <ShieldCheck className="w-5 h-5" /> Drugs tolerated
              </h3>
              {negResults.length > 0 ? (
                 <ul className="space-y-3">
                    {negResults.map((drugName, idx) => (
                       <li key={idx} className="bg-green-50 border border-green-100 p-4 rounded-lg flex justify-between items-center print:bg-green-50">
                          <span className="font-bold text-green-900 text-lg">{drugName}</span>
                          <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">SAFE</span>
                       </li>
                    ))}
                 </ul>
              ) : (
                 <p className="text-slate-500 italic p-4 bg-slate-50 rounded-lg border border-slate-200">No negative results recorded.</p>
              )}
           </div>

           {/* Department Info */}
           <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 text-sm space-y-1 print:bg-slate-50">
              <h3 className="font-bold text-[#441170] mb-2 uppercase tracking-wide">Contact Information</h3>
              <p className="font-bold">Department of Clinical Immunology & Allergy</p>
              <p>Royal Prince Alfred Hospital</p>
              <p>Clinic location: Level 5, Gloucester House</p>
              <p>Phone: (02) 9515 8814</p>
              <p>Email: SLHD-RPA-ClinicalImmunology@health.nsw.gov.au</p>
              <p className="pt-2 text-slate-600 italic">If you have any questions about these results, please contact the clinic.</p>
           </div>

           <div className="text-xs text-slate-400 pt-8 text-center border-t border-slate-200 mt-8">
              <p>This report summarises your skin and/or challenge tests performed today.</p>
              <p className="font-semibold text-slate-600 mt-1">Please provide this document to your anaesthetist before any future surgery.</p>
           </div>

        </CardContent>
    </Card>
  );
};

export default PatientHandout;