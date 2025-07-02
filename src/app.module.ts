import { Module } from '@nestjs/common';
import { HealthCheckModule } from './modules/healthcheck/healthcheck.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';

@Module({
  imports: [ConfigModule.forRoot(), HealthCheckModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
