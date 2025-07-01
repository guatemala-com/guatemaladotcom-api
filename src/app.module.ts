import { Module } from '@nestjs/common';
import { HealthCheckModule } from './modules/healthcheck';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), HealthCheckModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
