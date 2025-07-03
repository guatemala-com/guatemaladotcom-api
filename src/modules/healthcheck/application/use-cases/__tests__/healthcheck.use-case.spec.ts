import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckUseCase } from '../../use-cases/healthcheck.use-case';
import { HealthCheckRepository } from '../../../infrastructure/repositories/healthcheck.repository';
import { HealthCheckDto } from '../../dtos/healthcheck.dto';
import { HealthCheck } from '../../../domain/entities/healthcheck.entity';
import { HealthStatus } from '../../../domain/types/healthcheck.types';

describe('HealthCheckUseCase', () => {
  let useCase: HealthCheckUseCase;
  let repository: jest.Mocked<HealthCheckRepository>;

  const mockHealthData: HealthCheck = {
    status: HealthStatus.OK,
    timestamp: '2024-01-01T00:00:00.000Z',
    uptime: 123.45,
    environment: 'test',
  } as HealthCheck;

  const mockHealthDto: HealthCheckDto = {
    status: HealthStatus.OK,
    timestamp: '2024-01-01T00:00:00.000Z',
    uptime: 123.45,
    environment: 'test',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthCheckUseCase,
        {
          provide: HealthCheckRepository,
          useValue: {
            getHealthStatus: jest.fn(),
          },
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
      const error = new Error('Database connection failed');
      repository.getHealthStatus.mockRejectedValue(error);

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
      const errorHealthData = {
        ...mockHealthData,
        status: HealthStatus.ERROR,
      } as HealthCheck;
      repository.getHealthStatus.mockResolvedValue(errorHealthData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result.status).toBe(HealthStatus.ERROR);
    });
  });
});
