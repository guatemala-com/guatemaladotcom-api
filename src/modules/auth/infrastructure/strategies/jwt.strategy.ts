import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from '../../domain/entities/token.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'your-secret-key'),
      issuer: configService.get<string>('JWT_ISSUER', 'guatemala.com'),
      audience: configService.get<string>('JWT_AUDIENCE', 'guatemala-api'),
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
