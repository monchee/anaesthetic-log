import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppNavigation } from './useAppNavigation';
import { Screen } from '../../shared/types';

describe('useAppNavigation', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Reset location and history for each test
    vi.stubGlobal('location', {
      ...originalLocation,
      pathname: '/',
    });
    window.history.pushState({}, '', '/');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should initialize with Screen.LOG when path is /', () => {
    const { result } = renderHook(() => useAppNavigation());
    expect(result.current.screen).toBe(Screen.LOG);
  });

  it('should initialize with correct screen from URL', () => {
    vi.stubGlobal('location', {
      ...originalLocation,
      pathname: '/dashboard',
    });
    
    const { result } = renderHook(() => useAppNavigation());
    expect(result.current.screen).toBe(Screen.DASHBOARD);
  });

  it('should initialize research from direct URL', () => {
    vi.stubGlobal('location', {
      ...originalLocation,
      pathname: '/research',
    });

    const { result } = renderHook(() => useAppNavigation());
    expect(result.current.screen).toBe(Screen.RESEARCH);
  });

  it('should update URL when setScreen is called', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const { result } = renderHook(() => useAppNavigation());

    act(() => {
      result.current.setScreen(Screen.DASHBOARD);
    });

    expect(result.current.screen).toBe(Screen.DASHBOARD);
    expect(pushStateSpy).toHaveBeenCalledWith({ screen: Screen.DASHBOARD }, '', '/dashboard');
  });

  it('should handle popstate events', () => {
    const { result } = renderHook(() => useAppNavigation());

    // Simulation of browser back button
    act(() => {
      vi.stubGlobal('location', {
        ...originalLocation,
        pathname: '/testing',
      });
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(result.current.screen).toBe(Screen.TESTING);
  });

  it('should navigate via helper functions', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const { result } = renderHook(() => useAppNavigation());

    act(() => {
      result.current.navigateToDashboard();
    });

    expect(result.current.screen).toBe(Screen.DASHBOARD);
    expect(pushStateSpy).toHaveBeenCalledWith({ screen: Screen.DASHBOARD }, '', '/dashboard');
  });

  it('should navigate to research via helper function', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const { result } = renderHook(() => useAppNavigation());

    act(() => {
      result.current.navigateToResearch();
    });

    expect(result.current.screen).toBe(Screen.RESEARCH);
    expect(pushStateSpy).toHaveBeenCalledWith({ screen: Screen.RESEARCH }, '', '/research');
  });
});
