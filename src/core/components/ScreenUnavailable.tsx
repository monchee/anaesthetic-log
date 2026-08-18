import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui';
import { Screen } from '@shared/types';
import { ScreenLayout } from './ScreenLayout';

interface ScreenUnavailableProps {
  title: string;
  message: string;
  onGoHome: () => void;
  onGoDashboard: () => void;
}

const ignoreScreenChange = () => undefined;

export function ScreenUnavailable({
  title,
  message,
  onGoHome,
  onGoDashboard,
}: ScreenUnavailableProps) {
  return (
    <ScreenLayout
      chrome={{
        setScreen: ignoreScreenChange,
        currentScreen: Screen.LOG,
        databaseDate: '',
      }}
      title="DREAM"
      icon={<FileQuestion className="h-5 w-5" />}
      showNav={false}
      showFooter={false}
      contentClassName="justify-center"
    >
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md border border-border bg-card p-6 text-center shadow-sm">
          <div className="mb-4 flex justify-center">
            <FileQuestion className="h-12 w-12 text-primary" aria-hidden="true" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-foreground">{title}</h2>
          <p className="mb-6 text-sm text-muted-foreground">{message}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={onGoHome}>Go Home</Button>
            <Button onClick={onGoDashboard} variant="outline">Go to Dashboard</Button>
          </div>
        </div>
      </div>
    </ScreenLayout>
  );
}
