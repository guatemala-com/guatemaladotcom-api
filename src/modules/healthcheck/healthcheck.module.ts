import { Module } from '@nestjs/common';
import { HealthCheckController } from './infrastructure/controllers/healthcheck.controller';
import { HealthCheckRepository } from './infrastructure/repositories/healthcheck.repository';
import { HealthCheckUseCase } from './application/use-cases/healthcheck.use-case';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [HealthCheckController],
  providers: [HealthCheckRepository, HealthCheckUseCase],
  exports: [],
})
export class HealthCheckModule {}
