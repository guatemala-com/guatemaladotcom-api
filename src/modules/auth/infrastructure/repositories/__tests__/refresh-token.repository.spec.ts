import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenRepositoryImpl } from '../refresh-token.repository';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';

describe('RefreshTokenRepositoryImpl', () => {
  let repository: RefreshTokenRepositoryImpl;
  let testTokens: RefreshToken[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefreshTokenRepositoryImpl],
    }).compile();

    repository = module.get<RefreshTokenRepositoryImpl>(
      RefreshTokenRepositoryImpl,
    );

    // Clear repository before each test
    await repository.clearAll();

    // Create test tokens
    testTokens = [
      new RefreshToken(
        'token-1',
        'client-1',
        'refresh-token-1',
        new Date(Date.now() + 3600000), // 1 hour from now
        new Date(),
        false,
        'read write',
      ),
      new RefreshToken(
        'token-2',
        'client-1',
        'refresh-token-2',
        new Date(Date.now() + 7200000), // 2 hours from now
        new Date(),
        false,
        'read',
      ),
      new RefreshToken(
        'token-3',
        'client-2',
        'refresh-token-3',
        new Date(Date.now() + 3600000), // 1 hour from now
        new Date(),
        false,
        'admin',
      ),
      new RefreshToken(
        'token-4',
        'client-1',
        'refresh-token-4',
        new Date(Date.now() - 3600000), // 1 hour ago (expired)
        new Date(),
        false,
        'read',
      ),
      new RefreshToken(
        'token-5',
        'client-2',
        'refresh-token-5',
        new Date(Date.now() + 3600000), // 1 hour from now
        new Date(),
        true, // revoked
        'write',
      ),
    ];
  });

  afterEach(async () => {
    await repository.clearAll();
  });

  describe('implementation', () => {
    it('should be defined', () => {
      expect(repository).toBeDefined();
    });

    it('should implement RefreshTokenRepository interface', () => {
      expect(repository).toBeInstanceOf(RefreshTokenRepositoryImpl);
      expect(typeof repository.save).toBe('function');
      expect(typeof repository.findByToken).toBe('function');
      expect(typeof repository.findByClientId).toBe('function');
      expect(typeof repository.revoke).toBe('function');
      expect(typeof repository.revokeAllForClient).toBe('function');
      expect(typeof repository.deleteExpired).toBe('function');
      expect(typeof repository.deleteByToken).toBe('function');
      expect(typeof repository.countActiveForClient).toBe('function');
    });
  });

  describe('save', () => {
    it('should save a refresh token', async () => {
      // Arrange
      const token = testTokens[0];

      // Act
      await repository.save(token);

      // Assert
      const saved = await repository.findByToken(token.refreshToken);
      expect(saved).toBeDefined();
      expect(saved?.tokenId).toBe(token.tokenId);
      expect(saved?.clientId).toBe(token.clientId);
      expect(saved?.refreshToken).toBe(token.refreshToken);
      expect(saved?.scope).toBe(token.scope);
    });

    it('should overwrite existing token with same refresh token string', async () => {
      // Arrange
      const token1 = testTokens[0];
      const token2 = new RefreshToken(
        'different-token-id',
        'different-client',
        token1.refreshToken, // same refresh token string
        new Date(Date.now() + 7200000),
        new Date(),
        false,
        'admin',
      );

      // Act
      await repository.save(token1);
      await repository.save(token2);

      // Assert
      const saved = await repository.findByToken(token1.refreshToken);
      expect(saved).toBeDefined();
      expect(saved?.tokenId).toBe(token2.tokenId);
      expect(saved?.clientId).toBe(token2.clientId);
      expect(saved?.scope).toBe(token2.scope);
    });

    it('should save multiple tokens', async () => {
      // Arrange & Act
      for (const token of testTokens.slice(0, 3)) {
        await repository.save(token);
      }

      // Assert
      const allTokens = await repository.getAllTokens();
      expect(allTokens).toHaveLength(3);
    });
  });

  describe('findByToken', () => {
    beforeEach(async () => {
      // Save test tokens
      for (const token of testTokens) {
        await repository.save(token);
      }
    });

    it('should find existing token by token string', async () => {
      // Arrange
      const targetToken = testTokens[0];

      // Act
      const result = await repository.findByToken(targetToken.refreshToken);

      // Assert
      expect(result).toBeDefined();
      expect(result?.tokenId).toBe(targetToken.tokenId);
      expect(result?.clientId).toBe(targetToken.clientId);
      expect(result?.refreshToken).toBe(targetToken.refreshToken);
    });

    it('should return null for non-existent token', async () => {
      // Act
      const result = await repository.findByToken('non-existent-token');

      // Assert
      expect(result).toBeNull();
    });

    it('should find expired token', async () => {
      // Arrange
      const expiredToken = testTokens[3];

      // Act
      const result = await repository.findByToken(expiredToken.refreshToken);

      // Assert
      expect(result).toBeDefined();
      expect(result?.tokenId).toBe(expiredToken.tokenId);
      expect(result?.isExpired()).toBe(true);
    });

    it('should find revoked token', async () => {
      // Arrange
      const revokedToken = testTokens[4];

      // Act
      const result = await repository.findByToken(revokedToken.refreshToken);

      // Assert
      expect(result).toBeDefined();
      expect(result?.tokenId).toBe(revokedToken.tokenId);
      expect(result?.isRevoked).toBe(true);
    });
  });

  describe('findByClientId', () => {
    beforeEach(async () => {
      // Save test tokens
      for (const token of testTokens) {
        await repository.save(token);
      }
    });

    it('should find all tokens for a client', async () => {
      // Act
      const result = await repository.findByClientId('client-1');

      // Assert
      expect(result).toHaveLength(3);
      expect(result.every((token) => token.clientId === 'client-1')).toBe(true);
    });

    it('should find tokens for client with fewer tokens', async () => {
      // Act
      const result = await repository.findByClientId('client-2');

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every((token) => token.clientId === 'client-2')).toBe(true);
    });

    it('should return empty array for non-existent client', async () => {
      // Act
      const result = await repository.findByClientId('non-existent-client');

      // Assert
      expect(result).toEqual([]);
    });

    it('should include expired and revoked tokens', async () => {
      // Act
      const result = await repository.findByClientId('client-1');

      // Assert
      const expiredToken = result.find((token) => token.isExpired());
      expect(expiredToken).toBeDefined();
      expect(result).toHaveLength(3);
    });
  });

  describe('revoke', () => {
    beforeEach(async () => {
      // Save test tokens
      for (const token of testTokens.slice(0, 3)) {
        await repository.save(token);
      }
    });

    it('should revoke token by token ID', async () => {
      // Arrange
      const targetToken = testTokens[0];

      // Act
      await repository.revoke(targetToken.tokenId);

      // Assert
      const revokedToken = await repository.findByToken(
        targetToken.refreshToken,
      );
      expect(revokedToken).toBeDefined();
      expect(revokedToken?.isRevoked).toBe(true);
      expect(revokedToken?.tokenId).toBe(targetToken.tokenId);
    });

    it('should not affect other tokens when revoking', async () => {
      // Arrange
      const targetToken = testTokens[0];
      const otherToken = testTokens[1];

      // Act
      await repository.revoke(targetToken.tokenId);

      // Assert
      const revokedToken = await repository.findByToken(
        targetToken.refreshToken,
      );
      const otherTokenResult = await repository.findByToken(
        otherToken.refreshToken,
      );

      expect(revokedToken?.isRevoked).toBe(true);
      expect(otherTokenResult?.isRevoked).toBe(false);
    });

    it('should handle revoke of non-existent token ID', async () => {
      // Act & Assert - should not throw
      await expect(
        repository.revoke('non-existent-token-id'),
      ).resolves.not.toThrow();
    });

    it('should maintain other token properties when revoking', async () => {
      // Arrange
      const targetToken = testTokens[0];

      // Act
      await repository.revoke(targetToken.tokenId);

      // Assert
      const revokedToken = await repository.findByToken(
        targetToken.refreshToken,
      );
      expect(revokedToken?.tokenId).toBe(targetToken.tokenId);
      expect(revokedToken?.clientId).toBe(targetToken.clientId);
      expect(revokedToken?.refreshToken).toBe(targetToken.refreshToken);
      expect(revokedToken?.scope).toBe(targetToken.scope);
      expect(revokedToken?.expiresAt).toEqual(targetToken.expiresAt);
    });
  });

  describe('revokeAllForClient', () => {
    beforeEach(async () => {
      // Save test tokens
      for (const token of testTokens.slice(0, 4)) {
        await repository.save(token);
      }
    });

    it('should revoke all tokens for a client', async () => {
      // Act
      await repository.revokeAllForClient('client-1');

      // Assert
      const client1Tokens = await repository.findByClientId('client-1');
      expect(client1Tokens).toHaveLength(3);
      expect(client1Tokens.every((token) => token.isRevoked)).toBe(true);
    });

    it('should not affect tokens from other clients', async () => {
      // Act
      await repository.revokeAllForClient('client-1');

      // Assert
      const client2Tokens = await repository.findByClientId('client-2');
      expect(client2Tokens).toHaveLength(1);
      expect(client2Tokens.every((token) => !token.isRevoked)).toBe(true);
    });

    it('should handle non-existent client', async () => {
      // Act & Assert - should not throw
      await expect(
        repository.revokeAllForClient('non-existent-client'),
      ).resolves.not.toThrow();
    });

    it('should revoke expired tokens as well', async () => {
      // Act
      await repository.revokeAllForClient('client-1');

      // Assert
      const expiredToken = await repository.findByToken(
        testTokens[3].refreshToken,
      );
      expect(expiredToken?.isRevoked).toBe(true);
    });
  });

  describe('deleteExpired', () => {
    beforeEach(async () => {
      // Save test tokens including expired ones
      for (const token of testTokens) {
        await repository.save(token);
      }
    });

    it('should delete expired tokens', async () => {
      // Act
      await repository.deleteExpired();

      // Assert
      const expiredToken = await repository.findByToken(
        testTokens[3].refreshToken,
      );
      expect(expiredToken).toBeNull();
    });

    it('should not delete valid tokens', async () => {
      // Act
      await repository.deleteExpired();

      // Assert
      const validToken = await repository.findByToken(
        testTokens[0].refreshToken,
      );
      expect(validToken).toBeDefined();
    });

    it('should delete only expired tokens', async () => {
      // Act
      await repository.deleteExpired();

      // Assert
      const allTokens = await repository.getAllTokens();
      expect(allTokens).toHaveLength(4); // 5 - 1 expired
      expect(allTokens.some((token) => token.isExpired())).toBe(false);
    });

    it('should handle empty repository', async () => {
      // Arrange
      await repository.clearAll();

      // Act & Assert - should not throw
      await expect(repository.deleteExpired()).resolves.not.toThrow();
    });
  });

  describe('deleteByToken', () => {
    beforeEach(async () => {
      // Save test tokens
      for (const token of testTokens.slice(0, 3)) {
        await repository.save(token);
      }
    });

    it('should delete token by token string', async () => {
      // Arrange
      const targetToken = testTokens[0];

      // Act
      await repository.deleteByToken(targetToken.refreshToken);

      // Assert
      const deletedToken = await repository.findByToken(
        targetToken.refreshToken,
      );
      expect(deletedToken).toBeNull();
    });

    it('should not affect other tokens', async () => {
      // Arrange
      const targetToken = testTokens[0];
      const otherToken = testTokens[1];

      // Act
      await repository.deleteByToken(targetToken.refreshToken);

      // Assert
      const deletedToken = await repository.findByToken(
        targetToken.refreshToken,
      );
      const otherTokenResult = await repository.findByToken(
        otherToken.refreshToken,
      );

      expect(deletedToken).toBeNull();
      expect(otherTokenResult).toBeDefined();
    });

    it('should handle non-existent token', async () => {
      // Act & Assert - should not throw
      await expect(
        repository.deleteByToken('non-existent-token'),
      ).resolves.not.toThrow();
    });
  });

  describe('countActiveForClient', () => {
    beforeEach(async () => {
      // Save test tokens
      for (const token of testTokens) {
        await repository.save(token);
      }
    });

    it('should count only active tokens for client', async () => {
      // Act
      const count = await repository.countActiveForClient('client-1');

      // Assert - client-1 has 3 tokens: 2 active, 1 expired
      expect(count).toBe(2);
    });

    it('should not count expired tokens', async () => {
      // Act
      const count = await repository.countActiveForClient('client-1');

      // Assert - expired token should not be counted
      expect(count).toBe(2);
    });

    it('should not count revoked tokens', async () => {
      // Act
      const count = await repository.countActiveForClient('client-2');

      // Assert - client-2 has 2 tokens: 1 active, 1 revoked
      expect(count).toBe(1);
    });

    it('should return 0 for non-existent client', async () => {
      // Act
      const count = await repository.countActiveForClient(
        'non-existent-client',
      );

      // Assert
      expect(count).toBe(0);
    });

    it('should return 0 for client with no active tokens', async () => {
      // Arrange - revoke all tokens for client-1
      await repository.revokeAllForClient('client-1');

      // Act
      const count = await repository.countActiveForClient('client-1');

      // Assert
      expect(count).toBe(0);
    });
  });

  describe('getAllTokens', () => {
    it('should return empty array when no tokens', async () => {
      // Act
      const tokens = await repository.getAllTokens();

      // Assert
      expect(tokens).toEqual([]);
    });

    it('should return all saved tokens', async () => {
      // Arrange
      for (const token of testTokens.slice(0, 3)) {
        await repository.save(token);
      }

      // Act
      const tokens = await repository.getAllTokens();

      // Assert
      expect(tokens).toHaveLength(3);
      expect(tokens.map((t) => t.tokenId)).toEqual(
        expect.arrayContaining(['token-1', 'token-2', 'token-3']),
      );
    });

    it('should return same token references', async () => {
      // Arrange
      await repository.save(testTokens[0]);

      // Act
      const tokens = await repository.getAllTokens();
      const originalToken = await repository.findByToken(
        testTokens[0].refreshToken,
      );

      // Assert
      expect(tokens[0]).toEqual(originalToken);
      expect(tokens[0]).toBe(originalToken); // Same object references in this implementation
    });
  });

  describe('clearAll', () => {
    it('should clear all tokens', async () => {
      // Arrange
      for (const token of testTokens) {
        await repository.save(token);
      }

      // Act
      await repository.clearAll();

      // Assert
      const tokens = await repository.getAllTokens();
      expect(tokens).toHaveLength(0);
    });

    it('should work on empty repository', async () => {
      // Act & Assert - should not throw
      await expect(repository.clearAll()).resolves.not.toThrow();
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete token lifecycle', async () => {
      // Create token
      const token = testTokens[0];
      await repository.save(token);

      // Find token
      const found = await repository.findByToken(token.refreshToken);
      expect(found).toBeDefined();

      // Count active
      const initialCount = await repository.countActiveForClient(
        token.clientId,
      );
      expect(initialCount).toBe(1);

      // Revoke token
      await repository.revoke(token.tokenId);

      // Count active after revoke
      const afterRevokeCount = await repository.countActiveForClient(
        token.clientId,
      );
      expect(afterRevokeCount).toBe(0);

      // Delete token
      await repository.deleteByToken(token.refreshToken);

      // Verify deleted
      const deleted = await repository.findByToken(token.refreshToken);
      expect(deleted).toBeNull();
    });

    it('should handle multiple clients with mixed token states', async () => {
      // Arrange - Save all test tokens
      for (const token of testTokens) {
        await repository.save(token);
      }

      // Act & Assert - Verify initial state
      const client1Count = await repository.countActiveForClient('client-1');
      const client2Count = await repository.countActiveForClient('client-2');
      expect(client1Count).toBe(2); // 2 active, 1 expired
      expect(client2Count).toBe(1); // 1 active, 1 revoked

      // Revoke all for client-1
      await repository.revokeAllForClient('client-1');

      // Verify counts after revoke
      const client1CountAfterRevoke =
        await repository.countActiveForClient('client-1');
      const client2CountAfterRevoke =
        await repository.countActiveForClient('client-2');
      expect(client1CountAfterRevoke).toBe(0);
      expect(client2CountAfterRevoke).toBe(1); // Unchanged

      // Delete expired tokens
      await repository.deleteExpired();

      // Verify final state
      const finalTokens = await repository.getAllTokens();
      expect(finalTokens).toHaveLength(4); // 5 - 1 expired
      expect(finalTokens.some((token) => token.isExpired())).toBe(false);
    });

    it('should handle token replacement and cleanup', async () => {
      // Create initial token
      const token1 = testTokens[0];
      await repository.save(token1);

      // Replace with new token (same refresh token string)
      const token2 = new RefreshToken(
        'new-token-id',
        token1.clientId,
        token1.refreshToken,
        new Date(Date.now() + 7200000),
        new Date(),
        false,
        'admin',
      );
      await repository.save(token2);

      // Verify replacement
      const found = await repository.findByToken(token1.refreshToken);
      expect(found?.tokenId).toBe(token2.tokenId);
      expect(found?.scope).toBe(token2.scope);

      // Verify count is still 1
      const count = await repository.countActiveForClient(token1.clientId);
      expect(count).toBe(1);

      // Clear all
      await repository.clearAll();

      // Verify empty
      const finalCount = await repository.countActiveForClient(token1.clientId);
      expect(finalCount).toBe(0);
    });
  });
});
