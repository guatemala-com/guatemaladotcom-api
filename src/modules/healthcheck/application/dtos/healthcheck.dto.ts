export class HealthCheckDto {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
}

export class HealthCheckResponseDto {
  success: boolean;
  data: HealthCheckDto;
  message: string;
}
