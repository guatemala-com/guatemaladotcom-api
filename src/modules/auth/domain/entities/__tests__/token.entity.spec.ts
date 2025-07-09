import { Token, TokenPayload } from '../token.entity';

describe('Token', () => {
  let token: Token;
  let payload: TokenPayload;
  const now = Math.floor(Date.now() / 1000);

  beforeEach(() => {
    payload = {
      sub: 'test-client-id',
      aud: 'test-audience',
      iss: 'test-issuer',
      iat: now,
      exp: now + 3600, // 1 hour from now
      scope: 'read write admin',
    };
    token = new Token('test-access-token', payload);
  });

  describe('constructor and getters', () => {
    it('should create a token with correct properties', () => {
      // Assert
      expect(token.accessToken).toBe('test-access-token');
      expect(token.clientId).toBe('test-client-id');
      expect(token.scopes).toEqual(['read', 'write', 'admin']);
    });

    it('should return a copy of payload to prevent mutation', () => {
      // Act
      const tokenPayload = token.payload;
      tokenPayload.sub = 'modified-client-id';

      // Assert
      expect(token.clientId).toBe('test-client-id');
      expect(tokenPayload.sub).toBe('modified-client-id');
    });

    it('should handle token without scope', () => {
      // Arrange
      const payloadWithoutScope = { ...payload };
      delete payloadWithoutScope.scope;
      const tokenWithoutScope = new Token('test-token', payloadWithoutScope);

      // Assert
      expect(tokenWithoutScope.scopes).toEqual([]);
      expect(tokenWithoutScope.payload.scope).toBeUndefined();
    });

    it('should handle token with empty scope', () => {
      // Arrange
      const payloadWithEmptyScope = { ...payload, scope: '' };
      const tokenWithEmptyScope = new Token(
        'test-token',
        payloadWithEmptyScope,
      );

      // Assert
      expect(tokenWithEmptyScope.scopes).toEqual([]);
    });
  });

  describe('scopes', () => {
    it('should return scopes as array', () => {
      // Act & Assert
      expect(token.scopes).toEqual(['read', 'write', 'admin']);
    });

    it('should handle single scope', () => {
      // Arrange
      const singleScopePayload = { ...payload, scope: 'read' };
      const singleScopeToken = new Token('test-token', singleScopePayload);

      // Act & Assert
      expect(singleScopeToken.scopes).toEqual(['read']);
    });

    it('should handle scopes with extra whitespace', () => {
      // Arrange
      const whitespaceScopePayload = { ...payload, scope: '  read   write  ' };
      const whitespaceScopeToken = new Token(
        'test-token',
        whitespaceScopePayload,
      );

      // Act & Assert
      expect(whitespaceScopeToken.scopes).toEqual([
        '',
        '',
        'read',
        '',
        '',
        'write',
        '',
        '',
      ]);
    });

    it('should return empty array when no scope', () => {
      // Arrange
      const noScopePayload = { ...payload };
      delete noScopePayload.scope;
      const noScopeToken = new Token('test-token', noScopePayload);

      // Act & Assert
      expect(noScopeToken.scopes).toEqual([]);
    });
  });

  describe('isExpired', () => {
    it('should return false for non-expired token', () => {
      // Arrange
      const futurePayload = { ...payload, exp: now + 3600 };
      const futureToken = new Token('test-token', futurePayload);

      // Act & Assert
      expect(futureToken.isExpired()).toBe(false);
    });

    it('should return true for expired token', () => {
      // Arrange
      const pastPayload = { ...payload, exp: now - 3600 };
      const pastToken = new Token('test-token', pastPayload);

      // Act & Assert
      expect(pastToken.isExpired()).toBe(true);
    });

    it('should return false for token expiring now', () => {
      // Arrange
      const currentPayload = { ...payload, exp: now };
      const currentToken = new Token('test-token', currentPayload);

      // Act & Assert
      expect(currentToken.isExpired()).toBe(false);
    });
  });

  describe('hasScope', () => {
    it('should return true for existing scope', () => {
      // Act & Assert
      expect(token.hasScope('read')).toBe(true);
      expect(token.hasScope('write')).toBe(true);
      expect(token.hasScope('admin')).toBe(true);
    });

    it('should return false for non-existing scope', () => {
      // Act & Assert
      expect(token.hasScope('delete')).toBe(false);
      expect(token.hasScope('invalid')).toBe(false);
    });

    it('should be case sensitive', () => {
      // Act & Assert
      expect(token.hasScope('READ')).toBe(false);
      expect(token.hasScope('Read')).toBe(false);
    });

    it('should handle token without scopes', () => {
      // Arrange
      const noScopePayload = { ...payload };
      delete noScopePayload.scope;
      const noScopeToken = new Token('test-token', noScopePayload);

      // Act & Assert
      expect(noScopeToken.hasScope('read')).toBe(false);
      expect(noScopeToken.hasScope('')).toBe(false);
    });
  });

  describe('hasAllScopes', () => {
    it('should return true when token has all specified scopes', () => {
      // Act & Assert
      expect(token.hasAllScopes(['read', 'write'])).toBe(true);
      expect(token.hasAllScopes(['read', 'write', 'admin'])).toBe(true);
      expect(token.hasAllScopes(['read'])).toBe(true);
    });

    it('should return false when token is missing any of the specified scopes', () => {
      // Act & Assert
      expect(token.hasAllScopes(['read', 'delete'])).toBe(false);
      expect(token.hasAllScopes(['delete', 'write'])).toBe(false);
      expect(token.hasAllScopes(['invalid'])).toBe(false);
    });

    it('should return true for empty array', () => {
      // Act & Assert
      expect(token.hasAllScopes([])).toBe(true);
    });

    it('should handle token without scopes', () => {
      // Arrange
      const noScopePayload = { ...payload };
      delete noScopePayload.scope;
      const noScopeToken = new Token('test-token', noScopePayload);

      // Act & Assert
      expect(noScopeToken.hasAllScopes(['read'])).toBe(false);
      expect(noScopeToken.hasAllScopes([])).toBe(true);
    });
  });

  describe('hasAnyScope', () => {
    it('should return true when token has at least one of the specified scopes', () => {
      // Act & Assert
      expect(token.hasAnyScope(['read', 'delete'])).toBe(true);
      expect(token.hasAnyScope(['delete', 'write'])).toBe(true);
      expect(token.hasAnyScope(['read'])).toBe(true);
    });

    it('should return false when token has none of the specified scopes', () => {
      // Act & Assert
      expect(token.hasAnyScope(['delete', 'invalid'])).toBe(false);
      expect(token.hasAnyScope(['invalid'])).toBe(false);
    });

    it('should return false for empty array', () => {
      // Act & Assert
      expect(token.hasAnyScope([])).toBe(false);
    });

    it('should handle token without scopes', () => {
      // Arrange
      const noScopePayload = { ...payload };
      delete noScopePayload.scope;
      const noScopeToken = new Token('test-token', noScopePayload);

      // Act & Assert
      expect(noScopeToken.hasAnyScope(['read'])).toBe(false);
      expect(noScopeToken.hasAnyScope([])).toBe(false);
    });
  });

  describe('getVerificationInfo', () => {
    it('should return correct verification info', () => {
      // Act
      const verificationInfo = token.getVerificationInfo();

      // Assert
      expect(verificationInfo).toEqual({
        client_id: 'test-client-id',
        issuer: 'test-issuer',
        audience: 'test-audience',
        issued_at: new Date(now * 1000).toISOString(),
        expires_at: new Date((now + 3600) * 1000).toISOString(),
        scope: 'read write admin',
      });
    });

    it('should handle token without scope', () => {
      // Arrange
      const noScopePayload = { ...payload };
      delete noScopePayload.scope;
      const noScopeToken = new Token('test-token', noScopePayload);

      // Act
      const verificationInfo = noScopeToken.getVerificationInfo();

      // Assert
      expect(verificationInfo.scope).toBeUndefined();
      expect(verificationInfo.client_id).toBe('test-client-id');
      expect(verificationInfo.issuer).toBe('test-issuer');
      expect(verificationInfo.audience).toBe('test-audience');
    });

    it('should return ISO string dates', () => {
      // Act
      const verificationInfo = token.getVerificationInfo();

      // Assert
      expect(verificationInfo.issued_at).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
      expect(verificationInfo.expires_at).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });
  });

  describe('fromJWT', () => {
    it('should create a token from JWT string and payload', () => {
      // Arrange
      const jwtString = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      const jwtPayload: TokenPayload = {
        sub: 'jwt-client-id',
        aud: 'jwt-audience',
        iss: 'jwt-issuer',
        iat: now,
        exp: now + 7200,
        scope: 'jwt-read jwt-write',
      };

      // Act
      const jwtToken = Token.fromJWT(jwtString, jwtPayload);

      // Assert
      expect(jwtToken.accessToken).toBe(jwtString);
      expect(jwtToken.clientId).toBe('jwt-client-id');
      expect(jwtToken.scopes).toEqual(['jwt-read', 'jwt-write']);
      expect(jwtToken.payload).toEqual(jwtPayload);
    });

    it('should create a token without scope', () => {
      // Arrange
      const jwtString = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      const jwtPayload: TokenPayload = {
        sub: 'jwt-client-id',
        aud: 'jwt-audience',
        iss: 'jwt-issuer',
        iat: now,
        exp: now + 7200,
      };

      // Act
      const jwtToken = Token.fromJWT(jwtString, jwtPayload);

      // Assert
      expect(jwtToken.accessToken).toBe(jwtString);
      expect(jwtToken.scopes).toEqual([]);
      expect(jwtToken.payload.scope).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle token with empty string scope', () => {
      // Arrange
      const emptyScopePayload = { ...payload, scope: '' };
      const emptyScopeToken = new Token('test-token', emptyScopePayload);

      // Act & Assert
      expect(emptyScopeToken.scopes).toEqual([]);
      expect(emptyScopeToken.hasScope('')).toBe(false);
      expect(emptyScopeToken.hasScope('read')).toBe(false);
    });

    it('should handle token with single space scope', () => {
      // Arrange
      const spaceScopePayload = { ...payload, scope: ' ' };
      const spaceScopeToken = new Token('test-token', spaceScopePayload);

      // Act & Assert
      expect(spaceScopeToken.scopes).toEqual(['', '']);
      expect(spaceScopeToken.hasScope('')).toBe(true);
      expect(spaceScopeToken.hasScope('read')).toBe(false);
    });

    it('should handle token with very long expiration time', () => {
      // Arrange
      const farFuturePayload = { ...payload, exp: now + 31536000 }; // 1 year from now
      const farFutureToken = new Token('test-token', farFuturePayload);

      // Act & Assert
      expect(farFutureToken.isExpired()).toBe(false);
    });

    it('should handle token with very old expiration time', () => {
      // Arrange
      const farPastPayload = { ...payload, exp: now - 31536000 }; // 1 year ago
      const farPastToken = new Token('test-token', farPastPayload);

      // Act & Assert
      expect(farPastToken.isExpired()).toBe(true);
    });

    it('should handle token with zero expiration time', () => {
      // Arrange
      const zeroExpPayload = { ...payload, exp: 0 };
      const zeroExpToken = new Token('test-token', zeroExpPayload);

      // Act & Assert
      expect(zeroExpToken.isExpired()).toBe(true);
    });
  });
});
