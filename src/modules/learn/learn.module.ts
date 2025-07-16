import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LearnController } from './infrastructure/controllers/learn.controller';
import { LearnRepositoryImpl } from './infrastructure/repositories/learn.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { GetCategoriesUseCase } from './application/use-cases/get-categories.use-case';
import { GetCategoryByIdUseCase } from './application/use-cases/get-category-by-id.use-case';
import { GetLearnPostByIdUseCase } from './application/use-cases/get-learn-post-by-id.use-case';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [LearnController],
  providers: [
    LearnRepositoryImpl,
    {
      provide: 'LearnRepository',
      useClass: LearnRepositoryImpl,
    },
    GetCategoriesUseCase,
    GetCategoryByIdUseCase,
    GetLearnPostByIdUseCase,
  ],
})
export class LearnModule {}
