import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface ClientCredentials {
  client_id: string;
  client_secret: string;
}

export interface ClientConfig {
  clientId: string;
  clientSecret: string;
  allowedScopes: string[];
}

export interface TokenPayload {
  sub: string; // clientId
  aud: string; // audience
  iss: string; // issuer
  iat: number; // issued at
  exp: number; // expiration (set automatically by JWT)
  scope?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Get client configuration including allowed scopes
   */
  private getClientConfig(clientId: string): ClientConfig | null {
    const validClients = this.configService.get<string>('OAUTH_CLIENTS');

    if (!validClients) {
      // Development mode: return default config with all scopes
      return {
        clientId,
        clientSecret: 'development',
        allowedScopes: ['read', 'write', 'admin'],
      };
    }

    try {
      const clients = JSON.parse(validClients) as ClientConfig[];
      return clients.find((c) => c.clientId === clientId) || null;
    } catch {
      return null;
    }
  }

  /**
   * Validate client credentials
   */
  validateClient(clientId: string, clientSecret: string): boolean {
    const clientConfig = this.getClientConfig(clientId);

    if (!clientConfig) {
      return false;
    }

    return clientConfig.clientSecret === clientSecret;
  }

  /**
   * Validate and filter requested scopes against client's allowed scopes
   */
  validateAndFilterScopes(clientId: string, requestedScopes?: string): string {
    const clientConfig = this.getClientConfig(clientId);

    if (!clientConfig) {
      throw new UnauthorizedException('Client not found');
    }

    // If no scopes requested, return empty string
    if (!requestedScopes || requestedScopes.trim() === '') {
      return '';
    }

    // Parse requested scopes
    const requestedScopesList = requestedScopes
      .split(' ')
      .map((scope) => scope.trim())
      .filter((scope) => scope.length > 0);

    // Validate each requested scope
    const invalidScopes = requestedScopesList.filter(
      (scope) => !clientConfig.allowedScopes.includes(scope),
    );

    if (invalidScopes.length > 0) {
      throw new BadRequestException(
        `Client is not authorized for scopes: ${invalidScopes.join(', ')}. ` +
          `Allowed scopes: ${clientConfig.allowedScopes.join(', ')}`,
      );
    }

    // Return the validated scopes
    return requestedScopesList.join(' ');
  }

  /**
   * Generate access token using client credentials flow
   */
  async generateAccessToken(clientId: string, scope?: string): Promise<string> {
    // Validate and filter scopes before generating token
    const validatedScope = this.validateAndFilterScopes(clientId, scope);

    const payload = {
      sub: clientId,
      iat: Math.floor(Date.now() / 1000),
      scope: validatedScope,
    };

    return this.jwtService.signAsync(payload);
  }

  /**
   * Validate access token
   */
  async validateToken(token: string): Promise<TokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(token);
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Check if the token has a specific scope
   */
  async hasScope(token: string, requiredScope: string): Promise<boolean> {
    try {
      const payload = await this.validateToken(token);
      if (!payload.scope) {
        return false;
      }

      const scopes = payload.scope.split(' ');
      return scopes.includes(requiredScope);
    } catch {
      return false;
    }
  }

  /**
   * Generate client credentials for development
   */
  generateClientCredentials(): ClientCredentials {
    const client_id = `gt_client_${Math.random().toString(36).substring(2, 15)}`;
    const client_secret = `gt_secret_${Math.random().toString(36).substring(2, 15)}`;

    return { client_id, client_secret };
  }
}
