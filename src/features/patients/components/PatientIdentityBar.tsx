import React from 'react';
import { ClinicalContextBar, ClinicalContextBarProps } from './ClinicalContextBar';

export interface PatientIdentityBarProps extends Omit<ClinicalContextBarProps, 'context'> {
  firstName: string;
  lastName: string;
  mrn: string;
  dob?: string;
  reactionDate?: string;
  visitDate?: string;
  className?: string;
  ariaLabel?: string;
}

export function PatientIdentityBar({
  firstName,
  lastName,
  mrn,
  dob,
  reactionDate,
  visitDate,
  className,
  ariaLabel = 'Patient identity',
}: PatientIdentityBarProps) {
  return (
    <ClinicalContextBar
      firstName={firstName}
      lastName={lastName}
      mrn={mrn}
      dob={dob}
      reactionDate={reactionDate}
      visitDate={visitDate}
      className={className}
      ariaLabel={ariaLabel}
    />
  );
}

export default PatientIdentityBar;
