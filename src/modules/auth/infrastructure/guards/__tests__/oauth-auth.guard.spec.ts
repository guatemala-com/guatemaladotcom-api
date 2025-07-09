/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OAuthAuthGuard } from '../oauth-auth.guard';
import {
  OAUTH_AUTH_KEY,
  OAUTH_SCOPE_KEY,
} from '../../decorators/oauth-scopes.decorator';
import { TokenPayload } from '../../../domain/entities/token.entity';

describe('OAuthAuthGuard', () => {
  let guard: OAuthAuthGuard;
  let reflector: jest.Mocked<Reflector>;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;

  const mockTokenPayload: TokenPayload = {
    sub: 'test-client-id',
    aud: 'guatemala-api',
    iss: 'guatemala.com',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    scope: 'read write',
  };

  beforeEach(async () => {
    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthAuthGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<OAuthAuthGuard>(OAuthAuthGuard);
    reflector = module.get(Reflector);

    // Mock ExecutionContext
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: { authorization: 'Bearer test-token' },
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

  describe('initialization', () => {
    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should be an instance of OAuthAuthGuard', () => {
      expect(guard).toBeInstanceOf(OAuthAuthGuard);
    });

    it('should have reflector injected', () => {
      expect(reflector).toBeDefined();
    });
  });

  describe('canActivate', () => {
    it('should return true when OAuth authentication is not required', () => {
      // Arrange
      reflector.getAllAndOverride.mockReturnValue(false);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(OAUTH_AUTH_KEY, [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
    });

    it('should return true when OAuth metadata is undefined', () => {
      // Arrange
      reflector.getAllAndOverride.mockReturnValue(undefined);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should call super.canActivate when OAuth authentication is required', () => {
      // Arrange
      reflector.getAllAndOverride.mockReturnValue(true);
      const superCanActivateSpy = jest
        .spyOn(
          Object.getPrototypeOf(Object.getPrototypeOf(guard)),
          'canActivate',
        )
        .mockReturnValue(true);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(superCanActivateSpy).toHaveBeenCalledWith(mockExecutionContext);
    });

    it('should return Promise<boolean> when super.canActivate returns Promise', async () => {
      // Arrange
      reflector.getAllAndOverride.mockReturnValue(true);
      const superCanActivateSpy = jest
        .spyOn(
          Object.getPrototypeOf(Object.getPrototypeOf(guard)),
          'canActivate',
        )
        .mockReturnValue(Promise.resolve(true));

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(superCanActivateSpy).toHaveBeenCalledWith(mockExecutionContext);
    });

    it('should handle when super.canActivate returns false', () => {
      // Arrange
      reflector.getAllAndOverride.mockReturnValue(true);
      const superCanActivateSpy = jest
        .spyOn(
          Object.getPrototypeOf(Object.getPrototypeOf(guard)),
          'canActivate',
        )
        .mockReturnValue(false);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(false);
      expect(superCanActivateSpy).toHaveBeenCalledWith(mockExecutionContext);
    });
  });

  describe('handleRequest', () => {
    it('should throw error when err parameter is provided', () => {
      // Arrange
      const error = new Error('Test error');

      // Act & Assert
      expect(() =>
        guard.handleRequest(error, mockTokenPayload, {}, mockExecutionContext),
      ).toThrow(error);
    });

    it('should throw UnauthorizedException when user is null', () => {
      // Act & Assert
      expect(() =>
        guard.handleRequest(
          null,
          null as unknown as TokenPayload,
          {},
          mockExecutionContext,
        ),
      ).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is undefined', () => {
      // Act & Assert
      expect(() =>
        guard.handleRequest(
          null,
          undefined as unknown as TokenPayload,
          {},
          mockExecutionContext,
        ),
      ).toThrow(UnauthorizedException);
    });

    it('should return user when no scopes are required', () => {
      // Arrange
      reflector.getAllAndOverride.mockReturnValue(undefined);

      // Act
      const result = guard.handleRequest(
        null,
        mockTokenPayload,
        {},
        mockExecutionContext,
      );

      // Assert
      expect(result).toBe(mockTokenPayload);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        OAUTH_SCOPE_KEY,
        [mockExecutionContext.getHandler(), mockExecutionContext.getClass()],
      );
    });

    it('should return user when required scope is present', () => {
      // Arrange
      reflector.getAllAndOverride.mockReturnValue('read');

      // Act
      const result = guard.handleRequest(
        null,
        mockTokenPayload,
        {},
        mockExecutionContext,
      );

      // Assert
      expect(result).toBe(mockTokenPayload);
    });

    it('should throw UnauthorizedException when required scope is not present', () => {
      // Arrange
      reflector.getAllAndOverride.mockReturnValue('admin');

      // Act & Assert
      expect(() =>
        guard.handleRequest(null, mockTokenPayload, {}, mockExecutionContext),
      ).toThrow(UnauthorizedException);
      expect(() =>
        guard.handleRequest(null, mockTokenPayload, {}, mockExecutionContext),
      ).toThrow('Insufficient scope');
    });

    it('should throw UnauthorizedException when user has no scope property', () => {
      // Arrange
      const userWithoutScope: TokenPayload = {
        ...mockTokenPayload,
        scope: undefined,
      };
      reflector.getAllAndOverride.mockReturnValue('read');

      // Act & Assert
      expect(() =>
        guard.handleRequest(null, userWithoutScope, {}, mockExecutionContext),
      ).toThrow(UnauthorizedException);
      expect(() =>
        guard.handleRequest(null, userWithoutScope, {}, mockExecutionContext),
      ).toThrow('Insufficient scope');
    });

    it('should throw UnauthorizedException when user has empty scope', () => {
      // Arrange
      const userWithEmptyScope: TokenPayload = {
        ...mockTokenPayload,
        scope: '',
      };
      reflector.getAllAndOverride.mockReturnValue('read');

      // Act & Assert
      expect(() =>
        guard.handleRequest(null, userWithEmptyScope, {}, mockExecutionContext),
      ).toThrow(UnauthorizedException);
    });

    it('should work with multiple scopes', () => {
      // Arrange
      reflector.getAllAndOverride.mockReturnValue('write');

      // Act
      const result = guard.handleRequest(
        null,
        mockTokenPayload,
        {},
        mockExecutionContext,
      );

      // Assert
      expect(result).toBe(mockTokenPayload);
    });

    it('should handle partial scope matches correctly', () => {
      // Arrange
      const userWithReadScope: TokenPayload = {
        ...mockTokenPayload,
        scope: 'read',
      };
      reflector.getAllAndOverride.mockReturnValue('read');

      // Act
      const result = guard.handleRequest(
        null,
        userWithReadScope,
        {},
        mockExecutionContext,
      );

      // Assert
      expect(result).toBe(userWithReadScope);
    });

    it('should handle scope validation case-sensitively', () => {
      // Arrange
      const userWithReadScope: TokenPayload = {
        ...mockTokenPayload,
        scope: 'Read',
      };
      reflector.getAllAndOverride.mockReturnValue('read');

      // Act & Assert
      expect(() =>
        guard.handleRequest(null, userWithReadScope, {}, mockExecutionContext),
      ).toThrow(UnauthorizedException);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete OAuth flow with valid token and scope', () => {
      // Arrange
      reflector.getAllAndOverride.mockReturnValue('read'); // Required scope

      // Act
      const result = guard.handleRequest(
        null,
        mockTokenPayload,
        {},
        mockExecutionContext,
      );

      // Assert
      expect(result).toBe(mockTokenPayload);
    });

    it('should handle OAuth flow with invalid scope', () => {
      // Arrange
      reflector.getAllAndOverride.mockReturnValue('admin'); // Required scope

      // Act & Assert
      expect(() =>
        guard.handleRequest(null, mockTokenPayload, {}, mockExecutionContext),
      ).toThrow(UnauthorizedException);
    });

    it('should handle different execution contexts', () => {
      // Arrange
      const wsContext = {
        ...mockExecutionContext,
        getType: jest.fn().mockReturnValue('ws'),
      };
      reflector.getAllAndOverride.mockReturnValue('read');

      // Act
      const result = guard.handleRequest(null, mockTokenPayload, {}, wsContext);

      // Assert
      expect(result).toBe(mockTokenPayload);
    });

    it('should handle multiple reflector calls correctly', () => {
      // Arrange
      reflector.getAllAndOverride.mockReturnValue('read');

      // Act
      const result1 = guard.handleRequest(
        null,
        mockTokenPayload,
        {},
        mockExecutionContext,
      );
      const result2 = guard.handleRequest(
        null,
        mockTokenPayload,
        {},
        mockExecutionContext,
      );

      // Assert
      expect(result1).toBe(mockTokenPayload);
      expect(result2).toBe(mockTokenPayload);
      expect(reflector.getAllAndOverride).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling edge cases', () => {
    it('should prioritize original error over UnauthorizedException', () => {
      // Arrange
      const originalError = new Error('Original error');

      // Act & Assert
      expect(() =>
        guard.handleRequest(
          originalError,
          null as unknown as TokenPayload,
          {},
          mockExecutionContext,
        ),
      ).toThrow(originalError);
    });

    it('should handle when reflector throws error', () => {
      // Arrange
      reflector.getAllAndOverride.mockImplementation(() => {
        throw new Error('Reflector error');
      });

      // Act & Assert
      expect(() =>
        guard.handleRequest(null, mockTokenPayload, {}, mockExecutionContext),
      ).toThrow('Reflector error');
    });

    it('should handle malformed execution context', () => {
      // Arrange
      const malformedContext = {
        ...mockExecutionContext,
        getHandler: jest.fn().mockReturnValue(null),
        getClass: jest.fn().mockReturnValue(null),
      };
      reflector.getAllAndOverride.mockReturnValue('read');

      // Act
      const result = guard.handleRequest(
        null,
        mockTokenPayload,
        {},
        malformedContext,
      );

      // Assert
      expect(result).toBe(mockTokenPayload);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        OAUTH_SCOPE_KEY,
        [null, null],
      );
    });
  });
});
