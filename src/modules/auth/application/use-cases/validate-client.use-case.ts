import { Injectable, UnauthorizedException } from '@nestjs/common';
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
  constructor(private readonly clientRepository: ClientRepositoryImpl) {}

  /**
   * Execute the validate client use case
   */
  async execute(
    request: ValidateClientRequest,
  ): Promise<ValidateClientResponse> {
    const { clientId, clientSecret, certificateFingerprint } = request;

    // Find the client
    const client = await this.clientRepository.findByClientId(clientId);

    if (!client) {
      throw new UnauthorizedException('Client not found');
    }

    // Validate credentials
    const isValid = client.validateCredentials(clientSecret);

    if (!isValid) {
      throw new UnauthorizedException('Invalid client credentials');
    }

    // Validate certificate if required
    const isCertificateValid = client.validateCertificate(
      certificateFingerprint,
    );

    if (!isCertificateValid) {
      throw new UnauthorizedException('Invalid client certificate');
    }

    return {
      client,
      isValid: true,
    };
  }
}
