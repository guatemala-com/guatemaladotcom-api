export enum HealthStatus {
  OK = 'ok',
  ERROR = 'error',
  WARNING = 'warning',
}

export interface HealthCheckData {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
}

export interface DatabaseHealth {
  status: HealthStatus;
  responseTime: number;
  message?: string;
}

export interface ServiceHealth {
  name: string;
  status: HealthStatus;
  responseTime: number;
  message?: string;
}
