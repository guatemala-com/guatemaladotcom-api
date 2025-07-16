/**
 * Articles Module
 *
 * Module that provides article-related functionality.
 * Includes controllers, use cases, and repository implementations.
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ArticleController } from './infrastructure/controllers/article.controller';
import { ArticleRepositoryImpl } from './infrastructure/repositories/article.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { GetArticleByIdUseCase } from './application/use-cases/get-article-by-id.use-case';
import { GetArticleBySlugUseCase } from './application/use-cases/get-article-by-slug.use-case';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [ArticleController],
  providers: [
    ArticleRepositoryImpl,
    GetArticleByIdUseCase,
    GetArticleBySlugUseCase,
  ],
  exports: [
    ArticleRepositoryImpl,
    GetArticleByIdUseCase,
    GetArticleBySlugUseCase,
  ],
})
export class ArticlesModule {} 