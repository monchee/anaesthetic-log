/**
 * Mock localStorage for testing
 */
export class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }

  get length(): number {
    return Object.keys(this.store).length;
  }
}

/**
 * Setup localStorage mock for tests
 */
export function setupLocalStorageMock(): MockLocalStorage {
  const mockStorage = new MockLocalStorage();
  globalThis.localStorage = mockStorage as any;
  return mockStorage;
}

/**
 * Clear localStorage mock
 */
export function clearLocalStorageMock(): void {
  globalThis.localStorage.clear();
}

/**
 * Set localStorage item for testing
 */
export function setLocalStorageItem(key: string, value: any): void {
  globalThis.localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Get localStorage item for testing
 */
export function getLocalStorageItem<T>(key: string): T | null {
  const item = globalThis.localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
}
