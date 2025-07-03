import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../app.module';

// Mock NestJS modules
jest.mock('@nestjs/core');
jest.mock('@nestjs/config');

describe('main.ts', () => {
  let mockApp: {
    get: jest.Mock;
    setGlobalPrefix: jest.Mock;
    listen: jest.Mock;
  };
  let mockConfigService: {
    get: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the app instance
    mockApp = {
      get: jest.fn(),
      setGlobalPrefix: jest.fn(),
      listen: jest.fn(),
    };

    // Mock ConfigService
    mockConfigService = {
      get: jest.fn(),
    };

    // Mock NestFactory.create
    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('bootstrap function', () => {
    it('should create app with AppModule', async () => {
      // Arrange
      mockApp.get.mockReturnValue(mockConfigService);
      mockConfigService.get.mockReturnValue(3001);

      // Act
      // Import and execute the bootstrap function
      const mainModule = await import('../main');
      await mainModule.bootstrap();

      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
    });

    it('should get ConfigService from app', async () => {
      // Arrange
      mockApp.get.mockReturnValue(mockConfigService);
      mockConfigService.get.mockReturnValue(3001);

      // Act
      const mainModule = await import('../main');
      await mainModule.bootstrap();

      // Assert
      expect(mockApp.get).toHaveBeenCalledWith(ConfigService);
    });

    it('should set global prefix to api', async () => {
      // Arrange
      mockApp.get.mockReturnValue(mockConfigService);
      mockConfigService.get.mockReturnValue(3001);

      // Act
      const mainModule = await import('../main');
      await mainModule.bootstrap();

      // Assert
      expect(mockApp.setGlobalPrefix).toHaveBeenCalledWith('api');
    });

    it('should use default port 3001 when PORT is not configured', async () => {
      // Arrange
      mockApp.get.mockReturnValue(mockConfigService);
      mockConfigService.get.mockReturnValue(undefined);

      // Act
      const mainModule = await import('../main');
      await mainModule.bootstrap();

      // Assert
      expect(mockConfigService.get).toHaveBeenCalledWith('PORT');
      expect(mockApp.listen).toHaveBeenCalledWith(3001);
    });

    it('should use configured PORT from environment', async () => {
      // Arrange
      const configuredPort = 8080;
      mockApp.get.mockReturnValue(mockConfigService);
      mockConfigService.get.mockReturnValue(configuredPort);

      // Act
      const mainModule = await import('../main');
      await mainModule.bootstrap();

      // Assert
      expect(mockConfigService.get).toHaveBeenCalledWith('PORT');
      expect(mockApp.listen).toHaveBeenCalledWith(configuredPort);
    });

    it('should call app.listen with correct port', async () => {
      // Arrange
      const port = 5000;
      mockApp.get.mockReturnValue(mockConfigService);
      mockConfigService.get.mockReturnValue(port);

      // Act
      const mainModule = await import('../main');
      await mainModule.bootstrap();

      // Assert
      expect(mockApp.listen).toHaveBeenCalledWith(port);
    });

    it('should handle ConfigService.get returning number', async () => {
      // Arrange
      const port = 9000;
      mockApp.get.mockReturnValue(mockConfigService);
      mockConfigService.get.mockReturnValue(port);

      // Act
      const mainModule = await import('../main');
      await mainModule.bootstrap();

      // Assert
      expect(mockConfigService.get).toHaveBeenCalledWith('PORT');
      expect(mockApp.listen).toHaveBeenCalledWith(port);
    });

    it('should handle ConfigService.get returning string', async () => {
      // Arrange
      const portString = '7000';
      mockApp.get.mockReturnValue(mockConfigService);
      mockConfigService.get.mockReturnValue(portString);

      // Act
      const mainModule = await import('../main');
      await mainModule.bootstrap();

      // Assert
      expect(mockConfigService.get).toHaveBeenCalledWith('PORT');
      expect(mockApp.listen).toHaveBeenCalledWith(portString);
    });
  });

  describe('error handling', () => {
    it('should propagate NestFactory.create errors', async () => {
      // Arrange
      const error = new Error('Failed to create app');
      (NestFactory.create as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      const mainModule = await import('../main');
      await expect(mainModule.bootstrap()).rejects.toThrow(
        'Failed to create app',
      );
    });

    it('should propagate app.get errors', async () => {
      // Arrange
      const error = new Error('Failed to get ConfigService');
      mockApp.get.mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      const mainModule = await import('../main');
      await expect(mainModule.bootstrap()).rejects.toThrow(
        'Failed to get ConfigService',
      );
    });

    it('should propagate app.listen errors', async () => {
      // Arrange
      const error = new Error('Failed to start server');
      mockApp.get.mockReturnValue(mockConfigService);
      mockConfigService.get.mockReturnValue(3001);
      mockApp.listen.mockRejectedValue(error);

      // Act & Assert
      const mainModule = await import('../main');
      await expect(mainModule.bootstrap()).rejects.toThrow(
        'Failed to start server',
      );
    });
  });

  describe('function execution order', () => {
    it('should execute functions in correct order', async () => {
      // Arrange
      const executionOrder: string[] = [];
      mockApp.get.mockImplementation(() => {
        executionOrder.push('get ConfigService');
        return mockConfigService;
      });
      mockConfigService.get.mockImplementation(() => {
        executionOrder.push('get PORT');
        return 3001;
      });
      mockApp.setGlobalPrefix.mockImplementation(() => {
        executionOrder.push('setGlobalPrefix');
      });
      mockApp.listen.mockImplementation(() => {
        executionOrder.push('listen');
      });

      // Act
      const mainModule = await import('../main');
      await mainModule.bootstrap();

      // Assert
      expect(executionOrder).toEqual([
        'get ConfigService',
        'get PORT',
        'setGlobalPrefix',
        'listen',
      ]);
    });
  });
});
