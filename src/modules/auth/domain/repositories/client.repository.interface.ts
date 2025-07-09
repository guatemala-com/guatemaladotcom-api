import { Client } from '../entities/client.entity';

/**
 * Client Repository Interface
 *
 * Defines the contract for client data access operations.
 * This interface belongs to the domain layer and is implemented by infrastructure.
 */
export interface ClientRepository {
  /**
   * Find a client by its ID
   */
  findByClientId(clientId: string): Promise<Client | null>;

  /**
   * Validate client credentials
   */
  validateCredentials(clientId: string, clientSecret: string): Promise<boolean>;

  /**
   * Get all clients (for development/testing purposes)
   */
  findAll(): Promise<Client[]>;
}
