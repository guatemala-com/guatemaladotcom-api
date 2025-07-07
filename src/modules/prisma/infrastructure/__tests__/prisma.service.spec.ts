import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('service instantiation', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should implement OnModuleInit interface', () => {
      expect(service).toHaveProperty('onModuleInit');
      expect(typeof service.onModuleInit).toBe('function');
    });

    it('should implement OnModuleDestroy interface', () => {
      expect(service).toHaveProperty('onModuleDestroy');
      expect(typeof service.onModuleDestroy).toBe('function');
    });

    it('should have logger instance', () => {
      expect(service['logger']).toBeInstanceOf(Logger);
      expect(service['logger']['context']).toBe('PrismaService');
    });

    it('should have PrismaClient methods', () => {
      expect(service).toHaveProperty('$connect');
      expect(service).toHaveProperty('$disconnect');
      expect(typeof service.$connect).toBe('function');
      expect(typeof service.$disconnect).toBe('function');
    });
  });

  describe('onModuleInit', () => {
    it('should call $connect and log initialization', async () => {
      // Arrange
      const connectSpy = jest
        .spyOn(service, '$connect')
        .mockResolvedValue(undefined);
      const logSpy = jest.spyOn(service['logger'], 'log').mockImplementation();

      // Act
      await service.onModuleInit();

      // Assert
      expect(connectSpy).toHaveBeenCalledTimes(1);
      expect(connectSpy).toHaveBeenCalledWith();
      expect(logSpy).toHaveBeenCalledWith('Prisma service initialized');
    });

    it('should handle connection errors', async () => {
      // Arrange
      const connectionError: Error = new Error('Failed to connect to database');
      const connectSpy = jest
        .spyOn(service, '$connect')
        .mockRejectedValue(connectionError);

      // Act & Assert
      await expect(service.onModuleInit()).rejects.toThrow(
        'Failed to connect to database',
      );
      expect(connectSpy).toHaveBeenCalledTimes(1);
    });

    it('should log initialization message after successful connection', async () => {
      // Arrange
      jest.spyOn(service, '$connect').mockResolvedValue(undefined);
      const logSpy = jest.spyOn(service['logger'], 'log').mockImplementation();

      // Act
      await service.onModuleInit();

      // Assert
      expect(logSpy).toHaveBeenCalledWith('Prisma service initialized');
    });
  });

  describe('onModuleDestroy', () => {
    it('should call $disconnect', async () => {
      // Arrange
      const disconnectSpy = jest
        .spyOn(service, '$disconnect')
        .mockResolvedValue(undefined);

      // Act
      await service.onModuleDestroy();

      // Assert
      expect(disconnectSpy).toHaveBeenCalledTimes(1);
      expect(disconnectSpy).toHaveBeenCalledWith();
    });

    it('should handle disconnection errors', async () => {
      // Arrange
      const disconnectionError: Error = new Error(
        'Failed to disconnect from database',
      );
      const disconnectSpy = jest
        .spyOn(service, '$disconnect')
        .mockRejectedValue(disconnectionError);

      // Act & Assert
      await expect(service.onModuleDestroy()).rejects.toThrow(
        'Failed to disconnect from database',
      );
      expect(disconnectSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('lifecycle methods execution order', () => {
    it('should execute onModuleInit before onModuleDestroy', async () => {
      // Arrange
      const executionOrder: string[] = [];
      const connectSpy = jest
        .spyOn(service, '$connect')
        .mockImplementation(() => {
          executionOrder.push('connect');
          return Promise.resolve();
        });
      const disconnectSpy = jest
        .spyOn(service, '$disconnect')
        .mockImplementation(() => {
          executionOrder.push('disconnect');
          return Promise.resolve();
        });

      // Act
      await service.onModuleInit();
      await service.onModuleDestroy();

      // Assert
      expect(executionOrder).toEqual(['connect', 'disconnect']);
      expect(connectSpy).toHaveBeenCalledTimes(1);
      expect(disconnectSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('logger functionality', () => {
    it('should use correct logger context', () => {
      // Assert
      expect(service['logger']['context']).toBe('PrismaService');
    });

    it('should log with correct message format', async () => {
      // Arrange
      jest.spyOn(service, '$connect').mockResolvedValue(undefined);
      const logSpy = jest.spyOn(service['logger'], 'log').mockImplementation();

      // Act
      await service.onModuleInit();

      // Assert
      expect(logSpy).toHaveBeenCalledWith('Prisma service initialized');
    });
  });
});
