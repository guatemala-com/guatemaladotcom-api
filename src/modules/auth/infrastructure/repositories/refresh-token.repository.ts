import { Injectable } from '@nestjs/common';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';

/**
 * Refresh Token Repository Implementation
 *
 * Implements the refresh token repository interface using in-memory storage.
 * In production, this would be replaced with a proper database implementation.
 * This belongs to the infrastructure layer.
 */
@Injectable()
export class RefreshTokenRepositoryImpl implements RefreshTokenRepository {
  private readonly refreshTokens: Map<string, RefreshToken> = new Map();

  /**
   * Save a refresh token
   */
  async save(refreshToken: RefreshToken): Promise<void> {
    this.refreshTokens.set(refreshToken.refreshToken, refreshToken);
    return Promise.resolve();
  }

  /**
   * Find a refresh token by token string
   */
  async findByToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = this.refreshTokens.get(token);
    return Promise.resolve(refreshToken || null);
  }

  /**
   * Find all refresh tokens for a client
   */
  async findByClientId(clientId: string): Promise<RefreshToken[]> {
    const tokens: RefreshToken[] = [];

    for (const token of this.refreshTokens.values()) {
      if (token.clientId === clientId) {
        tokens.push(token);
      }
    }

    return Promise.resolve(tokens);
  }

  /**
   * Revoke a refresh token
   */
  async revoke(tokenId: string): Promise<void> {
    for (const [tokenString, token] of this.refreshTokens) {
      if (token.tokenId === tokenId) {
        const revokedToken = RefreshToken.fromData({
          ...token.toPlainObject(),
          isRevoked: true,
        });
        this.refreshTokens.set(tokenString, revokedToken);
        break;
      }
    }
    return Promise.resolve();
  }

  /**
   * Revoke all refresh tokens for a client
   */
  async revokeAllForClient(clientId: string): Promise<void> {
    for (const [tokenString, token] of this.refreshTokens) {
      if (token.clientId === clientId) {
        const revokedToken = RefreshToken.fromData({
          ...token.toPlainObject(),
          isRevoked: true,
        });
        this.refreshTokens.set(tokenString, revokedToken);
      }
    }
    return Promise.resolve();
  }

  /**
   * Delete expired refresh tokens
   */
  async deleteExpired(): Promise<void> {
    for (const [tokenString, token] of this.refreshTokens) {
      if (token.isExpired()) {
        this.refreshTokens.delete(tokenString);
      }
    }
    return Promise.resolve();
  }

  /**
   * Delete a refresh token by token string
   */
  async deleteByToken(token: string): Promise<void> {
    this.refreshTokens.delete(token);
    return Promise.resolve();
  }

  /**
   * Count active refresh tokens for a client
   */
  async countActiveForClient(clientId: string): Promise<number> {
    let count = 0;

    for (const token of this.refreshTokens.values()) {
      if (token.clientId === clientId && token.isValid()) {
        count++;
      }
    }

    return Promise.resolve(count);
  }

  /**
   * Get all refresh tokens (for testing purposes)
   */
  async getAllTokens(): Promise<RefreshToken[]> {
    return Promise.resolve(Array.from(this.refreshTokens.values()));
  }

  /**
   * Clear all refresh tokens (for testing purposes)
   */
  async clearAll(): Promise<void> {
    this.refreshTokens.clear();
    return Promise.resolve();
  }
}
