import { Token } from '../entities/token.entity';

/**
 * Token Repository Interface
 *
 * Defines the contract for token operations.
 * This interface belongs to the domain layer and is implemented by infrastructure.
 */
export interface TokenRepository {
  /**
   * Generate a new access token
   */
  generateToken(clientId: string, scope?: string): Promise<Token>;

  /**
   * Validate and decode a token
   */
  validateToken(tokenString: string): Promise<Token>;

  /**
   * Check if a token has a specific scope
   */
  hasScope(tokenString: string, requiredScope: string): Promise<boolean>;
}
