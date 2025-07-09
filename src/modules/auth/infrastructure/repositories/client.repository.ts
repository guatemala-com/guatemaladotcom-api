import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientRepository } from '../../domain/repositories/client.repository.interface';
import { Client } from '../../domain/entities/client.entity';

/**
 * Client Repository Implementation
 *
 * Implements the client repository interface using environment variables.
 * This belongs to the infrastructure layer.
 */
@Injectable()
export class ClientRepositoryImpl implements ClientRepository {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Find a client by its ID
   */
  findByClientId(clientId: string): Promise<Client | null> {
    const validClients = this.configService.get<string>('OAUTH_CLIENTS');

    if (!validClients) {
      // Development mode: return default client with all scopes
      return Promise.resolve(
        Client.fromConfig({
          clientId,
          clientSecret: 'development',
          allowedScopes: ['read', 'write', 'admin'],
        }),
      );
    }

    try {
      const clients = JSON.parse(validClients) as Array<{
        clientId: string;
        clientSecret: string;
        allowedScopes: string[];
      }>;

      const clientConfig = clients.find((c) => c.clientId === clientId);

      if (!clientConfig) {
        return Promise.resolve(null);
      }

      return Promise.resolve(Client.fromConfig(clientConfig));
    } catch {
      return Promise.resolve(null);
    }
  }

  /**
   * Validate client credentials
   */
  async validateCredentials(
    clientId: string,
    clientSecret: string,
  ): Promise<boolean> {
    const client = await this.findByClientId(clientId);

    if (!client) {
      return false;
    }

    return client.validateCredentials(clientSecret);
  }

  /**
   * Get all clients (for development/testing purposes)
   */
  findAll(): Promise<Client[]> {
    const validClients = this.configService.get<string>('OAUTH_CLIENTS');

    if (!validClients) {
      // Development mode: return empty array
      return Promise.resolve([]);
    }

    try {
      const clients = JSON.parse(validClients) as Array<{
        clientId: string;
        clientSecret: string;
        allowedScopes: string[];
      }>;

      return Promise.resolve(
        clients.map((clientConfig) => Client.fromConfig(clientConfig)),
      );
    } catch {
      return Promise.resolve([]);
    }
  }
}
