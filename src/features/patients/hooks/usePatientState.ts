import { useState } from 'react';
import { Patient } from '../types';
import { MOCK_PATIENTS } from '../../../../data/mockPatients';
import { APP_CONFIG } from '../../../../lib/constants';

export function usePatientState() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [databaseDate, setDatabaseDate] = useState<string>(APP_CONFIG.DATABASE_DEFAULT_DATE);
  const [hasUploadedData, setHasUploadedData] = useState(false);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    
    if (patient.id === 'manual') {
      setIsPatientDialogOpen(true);
    }
  };

  const handleManualDetailChange = (field: keyof Patient | 'dob', value: string) => {
    if (!selectedPatient) return;

    setSelectedPatient(prev => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  };

  const handleUploadPatients = (newPatients: Patient[]) => {
    setPatients(newPatients);
    setDatabaseDate(new Date().toLocaleDateString('en-AU'));
    setHasUploadedData(true);
  };

  return {
    selectedPatient,
    setSelectedPatient,
    isPatientDialogOpen,
    setIsPatientDialogOpen,
    patients,
    databaseDate,
    hasUploadedData,
    handlePatientSelect,
    handleManualDetailChange,
    handleUploadPatients,
  };
}
