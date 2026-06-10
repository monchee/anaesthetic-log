import { Dispatch, SetStateAction } from 'react';
import { Patient, Screen } from '@/types';

export interface CommonScreenLayoutProps {
  setScreen: (screen: Screen) => void;
  currentScreen: Screen;
  databaseDate: string;
  showDisclaimer: boolean;
  isCustomData: boolean;
  onDismissDisclaimer: () => void;
  onUploadPatients: (newPatients: Patient[], fileLastModified?: number) => void;
  csvUploadSheetOpen: boolean;
  onCSVUploadSheetOpenChange: Dispatch<SetStateAction<boolean>>;
}
