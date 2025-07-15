/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, Logger } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { AuthController } from '../auth.controller';
import { GenerateTokenUseCase } from '../../../application/use-cases/generate-token.use-case';
import { VerifyTokenUseCase } from '../../../application/use-cases/verify-token.use-case';
import { GenerateClientCredentialsUseCase } from '../../../application/use-cases/generate-client-credentials.use-case';
import { RefreshTokenUseCase } from '../../../application/use-cases/refresh-token.use-case';
import {
  TokenRequestDto,
  TokenResponseDto,
  TokenVerificationRequestDto,
  TokenVerificationResponseDto,
  RefreshTokenRequestDto,
  RefreshTokenResponseDto,
} from '../../../application/dtos/token.dto';
import { RequestWithCertificate } from '../../middleware/certificate-validation.middleware';

describe('AuthController', () => {
  let controller: AuthController;
  let generateTokenUseCase: jest.Mocked<GenerateTokenUseCase>;
  let verifyTokenUseCase: jest.Mocked<VerifyTokenUseCase>;
  let generateClientCredentialsUseCase: jest.Mocked<GenerateClientCredentialsUseCase>;
  let refreshTokenUseCase: jest.Mocked<RefreshTokenUseCase>;

  const mockRequest: Partial<RequestWithCertificate> = {
    socket: {
      getPeerCertificate: jest.fn(),
    } as unknown as RequestWithCertificate['socket'],
    certificateFingerprint: 'TEST_FINGERPRINT',
  };

  const mockTokenResponse: TokenResponseDto = {
    access_token: 'mock-access-token-123',
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: 'mock-refresh-token-456',
    scope: 'read write',
  };

  const mockRefreshTokenResponse: RefreshTokenResponseDto = {
    access_token: 'mock-new-access-token-789',
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: 'mock-new-refresh-token-012',
    scope: 'read write',
  };

  const mockVerificationResponse: TokenVerificationResponseDto = {
    valid: true,
    payload: {
      client_id: 'test-client-id',
      issuer: 'guatemala.com',
      audience: 'test-audience',
      issued_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      scope: 'read write',
    },
  };

  beforeEach(async () => {
    const mockGenerateTokenUseCase = {
      execute: jest.fn(),
    };

    const mockVerifyTokenUseCase = {
      execute: jest.fn(),
    };

    const mockGenerateClientCredentialsUseCase = {
      execute: jest.fn(),
    };

    const mockRefreshTokenUseCase = {
      execute: jest.fn(),
    };

    const mockConfigService = {
      get: jest
        .fn()
        .mockImplementation((key: string, defaultValue?: string) => {
          switch (key) {
            case 'JWT_SECRET':
              return 'test-secret';
            case 'JWT_ISSUER':
              return 'guatemala.com';
            case 'JWT_AUDIENCE':
              return 'guatemala-api';
            case 'JWT_EXPIRES_IN':
              return '1h';
            default:
              return defaultValue;
          }
        }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: GenerateTokenUseCase,
          useValue: mockGenerateTokenUseCase,
        },
        {
          provide: VerifyTokenUseCase,
          useValue: mockVerifyTokenUseCase,
        },
        {
          provide: GenerateClientCredentialsUseCase,
          useValue: mockGenerateClientCredentialsUseCase,
        },
        {
          provide: RefreshTokenUseCase,
          useValue: mockRefreshTokenUseCase,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    generateTokenUseCase = module.get(GenerateTokenUseCase);
    verifyTokenUseCase = module.get(VerifyTokenUseCase);
    generateClientCredentialsUseCase = module.get(
      GenerateClientCredentialsUseCase,
    );
    refreshTokenUseCase = module.get(RefreshTokenUseCase);

    // Mock logger to avoid console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getToken', () => {
    const validTokenRequest: TokenRequestDto = {
      grant_type: 'client_credentials',
      client_id: 'test-client-id',
      client_secret: 'test-client-secret',
      scope: 'read write',
    };

    it('should generate token successfully with valid client credentials', async () => {
      // Arrange
      generateTokenUseCase.execute.mockResolvedValue({
        accessToken: mockTokenResponse.access_token,
        tokenType: mockTokenResponse.token_type,
        expiresIn: mockTokenResponse.expires_in,
        refreshToken: mockTokenResponse.refresh_token,
        scope: mockTokenResponse.scope,
      });

      // Act
      const result = await controller.getToken(
        validTokenRequest,
        mockRequest as RequestWithCertificate,
      );

      // Assert
      expect(generateTokenUseCase.execute).toHaveBeenCalledWith({
        clientId: validTokenRequest.client_id,
        clientSecret: validTokenRequest.client_secret,
        grantType: validTokenRequest.grant_type,
        scope: validTokenRequest.scope,
        certificateFingerprint: mockRequest.certificateFingerprint,
      });
      expect(result).toEqual(mockTokenResponse);
    });

    it('should generate token without scope', async () => {
      // Arrange
      const requestWithoutScope = { ...validTokenRequest };
      delete requestWithoutScope.scope;

      generateTokenUseCase.execute.mockResolvedValue({
        accessToken: mockTokenResponse.access_token,
        tokenType: mockTokenResponse.token_type,
        expiresIn: mockTokenResponse.expires_in,
        refreshToken: mockTokenResponse.refresh_token,
        scope: undefined,
      });

      // Act
      const result = await controller.getToken(
        requestWithoutScope,
        mockRequest as RequestWithCertificate,
      );

      // Assert
      expect(generateTokenUseCase.execute).toHaveBeenCalledWith({
        clientId: validTokenRequest.client_id,
        clientSecret: validTokenRequest.client_secret,
        grantType: validTokenRequest.grant_type,
        scope: undefined,
        certificateFingerprint: mockRequest.certificateFingerprint,
      });
      expect(result.scope).toBeUndefined();
    });

    it('should throw BadRequestException for unsupported grant type', async () => {
      // Arrange
      const invalidRequest = {
        ...validTokenRequest,
        grant_type: 'authorization_code',
      };

      generateTokenUseCase.execute.mockRejectedValue(
        new BadRequestException(
          'Only client_credentials grant type is supported',
        ),
      );

      // Act & Assert
      await expect(
        controller.getToken(
          invalidRequest,
          mockRequest as RequestWithCertificate,
        ),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.getToken(
          invalidRequest,
          mockRequest as RequestWithCertificate,
        ),
      ).rejects.toThrow('Only client_credentials grant type is supported');
    });

    it('should throw error when client validation fails', async () => {
      // Arrange
      const validationError = new BadRequestException('Invalid credentials');
      generateTokenUseCase.execute.mockRejectedValue(validationError);

      // Act & Assert
      await expect(
        controller.getToken(
          validTokenRequest,
          mockRequest as RequestWithCertificate,
        ),
      ).rejects.toThrow(validationError);
      expect(generateTokenUseCase.execute).toHaveBeenCalledWith({
        clientId: validTokenRequest.client_id,
        clientSecret: validTokenRequest.client_secret,
        grantType: validTokenRequest.grant_type,
        scope: validTokenRequest.scope,
        certificateFingerprint: mockRequest.certificateFingerprint,
      });
    });

    it('should throw BadRequestException when scope validation fails', async () => {
      // Arrange
      const scopeError = new BadRequestException('Invalid scope');
      generateTokenUseCase.execute.mockRejectedValue(scopeError);

      // Act & Assert
      await expect(
        controller.getToken(
          validTokenRequest,
          mockRequest as RequestWithCertificate,
        ),
      ).rejects.toThrow(scopeError);
    });
  });

  describe('refreshToken', () => {
    const validRefreshRequest: RefreshTokenRequestDto = {
      grant_type: 'refresh_token',
      refresh_token: 'valid-refresh-token',
      scope: 'read write',
    };

    it('should refresh token successfully with valid refresh token', async () => {
      // Arrange
      refreshTokenUseCase.execute.mockResolvedValue({
        accessToken: mockRefreshTokenResponse.access_token,
        tokenType: mockRefreshTokenResponse.token_type,
        expiresIn: mockRefreshTokenResponse.expires_in,
        refreshToken: mockRefreshTokenResponse.refresh_token,
        scope: mockRefreshTokenResponse.scope,
      });

      // Act
      const result = await controller.refreshToken(validRefreshRequest);

      // Assert
      expect(refreshTokenUseCase.execute).toHaveBeenCalledWith({
        refreshToken: validRefreshRequest.refresh_token,
        grantType: validRefreshRequest.grant_type,
        scope: validRefreshRequest.scope,
      });
      expect(result).toEqual(mockRefreshTokenResponse);
    });

    it('should refresh token without scope', async () => {
      // Arrange
      const requestWithoutScope = { ...validRefreshRequest };
      delete requestWithoutScope.scope;

      refreshTokenUseCase.execute.mockResolvedValue({
        accessToken: mockRefreshTokenResponse.access_token,
        tokenType: mockRefreshTokenResponse.token_type,
        expiresIn: mockRefreshTokenResponse.expires_in,
        refreshToken: mockRefreshTokenResponse.refresh_token,
        scope: undefined,
      });

      // Act
      const result = await controller.refreshToken(requestWithoutScope);

      // Assert
      expect(refreshTokenUseCase.execute).toHaveBeenCalledWith({
        refreshToken: validRefreshRequest.refresh_token,
        grantType: validRefreshRequest.grant_type,
        scope: undefined,
      });
      expect(result.scope).toBeUndefined();
    });

    it('should throw BadRequestException for unsupported grant type', async () => {
      // Arrange
      const invalidRequest = {
        ...validRefreshRequest,
        grant_type: 'client_credentials',
      };

      refreshTokenUseCase.execute.mockRejectedValue(
        new BadRequestException(
          'Only refresh_token grant type is supported for this endpoint',
        ),
      );

      // Act & Assert
      await expect(controller.refreshToken(invalidRequest)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.refreshToken(invalidRequest)).rejects.toThrow(
        'Only refresh_token grant type is supported for this endpoint',
      );
    });

    it('should throw error when refresh token validation fails', async () => {
      // Arrange
      const refreshError = new BadRequestException('Invalid refresh token');
      refreshTokenUseCase.execute.mockRejectedValue(refreshError);

      // Act & Assert
      await expect(
        controller.refreshToken(validRefreshRequest),
      ).rejects.toThrow(refreshError);
    });
  });

  describe('generateClient', () => {
    it('should generate client credentials successfully', () => {
      // Arrange
      const mockCredentials = {
        client_id: 'gt_client_abc123',
        client_secret: 'gt_secret_def456',
      };
      generateClientCredentialsUseCase.execute.mockReturnValue(mockCredentials);

      // Act
      const result = controller.generateClient();

      // Assert
      expect(generateClientCredentialsUseCase.execute).toHaveBeenCalled();
      expect(result).toEqual(mockCredentials);
    });

    it('should generate different credentials on each call', () => {
      // Arrange
      const credentials1 = {
        client_id: 'gt_client_abc123',
        client_secret: 'gt_secret_def456',
      };
      const credentials2 = {
        client_id: 'gt_client_xyz789',
        client_secret: 'gt_secret_uvw012',
      };

      generateClientCredentialsUseCase.execute
        .mockReturnValueOnce(credentials1)
        .mockReturnValueOnce(credentials2);

      // Act
      const result1 = controller.generateClient();
      const result2 = controller.generateClient();

      // Assert
      expect(result1).toEqual(credentials1);
      expect(result2).toEqual(credentials2);
      expect(result1).not.toEqual(result2);
    });
  });

  describe('verifyToken', () => {
    const validVerificationRequest: TokenVerificationRequestDto = {
      token: 'valid-token-123',
    };

    it('should verify valid token successfully', async () => {
      // Arrange
      verifyTokenUseCase.execute.mockResolvedValue(mockVerificationResponse);

      // Act
      const result = await controller.verifyToken(validVerificationRequest);

      // Assert
      expect(verifyTokenUseCase.execute).toHaveBeenCalledWith({
        token: validVerificationRequest.token,
      });
      expect(result).toEqual(mockVerificationResponse);
    });

    it('should handle invalid token verification', async () => {
      // Arrange
      const invalidResponse: TokenVerificationResponseDto = {
        valid: false,
        payload: undefined,
      };
      verifyTokenUseCase.execute.mockResolvedValue(invalidResponse);

      // Act
      const result = await controller.verifyToken(validVerificationRequest);

      // Assert
      expect(result).toEqual(invalidResponse);
      expect(result.valid).toBe(false);
      expect(result.payload).toBeUndefined();
    });

    it('should handle verification errors', async () => {
      // Arrange
      const verificationError = new Error('Token verification failed');
      verifyTokenUseCase.execute.mockRejectedValue(verificationError);

      // Act & Assert
      await expect(
        controller.verifyToken(validVerificationRequest),
      ).rejects.toThrow(verificationError);
    });
  });

  describe('getOAuthInfo', () => {
    it('should return OAuth information', () => {
      // Act
      const result = controller.getOAuthInfo();

      // Assert
      expect(result).toEqual({
        issuer: 'guatemala.com',
        authorization_endpoint: '/api/oauth/authorize',
        token_endpoint: '/api/oauth/token',
        supported_grant_types: ['client_credentials'],
        supported_scopes: ['read', 'write', 'admin'],
        token_endpoint_auth_methods: ['client_secret_post'],
      });
    });
  });

  describe('certificate validation', () => {
    it('should pass certificate fingerprint to validation', async () => {
      // Arrange
      const requestWithCertificate = {
        ...mockRequest,
        certificateFingerprint: 'ABC123456789',
      };

      generateTokenUseCase.execute.mockResolvedValue({
        accessToken: mockTokenResponse.access_token,
        tokenType: mockTokenResponse.token_type,
        expiresIn: mockTokenResponse.expires_in,
        refreshToken: mockTokenResponse.refresh_token,
        scope: mockTokenResponse.scope,
      });

      // Act
      await controller.getToken(
        {
          grant_type: 'client_credentials',
          client_id: 'test-client',
          client_secret: 'test-secret',
          scope: 'read',
        },
        requestWithCertificate as RequestWithCertificate,
      );

      // Assert
      expect(generateTokenUseCase.execute).toHaveBeenCalledWith({
        clientId: 'test-client',
        clientSecret: 'test-secret',
        grantType: 'client_credentials',
        scope: 'read',
        certificateFingerprint: 'ABC123456789',
      });
    });

    it('should handle requests without certificate fingerprint', async () => {
      // Arrange
      const requestWithoutCertificate = {
        ...mockRequest,
        certificateFingerprint: undefined,
      };

      generateTokenUseCase.execute.mockResolvedValue({
        accessToken: mockTokenResponse.access_token,
        tokenType: mockTokenResponse.token_type,
        expiresIn: mockTokenResponse.expires_in,
        refreshToken: mockTokenResponse.refresh_token,
        scope: mockTokenResponse.scope,
      });

      // Act
      await controller.getToken(
        {
          grant_type: 'client_credentials',
          client_id: 'test-client',
          client_secret: 'test-secret',
          scope: 'read',
        },
        requestWithoutCertificate as RequestWithCertificate,
      );

      // Assert
      expect(generateTokenUseCase.execute).toHaveBeenCalledWith({
        clientId: 'test-client',
        clientSecret: 'test-secret',
        grantType: 'client_credentials',
        scope: 'read',
        certificateFingerprint: undefined,
      });
    });
  });
});
