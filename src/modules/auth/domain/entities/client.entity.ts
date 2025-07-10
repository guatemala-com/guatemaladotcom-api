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
    private readonly _certificateFingerprint?: string, // Optional certificate fingerprint
    private readonly _requiresCertificate?: boolean, // Whether certificate is required
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
   * Get the certificate fingerprint
   */
  get certificateFingerprint(): string | undefined {
    return this._certificateFingerprint;
  }

  /**
   * Check if this client requires certificate authentication
   */
  get requiresCertificate(): boolean {
    return this._requiresCertificate || false;
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
   * Validate client certificate fingerprint
   */
  validateCertificate(providedFingerprint?: string): boolean {
    // If client doesn't require certificate, always valid
    if (!this.requiresCertificate) {
      return true;
    }

    // If client requires certificate but none provided, invalid
    if (this.requiresCertificate && !providedFingerprint) {
      return false;
    }

    // If client has configured fingerprint, validate it
    if (this._certificateFingerprint) {
      return this._certificateFingerprint === providedFingerprint;
    }

    // If no fingerprint configured but certificate provided, accept any valid certificate
    return true;
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
    certificateFingerprint?: string;
    requiresCertificate?: boolean;
  }): Client {
    return new Client(
      config.clientId,
      config.clientSecret,
      config.allowedScopes,
      config.certificateFingerprint,
      config.requiresCertificate,
    );
  }
}
