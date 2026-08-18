import { render } from './test/helpers';
import { describe, expect, it, vi } from 'vitest';
import { AnaestheticLogApp } from '../App';
import type { ScreenLayoutProps } from '@core/components/ScreenLayout';

/**
 * TEMPORARY TRIPWIRE TEST: to be deleted after the Phase 3 refactor.
 * Pins the exact field set App.tsx passes down to ScreenLayout (via layoutProps and screen props).
 * A silently dropped or added field fails loudly during refactoring.
 */

let capturedProps: Partial<ScreenLayoutProps> | null = null;

vi.mock('@core/components/ScreenLayout', () => ({
  ScreenLayout: (props: ScreenLayoutProps) => {
    capturedProps = props;
    return <div data-testid="mock-screen-layout">{props.children}</div>;
  },
}));

vi.mock('@features/research/hooks/useResearchSubmit', () => ({
  useResearchSubmit: () => ({ reset: vi.fn() }),
}));

vi.mock('@core/components/GetStartedModal', () => ({
  GetStartedModal: () => null,
}));

describe('App layoutProps tripwire (temporary Phase 0-3)', () => {
  it('pins exact prop keys received by ScreenLayout on Screen.LOG', () => {
    render(<AnaestheticLogApp />);
    expect(capturedProps).not.toBeNull();
    const propKeys = Object.keys(capturedProps!).sort();
    expect(propKeys).toMatchInlineSnapshot(`
      [
        "cancelNavigation",
        "children",
        "className",
        "confirmNavigation",
        "contentClassName",
        "contextBar",
        "csvUploadSheetOpen",
        "currentScreen",
        "databaseDate",
        "hasActiveReport",
        "hrefFor",
        "icon",
        "isCustomData",
        "isTestingDraftDirty",
        "navigate",
        "onCSVUploadSheetOpenChange",
        "onDeleteTestingDraft",
        "onDismissDisclaimer",
        "onOpenGetStarted",
        "onUploadComplete",
        "onUploadPatients",
        "pendingNavigation",
        "setScreen",
        "showDisclaimer",
        "subtitle",
        "title",
      ]
    `);
  });
});
