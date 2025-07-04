import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckUseCase } from '../../use-cases/healthcheck.use-case';
import { HealthCheckRepository } from '../../../infrastructure/repositories/healthcheck.repository';
import {
  mockHealthData,
  mockHealthDto,
  mockHealthCheckRepository,
  mockDatabaseError,
  createMockHealthData,
} from '../../../__mocks__/healthcheck.mocks';

describe('HealthCheckUseCase', () => {
  let useCase: HealthCheckUseCase;
  let repository: jest.Mocked<HealthCheckRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthCheckUseCase,
        {
          provide: HealthCheckRepository,
          useValue: mockHealthCheckRepository,
        },
      ],
    }).compile();

    useCase = module.get<HealthCheckUseCase>(HealthCheckUseCase);
    repository = module.get(HealthCheckRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return health check data successfully', async () => {
      // Arrange
      const getHealthStatusSpy = jest.spyOn(repository, 'getHealthStatus');
      repository.getHealthStatus.mockResolvedValue(mockHealthData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(getHealthStatusSpy).toHaveBeenCalledTimes(1);
      expect(getHealthStatusSpy).toHaveBeenCalledWith();
      expect(result).toEqual(mockHealthDto);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const getHealthStatusSpy = jest.spyOn(repository, 'getHealthStatus');
      repository.getHealthStatus.mockRejectedValue(mockDatabaseError);

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(
        'Database connection failed',
      );
      expect(getHealthStatusSpy).toHaveBeenCalledTimes(1);
    });

    it('should return correct data structure', async () => {
      // Arrange
      repository.getHealthStatus.mockResolvedValue(mockHealthData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('environment');
      expect(typeof result.status).toBe('string');
      expect(typeof result.timestamp).toBe('string');
      expect(typeof result.uptime).toBe('number');
      expect(typeof result.environment).toBe('string');
    });

    it('should handle different health statuses', async () => {
      // Arrange
      const errorHealthData = createMockHealthData({
        status: 'error' as const,
      });
      repository.getHealthStatus.mockResolvedValue(errorHealthData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result.status).toBe('error');
    });
  });
});
