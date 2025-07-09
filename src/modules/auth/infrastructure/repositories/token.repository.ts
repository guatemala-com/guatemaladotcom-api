import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenRepository } from '../../domain/repositories/token.repository.interface';
import { Token, TokenPayload } from '../../domain/entities/token.entity';

/**
 * Token Repository Implementation
 *
 * Implements the token repository interface using JWT service.
 * This belongs to the infrastructure layer.
 */
@Injectable()
export class TokenRepositoryImpl implements TokenRepository {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Generate a new access token
   */
  async generateToken(clientId: string, scope?: string): Promise<Token> {
    const payload = {
      sub: clientId,
      iat: Math.floor(Date.now() / 1000),
      scope,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    // Decode the token to get the full payload with exp, aud, iss
    const decodedPayload =
      await this.jwtService.verifyAsync<TokenPayload>(accessToken);

    return Token.fromJWT(accessToken, decodedPayload);
  }

  /**
   * Validate and decode a token
   */
  async validateToken(tokenString: string): Promise<Token> {
    try {
      const payload =
        await this.jwtService.verifyAsync<TokenPayload>(tokenString);
      return Token.fromJWT(tokenString, payload);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Check if a token has a specific scope
   */
  async hasScope(tokenString: string, requiredScope: string): Promise<boolean> {
    try {
      const token = await this.validateToken(tokenString);
      return token.hasScope(requiredScope);
    } catch {
      return false;
    }
  }
}
