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
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import {
  TokenRequestDto,
  TokenResponseDto,
  TokenVerificationRequestDto,
  TokenVerificationResponseDto,
} from '../../application/dtos/token.dto';
import { ValidateClientUseCase } from '../../application/use-cases/validate-client.use-case';
import { GenerateTokenUseCase } from '../../application/use-cases/generate-token.use-case';
import { VerifyTokenUseCase } from '../../application/use-cases/verify-token.use-case';
import { GenerateClientCredentialsUseCase } from '../../application/use-cases/generate-client-credentials.use-case';

@Controller('oauth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly validateClientUseCase: ValidateClientUseCase,
    private readonly generateTokenUseCase: GenerateTokenUseCase,
    private readonly verifyTokenUseCase: VerifyTokenUseCase,
    private readonly generateClientCredentialsUseCase: GenerateClientCredentialsUseCase,
    private readonly configService: ConfigService,
  ) {}

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

    try {
      await this.validateClientUseCase.execute({
        clientId: tokenRequest.client_id,
        clientSecret: tokenRequest.client_secret,
      });

      this.logger.log(
        `Credentials validated successfully for client: ${tokenRequest.client_id}`,
      );
    } catch (error) {
      this.logger.warn(
        `Invalid credentials for client: ${tokenRequest.client_id}`,
      );
      throw error;
    }

    // Generate access token with scope validation
    this.logger.debug(
      `Generating access token for client: ${tokenRequest.client_id}, requested scopes: ${tokenRequest.scope || 'none'}`,
    );

    try {
      const tokenResponse = await this.generateTokenUseCase.execute({
        clientId: tokenRequest.client_id,
        scope: tokenRequest.scope,
      });

      this.logger.log(
        `Access token generated successfully for client: ${tokenRequest.client_id}`,
      );

      return {
        access_token: tokenResponse.accessToken,
        token_type: tokenResponse.tokenType,
        expires_in: tokenResponse.expiresIn,
        scope: tokenResponse.scope,
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
  generateClient() {
    this.logger.log('Client credentials generation requested');

    const credentials = this.generateClientCredentialsUseCase.execute();

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

    const verificationResult = await this.verifyTokenUseCase.execute({
      token: body.token,
    });

    if (verificationResult.valid) {
      this.logger.log(
        `Token verified successfully for client: ${verificationResult.payload?.client_id}`,
      );
    } else {
      this.logger.warn('Token verification failed');
    }

    return verificationResult;
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
