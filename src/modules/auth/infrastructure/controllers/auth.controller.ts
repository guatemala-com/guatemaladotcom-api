import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService, ClientCredentials } from '../services/auth.service';
import {
  TokenRequestDto,
  TokenResponseDto,
  TokenVerificationRequestDto,
  TokenVerificationResponseDto,
} from '../../application/dtos/token.dto';

@Controller('oauth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * OAuth 2.0 Token Endpoint (Client Credentials Flow)
   */
  @Post('token')
  async getToken(
    @Body() tokenRequest: TokenRequestDto,
  ): Promise<TokenResponseDto> {
    // Validate that it's client_credentials flow
    if (tokenRequest.grant_type !== 'client_credentials') {
      throw new Error('Only client_credentials grant type is supported');
    }

    // Validate client credentials
    const isValid = this.authService.validateClient(
      tokenRequest.client_id,
      tokenRequest.client_secret,
    );

    if (!isValid) {
      throw new Error('Invalid client credentials');
    }

    // Generate access token
    const accessToken = await this.authService.generateAccessToken(
      tokenRequest.client_id,
      tokenRequest.scope,
    );

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600, // 1 hour
      scope: tokenRequest.scope,
    };
  }

  /**
   * Endpoint to generate client credentials (development only)
   */
  @Get('generate-client')
  generateClient(): ClientCredentials {
    return this.authService.generateClientCredentials();
  }

  /**
   * Endpoint to verify token
   */
  @Get('verify')
  async verifyToken(
    @Body() body: TokenVerificationRequestDto,
  ): Promise<TokenVerificationResponseDto> {
    try {
      const payload = await this.authService.validateToken(body.token);
      return {
        valid: true,
        payload: {
          client_id: payload.sub,
          issuer: payload.iss,
          audience: payload.aud,
          issued_at: new Date(payload.iat * 1000).toISOString(),
          expires_at: new Date(payload.exp * 1000).toISOString(),
          scope: payload.scope,
        },
      };
    } catch {
      return {
        valid: false,
        error: 'Invalid token',
      };
    }
  }

  /**
   * OAuth endpoint information
   */
  @Get('info')
  getOAuthInfo() {
    return {
      issuer: 'guatemala.com',
      authorization_endpoint: '/api/oauth/authorize',
      token_endpoint: '/api/oauth/token',
      supported_grant_types: ['client_credentials'],
      supported_scopes: ['read', 'write', 'admin'],
      token_endpoint_auth_methods: ['client_secret_post'],
    };
  }
}
