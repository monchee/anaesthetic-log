import { useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { APP_CONFIG } from '@shared/utils/constants';

export function useDisclaimer() {
  const [disclaimerDismissed, setDisclaimerDismissed] = useLocalStorage(
    APP_CONFIG.LOCAL_STORAGE_KEYS.DISCLAIMER_DISMISSED,
    false
  );

  const [showDisclaimer, setShowDisclaimer] = useState(() => !disclaimerDismissed);

  const handleDismissDisclaimer = () => {
    setShowDisclaimer(false);
    setDisclaimerDismissed(true);
  };

  return {
    showDisclaimer,
    handleDismissDisclaimer,
  };
}
