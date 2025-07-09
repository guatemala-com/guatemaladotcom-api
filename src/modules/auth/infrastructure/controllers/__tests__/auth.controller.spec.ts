/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, Logger } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { AuthController } from '../auth.controller';
import { ValidateClientUseCase } from '../../../application/use-cases/validate-client.use-case';
import { GenerateTokenUseCase } from '../../../application/use-cases/generate-token.use-case';
import { VerifyTokenUseCase } from '../../../application/use-cases/verify-token.use-case';
import { GenerateClientCredentialsUseCase } from '../../../application/use-cases/generate-client-credentials.use-case';
import {
  TokenRequestDto,
  TokenResponseDto,
  TokenVerificationRequestDto,
  TokenVerificationResponseDto,
} from '../../../application/dtos/token.dto';
import {
  mockClient,
  mockClientCredentials,
} from '../../../__mocks__/entities.mocks';

describe('AuthController', () => {
  let controller: AuthController;
  let validateClientUseCase: jest.Mocked<ValidateClientUseCase>;
  let generateTokenUseCase: jest.Mocked<GenerateTokenUseCase>;
  let verifyTokenUseCase: jest.Mocked<VerifyTokenUseCase>;
  let generateClientCredentialsUseCase: jest.Mocked<GenerateClientCredentialsUseCase>;

  const mockTokenResponse: TokenResponseDto = {
    access_token: 'mock-access-token-123',
    token_type: 'Bearer',
    expires_in: 3600,
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
    const mockValidateClientUseCase = {
      execute: jest.fn(),
    };

    const mockGenerateTokenUseCase = {
      execute: jest.fn(),
    };

    const mockVerifyTokenUseCase = {
      execute: jest.fn(),
    };

    const mockGenerateClientCredentialsUseCase = {
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
          provide: ValidateClientUseCase,
          useValue: mockValidateClientUseCase,
        },
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
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    validateClientUseCase = module.get(ValidateClientUseCase);
    generateTokenUseCase = module.get(GenerateTokenUseCase);
    verifyTokenUseCase = module.get(VerifyTokenUseCase);
    generateClientCredentialsUseCase = module.get(
      GenerateClientCredentialsUseCase,
    );

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
      validateClientUseCase.execute.mockResolvedValue({
        client: mockClient,
        isValid: true,
      });
      generateTokenUseCase.execute.mockResolvedValue({
        accessToken: mockTokenResponse.access_token,
        tokenType: mockTokenResponse.token_type,
        expiresIn: mockTokenResponse.expires_in,
        scope: mockTokenResponse.scope,
      });

      // Act
      const result = await controller.getToken(validTokenRequest);

      // Assert
      expect(validateClientUseCase.execute).toHaveBeenCalledWith({
        clientId: validTokenRequest.client_id,
        clientSecret: validTokenRequest.client_secret,
      });
      expect(generateTokenUseCase.execute).toHaveBeenCalledWith({
        clientId: validTokenRequest.client_id,
        scope: validTokenRequest.scope,
      });
      expect(result).toEqual(mockTokenResponse);
    });

    it('should generate token without scope', async () => {
      // Arrange
      const requestWithoutScope = { ...validTokenRequest };
      delete requestWithoutScope.scope;

      validateClientUseCase.execute.mockResolvedValue({
        client: mockClient,
        isValid: true,
      });
      generateTokenUseCase.execute.mockResolvedValue({
        accessToken: mockTokenResponse.access_token,
        tokenType: mockTokenResponse.token_type,
        expiresIn: mockTokenResponse.expires_in,
        scope: undefined,
      });

      // Act
      const result = await controller.getToken(requestWithoutScope);

      // Assert
      expect(generateTokenUseCase.execute).toHaveBeenCalledWith({
        clientId: validTokenRequest.client_id,
        scope: undefined,
      });
      expect(result.scope).toBeUndefined();
    });

    it('should throw BadRequestException for unsupported grant type', async () => {
      // Arrange
      const invalidRequest = {
        ...validTokenRequest,
        grant_type: 'authorization_code',
      };

      // Act & Assert
      await expect(controller.getToken(invalidRequest)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.getToken(invalidRequest)).rejects.toThrow(
        'Only client_credentials grant type is supported',
      );
    });

    it('should throw error when client validation fails', async () => {
      // Arrange
      const validationError = new BadRequestException('Invalid credentials');
      validateClientUseCase.execute.mockRejectedValue(validationError);

      // Act & Assert
      await expect(controller.getToken(validTokenRequest)).rejects.toThrow(
        validationError,
      );
      expect(validateClientUseCase.execute).toHaveBeenCalledWith({
        clientId: validTokenRequest.client_id,
        clientSecret: validTokenRequest.client_secret,
      });
      expect(generateTokenUseCase.execute).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when scope validation fails', async () => {
      // Arrange
      const scopeError = new BadRequestException('Invalid scope');
      validateClientUseCase.execute.mockResolvedValue({
        client: mockClient,
        isValid: true,
      });
      generateTokenUseCase.execute.mockRejectedValue(scopeError);

      // Act & Assert
      await expect(controller.getToken(validTokenRequest)).rejects.toThrow(
        scopeError,
      );
    });

    it('should throw BadRequestException for unknown token generation errors', async () => {
      // Arrange
      const unknownError = new Error('Database connection failed');
      validateClientUseCase.execute.mockResolvedValue({
        client: mockClient,
        isValid: true,
      });
      generateTokenUseCase.execute.mockRejectedValue(unknownError);

      // Act & Assert
      await expect(controller.getToken(validTokenRequest)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.getToken(validTokenRequest)).rejects.toThrow(
        'Error generating access token',
      );
    });

    it('should handle empty scope string', async () => {
      // Arrange
      const requestWithEmptyScope = {
        ...validTokenRequest,
        scope: '',
      };

      validateClientUseCase.execute.mockResolvedValue({
        client: mockClient,
        isValid: true,
      });
      generateTokenUseCase.execute.mockResolvedValue({
        accessToken: mockTokenResponse.access_token,
        tokenType: mockTokenResponse.token_type,
        expiresIn: mockTokenResponse.expires_in,
        scope: '',
      });

      // Act
      const result = await controller.getToken(requestWithEmptyScope);

      // Assert
      expect(generateTokenUseCase.execute).toHaveBeenCalledWith({
        clientId: validTokenRequest.client_id,
        scope: '',
      });
      expect(result.scope).toBe('');
    });
  });

  describe('generateClient', () => {
    it('should generate client credentials successfully', () => {
      // Arrange
      generateClientCredentialsUseCase.execute.mockReturnValue(
        mockClientCredentials,
      );

      // Act
      const result = controller.generateClient();

      // Assert
      expect(generateClientCredentialsUseCase.execute).toHaveBeenCalled();
      expect(result).toEqual(mockClientCredentials);
    });

    it('should return different credentials on multiple calls', () => {
      // Arrange
      const credentials1 = { client_id: 'client-1', client_secret: 'secret-1' };
      const credentials2 = { client_id: 'client-2', client_secret: 'secret-2' };

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

    it('should handle empty token string', async () => {
      // Arrange
      const emptyTokenRequest = { token: '' };
      const invalidResponse: TokenVerificationResponseDto = {
        valid: false,
        payload: undefined,
      };
      verifyTokenUseCase.execute.mockResolvedValue(invalidResponse);

      // Act
      const result = await controller.verifyToken(emptyTokenRequest);

      // Assert
      expect(verifyTokenUseCase.execute).toHaveBeenCalledWith({
        token: '',
      });
      expect(result).toEqual(invalidResponse);
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

    it('should handle token with payload', async () => {
      // Arrange
      const responseWithPayload: TokenVerificationResponseDto = {
        valid: true,
        payload: {
          client_id: 'test-client',
          issuer: 'guatemala.com',
          audience: 'test-audience',
          issued_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7200000).toISOString(),
          scope: 'read write admin',
        },
      };
      verifyTokenUseCase.execute.mockResolvedValue(responseWithPayload);

      // Act
      const result = await controller.verifyToken(validVerificationRequest);

      // Assert
      expect(result).toEqual(responseWithPayload);
      expect(result.payload?.client_id).toBe('test-client');
      expect(result.payload?.scope).toBe('read write admin');
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

    it('should return consistent OAuth information on multiple calls', () => {
      // Act
      const result1 = controller.getOAuthInfo();
      const result2 = controller.getOAuthInfo();

      // Assert
      expect(result1).toEqual(result2);
      expect(result1.issuer).toBe('guatemala.com');
      expect(result1.supported_grant_types).toContain('client_credentials');
      expect(result1.supported_scopes).toContain('read');
      expect(result1.supported_scopes).toContain('write');
      expect(result1.supported_scopes).toContain('admin');
    });
  });

  describe('logging', () => {
    it('should log token request information', async () => {
      // Arrange
      const logSpy = jest.spyOn(Logger.prototype, 'log');
      const debugSpy = jest.spyOn(Logger.prototype, 'debug');

      validateClientUseCase.execute.mockResolvedValue({
        client: mockClient,
        isValid: true,
      });
      generateTokenUseCase.execute.mockResolvedValue({
        accessToken: mockTokenResponse.access_token,
        tokenType: mockTokenResponse.token_type,
        expiresIn: mockTokenResponse.expires_in,
        scope: mockTokenResponse.scope,
      });

      // Act
      await controller.getToken({
        grant_type: 'client_credentials',
        client_id: 'test-client',
        client_secret: 'test-secret',
        scope: 'read',
      });

      // Assert
      expect(logSpy).toHaveBeenCalledWith(
        'Token request received from client: test-client',
      );
      expect(debugSpy).toHaveBeenCalledWith(
        'Validating credentials for client: test-client',
      );
      expect(logSpy).toHaveBeenCalledWith(
        'Credentials validated successfully for client: test-client',
      );
      expect(debugSpy).toHaveBeenCalledWith(
        'Generating access token for client: test-client, requested scopes: read',
      );
      expect(logSpy).toHaveBeenCalledWith(
        'Access token generated successfully for client: test-client',
      );
    });

    it('should log warning for unsupported grant type', async () => {
      // Arrange
      const warnSpy = jest.spyOn(Logger.prototype, 'warn');

      // Act & Assert
      await expect(
        controller.getToken({
          grant_type: 'authorization_code',
          client_id: 'test-client',
          client_secret: 'test-secret',
        }),
      ).rejects.toThrow();

      expect(warnSpy).toHaveBeenCalledWith(
        'Unsupported grant type: authorization_code from client: test-client',
      );
    });

    it('should log warning for invalid credentials', async () => {
      // Arrange
      const warnSpy = jest.spyOn(Logger.prototype, 'warn');
      const validationError = new BadRequestException('Invalid credentials');
      validateClientUseCase.execute.mockRejectedValue(validationError);

      // Act & Assert
      await expect(
        controller.getToken({
          grant_type: 'client_credentials',
          client_id: 'test-client',
          client_secret: 'wrong-secret',
        }),
      ).rejects.toThrow();

      expect(warnSpy).toHaveBeenCalledWith(
        'Invalid credentials for client: test-client',
      );
    });

    it('should log client credentials generation', () => {
      // Arrange
      const logSpy = jest.spyOn(Logger.prototype, 'log');
      generateClientCredentialsUseCase.execute.mockReturnValue(
        mockClientCredentials,
      );

      // Act
      controller.generateClient();

      // Assert
      expect(logSpy).toHaveBeenCalledWith(
        'Client credentials generation requested',
      );
      expect(logSpy).toHaveBeenCalledWith(
        `Client credentials generated: ${mockClientCredentials.client_id}`,
      );
    });

    it('should log token verification results', async () => {
      // Arrange
      const logSpy = jest.spyOn(Logger.prototype, 'log');
      const debugSpy = jest.spyOn(Logger.prototype, 'debug');

      verifyTokenUseCase.execute.mockResolvedValue(mockVerificationResponse);

      // Act
      await controller.verifyToken({ token: 'valid-token' });

      // Assert
      expect(debugSpy).toHaveBeenCalledWith('Token verification requested');
      expect(logSpy).toHaveBeenCalledWith(
        `Token verified successfully for client: ${mockVerificationResponse.payload?.client_id}`,
      );
    });

    it('should log failed token verification', async () => {
      // Arrange
      const debugSpy = jest.spyOn(Logger.prototype, 'debug');
      const warnSpy = jest.spyOn(Logger.prototype, 'warn');

      const invalidResponse: TokenVerificationResponseDto = {
        valid: false,
        payload: undefined,
      };
      verifyTokenUseCase.execute.mockResolvedValue(invalidResponse);

      // Act
      await controller.verifyToken({ token: 'invalid-token' });

      // Assert
      expect(debugSpy).toHaveBeenCalledWith('Token verification requested');
      expect(warnSpy).toHaveBeenCalledWith('Token verification failed');
    });

    it('should log OAuth info requests', () => {
      // Arrange
      const debugSpy = jest.spyOn(Logger.prototype, 'debug');
      const logSpy = jest.spyOn(Logger.prototype, 'log');

      // Act
      controller.getOAuthInfo();

      // Assert
      expect(debugSpy).toHaveBeenCalledWith('OAuth info requested');
      expect(logSpy).toHaveBeenCalledWith('OAuth info provided successfully');
    });
  });

  describe('error handling', () => {
    it('should handle non-Error exceptions in token generation', async () => {
      // Arrange
      validateClientUseCase.execute.mockResolvedValue({
        client: mockClient,
        isValid: true,
      });
      generateTokenUseCase.execute.mockRejectedValue('String error');

      // Act & Assert
      await expect(
        controller.getToken({
          grant_type: 'client_credentials',
          client_id: 'test-client',
          client_secret: 'test-secret',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle null/undefined errors in token generation', async () => {
      // Arrange
      validateClientUseCase.execute.mockResolvedValue({
        client: mockClient,
        isValid: true,
      });
      generateTokenUseCase.execute.mockRejectedValue(null);

      // Act & Assert
      await expect(
        controller.getToken({
          grant_type: 'client_credentials',
          client_id: 'test-client',
          client_secret: 'test-secret',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
