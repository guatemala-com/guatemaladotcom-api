import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './infrastructure/services/auth.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { ThrottlerModule } from '@nestjs/throttler';
import * as fs from 'fs';

@Module({
  imports: [
    PassportModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 10, // 10 auth attempts per minute
      },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const privateKeyPath = configService.get<string>(
          'JWT_PRIVATE_KEY_PATH',
        );
        const publicKeyPath = configService.get<string>('JWT_PUBLIC_KEY_PATH');

        if (!privateKeyPath || !publicKeyPath) {
          throw new Error('JWT key paths not configured');
        }

        const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
        const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

        return {
          privateKey,
          publicKey,
          signOptions: {
            algorithm: 'RS256',
            expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h'),
            issuer: configService.get<string>('JWT_ISSUER', 'guatemala.com'),
            audience: configService.get<string>(
              'JWT_AUDIENCE',
              'guatemala.com-api',
            ),
          },
          verifyOptions: {
            algorithms: ['RS256'],
            issuer: configService.get<string>('JWT_ISSUER', 'guatemala.com'),
            audience: configService.get<string>(
              'JWT_AUDIENCE',
              'guatemala.com-api',
            ),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
