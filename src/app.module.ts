import { Module } from '@nestjs/common';
import { HealthCheckModule } from './modules/healthcheck/healthcheck.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    HealthCheckModule,
    PrismaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
