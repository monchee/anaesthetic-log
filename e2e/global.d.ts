// Global declarations for E2E tests
declare global {
  var axe: {
    run: (
      context: Document | Element,
      options?: any,
      callback?: (error: Error | null, results: any) => void
    ) => Promise<any>;
  };
}

export {};
