import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ClientRepositoryImpl } from '../../infrastructure/repositories/client.repository';
import { Client } from '../../domain/entities/client.entity';

export interface ValidateClientRequest {
  clientId: string;
  clientSecret: string;
  certificateFingerprint?: string; // Optional certificate fingerprint
}

export interface ValidateClientResponse {
  client: Client;
  isValid: boolean;
}

/**
 * Validate Client Use Case
 *
 * Handles the business logic for validating client credentials.
 * This use case belongs to the application layer.
 */
@Injectable()
export class ValidateClientUseCase {
  private readonly logger = new Logger(ValidateClientUseCase.name);

  constructor(private readonly clientRepository: ClientRepositoryImpl) {}

  /**
   * Execute the validate client use case
   */
  async execute(
    request: ValidateClientRequest,
  ): Promise<ValidateClientResponse> {
    const { clientId, clientSecret, certificateFingerprint } = request;

    this.logger.debug(`Validating credentials for client: ${clientId}`);

    // Find the client
    const client = await this.clientRepository.findByClientId(clientId);

    if (!client) {
      this.logger.warn(`Client not found: ${clientId}`);
      throw new UnauthorizedException('Client not found');
    }

    // Validate credentials
    const isValid = client.validateCredentials(clientSecret);

    if (!isValid) {
      this.logger.warn(`Invalid client credentials for client: ${clientId}`);
      throw new UnauthorizedException('Invalid client credentials');
    }

    // Validate certificate if required
    const isCertificateValid = client.validateCertificate(
      certificateFingerprint,
    );

    if (!isCertificateValid) {
      this.logger.warn(`Invalid client certificate for client: ${clientId}`);
      throw new UnauthorizedException('Invalid client certificate');
    }

    this.logger.log(
      `Credentials validated successfully for client: ${clientId}`,
    );

    return {
      client,
      isValid: true,
    };
  }
}
