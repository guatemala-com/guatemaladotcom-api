import { Module } from '@nestjs/common';
import { HealthCheckController } from './infrastructure/controllers/healthcheck.controller';
import { HealthCheckRepositoryImpl } from './infrastructure/repositories/healthcheck.repository';
import { HealthCheckUseCase } from './application/use-cases/healthcheck.use-case';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [HealthCheckController],
  providers: [HealthCheckRepositoryImpl, HealthCheckUseCase],
  exports: [],
})
export class HealthCheckModule {}
