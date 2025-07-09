import { Controller, Get } from '@nestjs/common';
import { HealthCheckUseCase } from '../../application/use-cases/healthcheck.use-case';
import { HealthCheckResponseDto } from '../../application/dtos/healthcheck.dto';
import { OAuthAuthRead } from '../../../auth/infrastructure/decorators/oauth-scopes.decorator';

@OAuthAuthRead()
@Controller('health')
export class HealthCheckController {
  constructor(private readonly healthCheckUseCase: HealthCheckUseCase) {}

  @Get()
  async getHealthStatus(): Promise<HealthCheckResponseDto> {
    const healthData = await this.healthCheckUseCase.execute();

    return {
      success: true,
      data: healthData,
      message: 'Health check completed successfully',
    };
  }

  @Get('ping')
  ping(): { message: string; timestamp: string } {
    return {
      message: 'pong',
      timestamp: new Date().toISOString(),
    };
  }
}
