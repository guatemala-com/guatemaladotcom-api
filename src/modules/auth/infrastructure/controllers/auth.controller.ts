import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
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
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  /**
   * OAuth 2.0 Token Endpoint (Client Credentials Flow)
   */
  @Post('token')
  async getToken(
    @Body() tokenRequest: TokenRequestDto,
  ): Promise<TokenResponseDto> {
    this.logger.log(
      `Token request received from client: ${tokenRequest.client_id}`,
    );

    // Validate that it's client_credentials flow
    if (tokenRequest.grant_type !== 'client_credentials') {
      this.logger.warn(
        `Unsupported grant type: ${tokenRequest.grant_type} from client: ${tokenRequest.client_id}`,
      );
      throw new BadRequestException(
        'Only client_credentials grant type is supported',
      );
    }

    // Validate client credentials
    this.logger.debug(
      `Validating credentials for client: ${tokenRequest.client_id}`,
    );
    const isValid = this.authService.validateClient(
      tokenRequest.client_id,
      tokenRequest.client_secret,
    );

    if (!isValid) {
      this.logger.warn(
        `Invalid credentials for client: ${tokenRequest.client_id}`,
      );
      throw new UnauthorizedException('Invalid client credentials');
    }

    this.logger.log(
      `Credentials validated successfully for client: ${tokenRequest.client_id}`,
    );

    // Generate access token with scope validation
    this.logger.debug(
      `Generating access token for client: ${tokenRequest.client_id}, requested scopes: ${tokenRequest.scope || 'none'}`,
    );

    try {
      const accessToken = await this.authService.generateAccessToken(
        tokenRequest.client_id,
        tokenRequest.scope,
      );

      this.logger.log(
        `Access token generated successfully for client: ${tokenRequest.client_id}`,
      );

      return {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600, // 1 hour
        scope: tokenRequest.scope,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        this.logger.warn(
          `Scope validation failed for client ${tokenRequest.client_id}: ${error.message}`,
        );
        throw error;
      }

      this.logger.error(
        `Error generating token for client ${tokenRequest.client_id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new BadRequestException('Error generating access token');
    }
  }

  /**
   * Endpoint to generate client credentials (development only)
   */
  @Get('generate-client')
  generateClient(): ClientCredentials {
    this.logger.log('Client credentials generation requested');

    const credentials = this.authService.generateClientCredentials();

    this.logger.log(`Client credentials generated: ${credentials.client_id}`);

    return credentials;
  }

  /**
   * Endpoint to verify token
   */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyToken(
    @Body() body: TokenVerificationRequestDto,
  ): Promise<TokenVerificationResponseDto> {
    this.logger.debug('Token verification requested');

    try {
      const payload = await this.authService.validateToken(body.token);

      this.logger.log(`Token verified successfully for client: ${payload.sub}`);

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
    } catch (error) {
      this.logger.warn(
        `Token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

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
    this.logger.debug('OAuth info requested');

    const info = {
      issuer: 'guatemala.com',
      authorization_endpoint: '/api/oauth/authorize',
      token_endpoint: '/api/oauth/token',
      supported_grant_types: ['client_credentials'],
      supported_scopes: ['read', 'write', 'admin'],
      token_endpoint_auth_methods: ['client_secret_post'],
    };

    this.logger.log('OAuth info provided successfully');

    return info;
  }
}
