// Mock RefreshToken.create static method
jest.mock('../../../domain/entities/refresh-token.entity', () => ({
  RefreshToken: {
    create: jest.fn(() => ({
      _tokenId: 'new-token-id',
      _clientId: 'test-client-id',
      _refreshToken: 'new-refresh-token',
      _expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      _createdAt: new Date(),
      _isRevoked: false,
      _scope: 'read write',
      refreshToken: 'new-refresh-token',
    })),
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  RefreshTokenUseCase,
  RefreshTokenRequest,
} from '../refresh-token.use-case';
import { RefreshTokenRepositoryImpl } from '../../../infrastructure/repositories/refresh-token.repository';
import { TokenRepositoryImpl } from '../../../infrastructure/repositories/token.repository';
import { mockToken } from '../../../__mocks__/entities.mocks';
import { mockTokenRepository } from '../../../__mocks__/repositories.mocks';

// Mock refresh token repository
const mockRefreshTokenRepository = {
  save: jest.fn(),
  findByToken: jest.fn(),
  findByClientId: jest.fn(),
  revoke: jest.fn(),
  revokeAllForClient: jest.fn(),
  deleteExpired: jest.fn(),
  deleteByToken: jest.fn(),
  countActiveForClient: jest.fn(),
  getAllTokens: jest.fn(),
  clearAll: jest.fn(),
};

// Mock config service
const mockConfigService = {
  get: jest.fn(),
};

// Mock refresh token entity
const mockRefreshTokenEntity = {
  tokenId: 'test-token-id',
  clientId: 'test-client-id',
  refreshToken: 'test-refresh-token',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  createdAt: new Date(),
  isRevoked: false,
  scope: 'read write',
  isValid: jest.fn().mockReturnValue(true),
  isExpired: jest.fn().mockReturnValue(false),
};

const mockExpiredRefreshToken = {
  ...mockRefreshTokenEntity,
  isValid: jest.fn().mockReturnValue(false),
  isExpired: jest.fn().mockReturnValue(true),
};

const mockRevokedRefreshToken = {
  ...mockRefreshTokenEntity,
  isRevoked: true,
  isValid: jest.fn().mockReturnValue(false),
  isExpired: jest.fn().mockReturnValue(false),
};

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;

  beforeEach(async () => {
    // Reset mocks before each test
    jest.clearAllMocks();
    mockRefreshTokenRepository.findByToken.mockReset();
    mockRefreshTokenRepository.deleteByToken.mockReset();
    mockRefreshTokenRepository.save.mockReset();
    mockTokenRepository.generateToken.mockReset();
    mockConfigService.get.mockReset();

    // Set default config values
    mockConfigService.get.mockImplementation(
      (key: string, defaultValue: boolean | number) => {
        switch (key) {
          case 'REFRESH_TOKEN_ROTATION':
            return true;
          case 'REFRESH_TOKEN_EXPIRES_IN':
            return 7 * 24 * 60 * 60; // 7 days
          default:
            return defaultValue;
        }
      },
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
        {
          provide: RefreshTokenRepositoryImpl,
          useValue: mockRefreshTokenRepository,
        },
        {
          provide: TokenRepositoryImpl,
          useValue: mockTokenRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    useCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
  });

  describe('execute', () => {
    const validRequest: RefreshTokenRequest = {
      refreshToken: 'test-refresh-token',
      scope: 'read',
    };

    it('should refresh token successfully with rotation enabled', async () => {
      // Arrange
      mockRefreshTokenRepository.findByToken.mockResolvedValue(
        mockRefreshTokenEntity,
      );
      mockTokenRepository.generateToken.mockResolvedValue(mockToken);
      mockConfigService.get.mockImplementation(
        (key: string, defaultValue: boolean | number) => {
          switch (key) {
            case 'REFRESH_TOKEN_ROTATION':
              return true;
            case 'REFRESH_TOKEN_EXPIRES_IN':
              return 7 * 24 * 60 * 60;
            default:
              return defaultValue;
          }
        },
      );

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(mockRefreshTokenRepository.findByToken).toHaveBeenCalledWith(
        'test-refresh-token',
      );
      expect(mockTokenRepository.generateToken).toHaveBeenCalledWith(
        'test-client-id',
        'read',
      );
      expect(mockRefreshTokenRepository.deleteByToken).toHaveBeenCalledWith(
        'test-refresh-token',
      );
      expect(mockRefreshTokenRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: 'mock-access-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        refreshToken: 'new-refresh-token',
        scope: 'read',
      });
    });

    it('should refresh token successfully with rotation disabled', async () => {
      // Arrange
      mockRefreshTokenRepository.findByToken.mockResolvedValue(
        mockRefreshTokenEntity,
      );
      mockTokenRepository.generateToken.mockResolvedValue(mockToken);
      mockConfigService.get.mockImplementation(
        (key: string, defaultValue: boolean | number) => {
          switch (key) {
            case 'REFRESH_TOKEN_ROTATION':
              return false;
            default:
              return defaultValue;
          }
        },
      );

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(mockRefreshTokenRepository.findByToken).toHaveBeenCalledWith(
        'test-refresh-token',
      );
      expect(mockTokenRepository.generateToken).toHaveBeenCalledWith(
        'test-client-id',
        'read',
      );
      expect(mockRefreshTokenRepository.deleteByToken).not.toHaveBeenCalled();
      expect(mockRefreshTokenRepository.save).not.toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: 'mock-access-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        refreshToken: undefined,
        scope: 'read',
      });
    });

    it('should refresh token successfully without specific scope', async () => {
      // Arrange
      const requestWithoutScope = { refreshToken: 'test-refresh-token' };
      mockRefreshTokenRepository.findByToken.mockResolvedValue(
        mockRefreshTokenEntity,
      );
      mockTokenRepository.generateToken.mockResolvedValue(mockToken);

      // Act
      const result = await useCase.execute(requestWithoutScope);

      // Assert
      expect(mockRefreshTokenRepository.findByToken).toHaveBeenCalledWith(
        'test-refresh-token',
      );
      expect(mockTokenRepository.generateToken).toHaveBeenCalledWith(
        'test-client-id',
        'read write',
      );
      expect(result).toEqual({
        accessToken: 'mock-access-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        refreshToken: 'new-refresh-token',
        scope: 'read write',
      });
    });

    it('should throw UnauthorizedException when refresh token is not found', async () => {
      // Arrange
      mockRefreshTokenRepository.findByToken.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new UnauthorizedException('Invalid refresh token'),
      );
      expect(mockRefreshTokenRepository.findByToken).toHaveBeenCalledWith(
        'test-refresh-token',
      );
      expect(mockTokenRepository.generateToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when refresh token has expired', async () => {
      // Arrange
      mockRefreshTokenRepository.findByToken.mockResolvedValue(
        mockExpiredRefreshToken,
      );

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new UnauthorizedException('Refresh token has expired'),
      );
      expect(mockRefreshTokenRepository.findByToken).toHaveBeenCalledWith(
        'test-refresh-token',
      );
      expect(mockRefreshTokenRepository.deleteByToken).toHaveBeenCalledWith(
        'test-refresh-token',
      );
      expect(mockTokenRepository.generateToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when refresh token is revoked', async () => {
      // Arrange
      mockRefreshTokenRepository.findByToken.mockResolvedValue(
        mockRevokedRefreshToken,
      );

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new UnauthorizedException('Refresh token has been revoked'),
      );
      expect(mockRefreshTokenRepository.findByToken).toHaveBeenCalledWith(
        'test-refresh-token',
      );
      expect(mockTokenRepository.generateToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      // Arrange
      const invalidRefreshToken = {
        ...mockRefreshTokenEntity,
        isValid: jest.fn().mockReturnValue(false),
        isExpired: jest.fn().mockReturnValue(false),
        isRevoked: false,
      };
      mockRefreshTokenRepository.findByToken.mockResolvedValue(
        invalidRefreshToken,
      );

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new UnauthorizedException('Invalid refresh token'),
      );
      expect(mockRefreshTokenRepository.findByToken).toHaveBeenCalledWith(
        'test-refresh-token',
      );
      expect(mockTokenRepository.generateToken).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when requested scope exceeds refresh token scope', async () => {
      // Arrange
      const requestWithInvalidScope = {
        refreshToken: 'test-refresh-token',
        scope: 'admin',
      };
      mockRefreshTokenRepository.findByToken.mockResolvedValue(
        mockRefreshTokenEntity,
      );

      // Act & Assert
      await expect(useCase.execute(requestWithInvalidScope)).rejects.toThrow(
        new BadRequestException('Requested scope exceeds refresh token scope'),
      );
      expect(mockRefreshTokenRepository.findByToken).toHaveBeenCalledWith(
        'test-refresh-token',
      );
      expect(mockTokenRepository.generateToken).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when refresh token has no scope but scope is requested', async () => {
      // Arrange
      const refreshTokenWithoutScope = {
        ...mockRefreshTokenEntity,
        scope: undefined,
      };
      mockRefreshTokenRepository.findByToken.mockResolvedValue(
        refreshTokenWithoutScope,
      );

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new BadRequestException('Requested scope exceeds refresh token scope'),
      );
      expect(mockRefreshTokenRepository.findByToken).toHaveBeenCalledWith(
        'test-refresh-token',
      );
      expect(mockTokenRepository.generateToken).not.toHaveBeenCalled();
    });

    it('should validate scope correctly for multiple scopes', async () => {
      // Arrange
      const requestWithMultipleScopes = {
        refreshToken: 'test-refresh-token',
        scope: 'read write',
      };
      mockRefreshTokenRepository.findByToken.mockResolvedValue(
        mockRefreshTokenEntity,
      );
      mockTokenRepository.generateToken.mockResolvedValue(mockToken);

      // Act
      const result = await useCase.execute(requestWithMultipleScopes);

      // Assert
      expect(mockRefreshTokenRepository.findByToken).toHaveBeenCalledWith(
        'test-refresh-token',
      );
      expect(mockTokenRepository.generateToken).toHaveBeenCalledWith(
        'test-client-id',
        'read write',
      );
      expect(result).toEqual({
        accessToken: 'mock-access-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        refreshToken: 'new-refresh-token',
        scope: 'read write',
      });
    });

    it('should handle token repository errors', async () => {
      // Arrange
      mockRefreshTokenRepository.findByToken.mockResolvedValue(
        mockRefreshTokenEntity,
      );
      mockTokenRepository.generateToken.mockRejectedValue(
        new Error('Token generation failed'),
      );

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        'Token generation failed',
      );
      expect(mockRefreshTokenRepository.findByToken).toHaveBeenCalledWith(
        'test-refresh-token',
      );
      expect(mockTokenRepository.generateToken).toHaveBeenCalledWith(
        'test-client-id',
        'read',
      );
    });
  });
});
