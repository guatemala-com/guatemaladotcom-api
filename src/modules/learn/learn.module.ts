import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LearnController } from './infrastructure/controllers/learn.controller';
import { LearnRepositoryImpl } from './infrastructure/repositories/learn.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { GetCategoriesUseCase } from './application/use-cases/get-categories.use-case';
import { GetCategoryByIdUseCase } from './application/use-cases/get-category-by-id.use-case';
import { GetCategoryBySlugUseCase } from './application/use-cases/get-category-by-slug.use-case';
import { GetLearnPostByIdUseCase } from './application/use-cases/get-learn-post-by-id.use-case';
import { LearnPostBuilderService } from './infrastructure/services/learn-post-builder.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [LearnController],
  providers: [
    LearnRepositoryImpl,
    LearnPostBuilderService,
    GetCategoriesUseCase,
    GetCategoryByIdUseCase,
    GetCategoryBySlugUseCase,
    GetLearnPostByIdUseCase,
    ConfigService,
  ],
})
export class LearnModule {}
