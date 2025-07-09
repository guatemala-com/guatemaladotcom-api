import { Injectable } from '@nestjs/common';
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
  constructor(private readonly tokenRepository: TokenRepositoryImpl) {}

  /**
   * Execute the verify token use case
   */
  async execute(request: VerifyTokenRequest): Promise<VerifyTokenResponse> {
    const { token } = request;

    try {
      // Validate the token
      const tokenEntity = await this.tokenRepository.validateToken(token);

      return {
        valid: true,
        payload: tokenEntity.getVerificationInfo(),
      };
    } catch {
      return {
        valid: false,
        error: 'Invalid token',
      };
    }
  }
}
