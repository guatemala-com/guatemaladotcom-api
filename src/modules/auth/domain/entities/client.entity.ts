/**
 * OAuth Client Entity
 *
 * Represents an OAuth client with its credentials and allowed scopes.
 * This is a domain entity that encapsulates the business rules for clients.
 */
export class Client {
  constructor(
    private readonly _clientId: string,
    private readonly _clientSecret: string,
    private readonly _allowedScopes: string[],
  ) {}

  /**
   * Get the client ID
   */
  get clientId(): string {
    return this._clientId;
  }

  /**
   * Get the client secret
   */
  get clientSecret(): string {
    return this._clientSecret;
  }

  /**
   * Get the allowed scopes for this client
   */
  get allowedScopes(): string[] {
    return [...this._allowedScopes]; // Return a copy to prevent mutation
  }

  /**
   * Check if the client has a specific scope
   */
  hasScope(scope: string): boolean {
    return this._allowedScopes.includes(scope);
  }

  /**
   * Check if the client has all the specified scopes
   */
  hasAllScopes(scopes: string[]): boolean {
    return scopes.every((scope) => this.hasScope(scope));
  }

  /**
   * Check if the client has any of the specified scopes
   */
  hasAnyScope(scopes: string[]): boolean {
    return scopes.some((scope) => this.hasScope(scope));
  }

  /**
   * Validate client credentials
   */
  validateCredentials(clientSecret: string): boolean {
    return this._clientSecret === clientSecret;
  }

  /**
   * Validate and filter requested scopes
   * Returns the validated scopes or throws an error if unauthorized
   */
  validateAndFilterScopes(requestedScopes?: string): string {
    if (!requestedScopes || requestedScopes.trim() === '') {
      return '';
    }

    const requestedScopesList = requestedScopes
      .split(' ')
      .map((scope) => scope.trim())
      .filter((scope) => scope.length > 0);

    const invalidScopes = requestedScopesList.filter(
      (scope) => !this.hasScope(scope),
    );

    if (invalidScopes.length > 0) {
      throw new Error(
        `Client is not authorized for scopes: ${invalidScopes.join(', ')}. ` +
          `Allowed scopes: ${this._allowedScopes.join(', ')}`,
      );
    }

    return requestedScopesList.join(' ');
  }

  /**
   * Create a Client from configuration data
   */
  static fromConfig(config: {
    clientId: string;
    clientSecret: string;
    allowedScopes: string[];
  }): Client {
    return new Client(
      config.clientId,
      config.clientSecret,
      config.allowedScopes,
    );
  }
}
