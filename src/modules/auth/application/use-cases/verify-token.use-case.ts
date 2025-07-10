import { Injectable, Logger } from '@nestjs/common';
import { TokenRepositoryImpl } from '../../infrastructure/repositories/token.repository';

export interface VerifyTokenRequest {
  token: string;
}

export interface VerifyTokenResponse {
  valid: boolean;
  payload?: {
    client_id: string;
    issuer: string;
    audience: string;
    issued_at: string;
    expires_at: string;
    scope?: string;
  };
  error?: string;
}

/**
 * Verify Token Use Case
 *
 * Handles the business logic for verifying OAuth access tokens.
 * This use case belongs to the application layer.
 */
@Injectable()
export class VerifyTokenUseCase {
  private readonly logger = new Logger(VerifyTokenUseCase.name);

  constructor(private readonly tokenRepository: TokenRepositoryImpl) {}

  /**
   * Execute the verify token use case
   */
  async execute(request: VerifyTokenRequest): Promise<VerifyTokenResponse> {
    const { token } = request;

    this.logger.debug('Token verification requested');

    try {
      // Validate the token
      const tokenEntity = await this.tokenRepository.validateToken(token);

      this.logger.log(
        `Token verified successfully for client: ${tokenEntity.getVerificationInfo().client_id}`,
      );

      return {
        valid: true,
        payload: tokenEntity.getVerificationInfo(),
      };
    } catch {
      this.logger.warn('Token verification failed');
      return {
        valid: false,
        error: 'Invalid token',
      };
    }
  }
}
