import { useState, useEffect } from 'react';
import { Patient } from '../types';
import { APP_CONFIG } from '@shared/utils/constants';

export function usePatientState() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);

  useEffect(() => {
    import('@shared/data/mockPatients').then(({ MOCK_PATIENTS }) => {
      setPatients(prev => prev.length === 0 ? MOCK_PATIENTS : prev);
      setIsLoadingPatients(false);
    });
  }, []);
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

  const handleUploadPatients = (newPatients: Patient[], fileLastModified?: number) => {
    setPatients(newPatients);
    const date = fileLastModified ? new Date(fileLastModified) : new Date();
    setDatabaseDate(date.toLocaleDateString('en-AU'));
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
    isLoadingPatients,
    handlePatientSelect,
    handleManualDetailChange,
    handleUploadPatients,
  };
}
