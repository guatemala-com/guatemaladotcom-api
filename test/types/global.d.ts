declare global {
  // Global test utilities
  var testUtils: {
    createMockData: <T>(baseData: T, overrides?: Partial<T>) => T;
    waitFor: (ms: number) => Promise<void>;
    createMockError: (message: string) => Error;
  };
}

export {};
