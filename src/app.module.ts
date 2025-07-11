import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { HealthCheckModule } from './modules/healthcheck/healthcheck.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { LearnModule } from './modules/learn/learn.module';
import { OAuthAuthGuard } from './modules/auth/infrastructure/guards/oauth-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    HealthCheckModule,
    LearnModule,
    PrismaModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: OAuthAuthGuard,
    },
  ],
})
export class AppModule {}
