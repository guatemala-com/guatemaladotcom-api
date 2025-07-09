import { Client } from '../client.entity';

describe('Client', () => {
  let client: Client;

  beforeEach(() => {
    client = new Client('test-client-id', 'test-client-secret', [
      'read',
      'write',
      'admin',
    ]);
  });

  describe('constructor and getters', () => {
    it('should create a client with correct properties', () => {
      // Assert
      expect(client.clientId).toBe('test-client-id');
      expect(client.clientSecret).toBe('test-client-secret');
      expect(client.allowedScopes).toEqual(['read', 'write', 'admin']);
    });

    it('should return a copy of allowed scopes to prevent mutation', () => {
      // Act
      const scopes = client.allowedScopes;
      scopes.push('new-scope');

      // Assert
      expect(client.allowedScopes).toEqual(['read', 'write', 'admin']);
      expect(scopes).toEqual(['read', 'write', 'admin', 'new-scope']);
    });
  });

  describe('hasScope', () => {
    it('should return true for existing scope', () => {
      // Act & Assert
      expect(client.hasScope('read')).toBe(true);
      expect(client.hasScope('write')).toBe(true);
      expect(client.hasScope('admin')).toBe(true);
    });

    it('should return false for non-existing scope', () => {
      // Act & Assert
      expect(client.hasScope('delete')).toBe(false);
      expect(client.hasScope('invalid')).toBe(false);
    });

    it('should be case sensitive', () => {
      // Act & Assert
      expect(client.hasScope('READ')).toBe(false);
      expect(client.hasScope('Read')).toBe(false);
    });
  });

  describe('hasAllScopes', () => {
    it('should return true when client has all specified scopes', () => {
      // Act & Assert
      expect(client.hasAllScopes(['read', 'write'])).toBe(true);
      expect(client.hasAllScopes(['read', 'write', 'admin'])).toBe(true);
      expect(client.hasAllScopes(['read'])).toBe(true);
    });

    it('should return false when client is missing any of the specified scopes', () => {
      // Act & Assert
      expect(client.hasAllScopes(['read', 'delete'])).toBe(false);
      expect(client.hasAllScopes(['delete', 'write'])).toBe(false);
      expect(client.hasAllScopes(['invalid'])).toBe(false);
    });

    it('should return true for empty array', () => {
      // Act & Assert
      expect(client.hasAllScopes([])).toBe(true);
    });
  });

  describe('hasAnyScope', () => {
    it('should return true when client has at least one of the specified scopes', () => {
      // Act & Assert
      expect(client.hasAnyScope(['read', 'delete'])).toBe(true);
      expect(client.hasAnyScope(['delete', 'write'])).toBe(true);
      expect(client.hasAnyScope(['read'])).toBe(true);
    });

    it('should return false when client has none of the specified scopes', () => {
      // Act & Assert
      expect(client.hasAnyScope(['delete', 'invalid'])).toBe(false);
      expect(client.hasAnyScope(['invalid'])).toBe(false);
    });

    it('should return false for empty array', () => {
      // Act & Assert
      expect(client.hasAnyScope([])).toBe(false);
    });
  });

  describe('validateCredentials', () => {
    it('should return true for correct client secret', () => {
      // Act & Assert
      expect(client.validateCredentials('test-client-secret')).toBe(true);
    });

    it('should return false for incorrect client secret', () => {
      // Act & Assert
      expect(client.validateCredentials('wrong-secret')).toBe(false);
      expect(client.validateCredentials('')).toBe(false);
      expect(client.validateCredentials('TEST-CLIENT-SECRET')).toBe(false);
    });
  });

  describe('validateAndFilterScopes', () => {
    it('should return empty string when no scopes are requested', () => {
      // Act & Assert
      expect(client.validateAndFilterScopes()).toBe('');
      expect(client.validateAndFilterScopes('')).toBe('');
      expect(client.validateAndFilterScopes('   ')).toBe('');
    });

    it('should return validated scopes when all requested scopes are allowed', () => {
      // Act & Assert
      expect(client.validateAndFilterScopes('read write')).toBe('read write');
      expect(client.validateAndFilterScopes('read')).toBe('read');
      expect(client.validateAndFilterScopes('read write admin')).toBe(
        'read write admin',
      );
    });

    it('should handle scopes with extra whitespace', () => {
      // Act & Assert
      expect(client.validateAndFilterScopes('  read   write  ')).toBe(
        'read write',
      );
      expect(client.validateAndFilterScopes('read   write')).toBe('read write');
    });

    it('should filter out empty scopes', () => {
      // Act & Assert
      expect(client.validateAndFilterScopes('read  write')).toBe('read write');
      expect(client.validateAndFilterScopes('read   write')).toBe('read write');
    });

    it('should throw error when unauthorized scopes are requested', () => {
      // Act & Assert
      expect(() => client.validateAndFilterScopes('read delete')).toThrow(
        'Client is not authorized for scopes: delete. Allowed scopes: read, write, admin',
      );
    });

    it('should throw error when multiple unauthorized scopes are requested', () => {
      // Act & Assert
      expect(() =>
        client.validateAndFilterScopes('read delete invalid'),
      ).toThrow(
        'Client is not authorized for scopes: delete, invalid. Allowed scopes: read, write, admin',
      );
    });

    it('should throw error when all requested scopes are unauthorized', () => {
      // Act & Assert
      expect(() => client.validateAndFilterScopes('delete invalid')).toThrow(
        'Client is not authorized for scopes: delete, invalid. Allowed scopes: read, write, admin',
      );
    });

    it('should handle client with no allowed scopes', () => {
      // Arrange
      const clientWithNoScopes = new Client(
        'test-client-id',
        'test-client-secret',
        [],
      );

      // Act & Assert
      expect(() => clientWithNoScopes.validateAndFilterScopes('read')).toThrow(
        'Client is not authorized for scopes: read. Allowed scopes: ',
      );
      expect(clientWithNoScopes.validateAndFilterScopes('')).toBe('');
    });
  });

  describe('fromConfig', () => {
    it('should create a client from configuration data', () => {
      // Arrange
      const config = {
        clientId: 'config-client-id',
        clientSecret: 'config-client-secret',
        allowedScopes: ['config-read', 'config-write'],
      };

      // Act
      const clientFromConfig = Client.fromConfig(config);

      // Assert
      expect(clientFromConfig.clientId).toBe('config-client-id');
      expect(clientFromConfig.clientSecret).toBe('config-client-secret');
      expect(clientFromConfig.allowedScopes).toEqual([
        'config-read',
        'config-write',
      ]);
    });

    it('should create a client with empty scopes', () => {
      // Arrange
      const config = {
        clientId: 'config-client-id',
        clientSecret: 'config-client-secret',
        allowedScopes: [],
      };

      // Act
      const clientFromConfig = Client.fromConfig(config);

      // Assert
      expect(clientFromConfig.allowedScopes).toEqual([]);
      expect(clientFromConfig.hasScope('any')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle client with duplicate scopes', () => {
      // Arrange
      const clientWithDuplicates = new Client(
        'test-client-id',
        'test-client-secret',
        ['read', 'read', 'write'],
      );

      // Act & Assert
      expect(clientWithDuplicates.allowedScopes).toEqual([
        'read',
        'read',
        'write',
      ]);
      expect(clientWithDuplicates.hasScope('read')).toBe(true);
      expect(clientWithDuplicates.hasScope('write')).toBe(true);
    });

    it('should handle client with empty string scopes', () => {
      // Arrange
      const clientWithEmptyScopes = new Client(
        'test-client-id',
        'test-client-secret',
        ['', 'read', '', 'write'],
      );

      // Act & Assert
      expect(clientWithEmptyScopes.allowedScopes).toEqual([
        '',
        'read',
        '',
        'write',
      ]);
      expect(clientWithEmptyScopes.hasScope('')).toBe(true);
      expect(clientWithEmptyScopes.hasScope('read')).toBe(true);
      expect(clientWithEmptyScopes.hasScope('write')).toBe(true);
    });

    it('should handle validateAndFilterScopes with mixed valid and invalid scopes', () => {
      // Act & Assert
      expect(() =>
        client.validateAndFilterScopes('read invalid write'),
      ).toThrow(
        'Client is not authorized for scopes: invalid. Allowed scopes: read, write, admin',
      );
    });
  });
});
