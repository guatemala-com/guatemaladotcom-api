import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface ClientCredentials {
  client_id: string;
  client_secret: string;
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
   * Validate client credentials
   */
  validateClient(clientId: string, clientSecret: string): boolean {
    // In production, this should query a database
    // For now, we use environment variables for development
    const validClients = this.configService.get<string>('OAUTH_CLIENTS');

    if (!validClients) {
      // Development mode: allow any client
      return true;
    }

    try {
      const clients = JSON.parse(validClients) as Array<{
        clientId: string;
        clientSecret: string;
      }>;
      const client = clients.find((c) => c.clientId === clientId);

      if (!client) {
        return false;
      }

      return client.clientSecret === clientSecret;
    } catch {
      return false;
    }
  }

  /**
   * Generate access token using client credentials flow
   */
  async generateAccessToken(clientId: string, scope?: string): Promise<string> {
    const payload = {
      sub: clientId,
      iat: Math.floor(Date.now() / 1000),
      scope,
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
