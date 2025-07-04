// Global mock cleanup
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

// Global test utilities
global.testUtils = {
  // Helper to create mock data with overrides
  createMockData: <T>(baseData: T, overrides?: Partial<T>): T => ({
    ...baseData,
    ...overrides,
  }),

  // Helper to wait for async operations
  waitFor: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

  // Helper to create mock errors
  createMockError: (message: string) => new Error(message),
};

// Global test environment setup
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';

// Suppress console logs during tests (optional)
if (process.env.SUPPRESS_LOGS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}
