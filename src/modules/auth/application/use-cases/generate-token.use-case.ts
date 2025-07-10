import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientRepositoryImpl } from '../../infrastructure/repositories/client.repository';
import { TokenRepositoryImpl } from '../../infrastructure/repositories/token.repository';
import { RefreshTokenRepositoryImpl } from '../../infrastructure/repositories/refresh-token.repository';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';

export interface GenerateTokenRequest {
  clientId: string;
  scope?: string;
}

export interface GenerateTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken?: string;
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
    private readonly refreshTokenRepository: RefreshTokenRepositoryImpl,
    private readonly configService: ConfigService,
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

    // Generate the access token
    const token = await this.tokenRepository.generateToken(
      clientId,
      validatedScope,
    );

    // Generate refresh token if enabled
    const refreshTokenEnabled = this.configService.get<boolean>(
      'REFRESH_TOKEN_ENABLED',
      true,
    );
    let refreshToken: RefreshToken | undefined;

    if (refreshTokenEnabled) {
      const refreshTokenExpiresIn = this.configService.get<number>(
        'REFRESH_TOKEN_EXPIRES_IN',
        7 * 24 * 60 * 60,
      ); // 7 days
      refreshToken = RefreshToken.create(
        clientId,
        refreshTokenExpiresIn,
        validatedScope,
      );

      // Save the refresh token
      await this.refreshTokenRepository.save(refreshToken);
    }

    return {
      accessToken: token.accessToken,
      tokenType: 'Bearer',
      expiresIn: 3600, // 1 hour
      refreshToken: refreshToken?.refreshToken,
      scope: validatedScope || undefined,
    };
  }
}
