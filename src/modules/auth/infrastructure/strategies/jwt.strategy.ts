import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, TokenPayload } from '../services/auth.service';
import * as fs from 'fs';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const publicKeyPath = configService.get<string>('JWT_PUBLIC_KEY_PATH');

    if (!publicKeyPath) {
      throw new Error('JWT_PUBLIC_KEY_PATH not configured');
    }

    const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      algorithms: ['RS256'],
      issuer: configService.get<string>('JWT_ISSUER', 'guatemala.com'),
      audience: configService.get<string>('JWT_AUDIENCE', 'guatemala.com-api'),
    });
  }

  validate(payload: TokenPayload): TokenPayload {
    // Here you can add additional validations
    // For example, verify if the client is still valid

    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return payload;
  }
}
