import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  UNLOCK_KEY,
  isAppUnlocked,
  createUpdateExecutor,
  handlePwaNeedRefresh,
  handlePwaRegistration,
  initPwaUpdatePolicy,
} from './pwaUpdatePolicy';

describe('pwaUpdatePolicy', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('isAppUnlocked', () => {
    it('returns false when dream:unlocked is not set in sessionStorage', () => {
      expect(isAppUnlocked()).toBe(false);
    });

    it('returns false when dream:unlocked is set to a non-true string', () => {
      sessionStorage.setItem(UNLOCK_KEY, 'false');
      expect(isAppUnlocked()).toBe(false);
    });

    it('returns true when dream:unlocked is set to true', () => {
      sessionStorage.setItem(UNLOCK_KEY, 'true');
      expect(isAppUnlocked()).toBe(true);
    });

    it('returns false safely if storage throws (e.g. security restricted iframe / private mode)', () => {
      const mockStorage = {
        getItem: vi.fn(() => {
          throw new Error('Access denied');
        }),
      } as unknown as Storage;

      expect(isAppUnlocked(mockStorage)).toBe(false);
    });
  });

  describe('createUpdateExecutor', () => {
    it('calls activateWaitingSw and triggers reloadPage after the specified delay', async () => {
      const activateWaitingSw = vi.fn().mockResolvedValue(undefined);
      const reloadPage = vi.fn();

      const execute = createUpdateExecutor({
        activateWaitingSw,
        reloadPage,
        delayMs: 200,
      });

      const executePromise = execute();
      expect(activateWaitingSw).toHaveBeenCalledTimes(1);
      expect(reloadPage).not.toHaveBeenCalled();

      await executePromise;

      vi.advanceTimersByTime(199);
      expect(reloadPage).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(reloadPage).toHaveBeenCalledTimes(1);
    });

    it('is bounded and idempotent: multiple rapid calls do not trigger multiple activations or reloads', async () => {
      const activateWaitingSw = vi.fn().mockResolvedValue(undefined);
      const reloadPage = vi.fn();

      const execute = createUpdateExecutor({
        activateWaitingSw,
        reloadPage,
        delayMs: 200,
      });

      // Rapid successive calls
      const p1 = execute();
      const p2 = execute();
      const p3 = execute();

      await Promise.all([p1, p2, p3]);

      expect(activateWaitingSw).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(250);
      expect(reloadPage).toHaveBeenCalledTimes(1);
    });
  });

  describe('handlePwaNeedRefresh', () => {
    it('at PIN gate / locked state: automatically triggers update without showing prompt toast', () => {
      const onAutoUpdate = vi.fn();
      const onPromptUpdate = vi.fn();

      handlePwaNeedRefresh({
        isUnlocked: () => false,
        onAutoUpdate,
        onPromptUpdate,
      });

      expect(onAutoUpdate).toHaveBeenCalledTimes(1);
      expect(onPromptUpdate).not.toHaveBeenCalled();
    });

    it('when app is unlocked / clinical session active: prompts user with persistent toast and does not auto-reload', () => {
      const onAutoUpdate = vi.fn();
      const onPromptUpdate = vi.fn();

      handlePwaNeedRefresh({
        isUnlocked: () => true,
        onAutoUpdate,
        onPromptUpdate,
      });

      expect(onAutoUpdate).not.toHaveBeenCalled();
      expect(onPromptUpdate).toHaveBeenCalledTimes(1);

      // Verify the prompt provides an action callback that triggers the update
      const updateAction = onPromptUpdate.mock.calls[0][0];
      expect(typeof updateAction).toBe('function');
      expect(onAutoUpdate).not.toHaveBeenCalled();

      updateAction();
      expect(onAutoUpdate).toHaveBeenCalledTimes(1);
    });
  });

  describe('handlePwaRegistration', () => {
    it('handles undefined registration gracefully', () => {
      expect(() => {
        const cleanup = handlePwaRegistration(undefined, {
          isUnlocked: () => false,
          onAutoUpdate: vi.fn(),
        });
        cleanup?.();
      }).not.toThrow();
    });

    it('at PIN gate: automatically triggers update if registration already has a waiting worker', () => {
      const onAutoUpdate = vi.fn();
      const mockRegistration = {
        waiting: {} as ServiceWorker,
        update: vi.fn().mockResolvedValue(undefined),
      } as unknown as ServiceWorkerRegistration;

      const cleanup = handlePwaRegistration(mockRegistration, {
        isUnlocked: () => false,
        onAutoUpdate,
      });

      expect(onAutoUpdate).toHaveBeenCalledTimes(1);
      cleanup?.();
    });

    it('when unlocked: shows prompt if registration already has a waiting worker', () => {
      const onAutoUpdate = vi.fn();
      const onPromptUpdate = vi.fn();
      const mockRegistration = {
        waiting: {} as ServiceWorker,
        update: vi.fn().mockResolvedValue(undefined),
      } as unknown as ServiceWorkerRegistration;

      const cleanup = handlePwaRegistration(mockRegistration, {
        isUnlocked: () => true,
        onAutoUpdate,
        onPromptUpdate,
      });

      expect(onAutoUpdate).not.toHaveBeenCalled();
      expect(onPromptUpdate).toHaveBeenCalledTimes(1);
      cleanup?.();
    });

    it('polls for updates at configured interval (5 minutes)', () => {
      const updateSpy = vi.fn().mockResolvedValue(undefined);
      const mockRegistration = {
        update: updateSpy,
      } as unknown as ServiceWorkerRegistration;

      const cleanup = handlePwaRegistration(mockRegistration, {
        isUnlocked: () => false,
        onAutoUpdate: vi.fn(),
        checkIntervalMs: 5 * 60 * 1000,
      });

      expect(updateSpy).not.toHaveBeenCalled();

      // Advance 5 minutes
      vi.advanceTimersByTime(5 * 60 * 1000);
      expect(updateSpy).toHaveBeenCalledTimes(1);

      // Advance another 5 minutes
      vi.advanceTimersByTime(5 * 60 * 1000);
      expect(updateSpy).toHaveBeenCalledTimes(2);

      cleanup?.();

      // After cleanup, no more intervals fire
      vi.advanceTimersByTime(5 * 60 * 1000);
      expect(updateSpy).toHaveBeenCalledTimes(2);
    });

    it('triggers update check when visibilityState transitions to visible', () => {
      const updateSpy = vi.fn().mockResolvedValue(undefined);
      const mockRegistration = {
        update: updateSpy,
      } as unknown as ServiceWorkerRegistration;

      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'visible',
      });

      const cleanup = handlePwaRegistration(mockRegistration, {
        isUnlocked: () => false,
        onAutoUpdate: vi.fn(),
      });

      // Dispatch visibilitychange event
      document.dispatchEvent(new Event('visibilitychange'));
      expect(updateSpy).toHaveBeenCalledTimes(1);

      // Change visibility to hidden
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'hidden',
      });
      document.dispatchEvent(new Event('visibilitychange'));
      expect(updateSpy).toHaveBeenCalledTimes(1); // Not called when hidden

      cleanup?.();
      // After cleanup, listener is removed
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'visible',
      });
      document.dispatchEvent(new Event('visibilitychange'));
      expect(updateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('initPwaUpdatePolicy integration', () => {
    it('registers service worker with prompt mode and wires callbacks', async () => {
      let registeredOptions: any = null;
      const mockRegisterSW = vi.fn((opts) => {
        registeredOptions = opts;
        return vi.fn().mockResolvedValue(undefined);
      });

      const onPrompt = vi.fn();
      const mockReload = vi.fn();

      initPwaUpdatePolicy(mockRegisterSW, {
        onPromptUpdate: onPrompt,
        reloadPage: mockReload,
        isUnlocked: () => false,
      });

      expect(mockRegisterSW).toHaveBeenCalledTimes(1);
      expect(registeredOptions).toBeDefined();

      // Trigger onNeedRefresh while locked (at PIN gate)
      registeredOptions.onNeedRefresh();
      await vi.advanceTimersByTimeAsync(200);

      expect(onPrompt).not.toHaveBeenCalled();
      expect(mockReload).toHaveBeenCalledTimes(1);
    });
  });
});
