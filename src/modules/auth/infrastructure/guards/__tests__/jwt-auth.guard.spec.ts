import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);

    // Mock ExecutionContext
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: { authorization: 'Bearer valid-token' },
          user: { id: 1, username: 'testuser' },
        }),
        getResponse: jest.fn().mockReturnValue({}),
        getNext: jest.fn().mockReturnValue({}),
      }),
      getClass: jest.fn().mockReturnValue(class TestController {}),
      getHandler: jest.fn().mockReturnValue(jest.fn()),
      getType: jest.fn().mockReturnValue('http'),
      getArgs: jest.fn().mockReturnValue([]),
      getArgByIndex: jest.fn().mockReturnValue({}),
      switchToRpc: jest.fn().mockReturnValue({
        getData: jest.fn().mockReturnValue({}),
        getContext: jest.fn().mockReturnValue({}),
      }),
      switchToWs: jest.fn().mockReturnValue({
        getClient: jest.fn().mockReturnValue({}),
        getData: jest.fn().mockReturnValue({}),
        getPattern: jest.fn().mockReturnValue('test'),
      }),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should be an instance of JwtAuthGuard', () => {
      expect(guard).toBeInstanceOf(JwtAuthGuard);
    });

    it('should have canActivate method', () => {
      expect(typeof guard.canActivate).toBe('function');
    });

    it('should accept ExecutionContext as parameter', () => {
      expect(guard.canActivate.length).toBe(1);
    });
  });

  describe('canActivate method', () => {
    it('should call canActivate with execution context', async () => {
      // Arrange
      const spy = jest.spyOn(guard, 'canActivate');

      // Mock the parent canActivate to return true
      jest
        .spyOn(
          Object.getPrototypeOf(Object.getPrototypeOf(guard)),
          'canActivate',
        )
        .mockImplementation(() => Promise.resolve(true));

      // Act
      await guard.canActivate(mockExecutionContext);

      // Assert
      expect(spy).toHaveBeenCalledWith(mockExecutionContext);
    });

    it('should return boolean or Promise<boolean>', async () => {
      // Arrange
      jest
        .spyOn(
          Object.getPrototypeOf(Object.getPrototypeOf(guard)),
          'canActivate',
        )
        .mockImplementation(() => Promise.resolve(true));

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(typeof result).toBe('boolean');
    });

    it('should handle successful authentication', async () => {
      // Arrange
      jest
        .spyOn(
          Object.getPrototypeOf(Object.getPrototypeOf(guard)),
          'canActivate',
        )
        .mockImplementation(() => Promise.resolve(true));

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should handle failed authentication', async () => {
      // Arrange
      jest
        .spyOn(
          Object.getPrototypeOf(Object.getPrototypeOf(guard)),
          'canActivate',
        )
        .mockImplementation(() => Promise.resolve(false));

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle UnauthorizedException', async () => {
      // Arrange
      const unauthorizedError = new UnauthorizedException('Invalid token');
      jest
        .spyOn(
          Object.getPrototypeOf(Object.getPrototypeOf(guard)),
          'canActivate',
        )
        .mockImplementation(() => Promise.reject(unauthorizedError));

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Invalid token',
      );
    });

    it('should handle generic authentication errors', async () => {
      // Arrange
      const genericError = new Error('Authentication failed');
      jest
        .spyOn(
          Object.getPrototypeOf(Object.getPrototypeOf(guard)),
          'canActivate',
        )
        .mockImplementation(() => Promise.reject(genericError));

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Authentication failed',
      );
    });
  });

  describe('execution context handling', () => {
    it('should work with HTTP execution context', async () => {
      // Arrange
      jest
        .spyOn(
          Object.getPrototypeOf(Object.getPrototypeOf(guard)),
          'canActivate',
        )
        .mockImplementation(() => Promise.resolve(true));

      mockExecutionContext.getType.mockReturnValue('http');
      mockExecutionContext.switchToHttp.mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: { authorization: 'Bearer token' },
          user: { id: 1 },
        }),
        getResponse: jest.fn().mockReturnValue({}),
        getNext: jest.fn().mockReturnValue({}),
      });

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should work with WebSocket execution context', async () => {
      // Arrange
      jest
        .spyOn(
          Object.getPrototypeOf(Object.getPrototypeOf(guard)),
          'canActivate',
        )
        .mockImplementation(() => Promise.resolve(true));

      mockExecutionContext.getType.mockReturnValue('ws');
      mockExecutionContext.switchToWs.mockReturnValue({
        getClient: jest.fn().mockReturnValue({
          handshake: { headers: { authorization: 'Bearer token' } },
        }),
        getData: jest.fn().mockReturnValue({}),
        getPattern: jest.fn().mockReturnValue('test'),
      });

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should work with RPC execution context', async () => {
      // Arrange
      jest
        .spyOn(
          Object.getPrototypeOf(Object.getPrototypeOf(guard)),
          'canActivate',
        )
        .mockImplementation(() => Promise.resolve(true));

      mockExecutionContext.getType.mockReturnValue('rpc');
      mockExecutionContext.switchToRpc.mockReturnValue({
        getData: jest.fn().mockReturnValue({ token: 'test-token' }),
        getContext: jest.fn().mockReturnValue({ user: { id: 1 } }),
      });

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('multiple calls and edge cases', () => {
    it('should handle multiple consecutive calls', async () => {
      // Arrange
      const mockSuperCanActivate = jest.spyOn(
        Object.getPrototypeOf(Object.getPrototypeOf(guard)),
        'canActivate',
      );
      mockSuperCanActivate
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      // Act
      const result1 = await guard.canActivate(mockExecutionContext);
      const result2 = await guard.canActivate(mockExecutionContext);
      const result3 = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result1).toBe(true);
      expect(result2).toBe(false);
      expect(result3).toBe(true);
      expect(mockSuperCanActivate).toHaveBeenCalledTimes(3);
    });

    it('should handle different request types consistently', async () => {
      // Arrange
      jest
        .spyOn(
          Object.getPrototypeOf(Object.getPrototypeOf(guard)),
          'canActivate',
        )
        .mockImplementation(() => Promise.resolve(true));

      // Act & Assert for HTTP
      mockExecutionContext.getType.mockReturnValue('http');
      expect(await guard.canActivate(mockExecutionContext)).toBe(true);

      // Act & Assert for WebSocket
      mockExecutionContext.getType.mockReturnValue('ws');
      expect(await guard.canActivate(mockExecutionContext)).toBe(true);

      // Act & Assert for RPC
      mockExecutionContext.getType.mockReturnValue('rpc');
      expect(await guard.canActivate(mockExecutionContext)).toBe(true);
    });

    it('should handle authentication state changes', async () => {
      // Arrange
      const mockSuperCanActivate = jest.spyOn(
        Object.getPrototypeOf(Object.getPrototypeOf(guard)),
        'canActivate',
      );

      // First call succeeds
      mockSuperCanActivate.mockResolvedValueOnce(true);
      expect(await guard.canActivate(mockExecutionContext)).toBe(true);

      // Second call fails
      mockSuperCanActivate.mockRejectedValueOnce(
        new UnauthorizedException('Token expired'),
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Token expired',
      );

      // Third call succeeds again
      mockSuperCanActivate.mockResolvedValueOnce(true);
      expect(await guard.canActivate(mockExecutionContext)).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should propagate UnauthorizedException with custom message', async () => {
      // Arrange
      const customError = new UnauthorizedException('Custom auth error');
      jest
        .spyOn(
          Object.getPrototypeOf(Object.getPrototypeOf(guard)),
          'canActivate',
        )
        .mockImplementation(() => Promise.reject(customError));

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Custom auth error',
      );
    });

    it('should handle unexpected errors gracefully', async () => {
      // Arrange
      const unexpectedError = new Error('Unexpected error');
      jest
        .spyOn(
          Object.getPrototypeOf(Object.getPrototypeOf(guard)),
          'canActivate',
        )
        .mockImplementation(() => Promise.reject(unexpectedError));

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Unexpected error',
      );
    });

    it('should handle network or timeout errors', async () => {
      // Arrange
      const networkError = new Error('Network timeout');
      jest
        .spyOn(
          Object.getPrototypeOf(Object.getPrototypeOf(guard)),
          'canActivate',
        )
        .mockImplementation(() => Promise.reject(networkError));

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Network timeout',
      );
    });
  });

  describe('integration scenarios', () => {
    it('should work in a typical authentication flow', async () => {
      // Arrange
      jest
        .spyOn(
          Object.getPrototypeOf(Object.getPrototypeOf(guard)),
          'canActivate',
        )
        .mockImplementation(() => Promise.resolve(true));

      const httpContext = {
        ...mockExecutionContext,
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: { authorization: 'Bearer valid-jwt-token' },
            user: { id: 123, username: 'testuser', roles: ['user'] },
          }),
          getResponse: jest.fn().mockReturnValue({}),
          getNext: jest.fn().mockReturnValue({}),
        }),
      };

      // Act
      const result = await guard.canActivate(httpContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should work with different authentication scenarios', async () => {
      // Arrange
      const mockSuperCanActivate = jest.spyOn(
        Object.getPrototypeOf(Object.getPrototypeOf(guard)),
        'canActivate',
      );

      // Test valid token
      mockSuperCanActivate.mockResolvedValueOnce(true);
      expect(await guard.canActivate(mockExecutionContext)).toBe(true);

      // Test invalid token
      mockSuperCanActivate.mockRejectedValueOnce(
        new UnauthorizedException('Invalid token'),
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Invalid token',
      );

      // Test expired token
      mockSuperCanActivate.mockRejectedValueOnce(
        new UnauthorizedException('Token expired'),
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Token expired',
      );
    });
  });
});
