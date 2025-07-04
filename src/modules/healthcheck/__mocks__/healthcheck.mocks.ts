import { HealthStatus } from '../domain/types/healthcheck.types';
import { HealthCheck } from '../domain/entities/healthcheck.entity';
import { HealthCheckDto } from '../application/dtos/healthcheck.dto';
import { HealthCheckResponseDto } from '../application/dtos/healthcheck.dto';

// Mock data
export const mockHealthData = new HealthCheck(
  HealthStatus.OK,
  '2024-01-01T00:00:00.000Z',
  123.45,
  'test',
);

export const mockHealthDto: HealthCheckDto = {
  status: HealthStatus.OK,
  timestamp: '2024-01-01T00:00:00.000Z',
  uptime: 123.45,
  environment: 'test',
};

export const mockHealthResponse: HealthCheckResponseDto = {
  success: true,
  data: mockHealthData,
  message: 'Health check completed successfully',
};

// Mock providers
export const mockHealthCheckRepository = {
  getHealthStatus: jest.fn(),
};

export const mockHealthCheckUseCase = {
  execute: jest.fn(),
};

export const mockConfigService = {
  get: jest.fn(),
};

// Mock functions
export const createMockHealthData = (
  overrides?: Partial<HealthCheck>,
): HealthCheck => {
  const baseData = new HealthCheck(
    HealthStatus.OK,
    '2024-01-01T00:00:00.000Z',
    123.45,
    'test',
  );

  if (overrides) {
    return Object.assign(baseData, overrides);
  }

  return baseData;
};

export const createMockHealthResponse = (
  overrides?: Partial<HealthCheckResponseDto>,
): HealthCheckResponseDto => ({
  ...mockHealthResponse,
  ...overrides,
});

// Mock errors
export const mockHealthCheckError = new Error('Health check failed');
export const mockDatabaseError = new Error('Database connection failed');
