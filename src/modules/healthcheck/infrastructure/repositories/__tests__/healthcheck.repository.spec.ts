import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HealthCheckRepository } from '../../repositories/healthcheck.repository';
import { HealthCheck } from '../../../domain/entities/healthcheck.entity';
import { HealthStatus } from '../../../domain/types/healthcheck.types';
import { mockConfigService } from '../../../__mocks__';

describe('HealthCheckRepository', () => {
  let repository: HealthCheckRepository;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthCheckRepository,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    repository = module.get<HealthCheckRepository>(HealthCheckRepository);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getHealthStatus', () => {
    it('should return health status with default environment when NODE_ENV is not set', async () => {
      // Arrange
      const getSpy = jest.spyOn(configService, 'get');
      configService.get.mockReturnValue(undefined);
      const mockUptime = 123.45;
      jest.spyOn(process, 'uptime').mockReturnValue(mockUptime);

      // Act
      const result = await repository.getHealthStatus();

      // Assert
      expect(getSpy).toHaveBeenCalledWith('NODE_ENV');
      expect(result).toBeInstanceOf(HealthCheck);
      expect(result.status).toBe(HealthStatus.OK);
      expect(result.environment).toBe('development');
      expect(result.uptime).toBe(mockUptime);
      expect(typeof result.timestamp).toBe('string');
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });

    it('should return health status with configured environment', async () => {
      // Arrange
      const getSpy = jest.spyOn(configService, 'get');
      configService.get.mockReturnValue('production');
      const mockUptime = 999.99;
      jest.spyOn(process, 'uptime').mockReturnValue(mockUptime);

      // Act
      const result = await repository.getHealthStatus();

      // Assert
      expect(getSpy).toHaveBeenCalledWith('NODE_ENV');
      expect(result).toBeInstanceOf(HealthCheck);
      expect(result.status).toBe(HealthStatus.OK);
      expect(result.environment).toBe('production');
      expect(result.uptime).toBe(mockUptime);
    });

    it('should return health status with staging environment', async () => {
      // Arrange
      configService.get.mockReturnValue('staging');
      const mockUptime = 456.78;
      jest.spyOn(process, 'uptime').mockReturnValue(mockUptime);

      // Act
      const result = await repository.getHealthStatus();

      // Assert
      expect(result.environment).toBe('staging');
      expect(result.uptime).toBe(mockUptime);
    });

    it('should return health status with test environment', async () => {
      // Arrange
      configService.get.mockReturnValue('test');
      const mockUptime = 789.12;
      jest.spyOn(process, 'uptime').mockReturnValue(mockUptime);

      // Act
      const result = await repository.getHealthStatus();

      // Assert
      expect(result.environment).toBe('test');
      expect(result.uptime).toBe(mockUptime);
    });

    it('should return a valid timestamp in ISO format', async () => {
      // Arrange
      configService.get.mockReturnValue('development');
      const mockUptime = 100;
      jest.spyOn(process, 'uptime').mockReturnValue(mockUptime);

      // Act
      const result = await repository.getHealthStatus();

      // Assert
      expect(result.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
      expect(() => new Date(result.timestamp)).not.toThrow();
    });

    it('should always return OK status for current implementation', async () => {
      // Arrange
      configService.get.mockReturnValue('development');
      jest.spyOn(process, 'uptime').mockReturnValue(0);

      // Act
      const result = await repository.getHealthStatus();

      // Assert
      expect(result.status).toBe(HealthStatus.OK);
    });

    it('should return uptime from process.uptime()', async () => {
      // Arrange
      configService.get.mockReturnValue('development');
      const expectedUptime = 1234.56;
      const uptimeSpy = jest
        .spyOn(process, 'uptime')
        .mockReturnValue(expectedUptime);

      // Act
      const result = await repository.getHealthStatus();

      // Assert
      expect(uptimeSpy).toHaveBeenCalled();
      expect(result.uptime).toBe(expectedUptime);
    });

    it('should create HealthCheck using static create method', async () => {
      // Arrange
      configService.get.mockReturnValue('development');
      const mockUptime = 100;
      jest.spyOn(process, 'uptime').mockReturnValue(mockUptime);
      const createSpy = jest.spyOn(HealthCheck, 'create');

      // Act
      await repository.getHealthStatus();

      // Assert
      expect(createSpy).toHaveBeenCalledWith(
        HealthStatus.OK,
        expect.any(String),
        mockUptime,
        'development',
      );
    });
  });

  describe('interface implementation', () => {
    it('should implement IHealthCheckRepository interface', () => {
      // Assert
      expect(repository).toHaveProperty('getHealthStatus');
      expect(typeof repository.getHealthStatus).toBe('function');
    });

    it('should return a Promise<HealthCheck>', async () => {
      // Arrange
      configService.get.mockReturnValue('development');
      jest.spyOn(process, 'uptime').mockReturnValue(0);

      // Act
      const result = repository.getHealthStatus();

      // Assert
      expect(result).toBeInstanceOf(Promise);
      const resolvedResult = await result;
      expect(resolvedResult).toBeInstanceOf(HealthCheck);
    });
  });
});
