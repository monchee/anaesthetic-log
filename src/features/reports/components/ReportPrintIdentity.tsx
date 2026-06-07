import React from 'react';
import { formatDate } from '@shared/utils';

interface ReportPrintIdentityProps {
  patientName: string;
  mrn: string;
  dob?: string;
  reportTitle: string;
  requestDate?: string;
}

export const ReportPrintIdentity: React.FC<ReportPrintIdentityProps> = ({
  patientName,
  mrn,
  dob,
  reportTitle,
  requestDate,
}) => {
  const patientIdentifier = `${patientName} · MRN ${mrn}${dob ? ` · DOB ${formatDate(dob)}` : ''}`;
  const footerDate = requestDate || new Date().toISOString();

  return (
    <>
      <div className="hidden print:flex print:fixed print:top-0 print:left-0 print:right-0 print:z-50 print:items-center print:justify-between print:border-b print:border-black print:bg-white print:px-[15mm] print:py-[3mm] print:text-[9px] print:font-semibold print:text-black">
        <span>{patientIdentifier}</span>
        <span>{reportTitle}</span>
      </div>
      <div className="hidden print:flex print:fixed print:bottom-0 print:left-0 print:right-0 print:z-50 print:items-center print:justify-between print:border-t print:border-black print:bg-white print:px-[15mm] print:py-[3mm] print:text-[9px] print:font-semibold print:text-black">
        <span>{patientName} · MRN {mrn}</span>
        <span>Date of report: {formatDate(footerDate)}</span>
      </div>
    </>
  );
};
