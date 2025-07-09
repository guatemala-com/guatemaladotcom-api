/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { TokenRepositoryImpl } from '../token.repository';
import { Token } from '../../../domain/entities/token.entity';

describe('TokenRepositoryImpl', () => {
  let repository: TokenRepositoryImpl;
  let jwtService: jest.Mocked<JwtService>;

  const mockPayload = {
    sub: 'test-client-id',
    aud: 'test-audience',
    iss: 'test-issuer',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    scope: 'read write',
  };

  const mockAccessToken = 'mock-jwt-token-123';

  beforeEach(async () => {
    const mockJwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenRepositoryImpl,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    repository = module.get<TokenRepositoryImpl>(TokenRepositoryImpl);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate token successfully with scope', async () => {
      // Arrange
      const clientId = 'test-client-id';
      const scope = 'read write';
      const expectedPayload = {
        sub: clientId,
        iat: expect.any(Number),
        scope,
      };

      jwtService.signAsync.mockResolvedValue(mockAccessToken);
      jwtService.verifyAsync.mockResolvedValue(mockPayload);

      // Act
      const result = await repository.generateToken(clientId, scope);

      // Assert
      expect(jwtService.signAsync).toHaveBeenCalledWith(expectedPayload);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(mockAccessToken);
      expect(result).toBeInstanceOf(Token);
      expect(result.accessToken).toBe(mockAccessToken);
    });

    it('should generate token successfully without scope', async () => {
      // Arrange
      const clientId = 'test-client-id';
      const expectedPayload = {
        sub: clientId,
        iat: expect.any(Number),
        scope: undefined,
      };

      jwtService.signAsync.mockResolvedValue(mockAccessToken);
      jwtService.verifyAsync.mockResolvedValue({
        ...mockPayload,
        scope: undefined,
      });

      // Act
      const result = await repository.generateToken(clientId);

      // Assert
      expect(jwtService.signAsync).toHaveBeenCalledWith(expectedPayload);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(mockAccessToken);
      expect(result).toBeInstanceOf(Token);
      expect(result.accessToken).toBe(mockAccessToken);
    });

    it('should generate token with empty scope string', async () => {
      // Arrange
      const clientId = 'test-client-id';
      const scope = '';
      const expectedPayload = {
        sub: clientId,
        iat: expect.any(Number),
        scope: '',
      };

      jwtService.signAsync.mockResolvedValue(mockAccessToken);
      jwtService.verifyAsync.mockResolvedValue({
        ...mockPayload,
        scope: '',
      });

      // Act
      const result = await repository.generateToken(clientId, scope);

      // Assert
      expect(jwtService.signAsync).toHaveBeenCalledWith(expectedPayload);
      expect(result).toBeInstanceOf(Token);
    });

    it('should generate token with current timestamp', async () => {
      // Arrange
      const clientId = 'test-client-id';
      const scope = 'read';
      const beforeCall = Math.floor(Date.now() / 1000);

      jwtService.signAsync.mockResolvedValue(mockAccessToken);
      jwtService.verifyAsync.mockResolvedValue(mockPayload);

      // Act
      await repository.generateToken(clientId, scope);
      const afterCall = Math.floor(Date.now() / 1000);

      // Assert
      const calledPayload = jwtService.signAsync.mock.calls[0][0] as any;
      expect(calledPayload.iat).toBeGreaterThanOrEqual(beforeCall);
      expect(calledPayload.iat).toBeLessThanOrEqual(afterCall);
    });

    it('should handle JWT signing errors', async () => {
      // Arrange
      const clientId = 'test-client-id';
      const scope = 'read';
      const jwtError = new Error('JWT signing failed');

      jwtService.signAsync.mockRejectedValue(jwtError);

      // Act & Assert
      await expect(repository.generateToken(clientId, scope)).rejects.toThrow(
        jwtError,
      );
      expect(jwtService.signAsync).toHaveBeenCalled();
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should handle JWT verification errors during token generation', async () => {
      // Arrange
      const clientId = 'test-client-id';
      const scope = 'read';
      const verifyError = new Error('JWT verification failed');

      jwtService.signAsync.mockResolvedValue(mockAccessToken);
      jwtService.verifyAsync.mockRejectedValue(verifyError);

      // Act & Assert
      await expect(repository.generateToken(clientId, scope)).rejects.toThrow(
        verifyError,
      );
      expect(jwtService.signAsync).toHaveBeenCalled();
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(mockAccessToken);
    });

    it('should generate unique tokens for different clients', async () => {
      // Arrange
      const clientId1 = 'client-1';
      const clientId2 = 'client-2';
      const token1 = 'token-1';
      const token2 = 'token-2';

      jwtService.signAsync
        .mockResolvedValueOnce(token1)
        .mockResolvedValueOnce(token2);
      jwtService.verifyAsync
        .mockResolvedValueOnce({ ...mockPayload, sub: clientId1 })
        .mockResolvedValueOnce({ ...mockPayload, sub: clientId2 });

      // Act
      const result1 = await repository.generateToken(clientId1);
      const result2 = await repository.generateToken(clientId2);

      // Assert
      expect(result1.accessToken).toBe(token1);
      expect(result2.accessToken).toBe(token2);
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('validateToken', () => {
    it('should validate token successfully', async () => {
      // Arrange
      const tokenString = 'valid-token-123';
      jwtService.verifyAsync.mockResolvedValue(mockPayload);

      // Act
      const result = await repository.validateToken(tokenString);

      // Assert
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(tokenString);
      expect(result).toBeInstanceOf(Token);
      expect(result.accessToken).toBe(tokenString);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      // Arrange
      const tokenString = 'invalid-token';
      const jwtError = new Error('Invalid token');
      jwtService.verifyAsync.mockRejectedValue(jwtError);

      // Act & Assert
      await expect(repository.validateToken(tokenString)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(repository.validateToken(tokenString)).rejects.toThrow(
        'Invalid token',
      );
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(tokenString);
    });

    it('should throw UnauthorizedException for expired token', async () => {
      // Arrange
      const tokenString = 'expired-token';
      const expiredError = new Error('Token expired');
      jwtService.verifyAsync.mockRejectedValue(expiredError);

      // Act & Assert
      await expect(repository.validateToken(tokenString)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(tokenString);
    });

    it('should throw UnauthorizedException for malformed token', async () => {
      // Arrange
      const tokenString = 'malformed-token';
      const malformedError = new Error('Malformed token');
      jwtService.verifyAsync.mockRejectedValue(malformedError);

      // Act & Assert
      await expect(repository.validateToken(tokenString)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(tokenString);
    });

    it('should handle empty token string', async () => {
      // Arrange
      const tokenString = '';
      const emptyTokenError = new Error('Empty token');
      jwtService.verifyAsync.mockRejectedValue(emptyTokenError);

      // Act & Assert
      await expect(repository.validateToken(tokenString)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(tokenString);
    });

    it('should handle null token string', async () => {
      // Arrange
      const tokenString = null as unknown as string;
      const nullTokenError = new Error('Null token');
      jwtService.verifyAsync.mockRejectedValue(nullTokenError);

      // Act & Assert
      await expect(repository.validateToken(tokenString)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(tokenString);
    });

    it('should validate token with different payload structures', async () => {
      // Arrange
      const tokenString = 'valid-token-123';
      const customPayload = {
        ...mockPayload,
        customField: 'custom-value',
        scope: 'admin',
      };
      jwtService.verifyAsync.mockResolvedValue(customPayload);

      // Act
      const result = await repository.validateToken(tokenString);

      // Assert
      expect(result).toBeInstanceOf(Token);
      expect(result.accessToken).toBe(tokenString);
    });
  });

  describe('hasScope', () => {
    it('should return true when token has required scope', async () => {
      // Arrange
      const tokenString = 'valid-token-123';
      const requiredScope = 'read';
      jwtService.verifyAsync.mockResolvedValue({
        ...mockPayload,
        scope: 'read write admin',
      });

      // Act
      const result = await repository.hasScope(tokenString, requiredScope);

      // Assert
      expect(result).toBe(true);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(tokenString);
    });

    it('should return false when token does not have required scope', async () => {
      // Arrange
      const tokenString = 'valid-token-123';
      const requiredScope = 'admin';
      jwtService.verifyAsync.mockResolvedValue({
        ...mockPayload,
        scope: 'read write',
      });

      // Act
      const result = await repository.hasScope(tokenString, requiredScope);

      // Assert
      expect(result).toBe(false);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(tokenString);
    });

    it('should return false when token is invalid', async () => {
      // Arrange
      const tokenString = 'invalid-token';
      const requiredScope = 'read';
      const jwtError = new Error('Invalid token');
      jwtService.verifyAsync.mockRejectedValue(jwtError);

      // Act
      const result = await repository.hasScope(tokenString, requiredScope);

      // Assert
      expect(result).toBe(false);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(tokenString);
    });

    it('should return false when token validation throws UnauthorizedException', async () => {
      // Arrange
      const tokenString = 'invalid-token';
      const requiredScope = 'read';
      const authError = new UnauthorizedException('Invalid token');
      jwtService.verifyAsync.mockRejectedValue(authError);

      // Act
      const result = await repository.hasScope(tokenString, requiredScope);

      // Assert
      expect(result).toBe(false);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(tokenString);
    });

    it('should return false when token has no scope', async () => {
      // Arrange
      const tokenString = 'valid-token-123';
      const requiredScope = 'read';
      jwtService.verifyAsync.mockResolvedValue({
        ...mockPayload,
        scope: undefined,
      });

      // Act
      const result = await repository.hasScope(tokenString, requiredScope);

      // Assert
      expect(result).toBe(false);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(tokenString);
    });

    it('should return false when token has empty scope', async () => {
      // Arrange
      const tokenString = 'valid-token-123';
      const requiredScope = 'read';
      jwtService.verifyAsync.mockResolvedValue({
        ...mockPayload,
        scope: '',
      });

      // Act
      const result = await repository.hasScope(tokenString, requiredScope);

      // Assert
      expect(result).toBe(false);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(tokenString);
    });

    it('should handle exact scope match', async () => {
      // Arrange
      const tokenString = 'valid-token-123';
      const requiredScope = 'read';
      jwtService.verifyAsync.mockResolvedValue({
        ...mockPayload,
        scope: 'read',
      });

      // Act
      const result = await repository.hasScope(tokenString, requiredScope);

      // Assert
      expect(result).toBe(true);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(tokenString);
    });

    it('should handle scope with extra spaces', async () => {
      // Arrange
      const tokenString = 'valid-token-123';
      const requiredScope = 'read';
      jwtService.verifyAsync.mockResolvedValue({
        ...mockPayload,
        scope: '  read   write  ',
      });

      // Act
      const result = await repository.hasScope(tokenString, requiredScope);

      // Assert
      expect(result).toBe(true);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(tokenString);
    });

    it('should handle multiple scope checks on same token', async () => {
      // Arrange
      const tokenString = 'valid-token-123';
      jwtService.verifyAsync.mockResolvedValue({
        ...mockPayload,
        scope: 'read write',
      });

      // Act
      const hasRead = await repository.hasScope(tokenString, 'read');
      const hasWrite = await repository.hasScope(tokenString, 'write');
      const hasAdmin = await repository.hasScope(tokenString, 'admin');

      // Assert
      expect(hasRead).toBe(true);
      expect(hasWrite).toBe(true);
      expect(hasAdmin).toBe(false);
      expect(jwtService.verifyAsync).toHaveBeenCalledTimes(3);
    });
  });

  describe('integration scenarios', () => {
    it('should generate and validate token in sequence', async () => {
      // Arrange
      const clientId = 'test-client';
      const scope = 'read write';

      jwtService.signAsync.mockResolvedValue(mockAccessToken);
      jwtService.verifyAsync.mockResolvedValue(mockPayload);

      // Act
      const generatedToken = await repository.generateToken(clientId, scope);
      const validatedToken = await repository.validateToken(
        generatedToken.accessToken,
      );

      // Assert
      expect(generatedToken.accessToken).toBe(mockAccessToken);
      expect(validatedToken.accessToken).toBe(mockAccessToken);
      expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
      expect(jwtService.verifyAsync).toHaveBeenCalledTimes(2); // Once for generation, once for validation
    });

    it('should generate token and check scope', async () => {
      // Arrange
      const clientId = 'test-client';
      const scope = 'read write';

      jwtService.signAsync.mockResolvedValue(mockAccessToken);
      jwtService.verifyAsync.mockResolvedValue({
        ...mockPayload,
        scope: 'read write',
      });

      // Act
      const generatedToken = await repository.generateToken(clientId, scope);
      const hasReadScope = await repository.hasScope(
        generatedToken.accessToken,
        'read',
      );
      const hasAdminScope = await repository.hasScope(
        generatedToken.accessToken,
        'admin',
      );

      // Assert
      expect(generatedToken.accessToken).toBe(mockAccessToken);
      expect(hasReadScope).toBe(true);
      expect(hasAdminScope).toBe(false);
    });

    it('should handle error in token generation followed by validation', async () => {
      // Arrange
      const clientId = 'test-client';
      const scope = 'read';

      jwtService.signAsync.mockRejectedValue(new Error('Signing failed'));
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      // Act & Assert
      await expect(repository.generateToken(clientId, scope)).rejects.toThrow(
        'Signing failed',
      );
      await expect(repository.validateToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('error handling edge cases', () => {
    it('should handle JWT service throwing non-Error objects', async () => {
      // Arrange
      const tokenString = 'invalid-token';
      jwtService.verifyAsync.mockRejectedValue('String error');

      // Act & Assert
      await expect(repository.validateToken(tokenString)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle JWT service throwing null', async () => {
      // Arrange
      const tokenString = 'invalid-token';
      jwtService.verifyAsync.mockRejectedValue(null);

      // Act & Assert
      await expect(repository.validateToken(tokenString)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle JWT service throwing undefined', async () => {
      // Arrange
      const tokenString = 'invalid-token';
      jwtService.verifyAsync.mockRejectedValue(undefined);

      // Act & Assert
      await expect(repository.validateToken(tokenString)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
