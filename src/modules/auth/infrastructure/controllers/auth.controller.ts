import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RequestWithCertificate } from '../middleware/certificate-validation.middleware';
import {
  TokenRequestDto,
  TokenResponseDto,
  TokenVerificationRequestDto,
  TokenVerificationResponseDto,
  RefreshTokenRequestDto,
  RefreshTokenResponseDto,
} from '../../application/dtos/token.dto';
import { GenerateTokenUseCase } from '../../application/use-cases/generate-token.use-case';
import { VerifyTokenUseCase } from '../../application/use-cases/verify-token.use-case';
import { GenerateClientCredentialsUseCase } from '../../application/use-cases/generate-client-credentials.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';

@Controller('oauth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly generateTokenUseCase: GenerateTokenUseCase,
    private readonly verifyTokenUseCase: VerifyTokenUseCase,
    private readonly generateClientCredentialsUseCase: GenerateClientCredentialsUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  /**
   * OAuth 2.0 Token Endpoint (Client Credentials Flow)
   */
  @Post('token')
  async getToken(
    @Body() tokenRequest: TokenRequestDto,
    @Req() req: RequestWithCertificate,
  ): Promise<TokenResponseDto> {
    const tokenResponse = await this.generateTokenUseCase.execute({
      clientId: tokenRequest.client_id,
      clientSecret: tokenRequest.client_secret,
      grantType: tokenRequest.grant_type,
      scope: tokenRequest.scope,
      certificateFingerprint: req.certificateFingerprint,
    });

    return {
      access_token: tokenResponse.accessToken,
      token_type: tokenResponse.tokenType,
      expires_in: tokenResponse.expiresIn,
      refresh_token: tokenResponse.refreshToken,
      scope: tokenResponse.scope,
    };
  }

  /**
   * Endpoint to generate client credentials (development only)
   */
  @Get('generate-client')
  generateClient() {
    return this.generateClientCredentialsUseCase.execute();
  }

  /**
   * Endpoint to verify token
   */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyToken(
    @Body() body: TokenVerificationRequestDto,
  ): Promise<TokenVerificationResponseDto> {
    return await this.verifyTokenUseCase.execute({
      token: body.token,
    });
  }

  /**
   * OAuth 2.0 Refresh Token Endpoint
   */
  @Post('refresh')
  async refreshToken(
    @Body() refreshRequest: RefreshTokenRequestDto,
  ): Promise<RefreshTokenResponseDto> {
    const tokenResponse = await this.refreshTokenUseCase.execute({
      refreshToken: refreshRequest.refresh_token,
      grantType: refreshRequest.grant_type,
      scope: refreshRequest.scope,
    });

    return {
      access_token: tokenResponse.accessToken,
      token_type: tokenResponse.tokenType,
      expires_in: tokenResponse.expiresIn,
      refresh_token: tokenResponse.refreshToken,
      scope: tokenResponse.scope,
    };
  }

  /**
   * OAuth endpoint information
   */
  @Get('info')
  getOAuthInfo() {
    const info = {
      issuer: 'guatemala.com',
      authorization_endpoint: '/api/oauth/authorize',
      token_endpoint: '/api/oauth/token',
      supported_grant_types: ['client_credentials'],
      supported_scopes: ['read', 'write', 'admin'],
      token_endpoint_auth_methods: ['client_secret_post'],
    };

    return info;
  }
}
