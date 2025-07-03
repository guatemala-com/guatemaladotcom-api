import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckController } from '../../../infrastructure/controllers/healthcheck.controller';
import { HealthCheckUseCase } from '../../../application/use-cases/healthcheck.use-case';
import {
  HealthCheckResponseDto,
  HealthCheckDto,
} from '../../../application/dtos/healthcheck.dto';
import { HealthStatus } from '../../../domain/types/healthcheck.types';

describe('HealthCheckController', () => {
  let controller: HealthCheckController;
  let useCase: jest.Mocked<HealthCheckUseCase>;

  const mockHealthData = {
    status: HealthStatus.OK,
    timestamp: '2024-01-01T00:00:00.000Z',
    uptime: 123.45,
    environment: 'test',
  };

  const mockHealthResponse: HealthCheckResponseDto = {
    success: true,
    data: mockHealthData,
    message: 'Health check completed successfully',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthCheckController],
      providers: [
        {
          provide: HealthCheckUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthCheckController>(HealthCheckController);
    useCase = module.get(HealthCheckUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getHealthStatus', () => {
    it('should return health status response successfully', async () => {
      // Arrange
      const executeSpy = jest.spyOn(useCase, 'execute');
      useCase.execute.mockResolvedValue(mockHealthData);

      // Act
      const result = await controller.getHealthStatus();

      // Assert
      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenCalledWith();
      expect(result).toEqual(mockHealthResponse);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockHealthData);
      expect(result.message).toBe('Health check completed successfully');
    });

    it('should handle use case errors', async () => {
      // Arrange
      const executeSpy = jest.spyOn(useCase, 'execute');
      const error = new Error('Health check failed');
      useCase.execute.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.getHealthStatus()).rejects.toThrow(
        'Health check failed',
      );
      expect(executeSpy).toHaveBeenCalledTimes(1);
    });

    it('should return correct response structure', async () => {
      // Arrange
      useCase.execute.mockResolvedValue(mockHealthData);

      // Act
      const result = await controller.getHealthStatus();

      // Assert
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('message');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.message).toBe('string');
      expect(result.data).toHaveProperty('status');
      expect(result.data).toHaveProperty('timestamp');
      expect(result.data).toHaveProperty('uptime');
      expect(result.data).toHaveProperty('environment');
    });

    it('should handle different health statuses from use case', async () => {
      // Arrange
      const errorHealthData = {
        ...mockHealthData,
        status: HealthStatus.ERROR,
      };
      useCase.execute.mockResolvedValue(errorHealthData);

      // Act
      const result = await controller.getHealthStatus();

      // Assert
      expect(result.data.status).toBe(HealthStatus.ERROR);
      expect(result.success).toBe(true); // Controller always returns success: true
    });

    it('should always return success: true regardless of health status', async () => {
      // Arrange
      const warningHealthData = {
        ...mockHealthData,
        status: HealthStatus.WARNING,
      };
      useCase.execute.mockResolvedValue(warningHealthData);

      // Act
      const result = await controller.getHealthStatus();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.status).toBe(HealthStatus.WARNING);
    });
  });

  describe('ping', () => {
    it('should return pong message with timestamp', () => {
      // Arrange
      const mockDate = new Date('2024-01-01T00:00:00.000Z');
      jest
        .spyOn(global, 'Date')
        .mockImplementation(() => mockDate as unknown as Date);

      // Act
      const result = controller.ping();

      // Assert
      expect(result).toEqual({
        message: 'pong',
        timestamp: '2024-01-01T00:00:00.000Z',
      });
    });

    it('should return correct response structure', () => {
      // Act
      const result = controller.ping();

      // Assert
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('timestamp');
      expect(result.message).toBe('pong');
      expect(typeof result.timestamp).toBe('string');
      expect(() => new Date(result.timestamp)).not.toThrow();
    });

    it('should return current timestamp', () => {
      // Arrange
      const now = new Date();
      jest
        .spyOn(global, 'Date')
        .mockImplementation(() => now as unknown as Date);

      // Act
      const result = controller.ping();

      // Assert
      expect(result.timestamp).toBe(now.toISOString());
    });

    it('should not call use case', () => {
      // Arrange
      const executeSpy = jest.spyOn(useCase, 'execute');

      // Act
      controller.ping();

      // Assert
      expect(executeSpy).not.toHaveBeenCalled();
    });
  });

  describe('controller metadata', () => {
    it('should have correct route prefix', () => {
      // Assert
      const metadata = Reflect.getMetadata(
        'path',
        HealthCheckController,
      ) as string;
      expect(metadata).toBe('health');
    });

    it('should have getHealthStatus method with GET decorator', () => {
      // Assert
      const getHealthStatusMethod = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(controller),
        'getHealthStatus',
      )?.value as () => Promise<unknown>;
      const getHealthStatusMetadata = Reflect.getMetadata(
        'path',
        getHealthStatusMethod,
      ) as string;
      expect(getHealthStatusMetadata).toBe('/');
    });

    it('should have ping method with GET decorator', () => {
      // Assert
      const pingMethod = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(controller),
        'ping',
      )?.value as () => unknown;
      const pingMetadata = Reflect.getMetadata('path', pingMethod) as string;
      expect(pingMetadata).toBe('ping');
    });
  });

  describe('error scenarios', () => {
    it('should propagate use case exceptions', async () => {
      // Arrange
      const customError = new Error('Custom health check error');
      useCase.execute.mockRejectedValue(customError);

      // Act & Assert
      await expect(controller.getHealthStatus()).rejects.toThrow(
        'Custom health check error',
      );
    });

    it('should handle use case returning null', async () => {
      // Arrange
      useCase.execute.mockResolvedValue(null as unknown as HealthCheckDto);

      // Act
      const result = await controller.getHealthStatus();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
  });
});
