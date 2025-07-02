import { Global, Module } from '@nestjs/common';
import { PrismaService } from './infrastructure/prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
