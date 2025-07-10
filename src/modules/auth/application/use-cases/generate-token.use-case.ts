import {
  Injectable,
  BadRequestException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientRepositoryImpl } from '../../infrastructure/repositories/client.repository';
import { TokenRepositoryImpl } from '../../infrastructure/repositories/token.repository';
import { RefreshTokenRepositoryImpl } from '../../infrastructure/repositories/refresh-token.repository';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';

export interface GenerateTokenRequest {
  clientId: string;
  clientSecret: string;
  grantType: string;
  scope?: string;
  certificateFingerprint?: string;
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
  private readonly logger = new Logger(GenerateTokenUseCase.name);

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
    const { clientId, clientSecret, grantType, scope, certificateFingerprint } =
      request;

    // Validate grant type
    if (grantType !== 'client_credentials') {
      this.logger.warn(
        `Unsupported grant type: ${grantType} from client: ${clientId}`,
      );
      throw new BadRequestException(
        'Only client_credentials grant type is supported',
      );
    }

    this.logger.debug(
      `Generating access token for client: ${clientId}, requested scopes: ${scope || 'none'}`,
    );

    // Find and validate the client
    const client = await this.clientRepository.findByClientId(clientId);

    if (!client) {
      this.logger.warn(`Client not found for token generation: ${clientId}`);
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

    // Validate and filter scopes
    let validatedScope: string;
    try {
      validatedScope = client.validateAndFilterScopes(scope);
    } catch (error) {
      this.logger.warn(
        `Scope validation failed for client ${clientId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
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

    this.logger.log(
      `Access token generated successfully for client: ${clientId}`,
    );

    return {
      accessToken: token.accessToken,
      tokenType: 'Bearer',
      expiresIn: 3600, // 1 hour
      refreshToken: refreshToken?.refreshToken,
      scope: validatedScope || undefined,
    };
  }
}
