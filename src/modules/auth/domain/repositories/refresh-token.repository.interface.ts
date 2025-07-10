import { RefreshToken } from '../entities/refresh-token.entity';

/**
 * Refresh Token Repository Interface
 *
 * Defines the contract for refresh token storage and retrieval operations.
 * This interface belongs to the domain layer.
 */
export interface RefreshTokenRepository {
  /**
   * Save a refresh token
   */
  save(refreshToken: RefreshToken): Promise<void>;

  /**
   * Find a refresh token by token string
   */
  findByToken(token: string): Promise<RefreshToken | null>;

  /**
   * Find all refresh tokens for a client
   */
  findByClientId(clientId: string): Promise<RefreshToken[]>;

  /**
   * Revoke a refresh token
   */
  revoke(tokenId: string): Promise<void>;

  /**
   * Revoke all refresh tokens for a client
   */
  revokeAllForClient(clientId: string): Promise<void>;

  /**
   * Delete expired refresh tokens
   */
  deleteExpired(): Promise<void>;

  /**
   * Delete a refresh token by token string
   */
  deleteByToken(token: string): Promise<void>;

  /**
   * Count active refresh tokens for a client
   */
  countActiveForClient(clientId: string): Promise<number>;
}
