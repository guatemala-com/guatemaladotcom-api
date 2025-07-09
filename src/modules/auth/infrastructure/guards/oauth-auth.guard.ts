import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import {
  OAUTH_AUTH_KEY,
  OAUTH_SCOPE_KEY,
} from '../decorators/oauth-scopes.decorator';
import { TokenPayload } from '../../domain/entities/token.entity';

@Injectable()
export class OAuthAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Check if OAuth authentication is required
    const isOAuthRequired = this.reflector.getAllAndOverride<boolean>(
      OAUTH_AUTH_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no OAuth auth is required, allow access
    if (!isOAuthRequired) {
      return true;
    }

    // Apply JWT authentication
    return super.canActivate(context);
  }

  // Override handleRequest to add scope validation
  handleRequest(
    err: any,
    user: TokenPayload,
    info: any,
    context: ExecutionContext,
  ): any {
    if (err || !user) {
      throw err || new UnauthorizedException('Unauthorized');
    }

    return this.validateUserScopes(user, context);
  }

  private validateUserScopes(
    user: TokenPayload,
    context: ExecutionContext,
  ): TokenPayload {
    // Get required scopes
    const requiredScopes = this.reflector.getAllAndOverride<string>(
      OAUTH_SCOPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no scope is required, just return the user
    if (!requiredScopes) {
      return user;
    }

    // Validate scopes - check if the user has the required scope
    if (user.scope && user.scope.includes(requiredScopes)) {
      return user;
    }

    // If scope validation fails, throw unauthorized error
    throw new UnauthorizedException('Insufficient scope');
  }
}
