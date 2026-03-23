import React from 'react';
import { Card, CardContent } from '@/components/ui';
import { LogFormData, Patient } from '@/types';
import { formatDate, getPositiveResults, getNegativeResults } from '@shared/utils';
import {
  calculateMinutesAfterInduction,
  formatSymptomsList,
  formatTreatmentList,
  getOutcomeText,
} from '@shared/utils/reportExporter';

interface PowerchartLetterProps {
  data: LogFormData;
  patient: Patient | null;
}

// Re-export for backward compatibility with any direct imports
export { generateLetterText } from '@shared/utils/reportExporter';

const PowerchartLetter: React.FC<PowerchartLetterProps> = ({ data, patient }) => {
  const posResults = getPositiveResults(data);
  const negResults = getNegativeResults(data);

  const fullName = `${data.firstName} ${data.lastName}`;
  const firstName = data.firstName;
  const testingDate = data.visitDate ? formatDate(data.visitDate) : '[date]';

  return (
    <Card className="overflow-hidden print:shadow-none print:border-none print:bg-white">
      {/* Minimal Accent Header */}
      <div className="border-l-4 border-primary bg-slate-50 dark:bg-card/30 p-4 md:p-6 print:bg-white print:border-l-0 print:p-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Anaesthetic Allergy Clinic</h1>
            <p className="text-sm text-muted-foreground mt-1">Department of Clinical Immunology & Allergy</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Testing Date</p>
            <p className="text-sm font-semibold text-foreground">{testingDate}</p>
          </div>
        </div>
      </div>

      <CardContent className="p-4 md:p-8 lg:p-12 space-y-8 md:space-y-10 print:p-2 print:space-y-2">
        {/* Patient Details */}
        <div className="bg-slate-50 dark:bg-card/30 border border-border rounded-lg p-4 print:bg-white print:border-slate-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 print:grid-cols-2 print:gap-2">
          <div>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider print:text-[9px]">Patient Name</p>
            <p className="text-xl font-semibold tracking-tight text-primary print:text-base">{fullName}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider print:text-[9px]">MRN</p>
            <p className="text-lg font-mono font-medium text-slate-700 dark:text-foreground/80 print:text-xs">{data.mrn}</p>
          </div>
          {patient?.redcapId && patient.redcapId !== data.mrn && (
            <div>
              <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider print:text-[9px]">REDCap Record ID</p>
              <p className="text-lg font-mono font-medium text-slate-700 dark:text-foreground/80 print:text-xs">{patient.redcapId}</p>
            </div>
          )}
          {patient && patient.id !== 'manual' && (
            <>
              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider print:text-[9px]">Date of Reaction</p>
                <p className="text-slate-700 dark:text-foreground/80 font-medium print:text-xs">{formatDate(patient.history.date)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider print:text-[9px]">Hospital</p>
                <p className="text-slate-700 dark:text-foreground/80 font-medium print:text-xs">{patient.history.hospital || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider print:text-[9px]">Operation</p>
                <p className="text-slate-700 dark:text-foreground/80 font-medium print:text-xs">{patient.history.procedure}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider print:text-[9px]">Procedure Outcome</p>
                <p className="text-slate-700 dark:text-foreground/80 font-medium print:text-xs capitalize">{getOutcomeText(patient)}</p>
              </div>
            </>
          )}
          <div>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider print:text-[9px]">Testing Date</p>
            <p className="text-slate-700 dark:text-foreground/80 font-medium print:text-xs">{testingDate}</p>
          </div>
          </div>
        </div>

        {/* Narrative */}
        <div className="bg-card border border-border rounded-lg p-4 space-y-4 text-sm leading-relaxed text-foreground/90 print:bg-white print:border-slate-300 print:p-2 print:text-xs print:space-y-2">
          {patient && patient.id !== 'manual' && (
            <p>
              {fullName} presented to {patient.history.hospital || '[hospital]'} for a {patient.history.procedure?.toLowerCase() || '[procedure]'} on the {formatDate(patient.history.date)}.
              {' '}Approximately {calculateMinutesAfterInduction(patient)} after induction, {firstName} developed signs concerning for anaphylaxis.
              {' '}These were {formatSymptomsList(patient)}.
              {' '}{firstName} was treated with {formatTreatmentList(patient)} and the operation was {getOutcomeText(patient)}.
            </p>
          )}

          <p>
            {firstName} presented to the RPA ANZAAG Allergy Clinic on {testingDate}, for Skin Prick (SPT) and Intradermal (IDT) allergy testing. The following agents were tested with results below:
          </p>

          {/* Test Results Table */}
          {data.testPanel && data.testPanel.length > 0 && (
            <div className="overflow-x-auto -mx-1 print:mx-0">
            <table className="w-full min-w-[480px] text-sm border-collapse print:text-xs print:min-w-0">
              <thead>
                <tr className="border-b-2 border-slate-200 text-muted-foreground">
                  <th className="py-2 text-left font-semibold print:py-1 print:text-[10px]">Agent</th>
                  <th className="py-2 text-left font-semibold print:py-1 print:text-[10px]">SPT</th>
                  <th className="py-2 text-left font-semibold print:py-1 print:text-[10px]">IDT 1:100</th>
                  <th className="py-2 text-left font-semibold print:py-1 print:text-[10px]">IDT 1:10</th>
                  <th className="py-2 text-left font-semibold print:py-1 print:text-[10px]">IDT Neat</th>
                </tr>
              </thead>
              <tbody>
                {data.testPanel.map((row, i) => {
                  const drugName = row.drugName === 'Other' ? (row.customName || 'Other') : row.drugName;
                  const isPositive = posResults.includes(drugName);
                  return (
                    <tr key={i} className={`${i % 2 === 0 ? 'bg-slate-50 dark:bg-card/20' : 'bg-card'} border-b border-border ${isPositive ? 'font-bold' : ''} print:bg-white`}>
                      <td className={`py-2 print:py-1 ${isPositive ? 'text-red-700 dark:text-red-400 uppercase' : ''}`}>{drugName}</td>
                      <td className="py-2 print:py-1">{row.sptWheal || '-'} mm</td>
                      <td className="py-2 print:py-1">{row.idt100 || '-'} mm</td>
                      <td className="py-2 print:py-1">{row.idt10 || '-'} mm</td>
                      <td className="py-2 print:py-1">{row.idtNeat || '-'} mm</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="bg-slate-50 dark:bg-card/30 border border-border rounded-lg p-4 space-y-4 print:bg-white print:border-slate-300 print:p-1.5 print:space-y-1">
          <h3 className="font-bold text-sm uppercase tracking-wider border-b-2 border-primary pb-2 text-foreground print:text-xs print:pb-0.5">Results</h3>
          {posResults.length > 0 && (
            <div className="space-y-2">
              {posResults.map((drug, i) => (
                <div key={i} className="border-l-4 border-red-500 bg-card p-3 rounded-lg text-red-700 dark:text-red-400 font-bold uppercase text-sm print:bg-white print:border-l-2 print:p-2 print:text-xs">{drug} — POSITIVE</div>
              ))}
            </div>
          )}
          {negResults.length > 0 && (
            <ul className="space-y-1">
              {negResults.map((drug, i) => (
                <li key={i} className="text-slate-700 dark:text-foreground/80 text-sm print:text-xs">{drug} — Negative</li>
              ))}
            </ul>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-slate-50 dark:bg-card/30 border border-border rounded-lg p-4 space-y-4 print:bg-white print:border-slate-300 print:p-1.5 print:space-y-1">
          <h3 className="font-bold text-sm uppercase tracking-wider border-b-2 border-primary pb-2 text-foreground print:text-xs print:pb-0.5">Recommendations</h3>
          {posResults.length > 0 && (
            <p className="text-red-700 dark:text-red-400 font-bold text-sm print:text-xs">
              Avoid {posResults.map(d => d.toUpperCase()).join(', ')}
            </p>
          )}
          {negResults.length > 0 && (
            <p className="text-slate-700 dark:text-foreground/80 text-sm print:text-xs">
              There was no evidence of sensitisation to {negResults.join(', ')}
            </p>
          )}
        </div>

        {/* MDT Signature */}
        <div className="pt-6 border-t border-slate-200 print:pt-2">
          <p className="text-sm font-semibold text-foreground/90 print:text-xs">
            Allergy MDT: Dr. D Zalcberg, Dr. A Stoyanov and CNC K. Wells.
          </p>
        </div>

        {/* Print signature lines */}
        <div className="hidden print:flex print:pt-4 justify-between gap-12">
          <div className="flex-1 border-t border-black pt-1">
            <p className="text-[9px] uppercase font-semibold text-slate-500 tracking-wider">Clinician Signature</p>
          </div>
          <div className="w-32 border-t border-black pt-1">
            <p className="text-[9px] uppercase font-semibold text-slate-500 tracking-wider">Date</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PowerchartLetter;
