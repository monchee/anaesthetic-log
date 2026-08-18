import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';
import { ScreenLayout } from '@core/components/ScreenLayout';
import { findInfoPageRoute } from '@core/routes/infoPageConfig';
import { ScreenChrome } from './types';

const BACK_BTN = "h-11 min-w-11 px-4 bg-secondary hover:bg-muted text-secondary-foreground hover:text-foreground border border-border shadow-sm transition-[color,background-color,border-color,transform,box-shadow] duration-200 group rounded-none btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const BACK_ICON = "w-4 h-4 opacity-90 group-hover:opacity-100 transition-opacity";

interface InfoPageScreenProps {
  route: NonNullable<ReturnType<typeof findInfoPageRoute>>;
  chrome: ScreenChrome;
  onBack: () => void;
}

export function InfoPageScreen({ route, chrome, onBack }: InfoPageScreenProps) {
  const PageComponent = route.component;

  return (
    <ScreenLayout
      chrome={chrome}
      title={route.title}
      subtitle={route.subtitle}
      icon={route.icon}
      actions={
        <Button onClick={onBack} variant="ghost" className={BACK_BTN}>
          <ArrowLeft className={BACK_ICON} /> Back
        </Button>
      }
    >
      <article aria-label={route.title}>
        <PageComponent setScreen={chrome.setScreen} />
      </article>
    </ScreenLayout>
  );
}
