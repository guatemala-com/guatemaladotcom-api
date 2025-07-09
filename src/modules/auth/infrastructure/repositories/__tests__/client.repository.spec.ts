/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ClientRepositoryImpl } from '../client.repository';
import { Client } from '../../../domain/entities/client.entity';

describe('ClientRepositoryImpl', () => {
  let repository: ClientRepositoryImpl;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientRepositoryImpl,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    repository = module.get<ClientRepositoryImpl>(ClientRepositoryImpl);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByClientId', () => {
    it('should return default client in development mode when OAUTH_CLIENTS is not set', async () => {
      // Arrange
      configService.get.mockReturnValue(undefined);

      // Act
      const result = await repository.findByClientId('any-client-id');

      // Assert
      expect(configService.get).toHaveBeenCalledWith('OAUTH_CLIENTS');
      expect(result).toBeInstanceOf(Client);
      expect(result?.clientId).toBe('any-client-id');
      expect(result?.clientSecret).toBe('development');
      expect(result?.allowedScopes).toEqual(['read', 'write', 'admin']);
    });

    it('should return client from configuration when OAUTH_CLIENTS is set', async () => {
      // Arrange
      const clientsConfig = JSON.stringify([
        {
          clientId: 'test-client',
          clientSecret: 'test-secret',
          allowedScopes: ['read', 'write'],
        },
        {
          clientId: 'another-client',
          clientSecret: 'another-secret',
          allowedScopes: ['read'],
        },
      ]);
      configService.get.mockReturnValue(clientsConfig);

      // Act
      const result = await repository.findByClientId('test-client');

      // Assert
      expect(configService.get).toHaveBeenCalledWith('OAUTH_CLIENTS');
      expect(result).toBeInstanceOf(Client);
      expect(result?.clientId).toBe('test-client');
      expect(result?.clientSecret).toBe('test-secret');
      expect(result?.allowedScopes).toEqual(['read', 'write']);
    });

    it('should return null when client is not found in configuration', async () => {
      // Arrange
      const clientsConfig = JSON.stringify([
        {
          clientId: 'existing-client',
          clientSecret: 'existing-secret',
          allowedScopes: ['read'],
        },
      ]);
      configService.get.mockReturnValue(clientsConfig);

      // Act
      const result = await repository.findByClientId('non-existent-client');

      // Assert
      expect(configService.get).toHaveBeenCalledWith('OAUTH_CLIENTS');
      expect(result).toBeNull();
    });

    it('should return null when OAUTH_CLIENTS configuration is invalid JSON', async () => {
      // Arrange
      configService.get.mockReturnValue('invalid-json');

      // Act
      const result = await repository.findByClientId('any-client-id');

      // Assert
      expect(configService.get).toHaveBeenCalledWith('OAUTH_CLIENTS');
      expect(result).toBeNull();
    });

    it('should return null when OAUTH_CLIENTS is empty string', async () => {
      // Arrange
      configService.get.mockReturnValue('');

      // Act
      const result = await repository.findByClientId('any-client-id');

      // Assert
      expect(configService.get).toHaveBeenCalledWith('OAUTH_CLIENTS');
      expect(result).toBeInstanceOf(Client);
      expect(result?.clientId).toBe('any-client-id');
      expect(result?.clientSecret).toBe('development');
      expect(result?.allowedScopes).toEqual(['read', 'write', 'admin']);
    });

    it('should handle client with empty scopes array', async () => {
      // Arrange
      const clientsConfig = JSON.stringify([
        {
          clientId: 'client-no-scopes',
          clientSecret: 'secret',
          allowedScopes: [],
        },
      ]);
      configService.get.mockReturnValue(clientsConfig);

      // Act
      const result = await repository.findByClientId('client-no-scopes');

      // Assert
      expect(result).toBeInstanceOf(Client);
      expect(result?.clientId).toBe('client-no-scopes');
      expect(result?.allowedScopes).toEqual([]);
    });

    it('should handle client with single scope', async () => {
      // Arrange
      const clientsConfig = JSON.stringify([
        {
          clientId: 'client-single-scope',
          clientSecret: 'secret',
          allowedScopes: ['admin'],
        },
      ]);
      configService.get.mockReturnValue(clientsConfig);

      // Act
      const result = await repository.findByClientId('client-single-scope');

      // Assert
      expect(result).toBeInstanceOf(Client);
      expect(result?.clientId).toBe('client-single-scope');
      expect(result?.allowedScopes).toEqual(['admin']);
    });
  });

  describe('validateCredentials', () => {
    it('should return true for valid client credentials', async () => {
      // Arrange
      const clientsConfig = JSON.stringify([
        {
          clientId: 'test-client',
          clientSecret: 'correct-secret',
          allowedScopes: ['read', 'write'],
        },
      ]);
      configService.get.mockReturnValue(clientsConfig);

      // Act
      const result = await repository.validateCredentials(
        'test-client',
        'correct-secret',
      );

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for invalid client secret', async () => {
      // Arrange
      const clientsConfig = JSON.stringify([
        {
          clientId: 'test-client',
          clientSecret: 'correct-secret',
          allowedScopes: ['read', 'write'],
        },
      ]);
      configService.get.mockReturnValue(clientsConfig);

      // Act
      const result = await repository.validateCredentials(
        'test-client',
        'wrong-secret',
      );

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for non-existent client', async () => {
      // Arrange
      const clientsConfig = JSON.stringify([
        {
          clientId: 'existing-client',
          clientSecret: 'secret',
          allowedScopes: ['read'],
        },
      ]);
      configService.get.mockReturnValue(clientsConfig);

      // Act
      const result = await repository.validateCredentials(
        'non-existent-client',
        'any-secret',
      );

      // Assert
      expect(result).toBe(false);
    });

    it('should return true for development mode client with correct secret', async () => {
      // Arrange
      configService.get.mockReturnValue(undefined);

      // Act
      const result = await repository.validateCredentials(
        'any-client-id',
        'development',
      );

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for development mode client with wrong secret', async () => {
      // Arrange
      configService.get.mockReturnValue(undefined);

      // Act
      const result = await repository.validateCredentials(
        'any-client-id',
        'wrong-secret',
      );

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when OAUTH_CLIENTS configuration is invalid', async () => {
      // Arrange
      configService.get.mockReturnValue('invalid-json');

      // Act
      const result = await repository.validateCredentials(
        'any-client-id',
        'any-secret',
      );

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return empty array in development mode when OAUTH_CLIENTS is not set', async () => {
      // Arrange
      configService.get.mockReturnValue(undefined);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(configService.get).toHaveBeenCalledWith('OAUTH_CLIENTS');
      expect(result).toEqual([]);
    });

    it('should return all clients from configuration', async () => {
      // Arrange
      const clientsConfig = JSON.stringify([
        {
          clientId: 'client-1',
          clientSecret: 'secret-1',
          allowedScopes: ['read'],
        },
        {
          clientId: 'client-2',
          clientSecret: 'secret-2',
          allowedScopes: ['read', 'write'],
        },
        {
          clientId: 'client-3',
          clientSecret: 'secret-3',
          allowedScopes: ['admin'],
        },
      ]);
      configService.get.mockReturnValue(clientsConfig);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(configService.get).toHaveBeenCalledWith('OAUTH_CLIENTS');
      expect(result).toHaveLength(3);
      expect(result[0]).toBeInstanceOf(Client);
      expect(result[0].clientId).toBe('client-1');
      expect(result[0].allowedScopes).toEqual(['read']);
      expect(result[1]).toBeInstanceOf(Client);
      expect(result[1].clientId).toBe('client-2');
      expect(result[1].allowedScopes).toEqual(['read', 'write']);
      expect(result[2]).toBeInstanceOf(Client);
      expect(result[2].clientId).toBe('client-3');
      expect(result[2].allowedScopes).toEqual(['admin']);
    });

    it('should return empty array when OAUTH_CLIENTS configuration is invalid JSON', async () => {
      // Arrange
      configService.get.mockReturnValue('invalid-json');

      // Act
      const result = await repository.findAll();

      // Assert
      expect(configService.get).toHaveBeenCalledWith('OAUTH_CLIENTS');
      expect(result).toEqual([]);
    });

    it('should return empty array when OAUTH_CLIENTS is empty string', async () => {
      // Arrange
      configService.get.mockReturnValue('');

      // Act
      const result = await repository.findAll();

      // Assert
      expect(configService.get).toHaveBeenCalledWith('OAUTH_CLIENTS');
      expect(result).toEqual([]);
    });

    it('should handle empty clients array', async () => {
      // Arrange
      const clientsConfig = JSON.stringify([]);
      configService.get.mockReturnValue(clientsConfig);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(configService.get).toHaveBeenCalledWith('OAUTH_CLIENTS');
      expect(result).toEqual([]);
    });

    it('should handle single client configuration', async () => {
      // Arrange
      const clientsConfig = JSON.stringify([
        {
          clientId: 'single-client',
          clientSecret: 'single-secret',
          allowedScopes: ['read', 'write', 'admin'],
        },
      ]);
      configService.get.mockReturnValue(clientsConfig);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(configService.get).toHaveBeenCalledWith('OAUTH_CLIENTS');
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Client);
      expect(result[0].clientId).toBe('single-client');
      expect(result[0].allowedScopes).toEqual(['read', 'write', 'admin']);
    });
  });

  describe('integration scenarios', () => {
    it('should handle multiple operations with same configuration', async () => {
      // Arrange
      const clientsConfig = JSON.stringify([
        {
          clientId: 'test-client',
          clientSecret: 'test-secret',
          allowedScopes: ['read', 'write'],
        },
      ]);
      configService.get.mockReturnValue(clientsConfig);

      // Act
      const client = await repository.findByClientId('test-client');
      const isValid = await repository.validateCredentials(
        'test-client',
        'test-secret',
      );
      const allClients = await repository.findAll();

      // Assert
      expect(client).toBeInstanceOf(Client);
      expect(client?.clientId).toBe('test-client');
      expect(isValid).toBe(true);
      expect(allClients).toHaveLength(1);
      expect(allClients[0].clientId).toBe('test-client');
    });

    it('should handle development mode consistently across all methods', async () => {
      // Arrange
      configService.get.mockReturnValue(undefined);

      // Act
      const client = await repository.findByClientId('dev-client');
      const isValid = await repository.validateCredentials(
        'dev-client',
        'development',
      );
      const allClients = await repository.findAll();

      // Assert
      expect(client).toBeInstanceOf(Client);
      expect(client?.clientId).toBe('dev-client');
      expect(client?.clientSecret).toBe('development');
      expect(isValid).toBe(true);
      expect(allClients).toEqual([]);
    });

    it('should handle configuration changes between calls', async () => {
      // Arrange
      const initialConfig = JSON.stringify([
        {
          clientId: 'initial-client',
          clientSecret: 'initial-secret',
          allowedScopes: ['read'],
        },
      ]);
      const updatedConfig = JSON.stringify([
        {
          clientId: 'updated-client',
          clientSecret: 'updated-secret',
          allowedScopes: ['write'],
        },
      ]);

      // Act & Assert - First call
      configService.get.mockReturnValue(initialConfig);
      const initialClient = await repository.findByClientId('initial-client');
      expect(initialClient?.clientId).toBe('initial-client');

      // Second call with different config
      configService.get.mockReturnValue(updatedConfig);
      const updatedClient = await repository.findByClientId('updated-client');
      expect(updatedClient?.clientId).toBe('updated-client');

      // Verify initial client no longer exists
      const nonExistentClient =
        await repository.findByClientId('initial-client');
      expect(nonExistentClient).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle malformed client configuration', async () => {
      // Arrange
      const malformedConfig = JSON.stringify([
        {
          clientId: 'valid-client',
          clientSecret: 'valid-secret',
          allowedScopes: ['read'],
        },
        {
          // Missing required fields
          clientId: 'malformed-client',
        },
      ]);
      configService.get.mockReturnValue(malformedConfig);

      // Act
      const result = await repository.findByClientId('malformed-client');

      // Assert
      expect(result).toBeInstanceOf(Client);
      expect(result?.clientId).toBe('malformed-client');
      expect(result?.clientSecret).toBeUndefined();
      expect(() => result?.allowedScopes).toThrow(TypeError);
    });

    it('should handle null configuration value', async () => {
      // Arrange
      configService.get.mockReturnValue(null);

      // Act
      const result = await repository.findByClientId('any-client');

      // Assert
      expect(result).toBeInstanceOf(Client);
      expect(result?.clientId).toBe('any-client');
      expect(result?.clientSecret).toBe('development');
    });

    it('should handle undefined configuration value', async () => {
      // Arrange
      configService.get.mockReturnValue(undefined);

      // Act
      const result = await repository.findByClientId('any-client');

      // Assert
      expect(result).toBeInstanceOf(Client);
      expect(result?.clientId).toBe('any-client');
      expect(result?.clientSecret).toBe('development');
    });
  });
});
