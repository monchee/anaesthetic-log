import { Dispatch, SetStateAction } from 'react';
import { Patient, Screen } from '@shared/types';

export interface CommonScreenLayoutProps {
  setScreen: (screen: Screen) => void;
  navigate?: (screen: Screen) => void;
  hrefFor?: (screen: Screen) => string;
  pendingNavigation?: Screen | null;
  confirmNavigation?: () => void;
  cancelNavigation?: () => void;
  isTestingDraftDirty?: boolean;
  hasActiveReport?: boolean;
  currentScreen: Screen;
  databaseDate: string;
  showDisclaimer: boolean;
  isCustomData: boolean;
  onDismissDisclaimer: () => void;
  onUploadPatients: (newPatients: Patient[], fileLastModified?: number) => void;
  onUploadComplete?: () => void;
  csvUploadSheetOpen: boolean;
  onCSVUploadSheetOpenChange: Dispatch<SetStateAction<boolean>> | ((open: boolean) => void);
  onOpenHelp?: () => void;
}
