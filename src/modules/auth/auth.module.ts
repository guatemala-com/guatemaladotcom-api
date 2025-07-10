import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { readFileSync } from 'fs';
import { join } from 'path';

// Controllers
import { AuthController } from './infrastructure/controllers/auth.controller';

// Use Cases
import { ValidateClientUseCase } from './application/use-cases/validate-client.use-case';
import { GenerateTokenUseCase } from './application/use-cases/generate-token.use-case';
import { VerifyTokenUseCase } from './application/use-cases/verify-token.use-case';
import { GenerateClientCredentialsUseCase } from './application/use-cases/generate-client-credentials.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';

// Repositories
import { ClientRepositoryImpl } from './infrastructure/repositories/client.repository';
import { TokenRepositoryImpl } from './infrastructure/repositories/token.repository';
import { RefreshTokenRepositoryImpl } from './infrastructure/repositories/refresh-token.repository';

// Strategies
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';

// Guards
import { OAuthAuthGuard } from './infrastructure/guards/oauth-auth.guard';

// Middleware
import { CertificateValidationMiddleware } from './infrastructure/middleware/certificate-validation.middleware';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const privateKeyPath =
          configService.get<string>('JWT_PRIVATE_KEY_PATH') ||
          join(process.cwd(), 'keys', 'private.pem');
        const publicKeyPath =
          configService.get<string>('JWT_PUBLIC_KEY_PATH') ||
          join(process.cwd(), 'keys', 'public.pem');

        const privateKey = readFileSync(privateKeyPath, 'utf8');
        const publicKey = readFileSync(publicKeyPath, 'utf8');

        return {
          privateKey,
          publicKey,
          signOptions: {
            algorithm: 'RS256', // RSA with SHA-256
            expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h'),
            issuer: configService.get<string>('JWT_ISSUER', 'guatemala.com'),
            audience: configService.get<string>(
              'JWT_AUDIENCE',
              'guatemala-api',
            ),
          },
          verifyOptions: {
            algorithms: ['RS256'],
            issuer: configService.get<string>('JWT_ISSUER', 'guatemala.com'),
            audience: configService.get<string>(
              'JWT_AUDIENCE',
              'guatemala-api',
            ),
          },
        };
      },
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    // Use Cases
    ValidateClientUseCase,
    GenerateTokenUseCase,
    VerifyTokenUseCase,
    GenerateClientCredentialsUseCase,
    RefreshTokenUseCase,

    // Repositories
    ClientRepositoryImpl,
    TokenRepositoryImpl,
    RefreshTokenRepositoryImpl,

    // Strategies
    JwtStrategy,

    // Guards
    OAuthAuthGuard,

    // Middleware
    CertificateValidationMiddleware,
  ],
  exports: [JwtStrategy, OAuthAuthGuard],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CertificateValidationMiddleware).forRoutes('oauth/token');
  }
}
