// Mock crypto module
jest.mock('crypto', () => ({
  randomBytes: jest.fn(),
}));

import { randomBytes } from 'crypto';
import { RefreshToken } from '../refresh-token.entity';

describe('RefreshToken', () => {
  const mockRandomBytes = randomBytes as jest.MockedFunction<
    typeof randomBytes
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    // Use fake timers for consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('constructor and getters', () => {
    it('should create a refresh token with all properties', () => {
      // Arrange
      const tokenId = 'test-token-id';
      const clientId = 'test-client-id';
      const refreshToken = 'test-refresh-token';
      const expiresAt = new Date('2024-12-31T23:59:59Z');
      const createdAt = new Date('2024-01-01T00:00:00Z');
      const isRevoked = false;
      const scope = 'read write';

      // Act
      const token = new RefreshToken(
        tokenId,
        clientId,
        refreshToken,
        expiresAt,
        createdAt,
        isRevoked,
        scope,
      );

      // Assert
      expect(token.tokenId).toBe(tokenId);
      expect(token.clientId).toBe(clientId);
      expect(token.refreshToken).toBe(refreshToken);
      expect(token.expiresAt).toBe(expiresAt);
      expect(token.createdAt).toBe(createdAt);
      expect(token.isRevoked).toBe(isRevoked);
      expect(token.scope).toBe(scope);
    });

    it('should create a refresh token with default values', () => {
      // Arrange
      const tokenId = 'test-token-id';
      const clientId = 'test-client-id';
      const refreshToken = 'test-refresh-token';
      const expiresAt = new Date('2024-12-31T23:59:59Z');
      const createdAt = new Date('2024-01-01T00:00:00Z');

      // Act
      const token = new RefreshToken(
        tokenId,
        clientId,
        refreshToken,
        expiresAt,
        createdAt,
      );

      // Assert
      expect(token.tokenId).toBe(tokenId);
      expect(token.clientId).toBe(clientId);
      expect(token.refreshToken).toBe(refreshToken);
      expect(token.expiresAt).toBe(expiresAt);
      expect(token.createdAt).toBe(createdAt);
      expect(token.isRevoked).toBe(false); // Default value
      expect(token.scope).toBeUndefined(); // Default value
    });

    it('should create a refresh token without scope', () => {
      // Arrange
      const tokenId = 'test-token-id';
      const clientId = 'test-client-id';
      const refreshToken = 'test-refresh-token';
      const expiresAt = new Date('2024-12-31T23:59:59Z');
      const createdAt = new Date('2024-01-01T00:00:00Z');
      const isRevoked = true;

      // Act
      const token = new RefreshToken(
        tokenId,
        clientId,
        refreshToken,
        expiresAt,
        createdAt,
        isRevoked,
      );

      // Assert
      expect(token.isRevoked).toBe(true);
      expect(token.scope).toBeUndefined();
    });
  });

  describe('isExpired', () => {
    it('should return false when token has not expired', () => {
      // Arrange
      const futureDate = new Date(Date.now() + 60000); // 1 minute in the future
      const token = new RefreshToken(
        'token-id',
        'client-id',
        'refresh-token',
        futureDate,
        new Date(),
      );

      // Act
      const result = token.isExpired();

      // Assert
      expect(result).toBe(false);
    });

    it('should return true when token has expired', () => {
      // Arrange
      const pastDate = new Date(Date.now() - 60000); // 1 minute in the past
      const token = new RefreshToken(
        'token-id',
        'client-id',
        'refresh-token',
        pastDate,
        new Date(),
      );

      // Act
      const result = token.isExpired();

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when token expires exactly now', () => {
      // Arrange
      const now = new Date(Date.now() - 1); // 1ms in the past to ensure expiration
      const token = new RefreshToken(
        'token-id',
        'client-id',
        'refresh-token',
        now,
        new Date(),
      );

      // Act
      const result = token.isExpired();

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('isValid', () => {
    it('should return true when token is not expired and not revoked', () => {
      // Arrange
      const futureDate = new Date(Date.now() + 60000);
      const token = new RefreshToken(
        'token-id',
        'client-id',
        'refresh-token',
        futureDate,
        new Date(),
        false,
      );

      // Act
      const result = token.isValid();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when token is expired', () => {
      // Arrange
      const pastDate = new Date(Date.now() - 60000);
      const token = new RefreshToken(
        'token-id',
        'client-id',
        'refresh-token',
        pastDate,
        new Date(),
        false,
      );

      // Act
      const result = token.isValid();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when token is revoked', () => {
      // Arrange
      const futureDate = new Date(Date.now() + 60000);
      const token = new RefreshToken(
        'token-id',
        'client-id',
        'refresh-token',
        futureDate,
        new Date(),
        true, // revoked
      );

      // Act
      const result = token.isValid();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when token is both expired and revoked', () => {
      // Arrange
      const pastDate = new Date(Date.now() - 60000);
      const token = new RefreshToken(
        'token-id',
        'client-id',
        'refresh-token',
        pastDate,
        new Date(),
        true, // revoked
      );

      // Act
      const result = token.isValid();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getRemainingSeconds', () => {
    it('should return correct remaining seconds for valid token', () => {
      // Arrange
      const futureDate = new Date(Date.now() + 120000); // 2 minutes in the future
      const token = new RefreshToken(
        'token-id',
        'client-id',
        'refresh-token',
        futureDate,
        new Date(),
      );

      // Act
      const result = token.getRemainingSeconds();

      // Assert
      expect(result).toBe(120); // 2 minutes = 120 seconds
    });

    it('should return 0 for expired token', () => {
      // Arrange
      const pastDate = new Date(Date.now() - 60000);
      const token = new RefreshToken(
        'token-id',
        'client-id',
        'refresh-token',
        pastDate,
        new Date(),
      );

      // Act
      const result = token.getRemainingSeconds();

      // Assert
      expect(result).toBe(0);
    });

    it('should return 0 for token that expires exactly now', () => {
      // Arrange
      const now = new Date(Date.now());
      const token = new RefreshToken(
        'token-id',
        'client-id',
        'refresh-token',
        now,
        new Date(),
      );

      // Act
      const result = token.getRemainingSeconds();

      // Assert
      expect(result).toBe(0);
    });

    it('should floor the remaining seconds', () => {
      // Arrange
      const futureDate = new Date(Date.now() + 90500); // 90.5 seconds in the future
      const token = new RefreshToken(
        'token-id',
        'client-id',
        'refresh-token',
        futureDate,
        new Date(),
      );

      // Act
      const result = token.getRemainingSeconds();

      // Assert
      expect(result).toBe(90); // Should floor to 90
    });
  });

  describe('create', () => {
    beforeEach(() => {
      // Mock randomBytes to return predictable values
      mockRandomBytes
        .mockReturnValueOnce(Buffer.from('1234567890123456') as never) // tokenId
        .mockReturnValueOnce(
          Buffer.from('abcdefghijklmnopqrstuvwxyz123456') as never,
        ); // refreshToken
    });

    it('should create a new refresh token with default expiration', () => {
      // Arrange
      const clientId = 'test-client-id';

      // Act
      const token = RefreshToken.create(clientId);

      // Assert
      expect(token.tokenId).toBe('31323334353637383930313233343536');
      expect(token.clientId).toBe(clientId);
      expect(token.refreshToken).toBe(
        '6162636465666768696a6b6c6d6e6f707172737475767778797a313233343536',
      );
      expect(token.isRevoked).toBe(false);
      expect(token.scope).toBeUndefined();

      // Check that expiration is 7 days from creation
      const expectedExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      expect(token.expiresAt.getTime()).toBe(expectedExpiration.getTime());
    });

    it('should create a new refresh token with custom expiration', () => {
      // Arrange
      const clientId = 'test-client-id';
      const expiresInSeconds = 3600; // 1 hour

      // Act
      const token = RefreshToken.create(clientId, expiresInSeconds);

      // Assert
      expect(token.tokenId).toBe('31323334353637383930313233343536');
      expect(token.clientId).toBe(clientId);
      expect(token.refreshToken).toBe(
        '6162636465666768696a6b6c6d6e6f707172737475767778797a313233343536',
      );

      // Check that expiration is 1 hour from creation
      const expectedExpiration = new Date(Date.now() + expiresInSeconds * 1000);
      expect(token.expiresAt.getTime()).toBe(expectedExpiration.getTime());
    });

    it('should create a new refresh token with scope', () => {
      // Arrange
      const clientId = 'test-client-id';
      const expiresInSeconds = 3600;
      const scope = 'read write admin';

      // Act
      const token = RefreshToken.create(clientId, expiresInSeconds, scope);

      // Assert
      expect(token.tokenId).toBe('31323334353637383930313233343536');
      expect(token.clientId).toBe(clientId);
      expect(token.refreshToken).toBe(
        '6162636465666768696a6b6c6d6e6f707172737475767778797a313233343536',
      );
      expect(token.scope).toBe(scope);
    });

    it('should generate different tokens on multiple calls', () => {
      // Arrange - Reset and configure mock for this specific test
      mockRandomBytes.mockReset();
      mockRandomBytes
        .mockReturnValueOnce(Buffer.from('aaaaaaaaaaaaaaaa') as never)
        .mockReturnValueOnce(
          Buffer.from('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb') as never,
        )
        .mockReturnValueOnce(Buffer.from('cccccccccccccccc') as never)
        .mockReturnValueOnce(
          Buffer.from('dddddddddddddddddddddddddddddddd') as never,
        );

      // Act
      const token1 = RefreshToken.create('client1');
      const token2 = RefreshToken.create('client2');

      // Assert
      expect(token1.tokenId).toBe('61616161616161616161616161616161');
      expect(token1.refreshToken).toBe(
        '6262626262626262626262626262626262626262626262626262626262626262',
      );
      expect(token2.tokenId).toBe('63636363636363636363636363636363');
      expect(token2.refreshToken).toBe(
        '6464646464646464646464646464646464646464646464646464646464646464',
      );
      expect(token1.tokenId).not.toBe(token2.tokenId);
      expect(token1.refreshToken).not.toBe(token2.refreshToken);
    });
  });

  describe('fromData', () => {
    it('should create a refresh token from data object', () => {
      // Arrange
      const data = {
        tokenId: 'test-token-id',
        clientId: 'test-client-id',
        refreshToken: 'test-refresh-token',
        expiresAt: new Date('2024-12-31T23:59:59Z'),
        createdAt: new Date('2024-01-01T00:00:00Z'),
        isRevoked: false,
        scope: 'read write',
      };

      // Act
      const token = RefreshToken.fromData(data);

      // Assert
      expect(token.tokenId).toBe(data.tokenId);
      expect(token.clientId).toBe(data.clientId);
      expect(token.refreshToken).toBe(data.refreshToken);
      expect(token.expiresAt).toBe(data.expiresAt);
      expect(token.createdAt).toBe(data.createdAt);
      expect(token.isRevoked).toBe(data.isRevoked);
      expect(token.scope).toBe(data.scope);
    });

    it('should create a refresh token from data object without scope', () => {
      // Arrange
      const data = {
        tokenId: 'test-token-id',
        clientId: 'test-client-id',
        refreshToken: 'test-refresh-token',
        expiresAt: new Date('2024-12-31T23:59:59Z'),
        createdAt: new Date('2024-01-01T00:00:00Z'),
        isRevoked: true,
      };

      // Act
      const token = RefreshToken.fromData(data);

      // Assert
      expect(token.tokenId).toBe(data.tokenId);
      expect(token.clientId).toBe(data.clientId);
      expect(token.refreshToken).toBe(data.refreshToken);
      expect(token.expiresAt).toBe(data.expiresAt);
      expect(token.createdAt).toBe(data.createdAt);
      expect(token.isRevoked).toBe(true);
      expect(token.scope).toBeUndefined();
    });

    it('should preserve all data fields correctly', () => {
      // Arrange
      const data = {
        tokenId: 'preserve-test-id',
        clientId: 'preserve-client-id',
        refreshToken: 'preserve-refresh-token',
        expiresAt: new Date('2025-06-15T12:30:45Z'),
        createdAt: new Date('2024-06-15T12:30:45Z'),
        isRevoked: false,
        scope: 'admin superuser',
      };

      // Act
      const token = RefreshToken.fromData(data);

      // Assert
      expect(token.toPlainObject()).toEqual(data);
    });
  });

  describe('toPlainObject', () => {
    it('should convert refresh token to plain object with all fields', () => {
      // Arrange
      const tokenId = 'test-token-id';
      const clientId = 'test-client-id';
      const refreshToken = 'test-refresh-token';
      const expiresAt = new Date('2024-12-31T23:59:59Z');
      const createdAt = new Date('2024-01-01T00:00:00Z');
      const isRevoked = false;
      const scope = 'read write';

      const token = new RefreshToken(
        tokenId,
        clientId,
        refreshToken,
        expiresAt,
        createdAt,
        isRevoked,
        scope,
      );

      // Act
      const result = token.toPlainObject();

      // Assert
      expect(result).toEqual({
        tokenId,
        clientId,
        refreshToken,
        expiresAt,
        createdAt,
        isRevoked,
        scope,
      });
    });

    it('should convert refresh token to plain object without scope', () => {
      // Arrange
      const tokenId = 'test-token-id';
      const clientId = 'test-client-id';
      const refreshToken = 'test-refresh-token';
      const expiresAt = new Date('2024-12-31T23:59:59Z');
      const createdAt = new Date('2024-01-01T00:00:00Z');
      const isRevoked = true;

      const token = new RefreshToken(
        tokenId,
        clientId,
        refreshToken,
        expiresAt,
        createdAt,
        isRevoked,
      );

      // Act
      const result = token.toPlainObject();

      // Assert
      expect(result).toEqual({
        tokenId,
        clientId,
        refreshToken,
        expiresAt,
        createdAt,
        isRevoked,
        scope: undefined,
      });
    });

    it('should maintain object structure consistency', () => {
      // Arrange
      const originalData = {
        tokenId: 'consistency-test-id',
        clientId: 'consistency-client-id',
        refreshToken: 'consistency-refresh-token',
        expiresAt: new Date('2024-12-25T18:00:00Z'),
        createdAt: new Date('2024-12-24T18:00:00Z'),
        isRevoked: false,
        scope: 'test scope',
      };

      // Act
      const token = RefreshToken.fromData(originalData);
      const convertedData = token.toPlainObject();

      // Assert
      expect(convertedData).toEqual(originalData);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete token lifecycle', () => {
      // Arrange
      mockRandomBytes
        .mockReturnValueOnce(Buffer.from('lifecycle12345678') as never)
        .mockReturnValueOnce(
          Buffer.from('refreshlifecycle1234567890123456') as never,
        );

      const clientId = 'lifecycle-client';
      const scope = 'lifecycle read write';

      // Act - Create token
      const createdToken = RefreshToken.create(clientId, 3600, scope);

      // Act - Convert to plain object (simulating storage)
      const storedData = createdToken.toPlainObject();

      // Act - Recreate from stored data
      const retrievedToken = RefreshToken.fromData(storedData);

      // Assert - All data preserved
      expect(retrievedToken.tokenId).toBe(createdToken.tokenId);
      expect(retrievedToken.clientId).toBe(createdToken.clientId);
      expect(retrievedToken.refreshToken).toBe(createdToken.refreshToken);
      expect(retrievedToken.expiresAt.getTime()).toBe(
        createdToken.expiresAt.getTime(),
      );
      expect(retrievedToken.createdAt.getTime()).toBe(
        createdToken.createdAt.getTime(),
      );
      expect(retrievedToken.isRevoked).toBe(createdToken.isRevoked);
      expect(retrievedToken.scope).toBe(createdToken.scope);

      // Assert - Token is valid
      expect(retrievedToken.isValid()).toBe(true);
      expect(retrievedToken.getRemainingSeconds()).toBeGreaterThan(0);
    });

    it('should handle token expiration correctly', () => {
      // Arrange
      const pastDate = new Date(Date.now() - 1000); // 1 second ago
      const expiredToken = new RefreshToken(
        'expired-id',
        'client-id',
        'expired-token',
        pastDate,
        new Date(Date.now() - 2000),
        false,
      );

      // Assert
      expect(expiredToken.isExpired()).toBe(true);
      expect(expiredToken.isValid()).toBe(false);
      expect(expiredToken.getRemainingSeconds()).toBe(0);
    });

    it('should handle revoked token correctly', () => {
      // Arrange
      const futureDate = new Date(Date.now() + 3600000); // 1 hour from now
      const revokedToken = new RefreshToken(
        'revoked-id',
        'client-id',
        'revoked-token',
        futureDate,
        new Date(),
        true, // revoked
      );

      // Assert
      expect(revokedToken.isExpired()).toBe(false);
      expect(revokedToken.isValid()).toBe(false);
      expect(revokedToken.getRemainingSeconds()).toBeGreaterThan(0);
    });
  });
});
