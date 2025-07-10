import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenRepositoryImpl } from '../../infrastructure/repositories/refresh-token.repository';
import { TokenRepositoryImpl } from '../../infrastructure/repositories/token.repository';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';

export interface RefreshTokenRequest {
  refreshToken: string;
  scope?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken?: string;
  scope?: string;
}

/**
 * Refresh Token Use Case
 *
 * Handles the business logic for refreshing access tokens using refresh tokens.
 * This use case belongs to the application layer.
 */
@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepositoryImpl,
    private readonly tokenRepository: TokenRepositoryImpl,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Execute the refresh token use case
   */
  async execute(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const { refreshToken: refreshTokenString, scope } = request;

    // Find the refresh token
    const refreshToken =
      await this.refreshTokenRepository.findByToken(refreshTokenString);

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Validate the refresh token
    if (!refreshToken.isValid()) {
      if (refreshToken.isExpired()) {
        // Clean up expired token
        await this.refreshTokenRepository.deleteByToken(refreshTokenString);
        throw new UnauthorizedException('Refresh token has expired');
      }

      if (refreshToken.isRevoked) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }

      throw new UnauthorizedException('Invalid refresh token');
    }

    // Validate scope if provided
    let finalScope = refreshToken.scope;
    if (scope) {
      if (!this.isScopeValid(scope, refreshToken.scope)) {
        throw new BadRequestException(
          'Requested scope exceeds refresh token scope',
        );
      }
      finalScope = scope;
    }

    // Generate new access token
    const newAccessToken = await this.tokenRepository.generateToken(
      refreshToken.clientId,
      finalScope,
    );

    // Decide whether to rotate refresh token
    const shouldRotateRefreshToken = this.configService.get<boolean>(
      'REFRESH_TOKEN_ROTATION',
      true,
    );
    let newRefreshToken: RefreshToken | undefined;

    if (shouldRotateRefreshToken) {
      // Revoke the old refresh token
      await this.refreshTokenRepository.deleteByToken(refreshTokenString);

      // Create a new refresh token
      const refreshTokenExpiresIn = this.configService.get<number>(
        'REFRESH_TOKEN_EXPIRES_IN',
        7 * 24 * 60 * 60,
      ); // 7 days
      newRefreshToken = RefreshToken.create(
        refreshToken.clientId,
        refreshTokenExpiresIn,
        finalScope,
      );

      // Save the new refresh token
      await this.refreshTokenRepository.save(newRefreshToken);
    }

    return {
      accessToken: newAccessToken.accessToken,
      tokenType: 'Bearer',
      expiresIn: 3600, // 1 hour
      refreshToken: newRefreshToken?.refreshToken,
      scope: finalScope,
    };
  }

  /**
   * Check if requested scope is valid against refresh token scope
   */
  private isScopeValid(
    requestedScope: string,
    refreshTokenScope?: string,
  ): boolean {
    if (!refreshTokenScope) {
      return false;
    }

    const requestedScopes = requestedScope.split(' ');
    const allowedScopes = refreshTokenScope.split(' ');

    return requestedScopes.every((scope) => allowedScopes.includes(scope));
  }
}
