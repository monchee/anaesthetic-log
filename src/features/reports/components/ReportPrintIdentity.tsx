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
  const patientIdentifier = `${patientName} · REDCap ID ${mrn}${dob ? ` · DOB ${formatDate(dob)}` : ''}`;
  const footerDate = requestDate || new Date().toISOString();

  return (
    <>
      <div className="hidden print:flex print:items-center print:justify-between print:border-b print:border-black print:bg-white print:pb-[3mm] print:text-[10px] print:font-semibold print:text-black">
        <span>{patientIdentifier}</span>
        <span>{reportTitle}</span>
      </div>
      <div className="hidden print:flex print:items-center print:justify-between print:border-t print:border-black print:bg-white print:pt-[3mm] print:text-[10px] print:font-semibold print:text-black">
        <span>{patientName} · REDCap ID {mrn}</span>
        <span>Date of report: {formatDate(footerDate)}</span>
      </div>
    </>
  );
};
