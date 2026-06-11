import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';
import { ScreenLayout } from '@core/components/ScreenLayout';
import { Screen } from '@shared/types';
import { findInfoPageRoute } from '@core/routes/infoPageConfig';
import { CommonScreenLayoutProps } from './types';

const BACK_BTN = "h-11 min-w-11 px-4 bg-white/10 hover:bg-white/30 text-white hover:text-white border border-white/20 shadow-sm transition-[color,background-color,border-color,transform,box-shadow] duration-200 group rounded-none btn-press";
const BACK_ICON = "w-4 h-4 opacity-90 group-hover:opacity-100 transition-opacity";

interface InfoPageScreenProps {
  route: NonNullable<ReturnType<typeof findInfoPageRoute>>;
  layoutProps: CommonScreenLayoutProps;
  onBack: () => void;
}

export function InfoPageScreen({ route, layoutProps, onBack }: InfoPageScreenProps) {
  const PageComponent = route.component;

  return (
    <ScreenLayout
      title={route.title}
      subtitle={route.subtitle}
      icon={route.icon}
      {...layoutProps}
      actions={
        <Button onClick={onBack} variant="ghost" className={BACK_BTN}>
          <ArrowLeft className={BACK_ICON} /> Back
        </Button>
      }
    >
      <article aria-label={route.title}>
        <PageComponent setScreen={layoutProps.setScreen as (screen: Screen) => void} />
      </article>
    </ScreenLayout>
  );
}
