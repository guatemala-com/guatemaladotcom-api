// Mock RefreshToken.create static method
jest.mock('../../../domain/entities/refresh-token.entity', () => ({
  RefreshToken: {
    create: jest.fn(() => ({
      _tokenId: 'mock-token-id',
      _clientId: 'test-client-id',
      _refreshToken: 'mock-refresh-token',
      _expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      _createdAt: new Date(),
      _isRevoked: false,
      _scope: 'read write',
      refreshToken: 'mock-refresh-token', // Add public property for access
    })),
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GenerateTokenUseCase,
  GenerateTokenRequest,
} from '../generate-token.use-case';
import { ClientRepositoryImpl } from '../../../infrastructure/repositories/client.repository';
import { TokenRepositoryImpl } from '../../../infrastructure/repositories/token.repository';
import { RefreshTokenRepositoryImpl } from '../../../infrastructure/repositories/refresh-token.repository';

import {
  mockClient,
  mockToken,
  mockClientWithLimitedScopes,
  mockClientWithNoScopes,
} from '../../../__mocks__/entities.mocks';
import {
  mockClientRepository,
  mockTokenRepository,
} from '../../../__mocks__/repositories.mocks';

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

describe('GenerateTokenUseCase', () => {
  let useCase: GenerateTokenUseCase;

  beforeEach(async () => {
    // Reset mocks before each test
    jest.clearAllMocks();
    mockClientRepository.findByClientId.mockReset();
    mockTokenRepository.generateToken.mockReset();
    mockRefreshTokenRepository.save.mockReset();
    mockConfigService.get.mockReset();

    // Set default config values
    mockConfigService.get.mockImplementation(
      (key: string, defaultValue: string) => {
        switch (key) {
          case 'REFRESH_TOKEN_ENABLED':
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
        GenerateTokenUseCase,
        {
          provide: ClientRepositoryImpl,
          useValue: mockClientRepository,
        },
        {
          provide: TokenRepositoryImpl,
          useValue: mockTokenRepository,
        },
        {
          provide: RefreshTokenRepositoryImpl,
          useValue: mockRefreshTokenRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    useCase = module.get<GenerateTokenUseCase>(GenerateTokenUseCase);
  });

  describe('execute', () => {
    const validRequest: GenerateTokenRequest = {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      grantType: 'client_credentials',
      scope: 'read write',
    };

    it('should generate token successfully with valid client credentials and scopes', async () => {
      // Arrange
      mockClientRepository.findByClientId.mockResolvedValue(mockClient);
      mockTokenRepository.generateToken.mockResolvedValue(mockToken);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(mockClientRepository.findByClientId).toHaveBeenCalledWith(
        'test-client-id',
      );
      expect(mockTokenRepository.generateToken).toHaveBeenCalledWith(
        'test-client-id',
        'read write',
      );
      expect(result).toEqual({
        accessToken: 'mock-access-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        refreshToken: 'mock-refresh-token',
        scope: 'read write',
      });
      expect(mockRefreshTokenRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          _clientId: 'test-client-id',
          _scope: 'read write',
        }),
      );
    });

    it('should throw BadRequestException for unsupported grant type', async () => {
      // Arrange
      const invalidRequest: GenerateTokenRequest = {
        ...validRequest,
        grantType: 'authorization_code',
      };

      // Act & Assert
      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        BadRequestException,
      );
      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        'Only client_credentials grant type is supported',
      );
      expect(mockClientRepository.findByClientId).not.toHaveBeenCalled();
      expect(mockTokenRepository.generateToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when client is not found', async () => {
      // Arrange
      mockClientRepository.findByClientId.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        'Client not found',
      );
      expect(mockTokenRepository.generateToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when client credentials are invalid', async () => {
      // Arrange
      const invalidCredentialsClient = {
        ...mockClient,
        validateCredentials: jest.fn().mockReturnValue(false),
      };
      mockClientRepository.findByClientId.mockResolvedValue(
        invalidCredentialsClient,
      );

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        'Invalid client credentials',
      );
      expect(mockTokenRepository.generateToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when client certificate is invalid', async () => {
      // Arrange
      const invalidCertificateClient = {
        ...mockClient,
        validateCredentials: jest.fn().mockReturnValue(true),
        validateCertificate: jest.fn().mockReturnValue(false),
      };
      mockClientRepository.findByClientId.mockResolvedValue(
        invalidCertificateClient,
      );

      const requestWithCertificate: GenerateTokenRequest = {
        ...validRequest,
        certificateFingerprint: 'invalid-fingerprint',
      };

      // Act & Assert
      await expect(useCase.execute(requestWithCertificate)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(useCase.execute(requestWithCertificate)).rejects.toThrow(
        'Invalid client certificate',
      );
      expect(mockTokenRepository.generateToken).not.toHaveBeenCalled();
    });

    it('should generate token successfully without scope', async () => {
      // Arrange
      const requestWithoutScope: GenerateTokenRequest = {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        grantType: 'client_credentials',
      };
      mockClientRepository.findByClientId.mockResolvedValue(mockClient);
      mockTokenRepository.generateToken.mockResolvedValue(mockToken);

      // Act
      const result = await useCase.execute(requestWithoutScope);

      // Assert
      expect(mockClientRepository.findByClientId).toHaveBeenCalledWith(
        'test-client-id',
      );
      expect(mockTokenRepository.generateToken).toHaveBeenCalledWith(
        'test-client-id',
        '',
      );
      expect(result).toEqual({
        accessToken: 'mock-access-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        refreshToken: 'mock-refresh-token',
        scope: undefined,
      });
    });

    it('should generate token successfully with empty scope string', async () => {
      // Arrange
      const requestWithEmptyScope: GenerateTokenRequest = {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        grantType: 'client_credentials',
        scope: '',
      };
      mockClientRepository.findByClientId.mockResolvedValue(mockClient);
      mockTokenRepository.generateToken.mockResolvedValue(mockToken);

      // Act
      const result = await useCase.execute(requestWithEmptyScope);

      // Assert
      expect(mockClientRepository.findByClientId).toHaveBeenCalledWith(
        'test-client-id',
      );
      expect(mockTokenRepository.generateToken).toHaveBeenCalledWith(
        'test-client-id',
        '',
      );
      expect(result).toEqual({
        accessToken: 'mock-access-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        refreshToken: 'mock-refresh-token',
        scope: undefined,
      });
    });

    it('should generate token successfully with whitespace-only scope', async () => {
      // Arrange
      const requestWithWhitespaceScope: GenerateTokenRequest = {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        grantType: 'client_credentials',
        scope: '   ',
      };
      mockClientRepository.findByClientId.mockResolvedValue(mockClient);
      mockTokenRepository.generateToken.mockResolvedValue(mockToken);

      // Act
      const result = await useCase.execute(requestWithWhitespaceScope);

      // Assert
      expect(mockClientRepository.findByClientId).toHaveBeenCalledWith(
        'test-client-id',
      );
      expect(mockTokenRepository.generateToken).toHaveBeenCalledWith(
        'test-client-id',
        '',
      );
      expect(result).toEqual({
        accessToken: 'mock-access-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        refreshToken: 'mock-refresh-token',
        scope: undefined,
      });
    });

    it('should throw BadRequestException when client has unauthorized scopes', async () => {
      // Arrange
      mockClientRepository.findByClientId.mockResolvedValue(
        mockClientWithLimitedScopes,
      );

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new BadRequestException(
          'Client is not authorized for scopes: write. Allowed scopes: read',
        ),
      );
      expect(mockClientRepository.findByClientId).toHaveBeenCalledWith(
        'test-client-id',
      );
      expect(mockTokenRepository.generateToken).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when client has no scopes and scope is requested', async () => {
      // Arrange
      mockClientRepository.findByClientId.mockResolvedValue(
        mockClientWithNoScopes,
      );

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new BadRequestException(
          'Client is not authorized for scopes: read, write. Allowed scopes: ',
        ),
      );
      expect(mockClientRepository.findByClientId).toHaveBeenCalledWith(
        'test-client-id',
      );
      expect(mockTokenRepository.generateToken).not.toHaveBeenCalled();
    });

    it('should handle scope validation error and throw BadRequestException', async () => {
      // Arrange
      const clientWithError = {
        ...mockClient,
        validateCredentials: jest.fn().mockReturnValue(true),
        validateCertificate: jest.fn().mockReturnValue(true),
        validateAndFilterScopes: jest.fn().mockImplementation(() => {
          throw new Error('Custom validation error');
        }),
      };
      mockClientRepository.findByClientId.mockResolvedValue(clientWithError);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new BadRequestException('Custom validation error'),
      );
      expect(mockClientRepository.findByClientId).toHaveBeenCalledWith(
        'test-client-id',
      );
      expect(mockTokenRepository.generateToken).not.toHaveBeenCalled();
    });

    it('should handle non-Error exceptions and throw generic BadRequestException', async () => {
      // Arrange
      const clientWithError = {
        ...mockClient,
        validateCredentials: jest.fn().mockReturnValue(true),
        validateCertificate: jest.fn().mockReturnValue(true),
        validateAndFilterScopes: jest.fn().mockImplementation(() => {
          throw new Error('String error');
        }),
      };
      mockClientRepository.findByClientId.mockResolvedValue(clientWithError);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new BadRequestException('String error'),
      );
      expect(mockClientRepository.findByClientId).toHaveBeenCalledWith(
        'test-client-id',
      );
      expect(mockTokenRepository.generateToken).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException with default message if validateAndFilterScopes throws non-Error', async () => {
      // Arrange
      const clientWithNonErrorException = {
        ...mockClient,
        validateCredentials: jest.fn().mockReturnValue(true),
        validateCertificate: jest.fn().mockReturnValue(true),
        validateAndFilterScopes: jest.fn().mockImplementation(() => {
          // eslint-disable-next-line @typescript-eslint/only-throw-error
          throw 'string error';
        }),
      };
      mockClientRepository.findByClientId.mockResolvedValue(
        clientWithNonErrorException,
      );

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new BadRequestException('Invalid scopes'),
      );
      expect(mockClientRepository.findByClientId).toHaveBeenCalledWith(
        'test-client-id',
      );
      expect(mockTokenRepository.generateToken).not.toHaveBeenCalled();
    });

    it('should filter and validate scopes correctly', async () => {
      // Arrange
      const requestWithMixedScopes: GenerateTokenRequest = {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        grantType: 'client_credentials',
        scope: 'read write admin invalid',
      };
      mockClientRepository.findByClientId.mockResolvedValue(mockClient);
      mockTokenRepository.generateToken.mockResolvedValue(mockToken);

      // Act & Assert
      await expect(useCase.execute(requestWithMixedScopes)).rejects.toThrow(
        new BadRequestException(
          'Client is not authorized for scopes: invalid. Allowed scopes: read, write, admin',
        ),
      );
      expect(mockClientRepository.findByClientId).toHaveBeenCalledWith(
        'test-client-id',
      );
      expect(mockTokenRepository.generateToken).not.toHaveBeenCalled();
    });

    it('should handle scope with extra whitespace', async () => {
      // Arrange
      const requestWithWhitespace: GenerateTokenRequest = {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        grantType: 'client_credentials',
        scope: '  read   write  ',
      };
      mockClientRepository.findByClientId.mockResolvedValue(mockClient);
      mockTokenRepository.generateToken.mockResolvedValue(mockToken);

      // Act
      const result = await useCase.execute(requestWithWhitespace);

      // Assert
      expect(mockClientRepository.findByClientId).toHaveBeenCalledWith(
        'test-client-id',
      );
      expect(mockTokenRepository.generateToken).toHaveBeenCalledWith(
        'test-client-id',
        'read write',
      );
      expect(result).toEqual({
        accessToken: 'mock-access-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        refreshToken: 'mock-refresh-token',
        scope: 'read write',
      });
    });

    it('should return correct response structure', async () => {
      // Arrange
      mockClientRepository.findByClientId.mockResolvedValue(mockClient);
      mockTokenRepository.generateToken.mockResolvedValue(mockToken);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('tokenType');
      expect(result).toHaveProperty('expiresIn');
      expect(result).toHaveProperty('scope');
      expect(typeof result.accessToken).toBe('string');
      expect(typeof result.tokenType).toBe('string');
      expect(typeof result.expiresIn).toBe('number');
      expect(result.tokenType).toBe('Bearer');
      expect(result.expiresIn).toBe(3600);
    });

    it('should handle token repository errors', async () => {
      // Arrange
      mockClientRepository.findByClientId.mockResolvedValue(mockClient);
      mockTokenRepository.generateToken.mockRejectedValue(
        new Error('Token generation failed'),
      );

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        'Token generation failed',
      );
      expect(mockClientRepository.findByClientId).toHaveBeenCalledWith(
        'test-client-id',
      );
      expect(mockTokenRepository.generateToken).toHaveBeenCalledWith(
        'test-client-id',
        'read write',
      );
    });
  });
});
