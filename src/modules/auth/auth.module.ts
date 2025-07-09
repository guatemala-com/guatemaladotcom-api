import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

// Controllers
import { AuthController } from './infrastructure/controllers/auth.controller';

// Use Cases
import { ValidateClientUseCase } from './application/use-cases/validate-client.use-case';
import { GenerateTokenUseCase } from './application/use-cases/generate-token.use-case';
import { VerifyTokenUseCase } from './application/use-cases/verify-token.use-case';
import { GenerateClientCredentialsUseCase } from './application/use-cases/generate-client-credentials.use-case';

// Repositories
import { ClientRepositoryImpl } from './infrastructure/repositories/client.repository';
import { TokenRepositoryImpl } from './infrastructure/repositories/token.repository';

// Strategies
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'your-secret-key'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h'),
          issuer: 'guatemala.com',
          audience: 'guatemala-api',
        },
      }),
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

    // Repositories
    ClientRepositoryImpl,
    TokenRepositoryImpl,

    // Strategies
    JwtStrategy,
  ],
  exports: [JwtStrategy],
})
export class AuthModule {}
