// Mock providers
export const mockPrismaService = {
  onModuleInit: jest.fn(),
  onModuleDestroy: jest.fn(),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

// Mock logger
export const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
  context: 'PrismaService',
};

// Mock functions
export const createMockPrismaService = (
  overrides?: Partial<typeof mockPrismaService>,
) => ({
  ...mockPrismaService,
  ...overrides,
});

// Mock errors
export const mockConnectionError = new Error('Failed to connect to database');
export const mockDisconnectionError = new Error(
  'Failed to disconnect from database',
);
