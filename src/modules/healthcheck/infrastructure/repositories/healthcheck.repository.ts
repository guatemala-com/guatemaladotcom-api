import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IHealthCheckRepository } from '../../domain/repositories/healthcheck.repository.interface';
import { HealthCheck } from '../../domain/entities/healthcheck.entity';
import { HealthStatus } from '../../domain/types/healthcheck.types';

@Injectable()
export class HealthCheckRepository implements IHealthCheckRepository {
  constructor(private readonly configService: ConfigService) {}

  getHealthStatus(): Promise<HealthCheck> {
    const uptime = process.uptime();
    const timestamp = new Date().toISOString();
    const environment =
      this.configService.get<string>('NODE_ENV') || 'development';

    // Additional health checks to implement:
    // - Database connectivity
    // - External service health
    // - Memory usage
    // - Disk space
    // - Other critical dependencies

    const status = HealthStatus.OK;

    return Promise.resolve(
      HealthCheck.create(status, timestamp, uptime, environment),
    );
  }
}
