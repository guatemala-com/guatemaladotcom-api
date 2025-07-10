import { randomBytes } from 'crypto';

/**
 * Refresh Token Entity
 *
 * Represents a refresh token with its metadata and validation logic.
 * This is a domain entity that encapsulates the business rules for refresh tokens.
 */
export class RefreshToken {
  constructor(
    private readonly _tokenId: string,
    private readonly _clientId: string,
    private readonly _refreshToken: string,
    private readonly _expiresAt: Date,
    private readonly _createdAt: Date,
    private readonly _isRevoked: boolean = false,
    private readonly _scope?: string,
  ) {}

  /**
   * Get the token ID
   */
  get tokenId(): string {
    return this._tokenId;
  }

  /**
   * Get the client ID
   */
  get clientId(): string {
    return this._clientId;
  }

  /**
   * Get the refresh token string
   */
  get refreshToken(): string {
    return this._refreshToken;
  }

  /**
   * Get the expiration date
   */
  get expiresAt(): Date {
    return this._expiresAt;
  }

  /**
   * Get the creation date
   */
  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * Check if the token is revoked
   */
  get isRevoked(): boolean {
    return this._isRevoked;
  }

  /**
   * Get the scope
   */
  get scope(): string | undefined {
    return this._scope;
  }

  /**
   * Check if the refresh token has expired
   */
  isExpired(): boolean {
    return new Date() > this._expiresAt;
  }

  /**
   * Check if the refresh token is valid (not expired and not revoked)
   */
  isValid(): boolean {
    return !this.isExpired() && !this.isRevoked;
  }

  /**
   * Get the remaining time in seconds until expiration
   */
  getRemainingSeconds(): number {
    if (this.isExpired()) {
      return 0;
    }
    return Math.floor((this._expiresAt.getTime() - Date.now()) / 1000);
  }

  /**
   * Create a new refresh token
   */
  static create(
    clientId: string,
    expiresInSeconds: number = 7 * 24 * 60 * 60, // 7 days default
    scope?: string,
  ): RefreshToken {
    const tokenId = randomBytes(16).toString('hex');
    const refreshToken = randomBytes(32).toString('hex');
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + expiresInSeconds * 1000);

    return new RefreshToken(
      tokenId,
      clientId,
      refreshToken,
      expiresAt,
      createdAt,
      false,
      scope,
    );
  }

  /**
   * Create a RefreshToken from stored data
   */
  static fromData(data: {
    tokenId: string;
    clientId: string;
    refreshToken: string;
    expiresAt: Date;
    createdAt: Date;
    isRevoked: boolean;
    scope?: string;
  }): RefreshToken {
    return new RefreshToken(
      data.tokenId,
      data.clientId,
      data.refreshToken,
      data.expiresAt,
      data.createdAt,
      data.isRevoked,
      data.scope,
    );
  }

  /**
   * Convert to plain object for storage
   */
  toPlainObject(): {
    tokenId: string;
    clientId: string;
    refreshToken: string;
    expiresAt: Date;
    createdAt: Date;
    isRevoked: boolean;
    scope?: string;
  } {
    return {
      tokenId: this._tokenId,
      clientId: this._clientId,
      refreshToken: this._refreshToken,
      expiresAt: this._expiresAt,
      createdAt: this._createdAt,
      isRevoked: this._isRevoked,
      scope: this._scope,
    };
  }
}
