import { Injectable } from '@nestjs/common';
import { HealthCheckDto } from '../dtos/healthcheck.dto';
import { HealthCheckRepository } from '../../infrastructure/repositories/healthcheck.repository';

@Injectable()
export class HealthCheckUseCase {
  constructor(private readonly healthCheckRepository: HealthCheckRepository) {}

  async execute(): Promise<HealthCheckDto> {
    const healthData = await this.healthCheckRepository.getHealthStatus();

    return {
      status: healthData.status,
      timestamp: healthData.timestamp,
      uptime: healthData.uptime,
      environment: healthData.environment,
      version: healthData.version,
    };
  }
}
