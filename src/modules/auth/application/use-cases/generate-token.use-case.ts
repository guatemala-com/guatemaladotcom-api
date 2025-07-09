import { Injectable, BadRequestException } from '@nestjs/common';
import { ClientRepositoryImpl } from '../../infrastructure/repositories/client.repository';
import { TokenRepositoryImpl } from '../../infrastructure/repositories/token.repository';

export interface GenerateTokenRequest {
  clientId: string;
  scope?: string;
}

export interface GenerateTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  scope?: string;
}

/**
 * Generate Token Use Case
 *
 * Handles the business logic for generating OAuth access tokens.
 * This use case belongs to the application layer.
 */
@Injectable()
export class GenerateTokenUseCase {
  constructor(
    private readonly clientRepository: ClientRepositoryImpl,
    private readonly tokenRepository: TokenRepositoryImpl,
  ) {}

  /**
   * Execute the generate token use case
   */
  async execute(request: GenerateTokenRequest): Promise<GenerateTokenResponse> {
    const { clientId, scope } = request;

    // Find the client
    const client = await this.clientRepository.findByClientId(clientId);

    if (!client) {
      throw new BadRequestException('Client not found');
    }

    // Validate and filter scopes
    let validatedScope: string;
    try {
      validatedScope = client.validateAndFilterScopes(scope);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Invalid scopes',
      );
    }

    // Generate the token
    const token = await this.tokenRepository.generateToken(
      clientId,
      validatedScope,
    );

    return {
      accessToken: token.accessToken,
      tokenType: 'Bearer',
      expiresIn: 3600, // 1 hour
      scope: validatedScope || undefined,
    };
  }
}
