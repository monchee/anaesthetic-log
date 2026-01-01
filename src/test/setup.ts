import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi, beforeEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Store original window to restore after tests that mock it
/* eslint-disable-next-line no-restricted-globals */
let originalWindow: typeof window | undefined;

beforeEach(() => {
  /* eslint-disable-next-line no-restricted-globals */
  originalWindow = globalThis.window;
});

afterEach(() => {
  // Restore window if it was modified
  /* eslint-disable-next-line no-restricted-globals */
  if (!globalThis.window && originalWindow) {
    /* eslint-disable-next-line no-restricted-globals */
    global.window = originalWindow;
  }
});

// Mock localStorage with spies
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
globalThis.localStorage = localStorageMock as any;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.scrollTo
globalThis.scrollTo = vi.fn();
