/**
 * OAuth Token Entity
 *
 * Represents an OAuth access token with its payload and validation logic.
 * This is a domain entity that encapsulates the business rules for tokens.
 */
export interface TokenPayload {
  sub: string; // clientId
  aud: string; // audience
  iss: string; // issuer
  iat: number; // issued at
  exp: number; // expiration
  scope?: string;
}

export class Token {
  constructor(
    private readonly _accessToken: string,
    private readonly _payload: TokenPayload,
  ) {}

  /**
   * Get the access token string
   */
  get accessToken(): string {
    return this._accessToken;
  }

  /**
   * Get the token payload
   */
  get payload(): TokenPayload {
    return { ...this._payload }; // Return a copy to prevent mutation
  }

  /**
   * Get the client ID from the token
   */
  get clientId(): string {
    return this._payload.sub;
  }

  /**
   * Get the scopes from the token
   */
  get scopes(): string[] {
    if (!this._payload.scope) {
      return [];
    }
    return this._payload.scope.split(' ');
  }

  /**
   * Check if the token has expired
   */
  isExpired(): boolean {
    const now = Math.floor(Date.now() / 1000);
    return this._payload.exp < now;
  }

  /**
   * Check if the token has a specific scope
   */
  hasScope(scope: string): boolean {
    return this.scopes.includes(scope);
  }

  /**
   * Check if the token has all the specified scopes
   */
  hasAllScopes(scopes: string[]): boolean {
    return scopes.every((scope) => this.hasScope(scope));
  }

  /**
   * Check if the token has any of the specified scopes
   */
  hasAnyScope(scopes: string[]): boolean {
    return scopes.some((scope) => this.hasScope(scope));
  }

  /**
   * Get token information for verification response
   */
  getVerificationInfo() {
    return {
      client_id: this.clientId,
      issuer: this._payload.iss,
      audience: this._payload.aud,
      issued_at: new Date(this._payload.iat * 1000).toISOString(),
      expires_at: new Date(this._payload.exp * 1000).toISOString(),
      scope: this._payload.scope,
    };
  }

  /**
   * Create a Token from JWT string and payload
   */
  static fromJWT(accessToken: string, payload: TokenPayload): Token {
    return new Token(accessToken, payload);
  }
}
