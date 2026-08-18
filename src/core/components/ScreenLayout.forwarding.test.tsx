import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScreenLayout, ScreenChrome, ScreenPresentation } from './ScreenLayout';
import { Screen } from '@shared/types';
import { renderWithProviders } from '../../test/helpers/renderWithProviders';

let recordedSidebarProps: any = null;
let recordedTopBarProps: any = null;
let recordedDrawerProps: any = null;
let recordedFooterProps: any = null;

vi.mock('./navigation/AppSidebar', () => ({
  AppSidebar: (props: any) => {
    recordedSidebarProps = props;
    return <aside aria-label="Application sidebar" data-testid="app-sidebar" />;
  },
}));

vi.mock('./navigation/AppTopBar', () => ({
  AppTopBar: (props: any) => {
    recordedTopBarProps = props;
    return (
      <header role="banner" aria-label="Application header" data-testid="app-topbar">
        <h1>{props.title}</h1>
        {props.drawerTrigger}
      </header>
    );
  },
}));

vi.mock('./navigation/AppNavigationDrawer', () => ({
  AppNavigationDrawer: (props: any) => {
    recordedDrawerProps = props;
    return <button aria-label="Open navigation menu" data-testid="app-nav-drawer" />;
  },
}));

vi.mock('./Footer', () => ({
  default: (props: any) => {
    recordedFooterProps = props;
    return <footer role="contentinfo" aria-label="Application footer" data-testid="app-footer" />;
  },
}));

describe('ScreenLayout prop forwarding to navigation chrome', () => {
  beforeEach(() => {
    recordedSidebarProps = null;
    recordedTopBarProps = null;
    recordedDrawerProps = null;
    recordedFooterProps = null;
  });

  const baseChrome: ScreenChrome = {
    setScreen: vi.fn(),
    navigate: vi.fn(),
    hrefFor: (screen: Screen) => (screen === Screen.LOG ? '/' : `/${screen}`),
    currentScreen: Screen.LOG,
    isTestingDraftDirty: false,
    hasActiveReport: false,
    databaseDate: '2026-08-15',
    isCustomData: false,
  };

  const basePresentation: ScreenPresentation = {
    title: 'Clinical Workspace',
    subtitle: 'Anaesthetic allergy session',
    children: <div data-testid="workspace-content">Workspace Content</div>,
  };

  it('forwards chrome and navigation props to AppSidebar, AppTopBar, AppNavigationDrawer, and Footer', () => {
    const onDeleteTestingDraft = vi.fn();
    const onUploadPatients = vi.fn();
    const customChrome: ScreenChrome = {
      ...baseChrome,
      currentScreen: Screen.TESTING,
      isTestingDraftDirty: true,
      hasActiveReport: true,
      databaseDate: '2026-09-01',
      isCustomData: true,
      onDeleteTestingDraft,
      onUploadPatients,
    };

    renderWithProviders(
      <ScreenLayout
        chrome={customChrome}
        {...basePresentation}
        showNav={true}
        showFooter={true}
      />
    );

    // AppSidebar props
    expect(recordedSidebarProps).toMatchObject({
      currentScreen: Screen.TESTING,
      isTestingDraftDirty: true,
      hasActiveReport: true,
      databaseDate: '2026-09-01',
      isCustomData: true,
      onDeleteTestingDraft,
    });
    expect(recordedSidebarProps.hrefFor).toBe(customChrome.hrefFor);
    expect(typeof recordedSidebarProps.onNavigate).toBe('function');
    expect(typeof recordedSidebarProps.onOpenUploadCSV).toBe('function');
    expect(typeof recordedSidebarProps.onOpenGetStarted).toBe('function');

    // AppTopBar props
    expect(recordedTopBarProps).toMatchObject({
      currentScreen: Screen.TESTING,
      isTestingDraftDirty: true,
      hasActiveReport: true,
      title: 'Clinical Workspace',
      subtitle: 'Anaesthetic allergy session',
    });
    expect(recordedTopBarProps.hrefFor).toBe(customChrome.hrefFor);
    expect(typeof recordedTopBarProps.onNavigate).toBe('function');

    // AppNavigationDrawer props (rendered inside AppTopBar drawerTrigger)
    expect(recordedDrawerProps).toMatchObject({
      currentScreen: Screen.TESTING,
      isTestingDraftDirty: true,
      hasActiveReport: true,
      databaseDate: '2026-09-01',
      isCustomData: true,
      onDeleteTestingDraft,
    });
    expect(recordedDrawerProps.hrefFor).toBe(customChrome.hrefFor);
    expect(typeof recordedDrawerProps.onNavigate).toBe('function');
    expect(typeof recordedDrawerProps.onOpenUploadCSV).toBe('function');
    expect(typeof recordedDrawerProps.onOpenGetStarted).toBe('function');

    // Footer props
    expect(recordedFooterProps).toMatchObject({
      currentScreen: Screen.TESTING,
      databaseDate: '2026-09-01',
      isCustomData: true,
      onUploadPatients,
    });
    expect(recordedFooterProps.hrefFor).toBe(customChrome.hrefFor);
    expect(typeof recordedFooterProps.onNavigate).toBe('function');
    expect(typeof recordedFooterProps.setScreen).toBe('function');
  });

  it('uses navigate for onNavigate when navigate is provided, otherwise falls back to setScreen', () => {
    const navigate = vi.fn();
    const setScreen = vi.fn();

    renderWithProviders(
      <ScreenLayout
        chrome={{ ...baseChrome, navigate, setScreen }}
        {...basePresentation}
        showNav={true}
      />
    );

    recordedSidebarProps.onNavigate(Screen.DASHBOARD);
    expect(navigate).toHaveBeenCalledWith(Screen.DASHBOARD);
    expect(setScreen).not.toHaveBeenCalled();

    navigate.mockClear();
    setScreen.mockClear();

    renderWithProviders(
      <ScreenLayout
        chrome={{ ...baseChrome, navigate: undefined, setScreen }}
        {...basePresentation}
        showNav={true}
      />
    );

    recordedSidebarProps.onNavigate(Screen.SUMMARY);
    expect(setScreen).toHaveBeenCalledWith(Screen.SUMMARY);
  });
});
