import { showToast } from './toast-config';

export const UNLOCK_KEY = 'dream:unlocked';

/**
 * Returns whether the application is currently unlocked in the clinical workstation session.
 * Handled defensively against restrictive environments (e.g. Safari private mode or iframes).
 */
export function isAppUnlocked(storage?: Storage): boolean {
  try {
    const s = storage ?? (typeof sessionStorage !== 'undefined' ? sessionStorage : undefined);
    return s?.getItem(UNLOCK_KEY) === 'true';
  } catch {
    return false;
  }
}

export interface UpdateExecutorOptions {
  activateWaitingSw: () => Promise<void> | void;
  reloadPage?: () => void;
  delayMs?: number;
}

/**
 * Creates a bounded, idempotent update executor that activates the waiting
 * service worker and reloads the window after a short activation delay.
 *
 * Prevents multiple simultaneous activation/reload triggers.
 */
export function createUpdateExecutor({
  activateWaitingSw,
  reloadPage = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  },
  delayMs = 200,
}: UpdateExecutorOptions): () => Promise<void> {
  let isActivating = false;

  return async () => {
    if (isActivating) return;
    isActivating = true;

    try {
      await activateWaitingSw();
    } finally {
      setTimeout(() => {
        reloadPage();
      }, delayMs);
    }
  };
}

export interface PwaNeedRefreshOptions {
  isUnlocked?: () => boolean;
  onAutoUpdate: () => void | Promise<void>;
  onPromptUpdate: (onReload: () => void) => void;
}

/**
 * Executes the PWA update policy when a new service worker is waiting:
 * - At the PIN gate / before clinical session unlock: auto-activates and reloads once.
 * - During an active unlocked session: retains a clear persistent toast prompt to protect drafts.
 */
export function handlePwaNeedRefresh({
  isUnlocked = isAppUnlocked,
  onAutoUpdate,
  onPromptUpdate,
}: PwaNeedRefreshOptions): void {
  if (!isUnlocked()) {
    // PIN gate is showing — no clinical session or draft to disrupt, activate automatically
    void onAutoUpdate();
  } else {
    // Clinician is active in the app — preserve draft safety and prompt with reload action
    onPromptUpdate(() => {
      void onAutoUpdate();
    });
  }
}

export interface PwaRegistrationOptions {
  isUnlocked?: () => boolean;
  onAutoUpdate: () => void | Promise<void>;
  onPromptUpdate?: (onReload: () => void) => void;
  checkIntervalMs?: number;
  updateOnVisibilityChange?: boolean;
}

/**
 * Sets up background update polling and visibility change triggers for the registered worker.
 * Also checks if a worker was already waiting upon registration.
 */
export function handlePwaRegistration(
  registration: ServiceWorkerRegistration | undefined,
  {
    isUnlocked = isAppUnlocked,
    onAutoUpdate,
    onPromptUpdate,
    checkIntervalMs = 5 * 60 * 1000,
    updateOnVisibilityChange = true,
  }: PwaRegistrationOptions
): (() => void) | undefined {
  if (!registration) return undefined;

  // Check if a service worker was already waiting from a previous session
  if (registration.waiting) {
    if (!isUnlocked()) {
      void onAutoUpdate();
    } else if (onPromptUpdate) {
      onPromptUpdate(() => {
        void onAutoUpdate();
      });
    }
  }

  // Periodic poll for updates (default: every 5 minutes)
  const intervalId = setInterval(() => {
    try {
      void registration.update();
    } catch {
      // Ignore background update errors
    }
  }, checkIntervalMs);

  let onVisibilityChange: (() => void) | undefined;

  if (updateOnVisibilityChange && typeof document !== 'undefined') {
    onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        try {
          void registration.update();
        } catch {
          // Ignore background update errors
        }
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
  }

  return () => {
    clearInterval(intervalId);
    if (onVisibilityChange && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    }
  };
}

export interface RegisterSWOptions {
  immediate?: boolean;
  onNeedRefresh?: () => void;
  onOfflineReady?: () => void;
  onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
  onRegisterError?: (error: unknown) => void;
}

export interface PwaPolicyConfig {
  isUnlocked?: () => boolean;
  onPromptUpdate?: (onReload: () => void) => void;
  reloadPage?: () => void;
  delayMs?: number;
  checkIntervalMs?: number;
}

/**
 * Initializes the safer PWA update policy with virtual:pwa-register:
 * 1. Sends SKIP_WAITING without clientsClaim / without controllerchange reload loop.
 * 2. At PIN gate: auto-activates waiting SW and reloads once.
 * 3. When unlocked: prompts clinician persistently to preserve clinical drafts.
 */
export function initPwaUpdatePolicy(
  registerSWFn: (options: RegisterSWOptions) => (reloadPage?: boolean) => Promise<void>,
  config: PwaPolicyConfig = {}
): {
  updateSW: (reloadPage?: boolean) => Promise<void>;
  applyUpdateAndReload: () => Promise<void>;
} {
  let updateSW: (reloadPage?: boolean) => Promise<void> = async () => {};

  const applyUpdateAndReload = createUpdateExecutor({
    activateWaitingSw: async () => {
      // Pass false to send SKIP_WAITING without workbox-window's controllerchange listener,
      // avoiding the reload loop while still activating the waiting worker.
      await updateSW(false);
    },
    reloadPage: config.reloadPage,
    delayMs: config.delayMs ?? 200,
  });

  const promptUpdate = config.onPromptUpdate ?? showToast.update;

  updateSW = registerSWFn({
    onNeedRefresh() {
      handlePwaNeedRefresh({
        isUnlocked: config.isUnlocked,
        onAutoUpdate: applyUpdateAndReload,
        onPromptUpdate: promptUpdate,
      });
    },
    onOfflineReady() {
      console.log('App ready to work offline');
    },
    onRegistered(registration) {
      console.log('Service Worker registered:', registration?.scope);
      handlePwaRegistration(registration, {
        isUnlocked: config.isUnlocked,
        onAutoUpdate: applyUpdateAndReload,
        onPromptUpdate: promptUpdate,
        checkIntervalMs: config.checkIntervalMs,
      });
    },
    onRegisterError(error) {
      console.log('Service Worker registration error:', error);
    },
  });

  return { updateSW, applyUpdateAndReload };
}
