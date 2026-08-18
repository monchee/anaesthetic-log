import React from 'react';
import { Database } from 'lucide-react';
import { ScreenLayout } from '@core/components/ScreenLayout';
import { ScreenChrome } from './types';

const ResearchDashboard = React.lazy(() => import('@features/research/components/ResearchDashboard'));

interface ResearchScreenProps {
  chrome: ScreenChrome;
}

export function ResearchScreen({ chrome }: ResearchScreenProps) {
  return (
    <ScreenLayout
      chrome={chrome}
      title="Research Database"
      icon={<Database className="w-5 h-5" />}
      contentClassName="py-3 sm:py-4 space-y-4"
    >
      <h2 className="sr-only">Research database analytics and de-identified submissions</h2>
      <ResearchDashboard setScreen={chrome.setScreen} />
    </ScreenLayout>
  );
}
