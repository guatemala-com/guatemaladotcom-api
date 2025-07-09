import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GenerateClientCredentialsResponse {
  client_id: string;
  client_secret: string;
}

/**
 * Generate Client Credentials Use Case
 *
 * Handles the business logic for generating client credentials for development.
 * This use case belongs to the application layer.
 */
@Injectable()
export class GenerateClientCredentialsUseCase {
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {}

  /**
   * Execute the generate client credentials use case
   */
  execute(): GenerateClientCredentialsResponse {
    const client_id = `gt_client_${Math.random().toString(36).substring(2, 15)}`;

    // In development mode (no OAUTH_CLIENTS configured), always return "development"
    const oauthClients = this.configService.get<string>('OAUTH_CLIENTS');
    const client_secret = oauthClients
      ? `gt_secret_${Math.random().toString(36).substring(2, 15)}`
      : 'development';

    return { client_id, client_secret };
  }
}
